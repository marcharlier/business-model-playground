import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product, AssociatedCost } from '../lib/storage/types';
import { productStorage } from '../lib/storage/productStorage';

interface ProductFormProps {
  projectId: string;
  product?: Product;
  isDuplicate?: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function ProductForm({ projectId, product, isDuplicate = false, onSave, onCancel }: ProductFormProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [associatedCosts, setAssociatedCosts] = useState<AssociatedCost[]>([]);

  useEffect(() => {
    if (product) {
      // If this is a duplicate, append "(Copy)" to the name
      setName(isDuplicate ? `${product.name} (Copy)` : product.name);
      setPrice(product.price);
      
      if (isDuplicate) {
        // For duplicates, we need to create new IDs
        const newAssociatedCosts = product.associatedCosts.map(cost => ({
          ...cost,
          id: crypto.randomUUID(),
          productId: '', // Will be set when the product is created
          projectId
        }));
        setAssociatedCosts(newAssociatedCosts);
      } else {
        // For editing, keep the original associated costs
        setAssociatedCosts(product.associatedCosts);
      }
    }
  }, [product, projectId, isDuplicate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with:', { name, price, associatedCosts, projectId, isDuplicate });
    
    if (product && !isDuplicate) {
      // Update existing product
      console.log('Updating existing product:', product.id);
      productStorage.updateProduct({
        ...product,
        name,
        price,
        associatedCosts
      }, projectId);
    } else {
      // Create new product (either from scratch or as a duplicate)
      const newProduct = {
        id: crypto.randomUUID(),
        name,
        price,
        associatedCosts: associatedCosts.map(cost => ({
          ...cost,
          productId: '', // Will be set when the product is created
          projectId
        })),
        projectId
      };
      console.log('Creating new product:', newProduct);
      productStorage.createProduct(newProduct, projectId);
    }
    
    onSave();
  };

  const addAssociatedCost = () => {
    const newCost: AssociatedCost = {
      id: crypto.randomUUID(),
      name: '',
      amount: 0,
      productId: product?.id ?? '',
      projectId
    };
    setAssociatedCosts([...associatedCosts, newCost]);
  };

  const updateAssociatedCost = (costId: string, field: keyof AssociatedCost, value: string | number) => {
    setAssociatedCosts(associatedCosts.map(cost => 
      cost.id === costId ? { ...cost, [field]: value } : cost
    ));
  };

  const removeAssociatedCost = (costId: string) => {
    setAssociatedCosts(associatedCosts.filter(cost => cost.id !== costId));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{product ? 'Edit Product' : 'New Product'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Associated Costs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {associatedCosts.map((cost) => (
            <div key={cost.id} className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`cost-name-${cost.id}`}>Cost Name</Label>
                <Input
                  id={`cost-name-${cost.id}`}
                  value={cost.name}
                  onChange={(e) => updateAssociatedCost(cost.id, 'name', e.target.value)}
                  required
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor={`cost-amount-${cost.id}`}>Amount</Label>
                <Input
                  id={`cost-amount-${cost.id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={cost.amount}
                  onChange={(e) => updateAssociatedCost(cost.id, 'amount', Number(e.target.value))}
                  required
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                onClick={() => removeAssociatedCost(cost.id)}
              >
                Remove
              </Button>
            </div>
          ))}
          
          <Button type="button" onClick={addAssociatedCost}>
            Add Associated Cost
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
} 