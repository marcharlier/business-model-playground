import { z } from 'zod';
import { FixedCost, Product, ProductSales, Project as ProjectSchema, UpfrontCost, CostStructure, RevenueStreams, AssociatedCost } from './schema';
import type { Project, RevenueStream as RevenueStreamType, AssociatedCost as AssociatedCostType } from './types';

type LegacyFixedCost = Omit<z.infer<typeof FixedCost>, 'frequency'> & { frequency?: 'monthly' | 'annual' | 'upfront' };
type LegacyProduct = z.infer<typeof Product>;
type LegacySubscription = { id: string; name: string; price?: number; pricePeriod?: 'monthly' | 'annual'; subscribers?: number; associatedCosts: z.infer<typeof AssociatedCost>[]; projectId: string };
type CurrencyLiteral = 'GBP' | 'USD' | 'EUR';

function isCurrency(x: unknown): x is CurrencyLiteral {
  return x === 'GBP' || x === 'USD' || x === 'EUR';
}

function coerceCurrency(input: unknown): CurrencyLiteral {
  const s = typeof input === 'string' ? input : 'GBP';
  return isCurrency(s) ? s : 'GBP';
}

/**
 * Migrate AssociatedCost to use revenueStreamId instead of productId/subscriptionId
 */
function migrateAssociatedCost(cost: z.infer<typeof AssociatedCost>, revenueStreamId: string): AssociatedCostType {
  return {
    id: cost.id,
    name: cost.name,
    amount: cost.amount,
    revenueStreamId,
    projectId: cost.projectId,
  };
}

/**
 * Convert a legacy Product to a ProductRevenueStream
 */
function convertProductToRevenueStream(product: LegacyProduct): RevenueStreamType {
  return {
    type: 'product' as const,
    id: product.id,
    name: product.name,
    price: product.price,
    associatedCosts: product.associatedCosts.map(c => migrateAssociatedCost(c, product.id)),
    projectId: product.projectId,
    sales: product.sales,
  };
}

/**
 * Convert a legacy Subscription to a SubscriptionRevenueStream
 */
function convertSubscriptionToRevenueStream(subscription: LegacySubscription): RevenueStreamType {
  return {
    type: 'subscription' as const,
    id: subscription.id,
    name: subscription.name,
    price: subscription.price,
    associatedCosts: subscription.associatedCosts.map(c => migrateAssociatedCost(c, subscription.id)),
    projectId: subscription.projectId,
    pricePeriod: subscription.pricePeriod || 'monthly',
    subscribers: subscription.subscribers,
  };
}

/**
 * Migrate unknown input into the latest Project shape (version 3).
 * - Moves FixedCost with frequency 'upfront' into upfrontCosts
 * - Ensures defaults for missing collections
 * - Migrates version 1 to version 3 (restructures costs and revenue, embeds sales, unifies revenue streams)
 * - Migrates version 2 to version 3 (unifies products/subscriptions into revenueStreams.items)
 * - Coerces currency to allowed enum
 */
export function migrateProject(raw: unknown): Project {
  // If already valid version 3, return as-is
  const strict = ProjectSchema.safeParse(raw);
  if (strict.success) return strict.data;

  const parsed: Record<string, unknown> = isRecord(raw) ? raw : {};

  const id = typeof parsed['id'] === 'string' ? parsed['id'] as string : cryptoRandomId();
  const name = typeof parsed['name'] === 'string' ? parsed['name'] as string : 'Untitled Project';
  const createdAt = typeof parsed['createdAt'] === 'string' ? parsed['createdAt'] as string : new Date().toISOString();
  const updatedAt = new Date().toISOString();
  const currency = coerceCurrency(parsed['currency']);
  const version = typeof parsed['version'] === 'number' ? parsed['version'] : 1;

  // Handle version 2 projects - migrate to version 3
  if (version === 2 && isRecord(parsed['costStructure']) && isRecord(parsed['revenueStreams'])) {
    return migrateV2ToV3(parsed, id, name, currency, createdAt, updatedAt);
  }

  // Handle version 1 projects - migrate to version 3 (via intermediate v2 structure then to v3)
  if (version === 1 || !parsed['costStructure']) {
    // Parse products (version 1 structure)
    const productsV1: Array<z.infer<typeof Product>> = Array.isArray(parsed['products']) ? (parsed['products'] as unknown[]).filter(Boolean).map((p: unknown) => {
      if (!isRecord(p)) return { id: cryptoRandomId(), name: 'Product', price: 0, associatedCosts: [], projectId: id };
      const pid = typeof p['id'] === 'string' ? (p['id'] as string) : cryptoRandomId();
      const pname = typeof p['name'] === 'string' ? (p['name'] as string) : 'Product';
      const price = numberOrUndefined(p['price']);
      const associatedCosts = Array.isArray(p['associatedCosts']) ? (p['associatedCosts'] as unknown[]).filter(Boolean).map((c: unknown) => {
        if (!isRecord(c)) return { id: cryptoRandomId(), name: 'Cost', amount: 0, revenueStreamId: pid, projectId: id };
        return {
          id: typeof c['id'] === 'string' ? (c['id'] as string) : cryptoRandomId(),
          name: typeof c['name'] === 'string' ? (c['name'] as string) : 'Cost',
          amount: numberOrZero(c['amount']),
          revenueStreamId: pid,
          projectId: typeof c['projectId'] === 'string' ? (c['projectId'] as string) : id,
        };
      }) : [];
      const projId = typeof p['projectId'] === 'string' ? (p['projectId'] as string) : id;
      return { id: pid, name: pname, price, associatedCosts, projectId: projId };
    }) : [];

    // Parse productSales (version 1 structure)
    const productSales: Record<string, z.infer<typeof ProductSales>> = isRecord(parsed['productSales'])
      ? Object.fromEntries(Object.entries(parsed['productSales'] as Record<string, unknown>).map(([k, v]) => {
          const vv: Record<string, unknown> = isRecord(v) ? v : {};
          const volume = numberOrUndefined(vv['volume']);
          const period = vv['period'] === 'daily' ? 'daily' : 'monthly';
          return [String(k), { volume, period }];
        })) as Record<string, z.infer<typeof ProductSales>>
      : {};

    // Embed sales data into products and convert to RevenueStream
    const revenueItems: RevenueStreamType[] = productsV1.map((product) => {
      const sales = productSales[product.id];
      return convertProductToRevenueStream(sales ? { ...product, sales } : product);
    });

    // Build revenueStreams (version 3 structure)
    const revenueStreams: z.infer<typeof RevenueStreams> = {
      items: revenueItems,
    };

    // Parse fixedCosts (version 1 structure)
    const fixedCostsRaw: Array<LegacyFixedCost> = Array.isArray(parsed['fixedCosts']) ? parsed['fixedCosts'] as Array<LegacyFixedCost> : [];
    const upfrontFromFixed: Array<z.infer<typeof UpfrontCost>> = fixedCostsRaw
      .filter((c) => c?.frequency === 'upfront')
      .map((c) => ({ id: String(c?.id ?? cryptoRandomId()), name: String(c?.name ?? 'Upfront'), amount: numberOrZero(c?.amount), projectId: String(c?.projectId ?? id) }));

    const fixedRunningCosts: Array<z.infer<typeof FixedCost>> = fixedCostsRaw
      .filter((c) => c?.frequency !== 'upfront')
      .map((c) => ({
        id: String(c?.id ?? cryptoRandomId()),
        name: String(c?.name ?? 'Cost'),
        amount: numberOrZero(c?.amount),
        frequency: (c?.frequency === 'annual' ? 'annual' : 'monthly') as 'monthly' | 'annual',
        category: String(c?.category ?? 'general'),
        projectId: String(c?.projectId ?? id),
      }));

    const upfrontCosts: Array<z.infer<typeof UpfrontCost>> = Array.isArray(parsed['upfrontCosts'])
      ? (parsed['upfrontCosts'] as unknown[]).filter(Boolean).map((c: unknown) => {
          if (!isRecord(c)) return { id: cryptoRandomId(), name: 'Upfront', amount: 0, projectId: id };
          return {
            id: typeof c['id'] === 'string' ? (c['id'] as string) : cryptoRandomId(),
            name: typeof c['name'] === 'string' ? (c['name'] as string) : 'Upfront',
            amount: numberOrZero(c['amount']),
            projectId: typeof c['projectId'] === 'string' ? (c['projectId'] as string) : id,
          };
        })
      : [];

    // Build costStructure
    const costStructure: z.infer<typeof CostStructure> = {
      fixedRunningCosts,
      upfrontCosts: [...upfrontFromFixed, ...upfrontCosts],
    };

    // Build version 3 project
    const normalized: Project = {
      version: 3,
      id,
      name,
      currency,
      createdAt,
      updatedAt,
      costStructure,
      revenueStreams,
      partnerships: parseCanvasItems(parsed['partnerships']),
      activities: parseCanvasItems(parsed['activities']),
      valueProposition: parseCanvasItems(parsed['valueProposition']),
      customerRelationships: parseCanvasItems(parsed['customerRelationships']),
      customerSegments: parseCanvasItems(parsed['customerSegments']),
      resources: parseCanvasItems(parsed['resources']),
      channels: parseCanvasItems(parsed['channels']),
      sharedId: typeof parsed?.sharedId === 'string' ? parsed.sharedId : undefined,
      description: typeof parsed?.description === 'string' ? parsed.description : undefined,
      aiGeneratedFromPrompt: typeof parsed?.aiGeneratedFromPrompt === 'string' ? parsed.aiGeneratedFromPrompt : undefined,
    };

    const result = ProjectSchema.safeParse(normalized);
    if (result.success) return result.data;
    // As last resort, throw to signal unrecoverable state
    throw new Error('Failed to migrate project to latest schema');
  }

  // If we get here, it's an unknown version or malformed data
  throw new Error('Failed to migrate project to latest schema');
}

/**
 * Migrate a version 2 project to version 3
 */
function migrateV2ToV3(
  parsed: Record<string, unknown>,
  id: string,
  name: string,
  currency: CurrencyLiteral,
  createdAt: string,
  updatedAt: string
): Project {
  // Parse costStructure
  const costStructureRaw = parsed['costStructure'] as Record<string, unknown>;
  const fixedRunningCosts: Array<z.infer<typeof FixedCost>> = Array.isArray(costStructureRaw['fixedRunningCosts'])
    ? (costStructureRaw['fixedRunningCosts'] as unknown[]).filter(Boolean).map((c: unknown) => {
        if (!isRecord(c)) return { id: cryptoRandomId(), name: 'Cost', amount: 0, frequency: 'monthly' as const, category: 'general', projectId: id };
        return {
          id: typeof c['id'] === 'string' ? c['id'] : cryptoRandomId(),
          name: typeof c['name'] === 'string' ? c['name'] : 'Cost',
          amount: numberOrUndefined(c['amount']),
          frequency: (c['frequency'] === 'annual' ? 'annual' : 'monthly') as 'monthly' | 'annual',
          category: typeof c['category'] === 'string' ? c['category'] : 'general',
          projectId: typeof c['projectId'] === 'string' ? c['projectId'] : id,
        };
      })
    : [];

  const upfrontCosts: Array<z.infer<typeof UpfrontCost>> = Array.isArray(costStructureRaw['upfrontCosts'])
    ? (costStructureRaw['upfrontCosts'] as unknown[]).filter(Boolean).map((c: unknown) => {
        if (!isRecord(c)) return { id: cryptoRandomId(), name: 'Upfront', amount: 0, projectId: id };
        return {
          id: typeof c['id'] === 'string' ? c['id'] : cryptoRandomId(),
          name: typeof c['name'] === 'string' ? c['name'] : 'Upfront',
          amount: numberOrUndefined(c['amount']),
          projectId: typeof c['projectId'] === 'string' ? c['projectId'] : id,
        };
      })
    : [];

  const costStructure: z.infer<typeof CostStructure> = {
    fixedRunningCosts,
    upfrontCosts,
  };

  // Parse revenueStreams and convert to v3 format
  const revenueStreamsRaw = parsed['revenueStreams'] as Record<string, unknown>;
  
  // Parse legacy products
  const products: LegacyProduct[] = Array.isArray(revenueStreamsRaw['products'])
    ? (revenueStreamsRaw['products'] as unknown[]).filter(Boolean).map((p: unknown) => {
        if (!isRecord(p)) return { id: cryptoRandomId(), name: 'Product', price: undefined, associatedCosts: [], projectId: id };
        const pid = typeof p['id'] === 'string' ? p['id'] : cryptoRandomId();
        return {
          id: pid,
          name: typeof p['name'] === 'string' ? p['name'] : 'Product',
          price: numberOrUndefined(p['price']),
          associatedCosts: parseAssociatedCosts(p['associatedCosts'], pid, id),
          projectId: typeof p['projectId'] === 'string' ? p['projectId'] : id,
          sales: parseSales(p['sales']),
        };
      })
    : [];

  // Parse legacy subscriptions
  const subscriptions: LegacySubscription[] = Array.isArray(revenueStreamsRaw['subscriptions'])
    ? (revenueStreamsRaw['subscriptions'] as unknown[]).filter(Boolean).map((s: unknown) => {
        if (!isRecord(s)) return { id: cryptoRandomId(), name: 'Subscription', price: undefined, pricePeriod: 'monthly' as const, subscribers: undefined, associatedCosts: [], projectId: id };
        const sid = typeof s['id'] === 'string' ? s['id'] : cryptoRandomId();
        return {
          id: sid,
          name: typeof s['name'] === 'string' ? s['name'] : 'Subscription',
          price: numberOrUndefined(s['price']),
          pricePeriod: (s['pricePeriod'] === 'annual' ? 'annual' : 'monthly') as 'monthly' | 'annual',
          subscribers: numberOrUndefined(s['subscribers']),
          associatedCosts: parseAssociatedCosts(s['associatedCosts'], sid, id),
          projectId: typeof s['projectId'] === 'string' ? s['projectId'] : id,
        };
      })
    : [];

  // Convert to unified RevenueStream items
  const revenueItems: RevenueStreamType[] = [
    ...products.map(convertProductToRevenueStream),
    ...subscriptions.map(convertSubscriptionToRevenueStream),
  ];

  const revenueStreams: z.infer<typeof RevenueStreams> = {
    items: revenueItems,
  };

  // Build version 3 project
  const normalized: Project = {
    version: 3,
    id,
    name,
    currency,
    createdAt,
    updatedAt,
    costStructure,
    revenueStreams,
    partnerships: parseCanvasItems(parsed['partnerships']),
    activities: parseCanvasItems(parsed['activities']),
    valueProposition: parseCanvasItems(parsed['valueProposition']),
    customerRelationships: parseCanvasItems(parsed['customerRelationships']),
    customerSegments: parseCanvasItems(parsed['customerSegments']),
    resources: parseCanvasItems(parsed['resources']),
    channels: parseCanvasItems(parsed['channels']),
    sharedId: typeof parsed?.sharedId === 'string' ? parsed.sharedId : undefined,
    description: typeof parsed?.description === 'string' ? parsed.description : undefined,
    aiGeneratedFromPrompt: typeof parsed?.aiGeneratedFromPrompt === 'string' ? parsed.aiGeneratedFromPrompt : undefined,
  };

  const result = ProjectSchema.safeParse(normalized);
  if (result.success) return result.data;
  throw new Error('Failed to migrate project to latest schema');
}

function parseAssociatedCosts(costs: unknown, revenueStreamId: string, projectId: string): z.infer<typeof AssociatedCost>[] {
  if (!Array.isArray(costs)) return [];
  return costs.filter(Boolean).map((c: unknown) => {
    if (!isRecord(c)) return { id: cryptoRandomId(), name: 'Cost', amount: 0, revenueStreamId, projectId };
    return {
      id: typeof c['id'] === 'string' ? c['id'] : cryptoRandomId(),
      name: typeof c['name'] === 'string' ? c['name'] : 'Cost',
      amount: numberOrZero(c['amount']),
      revenueStreamId,
      projectId: typeof c['projectId'] === 'string' ? c['projectId'] : projectId,
    };
  });
}

function parseSales(sales: unknown): z.infer<typeof ProductSales> | undefined {
  if (!isRecord(sales)) return undefined;
  return {
    volume: numberOrUndefined(sales['volume']),
    period: (sales['period'] === 'daily' ? 'daily' : 'monthly') as 'monthly' | 'daily',
  };
}

function parseCanvasItems(items: unknown): Array<{ id: string; text: string }> {
  if (!Array.isArray(items)) return [];
  return items.filter(Boolean).map((item: unknown) => {
    if (!isRecord(item)) return { id: cryptoRandomId(), text: '' };
    return {
      id: typeof item['id'] === 'string' ? item['id'] : cryptoRandomId(),
      text: typeof item['text'] === 'string' ? item['text'] : '',
    };
  });
}

function numberOrZero(n: unknown): number {
  return typeof n === 'number' && isFinite(n) && n >= 0 ? n : 0;
}

function numberOrUndefined(n: unknown): number | undefined {
  return typeof n === 'number' && isFinite(n) && n >= 0 ? n : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cryptoRandomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return (crypto as { randomUUID?: () => string }).randomUUID?.() || Math.random().toString(36).slice(2);
  return Math.random().toString(36).slice(2);
}


