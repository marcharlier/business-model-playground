'use client';

import { cn } from '@/lib/utils';

export interface HomeSectionProps {
  title: string;
  children?: React.ReactNode;
  /** Visual/illustration area shown at the top of the card */
  visual?: React.ReactNode;
  /** Main body text below the visual (ignored if descriptionContent is set) */
  description?: string;
  /** Custom content below the visual (overrides description when set) */
  descriptionContent?: React.ReactNode;
  /** Card style: grey (neutral), blue (accent), or stone */
  variant?: 'grey' | 'blue' | 'stone';
  className?: string;
}

export function HomeSection({
  title,
  visual,
  description,
  descriptionContent,
  variant = 'grey',
  className,
}: HomeSectionProps) {
  return (
    <section className={cn('mx-auto', className)}>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div
        className={cn(
          'rounded-2xl p-4 sm:p-8 flex flex-col gap-6',
          variant === 'grey' && 'bg-gray-800 text-white',
          variant === 'blue' && 'bg-blue-900 text-white',
          variant === 'stone' && 'bg-stone-800 text-white'
        )}
      >
        {visual && (
          <div className="flex-shrink-0 flex items-center justify-center">
            {visual}
          </div>
        )}
        {descriptionContent !== undefined ? (
          <div className="text-white text-sm md:text-base font-hero leading-relaxed">
            {descriptionContent}
          </div>
        ) : description !== undefined ? (
          <p className="text-white text-sm md:text-base font-hero leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
