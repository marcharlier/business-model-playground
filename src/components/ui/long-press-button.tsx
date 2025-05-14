'use client';

import * as React from 'react';
import { Button, type buttonVariants } from './button';
import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';

interface LongPressButtonProps extends Omit<
  React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean },
  'onClick'
> {
  onLongPress: () => void;
  duration?: number; // Duration in milliseconds, default 3000
  children: React.ReactNode;
}

export function LongPressButton({
  onLongPress,
  duration = 3000,
  children,
  className,
  disabled,
  ...props
}: LongPressButtonProps) {
  const [isPressed, setIsPressed] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  const intervalRef = React.useRef<NodeJS.Timeout>();
  const startTimeRef = React.useRef<number>();

  const cleanup = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    setIsPressed(false);
    setProgress(0);
    startTimeRef.current = undefined;
  }, []);

  const handlePointerDown = React.useCallback((e: React.PointerEvent) => {
    if (disabled) return;
    
    // Prevent default to avoid form submission
    e.preventDefault();
    
    setIsPressed(true);
    startTimeRef.current = Date.now();
    
    // Start progress animation
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - (startTimeRef.current || 0);
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
    }, 16); // ~60fps
    
    // Set timeout for completion
    timeoutRef.current = setTimeout(() => {
      setProgress(100);
      onLongPress();
      cleanup();
    }, duration);
  }, [disabled, duration, onLongPress, cleanup]);

  const handlePointerUp = React.useCallback((e: React.PointerEvent) => {
    // Prevent default to avoid form submission
    e.preventDefault();
    cleanup();
  }, [cleanup]);

  // Cleanup on unmount
  React.useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Prevent context menu on long press
  const handleContextMenu = React.useCallback((e: React.MouseEvent) => {
    if (isPressed) {
      e.preventDefault();
    }
  }, [isPressed]);

  return (
    <Button
      {...props}
      type="button" // Prevent form submission
      className={cn(
        'relative overflow-hidden select-none',
        isPressed && 'scale-[0.98]',
        className
      )}
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp} // Cancel if pointer leaves button
      onContextMenu={handleContextMenu}
      style={{ 
        transition: 'transform 0.1s ease',
        ...props.style 
      }}
    >
      {/* Progress bar - behind content */}
      <div
        className="absolute inset-0 bg-current opacity-20"
        style={{
          transform: `translateX(${progress - 100}%)`,
          transition: isPressed ? 'none' : 'transform 0.1s ease',
        }}
      />
      
      {/* Button content - let Button handle layout */}
      {children}
    </Button>
  );
} 