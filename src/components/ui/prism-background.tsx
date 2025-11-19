"use client";

import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function PrismBackground({ isMerging = false }: { isMerging?: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-black">
            {/* Base Aurora Layer - Intensifies during merge */}
            <motion.div
                animate={{
                    opacity: isMerging ? 0.6 : 0.3,
                    scale: isMerging ? 1.2 : 1,
                }}
                transition={{ duration: 2 }}
                className="absolute inset-0 animate-aurora bg-[size:400%_400%] bg-gradient-to-br from-black via-[#1a0505] to-[#050a1a]"
            />

            {/* Angelic Light Leak (Top Left) - Pulses faster during merge */}
            <motion.div
                animate={{
                    opacity: isMerging ? [0.4, 0.8, 0.4] : [0.3, 0.5, 0.3],
                    scale: isMerging ? [1, 1.3, 1] : [1, 1.1, 1],
                    filter: isMerging ? "blur(100px) brightness(1.5)" : "blur(120px) brightness(1)",
                }}
                transition={{ duration: isMerging ? 2 : 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-[radial-gradient(circle_at_center,_var(--angel-primary)_0%,_transparent_70%)] opacity-20 mix-blend-screen"
            />

            {/* Demonic Light Leak (Bottom Right) - Pulses faster during merge */}
            <motion.div
                animate={{
                    opacity: isMerging ? [0.4, 0.9, 0.4] : [0.3, 0.6, 0.3],
                    scale: isMerging ? [1, 1.4, 1] : [1, 1.2, 1],
                    filter: isMerging ? "blur(100px) brightness(1.5)" : "blur(120px) brightness(1)",
                }}
                transition={{ duration: isMerging ? 2 : 10, repeat: Infinity, ease: "easeInOut", delay: isMerging ? 0 : 1 }}
                className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-[radial-gradient(circle_at_center,_var(--devil-primary)_0%,_transparent_70%)] opacity-20 mix-blend-screen"
            />

            {/* Prism Caustics Overlay */}
            <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-150 contrast-150" />

            {/* Dynamic Rainbow Refraction Lines - Becomes chaotic during merge */}
            <motion.svg
                animate={{ opacity: isMerging ? 0.4 : 0.2 }}
                className="absolute inset-0 w-full h-full mix-blend-color-dodge"
            >
                <filter id="noiseFilter">
                    <feTurbulence type="fractalNoise" baseFrequency={isMerging ? "0.9" : "0.6"} stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#noiseFilter)" opacity="0.1" />
            </motion.svg>
        </div>
    );
}
