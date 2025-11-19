"use client";

import { useState } from 'react';
import { DualInsightsForm } from '@/components/dual-insights-form';
import { PrismBackground } from '@/components/ui/prism-background';

export default function Home() {
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden bg-background selection:bg-primary/30">
      <PrismBackground isMerging={isSynthesizing} />

      <div className="relative z-10 w-full max-w-5xl px-4 md:px-8">
        <DualInsightsForm onSynthesizing={setIsSynthesizing} />
      </div>
    </main>
  );
}
