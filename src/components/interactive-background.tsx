
'use client';

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export const InteractiveBackground: FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensure this runs only on the client
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  if (!isClient) {
    return null; // Don't render on the server
  }

  return (
    <div
      className={cn(
        'fixed inset-0 -z-10' // -z-10 to ensure it's behind content
      )}
      style={{
        background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, var(--interactive-bg-spotlight), transparent 70%)`,
      }}
      aria-hidden="true"
    />
  );
};
