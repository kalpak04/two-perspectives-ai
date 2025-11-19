"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { ArrowLeft, GitMerge, Sparkles } from 'lucide-react';
import { generateSynthesis } from '@/ai/flows/synthesis-generation';

interface BalancedCardsProps {
    perspectiveA: string;
    perspectiveB: string;
    onBack: () => void;
    onSynthesizing?: (isSynthesizing: boolean) => void;
}

export function BalancedCards({ perspectiveA, perspectiveB, onBack, onSynthesizing }: BalancedCardsProps) {
    const [showSynthesis, setShowSynthesis] = useState(false);
    const [synthesisText, setSynthesisText] = useState<string | null>(null);
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [mergePhase, setMergePhase] = useState<'idle' | 'anticipation' | 'convergence' | 'flash' | 'revealed'>('idle');

    const handleSynthesize = async () => {
        setIsSynthesizing(true);
        onSynthesizing?.(true);
        setMergePhase('anticipation');

        // Start API call immediately
        const synthesisPromise = generateSynthesis({ perspectiveA, perspectiveB });

        // Phase 1: Anticipation (2s)
        await new Promise(resolve => setTimeout(resolve, 2000));
        setMergePhase('convergence');

        // Phase 2: Convergence (1.5s)
        await new Promise(resolve => setTimeout(resolve, 1500));
        setMergePhase('flash');

        try {
            const result = await synthesisPromise;
            setSynthesisText(result.synthesis);
        } catch (error) {
            console.error("Failed to generate synthesis:", error);
            setSynthesisText("The prism could not harmonize these truths. Please try again.");
        }

        // Phase 3: Flash -> Reveal (0.5s)
        await new Promise(resolve => setTimeout(resolve, 500));
        setShowSynthesis(true);
        setMergePhase('revealed');
        setIsSynthesizing(false);
        onSynthesizing?.(false);
    };

    return (
        <div className="relative w-full h-full min-h-[80vh] flex flex-col">
            {/* Back Button - Realigned */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute -top-12 left-0 z-50"
            >
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Focus
                </Button>
            </motion.div>

            <AnimatePresence mode="wait">
                {!showSynthesis ? (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 p-4 md:p-8 pt-8 relative">
                        {/* Perspective A: The Idealist (Angel) */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{
                                opacity: mergePhase === 'convergence' ? 0 : 1,
                                x: mergePhase === 'convergence' ? "50%" : 0,
                                scale: mergePhase === 'anticipation' ? [1, 1.02, 0.98, 1.05] : 1,
                                filter: mergePhase === 'anticipation' ? "brightness(1.5) blur(2px)" : "brightness(1) blur(0px)"
                            }}
                            transition={{
                                duration: mergePhase === 'convergence' ? 1.5 : 0.8,
                                ease: "easeInOut"
                            }}
                            className="relative group"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-purple-200 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                            <div className="relative h-full angel-glass rounded-[2rem] p-8 overflow-hidden border border-white/20">
                                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.4),_transparent_60%)] pointer-events-none" />
                                <h3 className="text-4xl font-serif font-light mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] tracking-wide">
                                    The Idealist
                                </h3>
                                <div className="prose dark:prose-invert max-w-none relative z-10">
                                    <p className="text-xl leading-relaxed whitespace-pre-wrap text-blue-50/90 font-serif tracking-wide">
                                        {perspectiveA}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Perspective B: The Realist (Devil) */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{
                                opacity: mergePhase === 'convergence' ? 0 : 1,
                                x: mergePhase === 'convergence' ? "-50%" : 0,
                                scale: mergePhase === 'anticipation' ? [1, 1.02, 0.98, 1.05] : 1,
                                filter: mergePhase === 'anticipation' ? "brightness(1.5) blur(2px)" : "brightness(1) blur(0px)"
                            }}
                            transition={{
                                duration: mergePhase === 'convergence' ? 1.5 : 0.8,
                                ease: "easeInOut"
                            }}
                            className="relative group"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-amber-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                            <div className="relative h-full devil-glass rounded-[2rem] p-8 overflow-hidden border border-red-500/30">
                                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_right,_rgba(239,68,68,0.4),_transparent_60%)] pointer-events-none" />
                                <h3 className="text-4xl font-sans font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] uppercase tracking-tighter">
                                    The Realist
                                </h3>
                                <div className="prose dark:prose-invert max-w-none relative z-10">
                                    <p className="text-lg leading-relaxed whitespace-pre-wrap text-red-50/90 font-sans font-semibold tracking-tight">
                                        {perspectiveB}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    <motion.div
                        key="synthesis-view"
                        initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="flex-1 flex items-center justify-center p-4 md:p-8"
                    >
                        <div className="relative max-w-4xl w-full">
                            {/* Synthesis Glow */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-[2rem] blur-xl opacity-40 animate-pulse" />

                            <div className="relative apple-glass rounded-[2rem] p-12 border border-white/30 shadow-[0_0_100px_rgba(168,85,247,0.2)]">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-red-500/10 rounded-[2rem]" />

                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <Sparkles className="w-12 h-12 text-purple-300 mb-6 animate-pulse" />
                                    <h3 className="text-5xl font-serif font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-red-200 drop-shadow-[0_0_25px_rgba(255,255,255,0.6)]">
                                        The Synthesis
                                    </h3>

                                    <div className="prose dark:prose-invert max-w-none">
                                        <p className="text-2xl leading-relaxed text-white/90 font-light font-sans tracking-wide">
                                            {synthesisText}
                                        </p>
                                    </div>

                                    <div className="mt-12">
                                        <Button
                                            onClick={() => {
                                                setShowSynthesis(false);
                                                setMergePhase('idle');
                                            }}
                                            variant="outline"
                                            className="border-white/20 text-white hover:bg-white/10 backdrop-blur-md transition-all hover:scale-105 px-8 py-6 text-lg rounded-full"
                                        >
                                            Explore Another Dilemma
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Flash Overlay */}
            <AnimatePresence>
                {mergePhase === 'flash' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] bg-white pointer-events-none"
                    />
                )}
            </AnimatePresence>

            {/* Synthesis Button */}
            {!showSynthesis && mergePhase === 'idle' && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, type: "spring" }}
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40"
                >
                    <Button
                        onClick={handleSynthesize}
                        className="relative group rounded-full px-12 py-8 text-xl overflow-hidden bg-black/50 border border-white/20 backdrop-blur-xl hover:scale-105 transition-transform duration-300"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 opacity-20 group-hover:opacity-50 transition-opacity duration-500" />
                        <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
                        <span className="relative flex items-center text-white font-light tracking-[0.2em] uppercase">
                            <GitMerge className="mr-4 h-6 w-6" />
                            Merge Realities
                        </span>
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
