'use client';

import { HomeSection } from './HomeSection';

const DESCRIPTION =
  'Once you have your business model mapped out, you can even use the AI to go deeper into specific aspects and generate more ideas for specific parts of your business idea.';

function ChatMockupVisual() {
  return (
    <div className="w-full max-w-md mx-auto space-y-3">
      <div className="flex justify-end">
        <div className="rounded-lg bg-neutral-300 px-3 py-2 max-w-xs">
          <p className="text-neutral-800 text-sm">
            What are some marketing ideas for my customer segments?
          </p>
        </div>
      </div>
      <div className="flex justify-start">
        <div className="rounded-lg px-3 py-2 max-w-xs">
          <p className="text-blue-400 text-sm">
            I&apos;ve reviewed your customer segments. Here are some ideas for how to market your product to them.
          </p>
        </div>
      </div>
    </div>
  );
}

export function GoDeeperAISection() {
  return (
    <HomeSection
      title="Go deeper with AI"
      visual={<ChatMockupVisual />}
      description={DESCRIPTION}
      variant="blue"
    />
  );
}
