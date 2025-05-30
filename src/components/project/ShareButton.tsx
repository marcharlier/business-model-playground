import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2, Copy, Share } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { projectStorage } from '@/lib/storage/projectStorage';
import { sharedProjectStorage } from '@/lib/storage/sharedProjectStorage';
import { avatarStorage } from '@/lib/storage/avatarStorage';
import type { Project } from '@/lib/storage/types';
import { useProject } from '@/lib/context/ProjectContext';

interface ShareButtonProps {
  project: Project;
}

interface SharedProjectInfo {
  name: string;
  created_at: string;
  updated_at: string;
}

export function ShareButton({ project }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [sharedInfo, setSharedInfo] = useState<SharedProjectInfo | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { refreshProject } = useProject();

  // Fetch shared project info when dialog opens or project.sharedId changes
  useEffect(() => {
    const fetchSharedInfo = async () => {
      if (project.sharedId) {
        try {
          const sharedProject = await sharedProjectStorage.getSharedProject(project.sharedId);
          setSharedInfo({
            name: sharedProject.projectData.name,
            created_at: sharedProject.created_at,
            updated_at: sharedProject.updated_at,
          });
        } catch (error) {
          // Silently handle the case where the shared project is not found
          if (error instanceof Error && error.message.includes('not found')) {
            console.log('Shared project no longer exists, clearing local reference');
            projectStorage.updateProject({
              ...project,
              sharedId: undefined,
            });
            refreshProject();
            setShareUrl(null);
            setSharedInfo(null);
          } else {
            // Only log other types of errors
            console.error('Error fetching shared project info:', error);
          }
        }
      }
    };

    if (open && project.sharedId) {
      fetchSharedInfo();
    }
  }, [open, project.sharedId, project, refreshProject]);

  // Set initial shareUrl if project is already shared
  useEffect(() => {
    if (project.sharedId) {
      setShareUrl(`${window.location.origin}/share/${project.sharedId}`);
    }
  }, [project.sharedId]);

  const handleCreateShare = async () => {
    try {
      setIsSharing(true);
      const authorAvatar = await avatarStorage.getAvatar();
      
      const sharedProject = await sharedProjectStorage.createSharedProject(
        project,
        authorAvatar
      );
      
      // Update local project with sharedId
      projectStorage.updateProject({
        ...project,
        sharedId: sharedProject.id,
      });
      
      // Refresh project context to update UI
      refreshProject();
      
      // Set share URL for new shares
      setShareUrl(`${window.location.origin}/share/${sharedProject.id}`);
      
      // Set shared info
      setSharedInfo({
        name: sharedProject.projectData.name,
        created_at: sharedProject.created_at,
        updated_at: sharedProject.updated_at,
      });

      console.log('Successfully created new shared project:', sharedProject.id);
    } catch (error) {
      console.error('Error creating shared project:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleUpdateShare = async () => {
    if (!project.sharedId) return;

    try {
      setIsUpdating(true);
      
      // Get the latest project data
      const latestProject = projectStorage.getProjectById(project.id);
      if (!latestProject) {
        throw new Error('Project not found');
      }
      
      const sharedProject = await sharedProjectStorage.updateSharedProject(project.sharedId, {
        ...latestProject,
      });
      
      // Update shared info
      setSharedInfo({
        name: sharedProject.projectData.name,
        created_at: sharedProject.created_at,
        updated_at: sharedProject.updated_at,
      });

      console.log('Successfully updated shared project:', sharedProject.id);
    } catch (error) {
      console.error('Error updating shared project:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveShare = async () => {
    if (!project.sharedId) return;
    
    try {
      setIsRemoving(true);
      await sharedProjectStorage.deleteSharedProject(project.sharedId);
      
      // Remove sharedId from local project
      projectStorage.updateProject({
        ...project,
        sharedId: undefined,
      });
      
      // Refresh project context to update UI
      refreshProject();
      
      setShareUrl(null);
      setSharedInfo(null);
      setOpen(false); // Close the dialog/drawer after removing
    } catch (error) {
      console.error('Error removing share:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const content = (
    <>
      <div className="space-y-4">
      {sharedInfo && (
        <div className="space-y-2 bg-muted p-4 rounded-md">
          <h3 className="font-medium">{sharedInfo?.name || project.name}</h3>
          <div className="text-sm text-muted-foreground space-y-1">
              <p title={new Date(sharedInfo.created_at).toLocaleString()}>
                Snapshot created {formatDistanceToNow(new Date(sharedInfo.created_at))} ago
              </p>
              <p title={new Date(sharedInfo.updated_at).toLocaleString()}>
                Snapshot last updated {formatDistanceToNow(new Date(sharedInfo.updated_at))} ago
              </p>
            </div>
          </div>
        )}

        {shareUrl ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button onClick={handleCopyLink} variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleUpdateShare}
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? (
                  'Updating...'
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Update snapshot
                  </>
                )}
              </Button>
              <Button
                onClick={handleRemoveShare}
                variant="destructive"
                disabled={isRemoving}
                className="flex-1"
              >
                {isRemoving ? (
                  'Removing...'
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove link
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={handleCreateShare} disabled={isSharing} className="w-full">
            {isSharing ? 'Generating...' : 'Generate share link'}
          </Button>
        )}
      </div>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Share className="h-4 w-4" />
          Share project
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share project snapshot</DialogTitle>
            <DialogDescription>
              Share a current snapshot of your project with others via a link.
            </DialogDescription>
          </DialogHeader>
          <ul className="list-disc pl-4 text-sm text-muted-foreground">
                <li>Others can import a copy of your project to their workspace.</li>
                <li>You can update this snapshot when you like.</li>
                <li>The snapshot data will be stored in a secure database.</li>
            </ul>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setOpen(true)}>
        <Share className="h-4 w-4" />
      </Button>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Share project snapshot</DrawerTitle>
          <DrawerDescription>
          Share a current snapshot of your project with others via a link.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <ul className="list-disc pl-4 text-xs text-muted-foreground mb-2 text-left">
            <li>Others can import a copy of your project to their workspace.</li>
            <li>You can update this snapshot when you like.</li>
            <li>The snapshot data will be stored in a secure database.</li>
          </ul>
          {content}
        </div>
        <DrawerFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
} 