'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LongPressButton } from '@/components/ui/long-press-button';
import { Trash2 } from 'lucide-react';
import type { CanvasItem } from '@/lib/domain/types';

interface CanvasItemFormProps {
  className?: string;
  item?: CanvasItem;
  onSave: (text: string) => void;
  onCancel: () => void;
  onDelete: () => void;
  isSubmitting: boolean;
  hideCancel?: boolean;
  itemLabel?: string;
}

export function CanvasItemForm({
  className,
  item,
  onSave,
  onCancel,
  onDelete,
  isSubmitting,
  hideCancel,
  itemLabel = 'item',
}: CanvasItemFormProps) {
  const [text, setText] = useState(item?.text ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSave(text.trim());
    }
  };

  return (
    <form className={cn('space-y-4', className)} onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="item-text" className="hidden capitalize">{itemLabel}</Label>
        <Input
          id="item-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isSubmitting}
          placeholder={`Enter ${itemLabel} description`}
        />
      </div>

      <Separator className="my-4" />

      <div className={cn(hideCancel ? 'flex flex-col' : 'flex flex-row justify-between', 'gap-2')}>
        {!hideCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="h-9 flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !text.trim()}
          className={cn('h-9', hideCancel ? 'w-full' : 'flex-1')}
        >
          {item ? 'Save changes' : `Add ${itemLabel}`}
        </Button>
      </div>

      {item && (
        <Accordion type="single" collapsible>
          <AccordionItem value="delete">
            <AccordionTrigger className="py-2 text-destructive">Delete this {itemLabel}?</AccordionTrigger>
            <AccordionContent>
              <LongPressButton
                variant="destructive"
                onLongPress={onDelete}
                disabled={isSubmitting}
                className="gap-2 w-full"
                duration={2000}
              >
                <Trash2 className="h-4 w-4" />
                Long press to delete
              </LongPressButton>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </form>
  );
}
