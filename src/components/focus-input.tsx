import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FocusInputProps {
    onSubmit: (value: string) => void;
    isSubmitting?: boolean;
}

const PLACEHOLDERS = [
    "What is on your mind?",
    "AI Regulation",
    "Remote Work",
    "Universal Basic Income",
    "Social Media Impact",
];

export function FocusInput({ onSubmit, isSubmitting = false }: FocusInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [value, setValue] = useState("");
    const [placeholderIndex, setPlaceholderIndex] = useState(0);

    useEffect(() => {
        if (isFocused || value) return;
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [isFocused, value]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            onSubmit(value);
        }
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto">
            {/* Dimming Background Overlay when focused */}
            <AnimatePresence>
                {isFocused && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-all duration-500"
                        onClick={() => setIsFocused(false)}
                    />
                )}
            </AnimatePresence>

            <motion.form
                onSubmit={handleSubmit}
                className="relative z-50"
                initial={false}
                animate={isFocused ? { scale: 1.05 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                <div className={cn(
                    "relative flex items-center overflow-hidden transition-all duration-500",
                    "apple-glass rounded-[50px]",
                    isFocused ? "shadow-[0_0_50px_-12px_rgba(0,122,255,0.25)] ring-1 ring-primary/20" : "hover:shadow-lg"
                )}>
                    <div className="pl-6 text-muted-foreground">
                        <Sparkles className={cn("w-6 h-6 transition-colors duration-300", isFocused ? "text-primary" : "")} />
                    </div>

                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className="w-full bg-transparent border-none px-4 py-6 text-xl placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0"
                        placeholder={PLACEHOLDERS[placeholderIndex]}
                    />

                    <AnimatePresence>
                        {value.trim() && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.5, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.5, x: 20 }}
                                type="submit"
                                disabled={isSubmitting}
                                className="mr-2 p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                                {isSubmitting ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                                    />
                                ) : (
                                    <ArrowRight className="w-5 h-5" />
                                )}
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </motion.form>
        </div>
    );
}
