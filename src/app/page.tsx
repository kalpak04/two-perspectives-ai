
import { DualInsightsForm } from '@/components/dual-insights-form'; // Will rename this component in a future step if needed
import { Sparkles } from 'lucide-react'; 

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center flex-grow p-4 md:p-8">
      <header className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-primary/20">
            <Sparkles className="h-12 w-12 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
          Two Perspectives
        </h1>
        <p className="mt-2 text-lg text-foreground/80">
          Explore your dilemmas with a Gentle Coach and a No-BS Coach.
        </p>
      </header>
      <DualInsightsForm />
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Two Perspectives. Powered by AI.</p>
        <p className="mt-1">Remember: AI advice is for reflection, not a substitute for professional help.</p>
      </footer>
    </main>
  );
}
