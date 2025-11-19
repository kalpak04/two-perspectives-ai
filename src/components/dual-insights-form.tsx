"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generalAdvice, GeneralAdviceOutput } from '@/ai/flows/general-advice';
import { useToast } from "@/hooks/use-toast";
import { FocusInput } from './focus-input';
import { RefractionAnimation } from './refraction-animation';
import { BalancedCards } from './balanced-cards';

type InitialAdvice = {
  gentleCoachAdvice: string;
  noBsCoachAdvice: string;
};

export function DualInsightsForm({ onSynthesizing }: { onSynthesizing?: (isSynthesizing: boolean) => void }) {
  const [viewState, setViewState] = useState<'idle' | 'refracting' | 'results'>('idle');
  const [initialAdvice, setInitialAdvice] = useState<InitialAdvice | null>(null);
  const { toast } = useToast();

  const handleTextSubmit = async (userInput: string) => {
    setViewState('refracting');
    setInitialAdvice(null);

    try {
      // Add a minimum delay to show the animation
      const [result] = await Promise.all([
        generalAdvice({ dilemma: userInput }),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);

      if (!result || typeof result !== 'object') {
        throw new Error('Invalid API response');
      }

      let advice: InitialAdvice;

      if ('gentleCoachAdvice' in result && 'noBsCoachAdvice' in result) {
        advice = {
          gentleCoachAdvice: typeof result.gentleCoachAdvice === 'string' ? result.gentleCoachAdvice : JSON.stringify(result.gentleCoachAdvice),
          noBsCoachAdvice: typeof result.noBsCoachAdvice === 'string' ? result.noBsCoachAdvice : JSON.stringify(result.noBsCoachAdvice),
        };
      } else {
        // Fallback for unexpected structure
        const content = JSON.stringify(result);
        advice = { gentleCoachAdvice: content, noBsCoachAdvice: content };
      }

      setInitialAdvice(advice);
      setViewState('results');
    } catch (err) {
      console.error("Error generating advice:", err);
      toast({
        title: "Error",
        description: "Could not generate perspectives. Please try again.",
        variant: "destructive",
      });
      setViewState('idle');
    }
  };

  const handleBack = () => {
    setViewState('idle');
    setInitialAdvice(null);
  };

  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        {viewState === 'idle' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <FocusInput onSubmit={handleTextSubmit} />
          </motion.div>
        )}

        {viewState === 'refracting' && (
          <motion.div
            key="refracting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <RefractionAnimation />
          </motion.div>
        )}

        {viewState === 'results' && initialAdvice && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full"
          >
            <BalancedCards
              perspectiveA={initialAdvice.gentleCoachAdvice}
              perspectiveB={initialAdvice.noBsCoachAdvice}
              onBack={handleBack}
              onSynthesizing={onSynthesizing}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DualInsightsForm;

