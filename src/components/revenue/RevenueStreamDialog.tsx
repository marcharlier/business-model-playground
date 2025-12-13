import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { RevenueStreamForm } from './RevenueStreamForm';
import type { Product, Subscription, AssociatedCost, Currency, ProductSales } from '@/lib/storage/types';

interface RevenueStreamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  subscription?: Subscription;
  currency: Currency;
  onSaveProduct?: (name: string, price: number, associatedCosts: AssociatedCost[], sales: ProductSales) => void;
  onSaveSubscription?: (name: string, price: number, pricePeriod: 'monthly' | 'annual', subscribers: number, associatedCosts: AssociatedCost[]) => void;
  isSubmitting: boolean;
  onDelete?: () => void;
}

export function RevenueStreamDialog({
  open,
  onOpenChange,
  product,
  subscription,
  currency,
  onSaveProduct,
  onSaveSubscription,
  isSubmitting,
  onDelete
}: RevenueStreamDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const hasExistingItem = !!product || !!subscription;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{hasExistingItem ? 'Edit revenue stream' : 'Add revenue stream'}</DialogTitle>
            <DialogDescription>
              {hasExistingItem 
                ? 'Make changes to your revenue stream here.'
                : 'Add a new revenue stream to your business.'}
            </DialogDescription>
          </DialogHeader>
          <RevenueStreamForm
            product={product}
            subscription={subscription}
            currency={currency}
            onSaveProduct={onSaveProduct}
            onSaveSubscription={onSaveSubscription}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
            onDelete={onDelete}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{hasExistingItem ? 'Edit revenue stream' : 'Add revenue stream'}</DrawerTitle>
          <DrawerDescription>
            {hasExistingItem 
              ? 'Make changes to your revenue stream here.'
              : 'Add a new revenue stream to your business.'}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <RevenueStreamForm
            product={product}
            subscription={subscription}
            currency={currency}
            onSaveProduct={onSaveProduct}
            onSaveSubscription={onSaveSubscription}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
            hideCancel
            onDelete={onDelete}
          />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
