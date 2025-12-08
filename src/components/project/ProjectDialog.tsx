'use client';

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
import { ProjectForm, type ProjectFormData } from './ProjectForm';
import type { Project } from '@/lib/storage/types';

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  onSave: (data: ProjectFormData) => void;
  isSubmitting: boolean;
  onDelete?: () => void;
}

export function ProjectDialog({
  open,
  onOpenChange,
  project,
  onSave,
  isSubmitting,
  onDelete,
}: ProjectDialogProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit project</DialogTitle>
            <DialogDescription>
              Make changes to your project here.
            </DialogDescription>
          </DialogHeader>
          <ProjectForm
            project={project}
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
          <DrawerTitle>Edit project</DrawerTitle>
          <DrawerDescription>
            Make changes to your project here.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <ProjectForm
            project={project}
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

