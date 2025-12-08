"use client";

import { useState, useSyncExternalStore } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sparkles } from "lucide-react";
import { useDailyRateLimit } from "@/hooks/use-daily-rate-limit";

const ANIMALS = [
  "🐶", "🐱", "🐰", "🦊", "🐼", "🦁", "🐯", "🐨", "🐮", "🐷",
  "🐸", "🐙", "🦄", "🦒", "🦘", "🦛", "🦏", "🐪", "🦬", "🐃"
];

const STORAGE_KEY = "business-model-playground-avatar-emoji";
// Cached empty string for server snapshot
const EMPTY_EMOJI = '';

// Get or create avatar emoji from localStorage
function getAvatarEmoji(): string {
  if (typeof window === 'undefined') return '';
  const storedEmoji = localStorage.getItem(STORAGE_KEY);
  if (storedEmoji) return storedEmoji;
  
  const randomIndex = Math.floor(Math.random() * ANIMALS.length);
  const newEmoji = ANIMALS[randomIndex];
  localStorage.setItem(STORAGE_KEY, newEmoji);
  return newEmoji;
}

// Subscription function (emoji doesn't change after initial load)
function subscribeToEmoji() {
  // Emoji is set once and doesn't change, so no need to subscribe to changes
  return () => {};
}

function getServerEmoji(): string {
  return EMPTY_EMOJI;
}

export function UserAvatarPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const avatarEmoji = useSyncExternalStore(subscribeToEmoji, getAvatarEmoji, getServerEmoji);
  const aiUsage = useDailyRateLimit("ai-cost-ideas", 10);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="rounded-full hover:bg-accent hover:text-accent-foreground"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback>{avatarEmoji}</AvatarFallback>
          </Avatar>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-4"
        align="end"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">How your data is stored</h4>
            <p className="text-sm text-muted-foreground">
              This application uses cloud storage to save your data. Here&apos;s what you need to know:
            </p>
            <ul className="list-disc pl-4 text-sm text-muted-foreground">
              <li>No login required</li>
              <li>A unique user id is generated for you</li>
              <li>Clearing browser data resets your user id</li>
              <li>{avatarEmoji} is your random avatar</li>
            </ul>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h4 className="font-medium leading-none">AI Feature Usage</h4>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Daily suggestions used</span>
              <span className="font-medium tabular-nums">
                {aiUsage.count} / {aiUsage.limit}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(aiUsage.count / aiUsage.limit) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {aiUsage.remaining > 0 ? (
                <>
                  {aiUsage.remaining} remaining • resets {aiUsage.resetIn}
                </>
              ) : (
                <>Limit reached • resets {aiUsage.resetIn}</>
              )}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

