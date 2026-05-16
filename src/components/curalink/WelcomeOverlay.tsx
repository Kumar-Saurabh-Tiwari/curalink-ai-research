import { useEffect, useState } from "react";
import { Activity, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "curalink:privacy-accepted";

export function WelcomeOverlay() {
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    if (!accepted) return;
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setClosing(true);
    setTimeout(() => setOpen(false), 450);
  };

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center px-4 transition-opacity duration-500 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/85 backdrop-blur-xl" />
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-primary/30 blur-3xl animate-blob" />
        <div className="absolute -bottom-40 -right-32 h-[460px] w-[460px] rounded-full bg-cyan-500/25 blur-3xl animate-blob [animation-delay:3s]" />
        <div className="absolute top-1/2 left-1/3 h-[360px] w-[360px] rounded-full bg-indigo-500/25 blur-3xl animate-blob [animation-delay:6s]" />
      </div>

      <div className="relative z-10 w-full max-w-lg animate-float-up">
        <div className="glass relative overflow-hidden rounded-3xl border border-primary/20 p-6 sm:p-8 shadow-elegant">
          {/* Animated gradient ring */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-3xl opacity-60 animate-gradient"
            style={{
              background:
                "linear-gradient(120deg, hsl(var(--primary)/0.35), transparent 40%, hsl(199 89% 60%/0.35) 70%, transparent)",
              maskImage:
                "linear-gradient(black, black) content-box, linear-gradient(black, black)",
              WebkitMask:
                "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              padding: 1,
            }}
          />

          <div className="relative flex flex-col items-center text-center">
            <div className="relative mb-5">
              <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-2xl animate-pulse-dot" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-cyan-500 shadow-elegant">
                <Activity className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>

            <h2 id="welcome-title" className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Welcome to <span className="text-gradient animate-gradient bg-clip-text">Curalink</span>
            </h2>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Your AI medical research companion. Evidence grounded in PubMed, OpenAlex
              and ClinicalTrials.gov — every claim traceable.
            </p>

            <div className="mt-6 grid w-full grid-cols-3 gap-2">
              {[
                { icon: Sparkles, label: "Cited answers" },
                { icon: ShieldCheck, label: "Privacy-first" },
                { icon: Activity, label: "Live trials" },
              ].map((f, i) => (
                <div
                  key={f.label}
                  style={{ animationDelay: `${150 + i * 120}ms` }}
                  className="animate-fade-in rounded-xl border border-border/60 bg-card/40 px-2 py-3 text-[11px] text-foreground/80"
                >
                  <f.icon className="mx-auto mb-1 h-4 w-4 text-primary" />
                  {f.label}
                </div>
              ))}
            </div>

            <div className="mt-7 w-full rounded-xl border border-border/60 bg-card/40 p-3 text-left">
              <label className="flex cursor-pointer items-start gap-3 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
                />
                <span>
                  I accept the <a className="text-primary underline-offset-2 hover:underline" href="#">Privacy Policy</a> and{" "}
                  <a className="text-primary underline-offset-2 hover:underline" href="#">Terms of Use</a>. Curalink is for research support only — not medical advice.
                </span>
              </label>
            </div>

            <Button
              onClick={handleAccept}
              disabled={!accepted}
              className="mt-5 h-11 w-full rounded-xl bg-gradient-to-r from-primary to-cyan-500 text-primary-foreground font-medium shadow-elegant transition-all hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed animate-gradient"
            >
              Continue to Curalink
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
