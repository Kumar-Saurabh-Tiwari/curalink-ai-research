import { Message } from "@/lib/curalink-types";
import { cn } from "@/lib/utils";
import { Activity, User, BookOpen, FlaskConical, Database } from "lucide-react";

interface Props {
  message: Message;
  active: boolean;
  onClick: () => void;
}

const sourceIcon = {
  PubMed: BookOpen,
  OpenAlex: Database,
  "ClinicalTrials.gov": FlaskConical,
} as const;

export function MessageBubble({ message, active, onClick }: Props) {
  const isUser = message.role === "user";

  return (
    <article
      className={cn(
        "group flex gap-4 px-4 py-5 animate-fade-in",
        !isUser && "cursor-pointer rounded-xl transition-colors hover:bg-card/40",
        active && !isUser && "bg-card/60 ring-1 ring-primary/30",
      )}
      onClick={!isUser ? onClick : undefined}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          isUser ? "bg-secondary" : "bg-primary/15 ring-1 ring-primary/30",
        )}
      >
        {isUser ? <User className="h-4 w-4 text-muted-foreground" /> : <Activity className="h-4 w-4 text-primary" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-xs font-medium text-muted-foreground">
          {isUser ? "You" : "Curalink"}
        </div>
        <div className="prose prose-invert prose-sm max-w-none text-foreground/90 whitespace-pre-wrap">
          {message.content}
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {message.sources.map((s, index) => {
              const sourceName = s.source || (s as any).sourcePlatform || "Unknown";
              const Icon = sourceIcon[sourceName as keyof typeof sourceIcon] || Database;
              return (
                <span
                  key={s.id || index}
                  className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                >
                  <Icon className="h-3 w-3" />
                  {sourceName}
                </span>
              );
            })}
            {!isUser && (
              <span className="ml-1 text-[11px] text-muted-foreground/70 self-center">
                Click to view evidence →
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
