'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateUUID } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { CanvasItemForm } from './CanvasItemForm';
import type { CanvasItem } from '@/lib/domain/types';

interface CanvasSectionEditableCardProps {
  items: CanvasItem[];
  title: string;
  icon: LucideIcon;
  onUpdate: (items: CanvasItem[]) => void;
  className?: string;
  itemLabel?: string;
}

export function CanvasSectionEditableCard({
  items,
  title,
  icon: Icon,
  onUpdate,
  className,
  itemLabel = 'item',
}: CanvasSectionEditableCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleEditClick = (item: CanvasItem) => {
    setEditingItemId(item.id);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingItemId(null);
    setIsSubmitting(false);
  };

  const handleSave = async (text: string) => {
    setIsSubmitting(true);
    try {
      if (editingItemId) {
        // Update existing item
        const updatedItems = items.map((p) =>
          p.id === editingItemId ? { ...p, text } : p
        );
        onUpdate(updatedItems);
      } else if (isAdding) {
        // Create new item
        const newItem: CanvasItem = {
          id: generateUUID(),
          text,
        };
        onUpdate([...items, newItem]);
      }

      // Reset form
      handleCancel();
    } catch (error) {
      console.error(`Error saving ${itemLabel}:`, error);
      setIsSubmitting(false);
    }
  };

  const handleDelete = (itemId: string) => {
    try {
      const updatedItems = items.filter((p) => p.id !== itemId);
      onUpdate(updatedItems);
      handleCancel(); // Close the form after successful deletion
    } catch (error) {
      console.error(`Error deleting ${itemLabel}:`, error);
    }
  };

  const editingItem = editingItemId
    ? items.find((p) => p.id === editingItemId)
    : undefined;

  const renderForm = () => {
    const form = (
      <CanvasItemForm
        item={editingItem}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={() => editingItem && handleDelete(editingItem.id)}
        isSubmitting={isSubmitting}
        hideCancel={!isDesktop}
        itemLabel={itemLabel}
      />
    );

    if (isDesktop) {
      return (
        <Dialog open={isAdding || !!editingItemId} onOpenChange={(open) => !open && handleCancel()}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? `Edit ${itemLabel}` : `Add ${itemLabel}`}</DialogTitle>
              <DialogDescription>
                {editingItem
                  ? `Make changes to your ${itemLabel}.`
                  : `Add a new ${itemLabel} to your business model.`}
              </DialogDescription>
            </DialogHeader>
            {form}
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Drawer open={isAdding || !!editingItemId} onOpenChange={(open) => !open && handleCancel()} repositionInputs={false}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{editingItem ? `Edit ${itemLabel}` : `Add ${itemLabel}`}</DrawerTitle>
            <DrawerDescription>
              {editingItem
                ? `Make changes to your ${itemLabel}.`
                : `Add a new ${itemLabel} to your business model.`}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            {form}
          </div>
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  };

  return (
    <>
      <Card
        className={cn(
          'flex h-full flex-col rounded-lg gap-0 border-black/5 bg-background p-1 shadow-md',
          className,
        )}
      >
        <CardHeader className="space-y-2 px-2 py-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base font-medium text-foreground">{title}</CardTitle>
            <div className="">
              <Icon className="h-4 w-4 text-muted-foreground/80" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 min-h-0 flex-col px-2 pt-0">
          <ScrollArea className="flex-1 min-h-0">
            <div className="flex flex-col gap-2 overflow-hidden pr-2">
              {items.length > 0 ? (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-muted/80 px-1 py-1 text-xs font-medium text-muted-foreground cursor-pointer hover:bg-muted transition-colors hover:bg-foreground/20"
                    onClick={() => handleEditClick(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleEditClick(item);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <span className="min-w-0 truncate">{item.text}</span>
                    <Pencil className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-border/60 px-3 py-6 text-center text-xs text-muted-foreground">
                  Nothing captured yet
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="mt-auto flex w-full flex-col gap-2 px-2 pb-2 pt-0">
          <Separator className="bg-border/70" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-full justify-center rounded-lg border border-border bg-background text-xs font-medium text-foreground shadow-none"
            onClick={handleAddClick}
          >
            Add more
          </Button>
        </CardFooter>
      </Card>
      {renderForm()}
    </>
  );
}
