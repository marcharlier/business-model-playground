'use client';

import { CloudOff, RefreshCw, CloudUpload, CloudCheck, WifiOff } from 'lucide-react';
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
  /** Show a text label next to the icon */
  showLabel?: boolean;
}

export function CloudSyncStatus({
  status,
  error,
  lastSyncedAt,
  onRetry,
  showLabel = true,
}: CloudSyncStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'idle':
        return {
          icon: CloudCheck,
          label: 'Synced',
          tooltipLabel: 'Synced to cloud',
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
          tooltipLabel: 'Syncing...',
          description: 'Saving changes to cloud',
          iconClass: 'text-blue-500',
          animate: true,
        };
      case 'migrating':
        return {
          icon: CloudUpload,
          label: 'Migrating...',
          tooltipLabel: 'Migrating...',
          description: 'Setting up cloud storage',
          iconClass: 'text-amber-500',
          animate: false,
        };
      case 'offline':
        return {
          icon: WifiOff,
          label: 'Offline',
          tooltipLabel: 'You are offline',
          description: 'Changes will sync when you reconnect',
          iconClass: 'text-muted-foreground',
          animate: false,
        };
      case 'error':
        return {
          icon: CloudOff,
          label: 'Error',
          tooltipLabel: 'Sync failed',
          description: error || 'Unable to sync to cloud',
          iconClass: 'text-red-500',
          animate: false,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const isClickable = status === 'error' || status === 'offline';
  const handleClick = isClickable ? onRetry : undefined;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-0">
            <Button
              variant={status === 'error' ? 'outline' : 'link'}
              size="sm"
              className={cn(
                'h-8 w-8 p-0',
                status === 'error' && 'hover:bg-red-500/10'
              )}
              onClick={handleClick}
              disabled={status === 'syncing' || status === 'migrating'}
            >
              <Icon
                className={cn(
                  'h-4 w-4',
                  config.iconClass,
                  config.animate && 'animate-spin'
                )}
              />
              <span className="sr-only">{config.tooltipLabel}</span>
            </Button>
            {showLabel && (
              <span className="text-sm text-muted-foreground">
                {config.label}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center">
          <div className="text-center">
            <p className="font-medium">{config.tooltipLabel}</p>
            <p className="text-xs text-muted-foreground">{config.description}</p>
            {status === 'error' && (
              <p className="text-xs text-muted-foreground mt-1">
                Click to retry
              </p>
            )}
            {status === 'offline' && (
              <p className="text-xs text-muted-foreground mt-1">
                Click to retry when online
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

