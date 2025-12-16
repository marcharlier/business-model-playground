import { z } from 'zod';
import { 
  Currency, 
  CanvasItem as CanvasItemSchema, 
  AssociatedCost, 
  ProductSales, 
  Product, 
  Subscription, 
  FixedCost, 
  UpfrontCost, 
  CostStructure, 
  RevenueStreams, 
  RevenueStream,
  ProductRevenueStream,
  SubscriptionRevenueStream,
  Project 
} from './schema';

export type Currency = z.infer<typeof Currency>;
export type CanvasItem = z.infer<typeof CanvasItemSchema>;
export type AssociatedCost = z.infer<typeof AssociatedCost>;
export type ProductSales = z.infer<typeof ProductSales>;

// Unified Revenue Stream types
export type RevenueStream = z.infer<typeof RevenueStream>;
export type ProductRevenueStream = z.infer<typeof ProductRevenueStream>;
export type SubscriptionRevenueStream = z.infer<typeof SubscriptionRevenueStream>;

// Legacy types - kept for backward compatibility
export type Product = z.infer<typeof Product>;
export type Subscription = z.infer<typeof Subscription>;

export type FixedCost = z.infer<typeof FixedCost>;
export type UpfrontCost = z.infer<typeof UpfrontCost>;
export type CostStructure = z.infer<typeof CostStructure>;
export type RevenueStreams = z.infer<typeof RevenueStreams>;
export type Project = z.infer<typeof Project>;


