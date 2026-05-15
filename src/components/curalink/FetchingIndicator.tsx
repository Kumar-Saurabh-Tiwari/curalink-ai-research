import { Loader2 } from "lucide-react";

const sources = [
  { label: "Fetching from PubMed", color: "hsl(217 91% 60%)" },
  { label: "Querying OpenAlex", color: "hsl(199 89% 56%)" },
  { label: "Analyzing ClinicalTrials.gov", color: "hsl(173 80% 50%)" },
];

export function FetchingIndicator() {
  return (
    <div className="space-y-2 rounded-xl border border-border/60 bg-card/40 p-4">
      {sources.map((s, i) => (
        <div key={s.label} className="flex items-center gap-3 text-sm">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full animate-pulse-dot"
            style={{ background: s.color, animationDelay: `${i * 0.2}s` }}
          />
          <span className="text-muted-foreground">{s.label}…</span>
          <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-primary/60" />
        </div>
      ))}
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full w-1/2 animate-shimmer rounded-full" />
      </div>
    </div>
  );
}
