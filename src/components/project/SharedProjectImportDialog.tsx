import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';
import { projectStorage } from '@/lib/storage/projectStorage';
import type { Project } from '@/lib/storage/types';

interface SharedProjectImportDialogProps {
  sharedProject: {
    projectData: Project & { author: string };
    authorAvatar: string;
    created_at: string;
    updated_at: string;
  };
  onOpenChange: (open: boolean) => void;
}

export function SharedProjectImportDialog({ sharedProject, onOpenChange }: SharedProjectImportDialogProps) {
  const [isImporting, setIsImporting] = useState(false);
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const handleImport = async () => {
    try {
      setIsImporting(true);
      const { ...projectData } = sharedProject.projectData;
      const newProject = projectStorage.createProject(projectData);
      onOpenChange(false);
      router.push(`/projects/${newProject.id}`);
    } catch (error) {
      console.error('Error importing project:', error);
    } finally {
      setIsImporting(false);
    }
  };

  if (isDesktop) {
    return (
      <Dialog open={true} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import project snapshot</DialogTitle>
            <DialogDescription>
             You can import this project snapshot to your workspace to view and edit it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2 bg-muted p-4 rounded-md">
              <h3 className="font-medium">{sharedProject.projectData.name}</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Author: {sharedProject.authorAvatar}</p>
                <p>Currency: {sharedProject.projectData.currency}</p>
                <p title={formatDate(sharedProject.created_at)}>
                  Snapshot created {formatDistanceToNow(new Date(sharedProject.created_at))} ago
                </p>
                <p title={formatDate(sharedProject.updated_at)}>
                  Snapshot last updated {formatDistanceToNow(new Date(sharedProject.updated_at))} ago
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting ? (
                'Importing...'
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Import snapshot
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={true} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Import project snapshot</DrawerTitle>
          <DrawerDescription>
            You can import this project snapshot to your workspace to view and edit it.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 space-y-4">
          <div className="space-y-2 bg-muted p-4 rounded-md">
            <h3 className="font-medium">{sharedProject.projectData.name}</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Author: {sharedProject.authorAvatar}</p>
              <p>Currency: {sharedProject.projectData.currency}</p>
              <p title={formatDate(sharedProject.created_at)}>
                Snapshot created {formatDistanceToNow(new Date(sharedProject.created_at))} ago
              </p>
              <p title={formatDate(sharedProject.updated_at)}>
                Snapshot last updated {formatDistanceToNow(new Date(sharedProject.updated_at))} ago
              </p>
            </div>
          </div>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">Cancel</Button>
          </DrawerClose>
          <Button onClick={handleImport} disabled={isImporting}>
            {isImporting ? (
              'Importing...'
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Import snapshot
              </>
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
} 