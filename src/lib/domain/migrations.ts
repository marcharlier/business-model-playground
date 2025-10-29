import { z } from 'zod';
import { FixedCost, Product, ProductSales, Project as ProjectSchema, UpfrontCost } from './schema';
import type { Project } from './types';

type LegacyFixedCost = Omit<z.infer<typeof FixedCost>, 'frequency'> & { frequency?: 'monthly' | 'annual' | 'upfront' };
type CurrencyLiteral = 'GBP' | 'USD' | 'EUR';

function isCurrency(x: unknown): x is CurrencyLiteral {
  return x === 'GBP' || x === 'USD' || x === 'EUR';
}

function coerceCurrency(input: unknown): CurrencyLiteral {
  const s = typeof input === 'string' ? input : 'GBP';
  return isCurrency(s) ? s : 'GBP';
}

/**
 * Migrate unknown input into the latest Project shape.
 * - Moves FixedCost with frequency 'upfront' into upfrontCosts
 * - Ensures defaults for missing collections
 * - Adds version=1 if missing
 * - Coerces currency to allowed enum
 */
export function migrateProject(raw: unknown): Project {
  // If already valid, return as-is
  const strict = ProjectSchema.safeParse(raw);
  if (strict.success) return strict.data;

  const parsed: Record<string, unknown> = isRecord(raw) ? raw : {};

  const id = typeof parsed['id'] === 'string' ? parsed['id'] as string : cryptoRandomId();
  const name = typeof parsed['name'] === 'string' ? parsed['name'] as string : 'Untitled Project';
  const createdAt = typeof parsed['createdAt'] === 'string' ? parsed['createdAt'] as string : new Date().toISOString();
  const updatedAt = new Date().toISOString();
  const currency = coerceCurrency(parsed['currency']);

  const products: Array<z.infer<typeof Product>> = Array.isArray(parsed['products']) ? (parsed['products'] as unknown[]).filter(Boolean).map((p: unknown) => {
    if (!isRecord(p)) return { id: cryptoRandomId(), name: 'Product', price: 0, associatedCosts: [], projectId: id };
    const pid = typeof p['id'] === 'string' ? (p['id'] as string) : cryptoRandomId();
    const pname = typeof p['name'] === 'string' ? (p['name'] as string) : 'Product';
    const price = numberOrZero(p['price']);
    const associatedCosts = Array.isArray(p['associatedCosts']) ? (p['associatedCosts'] as unknown[]).filter(Boolean).map((c: unknown) => {
      if (!isRecord(c)) return { id: cryptoRandomId(), name: 'Cost', amount: 0, productId: pid, projectId: id };
      return {
        id: typeof c['id'] === 'string' ? (c['id'] as string) : cryptoRandomId(),
        name: typeof c['name'] === 'string' ? (c['name'] as string) : 'Cost',
        amount: numberOrZero(c['amount']),
        productId: typeof c['productId'] === 'string' ? (c['productId'] as string) : pid,
        projectId: typeof c['projectId'] === 'string' ? (c['projectId'] as string) : id,
      };
    }) : [];
    const projId = typeof p['projectId'] === 'string' ? (p['projectId'] as string) : id;
    return { id: pid, name: pname, price, associatedCosts, projectId: projId };
  }) : [];

  const fixedCostsRaw: Array<LegacyFixedCost> = Array.isArray(parsed['fixedCosts']) ? parsed['fixedCosts'] as Array<LegacyFixedCost> : [];
  const upfrontFromFixed: Array<z.infer<typeof UpfrontCost>> = fixedCostsRaw
    .filter((c) => c?.frequency === 'upfront')
    .map((c) => ({ id: String(c?.id ?? cryptoRandomId()), name: String(c?.name ?? 'Upfront'), amount: numberOrZero(c?.amount), projectId: String(c?.projectId ?? id) }));

  const fixedCosts: Array<z.infer<typeof FixedCost>> = fixedCostsRaw
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

  const productSales: Record<string, z.infer<typeof ProductSales>> = isRecord(parsed['productSales'])
    ? Object.fromEntries(Object.entries(parsed['productSales'] as Record<string, unknown>).map(([k, v]) => {
        const vv: Record<string, unknown> = isRecord(v) ? v : {};
        const volume = numberOrZero(vv['volume']);
        const period = vv['period'] === 'daily' ? 'daily' : 'monthly';
        return [String(k), { volume, period }];
      })) as Record<string, z.infer<typeof ProductSales>>
    : {};

  const normalized: Project = {
    version: 1,
    id,
    name,
    currency,
    createdAt,
    updatedAt,
    fixedCosts,
    upfrontCosts: [...upfrontFromFixed, ...upfrontCosts],
    products,
    productSales,
    sharedId: typeof parsed?.sharedId === 'string' ? parsed.sharedId : undefined,
  } as Project;

  const result = ProjectSchema.safeParse(normalized);
  if (result.success) return result.data;
  // As last resort, throw to signal unrecoverable state
  throw new Error('Failed to migrate project to latest schema');
}

function numberOrZero(n: unknown): number {
  return typeof n === 'number' && isFinite(n) && n >= 0 ? n : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cryptoRandomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return (crypto as { randomUUID?: () => string }).randomUUID?.() || Math.random().toString(36).slice(2);
  return Math.random().toString(36).slice(2);
}


