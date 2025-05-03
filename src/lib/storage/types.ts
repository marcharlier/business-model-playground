export type Currency = 'GBP' | 'USD' | 'EUR';

export interface ProductSales {
  volume: number;
  period: 'monthly' | 'daily';
}

export interface Project {
  id: string;
  name: string;
  currency: Currency;
  createdAt: string;
  updatedAt: string;
  fixedCosts: FixedCost[];
  products: Product[];
  productSales?: Record<string, ProductSales>;
}

export interface FixedCost {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'annual';
  category: string;
  projectId: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  associatedCosts: AssociatedCost[];
  projectId: string;
}

export interface AssociatedCost {
  id: string;
  name: string;
  amount: number;
  productId: string;
  projectId: string;
} 