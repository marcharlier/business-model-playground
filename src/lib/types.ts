export interface AssociatedCost {
  id: string;
  name: string;
  amount: number;
  productId: string;
  projectId: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  associatedCosts: AssociatedCost[];
  projectId: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  products: Product[];
  fixedCosts: FixedCost[];
  createdAt: string;
  updatedAt: string;
}

export interface FixedCost {
  id: string;
  name: string;
  amount: number;
  projectId: string;
} 