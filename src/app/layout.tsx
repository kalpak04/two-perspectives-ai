import type { Metadata } from 'next';
import Image from 'next/image';
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
        <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <div className="fixed inset-0 -z-20">
          <Image
            src="https://miro.medium.com/v2/resize:fit:1400/0*79VfKUZRMHTQdbd5"
            alt="Abstract background representing two perspectives"
            fill
            style={{
              objectFit: 'cover'
            }}
            quality={75}
            priority
          />
        </div>
        <InteractiveBackground />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
