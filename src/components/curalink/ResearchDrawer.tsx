import { Message } from "@/lib/curalink-types";
import { Button } from "@/components/ui/button";
import { X, ExternalLink, BookOpen, FlaskConical, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  message: Message | null;
  open: boolean;
  onClose: () => void;
}

const sourceIcon = {
  PubMed: BookOpen,
  OpenAlex: Database,
  "ClinicalTrials.gov": FlaskConical,
} as const;

function EvidenceGauge({ score }: { score: number }) {
  const color =
    score >= 75 ? "hsl(var(--evidence-high))" : score >= 50 ? "hsl(var(--evidence-mid))" : "hsl(var(--evidence-low))";
  const radius = 42;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/40 p-4">
      <div className="relative h-24 w-24 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold">{score}%</span>
        </div>
      </div>
      <div>
        <div className="text-sm font-semibold">Grounded Reasoning</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Confidence based on source quality, recency, and corroboration across databases.
        </div>
      </div>
    </div>
  );
}

export function ResearchDrawer({ message, open, onClose }: Props) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-0 z-50 flex flex-col border-l border-border bg-card transition-transform duration-300",
          "md:static md:z-auto md:h-full md:w-[420px] md:translate-x-0",
          open ? "translate-x-0" : "translate-x-full md:translate-x-0",
          !open && "md:hidden",
        )}
        aria-label="Research detail panel"
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">Research Drawer</h2>
            <p className="text-[11px] text-muted-foreground">Evidence & clinical metadata</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} aria-label="Close panel">
            <X className="h-4 w-4" />
          </Button>
        </header>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {!message && (
            <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/30">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              Select an AI message to see grounded sources, trials, and evidence scoring.
            </div>
          )}

          {message && (
            <>
              {message.evidenceScore !== undefined && <EvidenceGauge score={message.evidenceScore} />}

              {message.sources && message.sources.length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sources & Metadata
                  </h3>
                  <ul className="space-y-2">
                    {message.sources.map((s, index) => {
                      const sourceName = s.source || (s as any).sourcePlatform || "Unknown";
                      const Icon = sourceIcon[sourceName as keyof typeof sourceIcon] || Database;
                      return (
                        <li
                          key={s.id || index}
                          className="rounded-lg border border-border/60 bg-background/40 p-3 text-sm"
                        >
                          <div className="mb-1 flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5 text-primary" />
                            <span className="text-[11px] font-medium text-primary">{sourceName}</span>
                            {s.date && <span className="ml-auto text-[11px] text-muted-foreground">{s.date}</span>}
                          </div>
                          <div className="font-medium leading-snug">{s.title}</div>
                          {s.journal && <div className="mt-0.5 text-xs italic text-muted-foreground">{s.journal}</div>}
                          {s.doi && (
                            <a
                              href={s.url || `https://doi.org/${s.doi}`}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                            >
                              DOI: {s.doi} <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {message.trials && message.trials.length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Clinical Trials
                  </h3>
                  <div className="overflow-hidden rounded-lg border border-border/60">
                    <table className="w-full text-xs">
                      <thead className="bg-secondary/50 text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">Trial</th>
                          <th className="px-3 py-2 text-left font-medium">Phase</th>
                          <th className="px-3 py-2 text-right font-medium">N</th>
                          <th className="px-3 py-2 text-left font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {message.trials.map((t: any) => {
                          const trialName = t.name || t.title || "Unknown Trial";
                          const trialPhase = t.phase || (t.metadata && t.metadata.phase && t.metadata.phase[0]) || "N/A";
                          const trialParticipants = t.participants ?? (t.metadata && t.metadata.enrollment) ?? 0;
                          const trialStatus = t.status || t.trialStatus || "Unknown";

                          return (
                          <tr key={t.id || trialName} className="border-t border-border/60">
                            <td className="px-3 py-2 font-medium">{trialName}</td>
                            <td className="px-3 py-2 text-primary">{trialPhase}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{trialParticipants.toLocaleString()}</td>
                            <td className="px-3 py-2">
                              <span
                                className={cn(
                                  "inline-block rounded-full px-2 py-0.5 text-[10px] font-medium bg-secondary/50 text-foreground", // Default state fallback
                                  (trialStatus === "Completed" || trialStatus === "COMPLETED") && "bg-emerald-500/15 text-emerald-400",
                                  (trialStatus === "Active" || trialStatus === "ACTIVE") && "bg-blue-500/15 text-blue-400",
                                  (trialStatus === "Recruiting" || trialStatus === "RECRUITING") && "bg-amber-500/15 text-amber-400",
                                )}
                              >
                                {trialStatus}
                              </span>
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
