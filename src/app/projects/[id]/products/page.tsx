'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product, AssociatedCost } from '@/lib/storage/types';
import { formatCurrency } from '@/lib/utils/currency';
import { 
  calculateProfitMargin, 
  formatProfitMargin, 
  getProfitMarginColorClass,
  calculateProductTotalCost
} from '@/lib/utils/financial';
import { productStorage } from '@/lib/storage/productStorage';
import { PencilIcon, CopyIcon, TrashIcon, Plus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { useProject } from '@/lib/context/ProjectContext';
import { ProductDialog } from '@/components/products/ProductDialog';

export default function ProductsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { project, isLoading, refreshProject } = useProject();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isAddingNewProduct, setIsAddingNewProduct] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [duplicatingProduct, setDuplicatingProduct] = useState<Product | undefined>();
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
      
      // Create a copy of the product with "(Copy)" appended to the name
      const productToDuplicateWithCopyName = {
        ...productToDuplicate,
        name: `${productToDuplicate.name} (Copy)`
      };
      
      // Set up the form with the duplicated product's data
      setIsDuplicating(true);
      setIsAddingNewProduct(true);
      setDuplicatingProduct(productToDuplicateWithCopyName);
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
    setEditingProductId(product.id);
  };

  const handleCancel = () => {
    if (isAddingNewProduct) {
      setIsAddingNewProduct(false);
      setIsDuplicating(false);
      setDuplicatingProduct(undefined);
    }
    if (editingProductId) {
      setEditingProductId(null);
    }
  };

  const handleAddNewProduct = () => {
    setIsAddingNewProduct(true);
  };

  const handleSave = async (name: string, price: number, associatedCosts: AssociatedCost[]) => {
    if (!project) return;

    setIsSubmitting(true);
    try {
      if (isAddingNewProduct || isDuplicating) {
        // Create a new product
        const newProduct: Product = {
          id: crypto.randomUUID(),
          name: name,
          price: price,
          associatedCosts: associatedCosts.map(cost => ({
            ...cost,
            id: crypto.randomUUID(),
            productId: '', // Will be set when the product is created
            projectId: project.id
          })),
          projectId: project.id
        };

        // Add the product to storage
        productStorage.createProduct(newProduct, project.id);

        // Update the local state
        setProducts(prev => [newProduct, ...prev]);
        refreshProject();

        // Reset the form
        handleCancel();
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
          name,
          price,
          associatedCosts
        };

        // Update the product in storage
        productStorage.updateProduct(updatedProduct, project.id);

        // Update the local state
        setProducts(prev => prev.map(p => 
          p.id === editingProductId ? updatedProduct : p
        ));
        refreshProject();

        // Reset the form
        handleCancel();
      }
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
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

  const editingProduct = editingProductId ? products.find(p => p.id === editingProductId) : undefined;

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
          <div className="sm:hidden">
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

          {/* Product Dialog */}
          <ProductDialog
            open={isAddingNewProduct || !!editingProductId}
            onOpenChange={(open) => !open && handleCancel()}
            product={isDuplicating ? duplicatingProduct : editingProduct}
            currency={project.currency}
            onSave={handleSave}
            isSubmitting={isSubmitting}
          />

          {/* Existing Products */}
          {products.map(product => {
            const profitMargin = calculateProfitMargin(product);
            const profitMarginColorClass = getProfitMarginColorClass(profitMargin);
            const totalCost = calculateProductTotalCost(product);
            
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
                      <p className="text-lg font-medium">{product.price === 0 ? 'Free' : formatCurrency(product.price, project.currency)}</p>
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