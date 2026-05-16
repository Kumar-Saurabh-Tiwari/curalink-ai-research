import { Plus, MessageSquare, Activity, PanelLeftClose, PanelLeft } from "lucide-react";
import { ChatSession } from "@/lib/curalink-types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserProfile, useCuraUser } from "./UserProfile";

type Group = { label: string; sessions: ChatSession[] };

function groupSessions(sessions: ChatSession[]): Group[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const today: ChatSession[] = [];
  const yesterday: ChatSession[] = [];
  const month: ChatSession[] = [];
  for (const s of sessions) {
    const age = now - s.createdAt;
    if (age < day) today.push(s);
    else if (age < 2 * day) yesterday.push(s);
    else if (age < 30 * day) month.push(s);
  }
  return [
    { label: "Today", sessions: today },
    { label: "Yesterday", sessions: yesterday },
    { label: "Last 30 Days", sessions: month },
  ].filter((g) => g.sessions.length > 0);
}

interface SidebarProps {
  sessions: ChatSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  collapsed: boolean;
  onToggle: () => void;
}

export function CuralinkSidebar({ sessions, activeId, onSelect, onNewChat, collapsed, onToggle }: SidebarProps) {
  const groups = groupSessions(sessions);
  const { user, login, logout, update } = useCuraUser();

  return (
    <>
      {/* Mobile backdrop */}
      {!collapsed && (
        <button
          aria-label="Close sidebar"
          onClick={onToggle}
          className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm md:hidden animate-fade-in"
        />
      )}
      <aside
        className={cn(
          "z-40 flex h-full flex-col border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl transition-all duration-300 ease-out",
          "fixed inset-y-0 left-0 md:relative",
          collapsed
            ? "w-[280px] -translate-x-full md:w-[60px] md:translate-x-0"
            : "w-[280px] translate-x-0",
        )}
        aria-label="Research sessions"
      >
      <div className="flex items-center justify-between gap-2 p-3">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Curalink</span>
          </div>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      <div className="px-3 pb-2">
        <Button
          onClick={onNewChat}
          className={cn(
            "w-full justify-start gap-2 bg-primary/10 text-foreground ring-1 ring-primary/30 hover:bg-primary/20",
            collapsed && "px-0 justify-center",
          )}
          variant="ghost"
        >
          <Plus className="h-4 w-4 text-primary" />
          {!collapsed && <span className="text-sm font-medium">New Chat</span>}
        </Button>
      </div>

      {!collapsed && (
        <nav className="scrollbar-thin flex-1 overflow-y-auto px-2 pb-4">
          {groups.map((group) => (
            <div key={group.label} className="mt-3">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.label}
              </div>
              <ul className="mt-1 space-y-0.5">
                {group.sessions.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => onSelect(s.id)}
                      className={cn(
                        "group flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
                        activeId === s.id && "bg-sidebar-accent text-foreground",
                      )}
                    >
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                      <span className="truncate">{s.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {groups.length === 0 && (
            <div className="mt-8 px-2 text-center text-xs text-muted-foreground">No previous sessions</div>
          )}
        </nav>
      )}

      <div className="border-t border-sidebar-border p-3 space-y-2">
        <UserProfile collapsed={collapsed} user={user} onLogin={login} onLogout={logout} onUpdate={update} />
        {!collapsed && (
          <div className="text-[10px] text-muted-foreground/70 text-center">
            PubMed · OpenAlex · ClinicalTrials.gov
          </div>
        )}
      </div>
      </aside>
    </>
  );
}
