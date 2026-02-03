'use client';

import Image from 'next/image';
import { HomeSection } from './HomeSection';

const DESCRIPTION =
  'Visualise how costs and revenues will develop and when a possible break-even point might be.';

export function BreakEvenSection() {
  return (
    <HomeSection
      title="See your break even point"
      visual={
        <div className="w-full max-w-sm mx-auto rounded-md overflow-hidden bg-white shadow-lg">
          <Image
            src="/homepage/break-even-point.png"
            alt="Break-even analysis chart showing cumulative costs and revenue over time"
            width={560}
            height={320}
            className="w-full h-auto object-contain"
          />
        </div>
      }
      description={DESCRIPTION}
      variant="blue"
    />
  );
}
