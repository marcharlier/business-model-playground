'use client';

import { Check, Sparkles, Wrench } from 'lucide-react';
import { HomeSection } from './HomeSection';
import { Button } from '@/components/ui/button';
import { TextLoop } from '@/components/ui/text-loop';

const DESCRIPTION =
  'The AI Assistant helps you add ideas to your Business Model Canvas and can review your work or dive deeper into the ideas.';

const EXAMPLE_TOOL_CALLS = [
  '5 Partnerships added',
  '2 Value Propositions described',
  '5 Customer Segments identified',
  '5 Costs listed',
  '4 Channels identified',
];

function AIBuddyVisual() {
  return (
    <div className="w-full flex flex-col items-center gap-4">
      <Button
        className="h-12 md:w-1/3 rounded-xl bg-blue-700 text-white font-hero text-md font-semibold hover:bg-blue-700"
        
      >
        <Sparkles className="h-4 w-4" />
        AI Assistant
      </Button>
      <div className="flex items-center justify-center gap-2 text-blue-400 text-sm">
        <TextLoop interval={2} className="min-w-[22rem] flex justify-center">
          {EXAMPLE_TOOL_CALLS.map((label) => (
            <span key={label} className="flex items-center gap-2"><Wrench className="h-4 w-4" /> {label} <Check className="h-4 w-4" /></span>
          ))}
        </TextLoop>
      </div>
    </div>
  );
}

export function AIBuddySection() {
  return (
    <HomeSection
      title="Your AI business model buddy"
      visual={<AIBuddyVisual />}
      description={DESCRIPTION}
      variant="blue"
    />
  );
}
