'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { HomeSection } from './HomeSection';

const DESCRIPTION =
  'This website turns the Business Model Canvas framework by Strategyzer into an interactive playground with an AI assistant (powered by OpenAI) and easy-to-use financial calculation and visualisation tools.';

function ExploreVisual() {
  const [activeTab, setActiveTab] = useState<'business' | 'profitability'>('business');
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    if (userInteracted) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveTab((current) => (current === 'business' ? 'profitability' : 'business'));
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [userInteracted]);

  const handleTabChange = (tab: 'business' | 'profitability') => {
    setActiveTab(tab);
    setUserInteracted(true);
  };

  const isBusiness = activeTab === 'business';
  const activeClasses = 'opacity-100 blur-0';
  const inactiveClasses = 'opacity-20 blur-[3px]';

  return (
    <div className="flex w-full max-w-sm mx-auto flex-col items-center gap-5 sm:gap-6">
      <div className="flex items-center gap-1 rounded-full bg-stone-100 p-1 text-xs sm:text-sm">
        <button
          type="button"
          onClick={() => handleTabChange('business')}
          className={`rounded-full px-3 py-1 font-medium shadow-sm transition-colors sm:px-4 sm:py-1.5 ${
            isBusiness ? 'bg-black text-white' : 'bg-transparent text-stone-900'
          }`}
        >
          Business Model
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('profitability')}
          className={`rounded-full px-3 py-1 font-medium shadow-sm transition-colors sm:px-4 sm:py-1.5 ${
            isBusiness ? 'bg-transparent text-stone-900' : 'bg-black text-white'
          }`}
        >
          Profitability Playground
        </button>
      </div>
      <div className="flex w-full max-w-sm items-center justify-between gap-2 sm:gap-3">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-xl bg-stone-950 p-1.5 transition-all duration-500 sm:h-[80px] sm:w-[80px] sm:p-2 ${
            isBusiness ? activeClasses : inactiveClasses
          }`}
        >
          <Image
            src="/homepage/business-model-canvas.png"
            alt="Business model canvas preview"
            width={100}
            height={100}
            className="h-full w-full object-contain"
          />
        </div>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full bg-stone-950 transition-all duration-500 sm:h-10 sm:w-10 ${
            isBusiness ? activeClasses : inactiveClasses
          }`}
        >
          <Plus className="h-4 w-4 text-white sm:h-5 sm:w-5" />
        </div>
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-xl bg-stone-950 p-1.5 transition-all duration-500 sm:h-[80px] sm:w-[80px] sm:p-2 ${
            isBusiness ? activeClasses : inactiveClasses
          }`}
        >
          <Image
            src="/homepage/openai-logo.png"
            alt="AI assistant"
            width={100}
            height={100}
            className="h-full w-full object-contain"
          />
        </div>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full bg-stone-950 transition-all duration-500 sm:h-10 sm:w-10 ${
            isBusiness ? inactiveClasses : activeClasses
          }`}
        >
          <Plus className="h-4 w-4 text-white sm:h-5 sm:w-5" />
        </div>
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-xl bg-stone-950 p-1.5 transition-all duration-500 sm:h-[80px] sm:w-[80px] sm:p-2 ${
            isBusiness ? inactiveClasses : activeClasses
          }`}
        >
          <Image
            src="/homepage/calculator.png"
            alt="Financial calculator"
            width={100}
            height={100}
            className="h-full w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}

function DescriptionContent() {
  return (
    <p className="text-left space-y-3">
      {DESCRIPTION}
    </p>
  );
}

export function ExploreWithAISection() {
  return (
    <HomeSection
      title="Explore a business idea using AI"
      visual={<ExploreVisual />}
      descriptionContent={<DescriptionContent />}
      variant="stone"
    />
  );
}
