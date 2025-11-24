import { z } from 'zod';
import { Currency, CanvasItem as CanvasItemSchema, AssociatedCost, ProductSales, Product, FixedCost, UpfrontCost, CostStructure, RevenueStreams, Project } from './schema';

export type Currency = z.infer<typeof Currency>;
export type CanvasItem = z.infer<typeof CanvasItemSchema>;
export type AssociatedCost = z.infer<typeof AssociatedCost>;
export type ProductSales = z.infer<typeof ProductSales>;
export type Product = z.infer<typeof Product>;
export type FixedCost = z.infer<typeof FixedCost>;
export type UpfrontCost = z.infer<typeof UpfrontCost>;
export type CostStructure = z.infer<typeof CostStructure>;
export type RevenueStreams = z.infer<typeof RevenueStreams>;
export type Project = z.infer<typeof Project>;


