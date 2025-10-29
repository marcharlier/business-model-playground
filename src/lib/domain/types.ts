import { z } from 'zod';
import { Currency, AssociatedCost, ProductSales, Product, FixedCost, UpfrontCost, Project } from './schema';

export type Currency = z.infer<typeof Currency>;
export type AssociatedCost = z.infer<typeof AssociatedCost>;
export type ProductSales = z.infer<typeof ProductSales>;
export type Product = z.infer<typeof Product>;
export type FixedCost = z.infer<typeof FixedCost>;
export type UpfrontCost = z.infer<typeof UpfrontCost>;
export type Project = z.infer<typeof Project>;


