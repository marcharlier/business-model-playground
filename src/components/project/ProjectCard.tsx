'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Project } from '@/lib/storage/types';

interface ProjectCardProps {
  project: Project;
  onDelete: (projectId: string, e: React.MouseEvent) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    timeoutRef.current = setTimeout(() => {
      setShowDeleteButton(true);
    }, 500);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setShowDeleteButton(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return (
    <Link
      href={`/projects/${project.id}/canvas-view`}
      className="block p-4 border border-border rounded-2xl hover:border-primary transition-colors relative bg-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <h2 className="text-lg font-semibold mb-2">{project.name}</h2>
      <p className="text-sm text-muted-foreground mb-3 sm:mb-4">
        Created on {new Date(project.createdAt).toLocaleDateString()}
      </p>
      <div className="flex justify-between items-center text-sm">
        <Badge variant="outline" className="text-xs font-mono">
          {project.currency}
        </Badge>
        <span className="text-muted-foreground">
          {project.costStructure.fixedRunningCosts.length} fixed costs,{' '}
          {project.revenueStreams.products.length} products
        </span>
      </div>
      {isHovered && showDeleteButton && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => onDelete(project.id, e)}
                className="absolute top-2 right-2 h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete project</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </Link>
  );
}

