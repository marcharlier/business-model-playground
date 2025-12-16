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
import { ProductForm } from './ProductForm';
import type { Product, AssociatedCost, Currency, ProductSales } from '@/lib/storage/types';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  currency: Currency;
  onSave: (name: string, price: number | undefined, associatedCosts: AssociatedCost[], sales: ProductSales) => void;
  isSubmitting: boolean;
  onDelete?: () => void;
}

export function ProductDialog({
  open,
  onOpenChange,
  product,
  currency,
  onSave,
  isSubmitting,
  onDelete
}: ProductDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{product ? 'Edit revenue stream' : 'Add revenue stream'}</DialogTitle>
            <DialogDescription>
              {product 
                ? 'Make changes to your revenue stream here.'
                : 'Add a new revenue stream to your business.'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={product}
            currency={currency}
            onSave={onSave}
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
          <DrawerTitle>{product ? 'Edit revenue stream' : 'Add revenue stream'}</DrawerTitle>
          <DrawerDescription>
            {product 
              ? 'Make changes to your revenue stream here.'
              : 'Add a new revenue stream to your business.'}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <ProductForm
            product={product}
            currency={currency}
            onSave={onSave}
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