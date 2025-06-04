import { DualInsightsForm } from '@/components/dual-insights-form';
import { HeartHandshake } from 'lucide-react'; // Example Icon

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center flex-grow p-4 md:p-8">
      <header className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-primary/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              <path d="M17.5 10.5c2.5-1.5 2.5-4.5 0-6M6.5 4.5c-2.5 1.5-2.5 4.5 0 6"></path>
              <path d="M12 12.5V22"></path>
            </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
          Dual Insights
        </h1>
        <p className="mt-2 text-lg text-foreground/80">
          Navigate life's dilemmas with two unique perspectives.
        </p>
      </header>
      <DualInsightsForm />
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Dual Insights. Powered by AI.</p>
        <p className="mt-1">Remember: AI advice is for reflection, not a substitute for professional help.</p>
      </footer>
    </main>
  );
}
