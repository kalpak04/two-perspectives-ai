"use client";

import React from 'react';
import { motion } from 'framer-motion';

export function RefractionAnimation() {
    return (
        <div className="relative flex items-center justify-center w-full h-[50vh] overflow-visible z-50">
            {/* The Prism Core - A radiant diamond shape */}
            <motion.div
                initial={{ scale: 0, rotate: 45, opacity: 0 }}
                animate={{ scale: 1, rotate: 45, opacity: 1 }}
                transition={{ duration: 0.8, ease: "backOut" }}
                className="relative w-32 h-32 bg-white/10 backdrop-blur-md border border-white/50 shadow-[0_0_100px_rgba(255,255,255,0.5)] z-20"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent opacity-50" />
            </motion.div>

            {/* The Input Beam - Piercing the Prism */}
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "50vh", opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="absolute top-0 w-1 bg-gradient-to-b from-transparent via-white to-white h-1/2 z-10"
                style={{ top: "-50%" }}
            />

            {/* The Fracture - Screen Split */}
            <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-10" viewBox="0 0 1000 1000" preserveAspectRatio="none">
                <defs>
                    <filter id="glow-intense">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <linearGradient id="angel-ray" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--angel-primary)" stopOpacity="1" />
                        <stop offset="100%" stopColor="var(--angel-secondary)" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="devil-ray" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--devil-primary)" stopOpacity="1" />
                        <stop offset="100%" stopColor="var(--devil-accent)" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Angel Ray (Left) */}
                <motion.path
                    d="M 500 500 L -200 1200"
                    stroke="url(#angel-ray)"
                    strokeWidth="4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8, ease: "circOut" }}
                    filter="url(#glow-intense)"
                />

                {/* Devil Ray (Right) */}
                <motion.path
                    d="M 500 500 L 1200 1200"
                    stroke="url(#devil-ray)"
                    strokeWidth="4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8, ease: "circOut" }}
                    filter="url(#glow-intense)"
                />
            </svg>

            {/* Full Screen Flash Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0] }}
                transition={{ duration: 0.2, delay: 0.8 }}
                className="fixed inset-0 bg-white z-50 pointer-events-none mix-blend-overlay"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute top-[120%] text-center"
            >
                <p className="text-white/70 font-light tracking-[0.5em] text-sm uppercase animate-pulse">
                    Fracturing Reality
                </p>
            </motion.div>
        </div>
    );
}
