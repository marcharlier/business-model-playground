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
import { CostForm, type CostFormData } from './CostForm';
import type { FixedCost, UpfrontCost, Currency } from '@/lib/storage/types';

type UnifiedCost = FixedCost | UpfrontCost;

interface CostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cost?: UnifiedCost;
  costType: 'upfront' | 'operating';
  currency: Currency;
  onSave: (data: CostFormData) => void;
  isSubmitting: boolean;
  onDelete?: () => void;
  toggleEnabled: boolean;
  categoryPreselected?: string;
  prefillName?: string;
  prefillAmount?: string;
  prefillFrequency?: 'monthly' | 'annual';
}

export function CostDialog({
  open,
  onOpenChange,
  cost,
  costType,
  currency,
  onSave,
  isSubmitting,
  onDelete,
  toggleEnabled,
  categoryPreselected,
  prefillName,
  prefillAmount,
  prefillFrequency,
}: CostDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const title = cost ? 'Edit cost' : 'Add cost';
  const description = cost
    ? 'Make changes to your cost here.'
    : 'Add a new cost to your business.';

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <CostForm
            cost={cost}
            costType={costType}
            currency={currency}
            onSave={onSave}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
            onDelete={onDelete}
            toggleEnabled={toggleEnabled}
            categoryPreselected={categoryPreselected}
            prefillName={prefillName}
            prefillAmount={prefillAmount}
            prefillFrequency={prefillFrequency}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <CostForm
            cost={cost}
            costType={costType}
            currency={currency}
            onSave={onSave}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
            hideCancel
            onDelete={onDelete}
            toggleEnabled={toggleEnabled}
            categoryPreselected={categoryPreselected}
            prefillName={prefillName}
            prefillAmount={prefillAmount}
            prefillFrequency={prefillFrequency}
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
