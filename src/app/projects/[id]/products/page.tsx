'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Product, AssociatedCost } from '@/lib/storage/types';
import { formatCurrency } from '@/lib/utils/currency';
import { 
  calculateProfitMargin, 
  formatProfitMargin, 
  getProfitMarginColorClass,
  calculateProductTotalCost
} from '@/lib/utils/financial';
import { productStorage } from '@/lib/storage/productStorage';
import { PencilIcon, CopyIcon, TrashIcon, XIcon, PlusIcon, Plus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { useProject } from '@/lib/context/ProjectContext';

export default function ProductsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { project, isLoading, refreshProject } = useProject();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isAddingNewProduct, setIsAddingNewProduct] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [associatedCosts, setAssociatedCosts] = useState<AssociatedCost[]>([]);
  const [newCostRows, setNewCostRows] = useState<{id: string, name: string, amount: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const loadedProducts = productStorage.getProducts(projectId);
        setProducts(loadedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, [projectId]);

  const handleDuplicate = (productId: string) => {
    try {
      // Find the product to duplicate
      const productToDuplicate = project?.products.find(p => p.id === productId);
      if (!productToDuplicate) return;
      
      // Set up the form with the duplicated product's data
      setIsDuplicating(true);
      setProductName(`${productToDuplicate.name} (Copy)`);
      setProductPrice(productToDuplicate.price.toString());
      
      // Create new associated costs with new IDs
      const duplicatedCosts = productToDuplicate.associatedCosts.map(cost => ({
        ...cost,
        id: crypto.randomUUID(),
        productId: '', // Will be set when the product is created
        projectId: project?.id || ''
      }));
      
      setAssociatedCosts(duplicatedCosts);
      setNewCostRows([]);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error preparing to duplicate product:', error);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      const success = productStorage.deleteProduct(productId, params.id as string);
      
      if (success) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        refreshProject(); // Refresh project context to update onboarding progress
      } else {
        console.error('Failed to delete product. Product ID:', productId);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEditClick = (product: Product) => {
    // Cancel any in-progress additions
    if (isAddingNewProduct) {
      setIsAddingNewProduct(false);
      setProductName('');
      setProductPrice('');
      setAssociatedCosts([]);
      setNewCostRows([]);
    }

    // Start editing the selected product
    setEditingProductId(product.id);
    setProductName(product.name);
    setProductPrice(product.price.toString());
    setAssociatedCosts([...product.associatedCosts]);
    setNewCostRows([]);
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setProductName('');
    setProductPrice('');
    setAssociatedCosts([]);
    setNewCostRows([]);
  };

  const handleAddNewProduct = () => {
    // Cancel any in-progress edits
    if (editingProductId) {
      setEditingProductId(null);
      setProductName('');
      setProductPrice('');
      setAssociatedCosts([]);
      setNewCostRows([]);
    }

    // Start adding new product
    setIsAddingNewProduct(true);
    setProductName('');
    setProductPrice('');
    setAssociatedCosts([]);
    setNewCostRows([]);
  };

  const handleCancelAdd = () => {
    setIsAddingNewProduct(false);
    setIsDuplicating(false);
    setProductName('');
    setProductPrice('');
    setAssociatedCosts([]);
    setNewCostRows([]);
  };

  const handleAddCostRow = () => {
    const newRow = {
      id: crypto.randomUUID(),
      name: '',
      amount: ''
    };
    setNewCostRows([...newCostRows, newRow]);
  };

  const handleRemoveCostRow = (rowId: string) => {
    setNewCostRows(newCostRows.filter(row => row.id !== rowId));
  };

  const handleUpdateCostRow = (rowId: string, field: 'name' | 'amount', value: string) => {
    setNewCostRows(newCostRows.map(row => 
      row.id === rowId ? { ...row, [field]: value } : row
    ));
  };

  const handleRemoveCost = (costId: string) => {
    setAssociatedCosts(associatedCosts.filter(cost => cost.id !== costId));
  };

  const handleUpdateCost = (costId: string, field: keyof AssociatedCost, value: string | number) => {
    setAssociatedCosts(associatedCosts.map(cost => 
      cost.id === costId ? { ...cost, [field]: value } : cost
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName || !productPrice || !project) {
      return;
    }

    const price = Number.parseFloat(productPrice);
    if (Number.isNaN(price) || price <= 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Process new cost rows and add valid ones to associated costs
      let finalAssociatedCosts = [...associatedCosts];
      
      for (const row of newCostRows) {
        if (row.name && row.amount) {
          const amount = Number.parseFloat(row.amount);
          if (!Number.isNaN(amount) && amount > 0) {
            const newCost: AssociatedCost = {
              id: crypto.randomUUID(),
              name: row.name,
              amount: amount,
              productId: editingProductId || '',
              projectId: project.id
            };
            finalAssociatedCosts = [...finalAssociatedCosts, newCost];
          }
        }
      }

      if (isAddingNewProduct || isDuplicating) {
        // Create a new product
        const newProduct: Product = {
          id: crypto.randomUUID(),
          name: productName,
          price: price,
          associatedCosts: finalAssociatedCosts,
          projectId: project.id
        };

        // Add the product to storage
        productStorage.createProduct(newProduct, project.id);

        // Update the local state
        setProducts(prev => [newProduct, ...prev]);
        refreshProject();

        // Reset the form
        handleCancelAdd();
      } else if (editingProductId) {
        // Find the product to update
        const productToUpdate = products.find(p => p.id === editingProductId);
        if (!productToUpdate) {
          setIsSubmitting(false);
          return;
        }

        // Update the product
        const updatedProduct: Product = {
          ...productToUpdate,
          name: productName,
          price: price,
          associatedCosts: finalAssociatedCosts
        };

        // Update the product in storage
        productStorage.updateProduct(updatedProduct, project.id);

        // Update the local state
        setProducts(prev => prev.map(p => 
          p.id === editingProductId ? updatedProduct : p
        ));
        refreshProject();

        // Reset the form
        handleCancelEdit();
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setIsSubmitting(false);
    }
  };

  if (isLoading || !project || isLoadingProducts) {
    return <div>Loading...</div>;
  }

  // Calculate average product profit margin
  const averageProductProfitMargin = products.length > 0
    ? products.reduce((total, product) => total + calculateProfitMargin(product), 0) / products.length
    : 0;

  return (
    <div>
      <OnboardingProgress 
        hasCosts={project.fixedCosts.length > 0}
        hasProducts={products.length > 0}
        projectId={project.id}
        currentPage="products"
      />
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Products</h1>
          <div className="hidden sm:block">
            <Button variant="outline" size="sm" onClick={handleAddNewProduct}>
              <Plus className="h-4 w-4 mr-1" />
              Add Product
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Products</p>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Average Margin</p>
            <p className="text-2xl font-bold">{formatProfitMargin(averageProductProfitMargin)}</p>
          </div>
        </div>
      </div>

      {products.length === 0 && !isAddingNewProduct && !isDuplicating ? (
        <div className="text-center py-10 border rounded-lg">
          <p className="text-lg mb-4">No products or services added yet</p>
          <p className="text-muted-foreground mb-4">
            Products and services are what you sell to your customers
          </p>
          <Button onClick={handleAddNewProduct}>Add Your First Product</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mobile Add Product Button */}
          <div className={`sm:hidden ${(editingProductId || isAddingNewProduct) ? 'hidden' : ''}`}>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleAddNewProduct}
              className="w-full gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Product
            </Button>
          </div>

          {/* New Product Form */}
          {(isAddingNewProduct || isDuplicating) && (
            <Card className="h-full">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{isDuplicating ? 'Duplicate Product' : 'New Product'}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Product Name</Label>
                    <Input
                      id="product-name"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="product-price">Price</Label>
                    <div className="relative">
                      <Input
                        id="product-price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        required
                        className="pl-6"
                      />
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        {project.currency === 'GBP' ? '£' : project.currency === 'USD' ? '$' : '€'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Associated Costs</Label>
                    </div>
                    
                    {associatedCosts.length > 0 && (
                      <div className="space-y-2">
                        {associatedCosts.map(cost => (
                          <div key={cost.id} className="flex items-center gap-2">
                            <div className="flex-1">
                              <Label htmlFor={`cost-name-${cost.id}`} className="text-xs">Cost Name</Label>
                              <Input
                                id={`cost-name-${cost.id}`}
                                value={cost.name}
                                onChange={(e) => handleUpdateCost(cost.id, 'name', e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="flex-1">
                              <Label htmlFor={`cost-amount-${cost.id}`} className="text-xs">Amount</Label>
                              <div className="relative">
                                <Input
                                  id={`cost-amount-${cost.id}`}
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={cost.amount}
                                  onChange={(e) => handleUpdateCost(cost.id, 'amount', Number(e.target.value))}
                                  className="h-8 text-sm pl-6"
                                />
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                  {project.currency === 'GBP' ? '£' : project.currency === 'USD' ? '$' : '€'}
                                </span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleRemoveCost(cost.id)}
                            >
                              <XIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* New cost rows */}
                    {newCostRows.length > 0 && (
                      <div className="space-y-2">
                        {newCostRows.map(row => (
                          <div key={row.id} className="flex items-center gap-2 p-2 border rounded-md">
                            <div className="flex-1">
                              <Label htmlFor={`new-cost-name-${row.id}`} className="text-xs">Cost Name</Label>
                              <Input
                                id={`new-cost-name-${row.id}`}
                                value={row.name}
                                onChange={(e) => handleUpdateCostRow(row.id, 'name', e.target.value)}
                                placeholder="Enter cost name"
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="flex-1">
                              <Label htmlFor={`new-cost-amount-${row.id}`} className="text-xs">Amount</Label>
                              <div className="relative">
                                <Input
                                  id={`new-cost-amount-${row.id}`}
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={row.amount}
                                  onChange={(e) => handleUpdateCostRow(row.id, 'amount', e.target.value)}
                                  placeholder="0.00"
                                  className="h-8 text-sm pl-6"
                                />
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                  {project.currency === 'GBP' ? '£' : project.currency === 'USD' ? '$' : '€'}
                                </span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleRemoveCostRow(row.id)}
                            >
                              <XIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Add Cost button */}
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAddCostRow}
                      className="h-8 w-full"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Cost
                    </Button>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCancelAdd}
                      className="h-8"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      size="sm" 
                      disabled={isSubmitting}
                      className="h-8"
                    >
                      Save
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Existing Products */}
          {products.map(product => {
            const profitMargin = calculateProfitMargin(product);
            const profitMarginColorClass = getProfitMarginColorClass(profitMargin);
            const totalCost = calculateProductTotalCost(product);
            
            // If this product is being edited, show the edit form
            if (editingProductId === product.id) {
              return (
                <Card key={product.id} className="h-full">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Edit Product</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="product-name">Product Name</Label>
                        <Input
                          id="product-name"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="product-price">Price</Label>
                        <div className="relative">
                          <Input
                            id="product-price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={productPrice}
                            onChange={(e) => setProductPrice(e.target.value)}
                            required
                            className="pl-6"
                          />
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            {project.currency === 'GBP' ? '£' : project.currency === 'USD' ? '$' : '€'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>Associated Costs</Label>
                        </div>
                        
                        {associatedCosts.length > 0 && (
                          <div className="space-y-2">
                            {associatedCosts.map(cost => (
                              <div key={cost.id} className="flex items-center gap-2">
                                <div className="flex-1">
                                  <Label htmlFor={`cost-name-${cost.id}`} className="text-xs">Cost Name</Label>
                                  <Input
                                    id={`cost-name-${cost.id}`}
                                    value={cost.name}
                                    onChange={(e) => handleUpdateCost(cost.id, 'name', e.target.value)}
                                    className="h-8 text-sm"
                                  />
                                </div>
                                <div className="flex-1">
                                  <Label htmlFor={`cost-amount-${cost.id}`} className="text-xs">Amount</Label>
                                  <div className="relative">
                                    <Input
                                      id={`cost-amount-${cost.id}`}
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={cost.amount}
                                      onChange={(e) => handleUpdateCost(cost.id, 'amount', Number(e.target.value))}
                                      className="h-8 text-sm pl-6"
                                    />
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                      {project.currency === 'GBP' ? '£' : project.currency === 'USD' ? '$' : '€'}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => handleRemoveCost(cost.id)}
                                >
                                  <XIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* New cost rows */}
                        {newCostRows.length > 0 && (
                          <div className="space-y-2">
                            {newCostRows.map(row => (
                              <div key={row.id} className="flex items-center gap-2 p-2 border rounded-md">
                                <div className="flex-1">
                                  <Label htmlFor={`new-cost-name-${row.id}`} className="text-xs">Cost Name</Label>
                                  <Input
                                    id={`new-cost-name-${row.id}`}
                                    value={row.name}
                                    onChange={(e) => handleUpdateCostRow(row.id, 'name', e.target.value)}
                                    placeholder="Enter cost name"
                                    className="h-8 text-sm"
                                  />
                                </div>
                                <div className="flex-1">
                                  <Label htmlFor={`new-cost-amount-${row.id}`} className="text-xs">Amount</Label>
                                  <div className="relative">
                                    <Input
                                      id={`new-cost-amount-${row.id}`}
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={row.amount}
                                      onChange={(e) => handleUpdateCostRow(row.id, 'amount', e.target.value)}
                                      placeholder="0.00"
                                      className="h-8 text-sm pl-6"
                                    />
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                      {project.currency === 'GBP' ? '£' : project.currency === 'USD' ? '$' : '€'}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => handleRemoveCostRow(row.id)}
                                >
                                  <XIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Add Cost button */}
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={handleAddCostRow}
                          className="h-8 w-full"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add Cost
                        </Button>
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={handleCancelEdit}
                          className="h-8"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          size="sm" 
                          disabled={isSubmitting}
                          className="h-8"
                        >
                          Save
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              );
            }
            
            // Otherwise, show the regular product card
            return (
              <Card key={product.id} className="h-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>{product.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => handleEditClick(product)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => handleDuplicate(product.id)}
                            >
                              <CopyIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Duplicate</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive" 
                              onClick={() => handleDelete(product.id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="text-lg font-medium">{formatCurrency(product.price, project.currency)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Costs</p>
                      <p className="text-lg font-medium">{formatCurrency(totalCost, project.currency)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Profit Margin</p>
                      <p className={`text-lg font-medium ${profitMarginColorClass}`}>
                        {formatProfitMargin(profitMargin)}
                      </p>
                    </div>
                  </div>
                  
                  {product.associatedCosts.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Associated Costs</p>
                      <ul className="space-y-1">
                        {product.associatedCosts.map(cost => (
                          <li key={cost.id} className="flex justify-between text-sm">
                            <span>{cost.name}</span>
                            <span>{formatCurrency(cost.amount, project.currency)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 