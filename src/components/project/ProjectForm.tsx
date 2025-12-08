'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { LongPressButton } from '@/components/ui/long-press-button';
import type { Project, Currency } from '@/lib/storage/types';

const MAX_DESCRIPTION_LENGTH = 600;

export interface ProjectFormData {
  name: string;
  currency: Currency;
  description: string;
}

interface ProjectFormProps {
  className?: string;
  project: Project;
  onSave: (data: ProjectFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  hideCancel?: boolean;
  onDelete?: () => void;
}

export function ProjectForm({
  className,
  project,
  onSave,
  onCancel,
  isSubmitting,
  hideCancel = false,
  onDelete,
}: ProjectFormProps) {
  const [name, setName] = useState(project.name);
  const [currency, setCurrency] = useState<Currency>(project.currency);
  const [description, setDescription] = useState(project.description ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({
        name: name.trim(),
        currency,
        description: description.trim(),
      });
    }
  };

  const isValid = name.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="project-name">Project name</Label>
          <Input
            id="project-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            placeholder="Enter project name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={currency}
            onValueChange={(value) => setCurrency(value as Currency)}
            disabled={isSubmitting}
          >
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="business-description">Business description</Label>
          <Textarea
            id="business-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={MAX_DESCRIPTION_LENGTH}
            disabled={isSubmitting}
            placeholder="Describe your business..."
          />
          <div className="text-xs text-muted-foreground text-right">
            {description.length}/{MAX_DESCRIPTION_LENGTH}
          </div>
        </div>

        <Separator className="my-4" />

        <div className={`${hideCancel ? 'flex flex-col' : 'flex flex-row justify-between'} gap-2`}>
          {!hideCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-9 flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`h-9 ${hideCancel ? 'w-full' : 'flex-1'}`}
          >
            Save changes
          </Button>
        </div>

        {onDelete && (
          <Accordion type="single" collapsible>
            <AccordionItem value="delete" className="border-none">
              <AccordionTrigger className="text-sm text-muted-foreground hover:text-destructive py-2">
                Delete this project?
              </AccordionTrigger>
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
      </div>
    </form>
  );
}

