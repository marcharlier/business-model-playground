'use client';

import { CloudOff, RefreshCw, CloudUpload, CloudCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { CloudSyncStatus as SyncStatusType } from '@/hooks/use-cloud-sync';

interface CloudSyncStatusProps {
  status: SyncStatusType;
  error: string | null;
  lastSyncedAt: Date | null;
  onRetry?: () => void;
}

export function CloudSyncStatus({
  status,
  error,
  lastSyncedAt,
  onRetry,
}: CloudSyncStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'idle':
        return {
          icon: CloudCheck,
          label: 'Synced to cloud',
          description: lastSyncedAt
            ? `Last synced ${formatTimeAgo(lastSyncedAt)}`
            : 'All changes saved',
          iconClass: 'text-foreground',
          animate: false,
        };
      case 'syncing':
        return {
          icon: RefreshCw,
          label: 'Syncing...',
          description: 'Saving changes to cloud',
          iconClass: 'text-blue-500',
          animate: true,
        };
      case 'migrating':
        return {
          icon: CloudUpload,
          label: 'Migrating...',
          description: 'Setting up cloud storage',
          iconClass: 'text-amber-500',
          animate: false,
        };
      case 'error':
        return {
          icon: CloudOff,
          label: 'Sync failed',
          description: error || 'Unable to sync to cloud',
          iconClass: 'text-red-500',
          animate: false,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={status === 'error' ? 'outline' : 'link'}
            size="sm"
            className={cn(
              'h-8 w-8 p-0',
              status === 'error' && 'hover:bg-red-500/10'
            )}
            onClick={status === 'error' ? onRetry : undefined}
            disabled={status === 'syncing' || status === 'migrating'}
          >
            <Icon
              className={cn(
                'h-4 w-4',
                config.iconClass,
                config.animate && 'animate-spin'
              )}
            />
            <span className="sr-only">{config.label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center">
          <div className="text-center">
            <p className="font-medium">{config.label}</p>
            <p className="text-xs text-muted-foreground">{config.description}</p>
            {status === 'error' && (
              <p className="text-xs text-muted-foreground mt-1">
                Click to retry
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) {
    return 'just now';
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

