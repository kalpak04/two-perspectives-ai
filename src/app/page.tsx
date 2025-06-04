
import { DualInsightsForm } from '@/components/dual-insights-form'; 
import { Sparkles } from 'lucide-react'; 

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center flex-grow p-4 md:p-8">
      <header className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-primary/20">
            <Sparkles className="h-12 w-12 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary 
                       tracking-wider
                       style={{
                         textShadow: `
                           1px 1px 0px hsl(var(--muted)),
                           2px 2px 0px hsl(var(--muted)),
                           3px 3px 0px hsl(var(--muted)),
                           4px 4px 0px hsl(var(--muted)),
                           1px 1px 2px rgba(0,0,0,0.5)
                         `,
                       }}">
          Two Perspectives
        </h1>
        <p className="mt-4 text-lg text-foreground/80">
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
