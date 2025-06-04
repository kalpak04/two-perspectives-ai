
import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import { InteractiveBackground } from '@/components/interactive-background';
import './globals.css';

export const metadata: Metadata = {
  title: 'Two Perspectives',
  description: 'Explore dilemmas with two AI coaches: Gentle and No-BS.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alumni+Sans+SC:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <InteractiveBackground />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
