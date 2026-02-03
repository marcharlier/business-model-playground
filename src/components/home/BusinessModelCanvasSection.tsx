'use client';

import Image from 'next/image';
import { HomeSection } from './HomeSection';

function CanvasImagesVisual() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 w-full max-w-sm mx-auto items-center min-w-0">
      <div className="relative w-full min-w-0 rounded-sm overflow-hidden bg-white">
        <Image
          src="/homepage/business-model-canvas.png"
          alt="The Business Model Canvas"
          width={800}
          height={500}
          className="w-full h-auto object-contain"
        />
      </div>
      <div className="relative w-full min-w-0">
        <Image
          src="/homepage/CC-licenses.png"
          alt="Creative Commons license icons"
          width={120}
          height={80}
          className="w-full h-auto object-contain bg-white/10 rounded-sm"
        />
      </div>
    </div>
  );
}

function DescriptionContent() {
  return (
    <div className="text-left space-y-3">
      <p>
        The Business Model Canvas is a CC licensed framework created by Strategyzer and made popular through the brilliant book &ldquo;Business Model Generation&rdquo;.
      </p>
      <p>
        Learn more about it at{' '}
        <a
          href="https://www.strategyzer.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white underline hover:text-white/90 focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
        >
          Strategyzer
        </a>
        .
      </p>
    </div>
  );
}

export function BusinessModelCanvasSection() {
  return (
    <HomeSection
      title="The Business Model Canvas"
      visual={<CanvasImagesVisual />}
      descriptionContent={<DescriptionContent />}
      variant="stone"
    />
  );
}
