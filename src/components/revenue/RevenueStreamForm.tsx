import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import type {
  Product,
  Subscription,
  AssociatedCost,
  Currency,
  ProductSales,
} from '@/lib/storage/types';
import { ProductForm } from '@/components/products/ProductForm';
import { SubscriptionForm } from '@/components/subscriptions/SubscriptionForm';

type RevenueStreamType = 'product' | 'subscription';

interface RevenueStreamFormProps {
  className?: string;
  product?: Product;
  subscription?: Subscription;
  currency: Currency;
  onSaveProduct?: (
    name: string,
    price: number,
    associatedCosts: AssociatedCost[],
    sales: ProductSales
  ) => void;
  onSaveSubscription?: (
    name: string,
    price: number,
    pricePeriod: 'monthly' | 'annual',
    subscribers: number,
    associatedCosts: AssociatedCost[]
  ) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  hideCancel?: boolean;
  onDelete?: () => void;
}

export function RevenueStreamForm({
  className,
  product,
  subscription,
  currency,
  onSaveProduct,
  onSaveSubscription,
  onCancel,
  isSubmitting,
  hideCancel,
  onDelete,
}: RevenueStreamFormProps) {
  // Determine revenue type from existing item
  const existingType: RevenueStreamType | null = product ? 'product' : subscription ? 'subscription' : null;
  const [revenueType, setRevenueType] = useState<RevenueStreamType>(existingType || 'product');

  // Update revenue type when product/subscription changes (for new items only)
  // Use derived state for existing items to avoid effect issues
  const currentRevenueType = existingType || revenueType;

  const hasExistingItem = !!product || !!subscription;

  // If editing an existing item, show the appropriate form directly
  if (hasExistingItem) {
    if (product) {
      return (
        <ProductForm
          key={product.id}
          className={className}
          product={product}
          currency={currency}
          onSave={onSaveProduct!}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
          hideCancel={hideCancel}
          onDelete={onDelete}
        />
      );
    } else if (subscription) {
      return (
        <SubscriptionForm
          key={subscription.id}
          className={className}
          subscription={subscription}
          currency={currency}
          onSave={onSaveSubscription!}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
          hideCancel={hideCancel}
          onDelete={onDelete}
        />
      );
    }
  }

  // For new items, show type selector and appropriate form
  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="bg-muted rounded-md p-3 space-y-4 w-full">
          <div className="space-y-2">
            <Label>Revenue type</Label>
            <Select
              value={currentRevenueType}
              onValueChange={(value) => setRevenueType(value as RevenueStreamType)}
            >
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Select a revenue type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product">Product sales</SelectItem>
                <SelectItem value="subscription">Subscription revenue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {currentRevenueType === 'product' ? (
          <ProductForm
            key={`new-product-${revenueType}`}
            currency={currency}
            onSave={onSaveProduct!}
            onCancel={onCancel}
            isSubmitting={isSubmitting}
            hideCancel={hideCancel}
            onDelete={onDelete}
          />
        ) : (
          <SubscriptionForm
            key={`new-subscription-${revenueType}`}
            currency={currency}
            onSave={onSaveSubscription!}
            onCancel={onCancel}
            isSubmitting={isSubmitting}
            hideCancel={hideCancel}
            onDelete={onDelete}
          />
        )}
      </div>
    </div>
  );
}
