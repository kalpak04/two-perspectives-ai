
import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import { InteractiveBackground } from '@/components/interactive-background';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dual Insights',
  description: 'Get two perspectives on your dilemmas: Gentle Coach & No-BS Coach.',
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
