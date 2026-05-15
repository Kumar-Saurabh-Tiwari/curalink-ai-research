import { useEffect, useState } from "react";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type CuraUser = { name: string; email: string };

const KEY = "curalink:user";

export function useCuraUser() {
  const [user, setUser] = useState<CuraUser | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);
  const login = (u: CuraUser) => {
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
  };
  const logout = () => {
    localStorage.removeItem(KEY);
    setUser(null);
  };
  return { user, login, logout };
}

interface Props {
  collapsed?: boolean;
  user: CuraUser | null;
  onLogin: (u: CuraUser) => void;
  onLogout: () => void;
}

export function UserProfile({ collapsed, user, onLogin, onLogout }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const initials = user?.name
    ? user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
    : "";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onLogin({ name: name.trim(), email: email.trim() });
    setOpen(false);
    setName(""); setEmail("");
  };

  if (!user) {
    return (
      <>
        <Button
          onClick={() => setOpen(true)}
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 border border-border/60 bg-card/40 hover:bg-card",
            collapsed && "px-0 justify-center",
          )}
        >
          <LogIn className="h-4 w-4 text-primary" />
          {!collapsed && <span className="text-sm">Sign in</span>}
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-gradient">Sign in to Curalink</DialogTitle>
              <DialogDescription>
                Save your research sessions and personalize your experience.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Jane Smith" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@hospital.org" required />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary-glow">
                  Continue
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className={cn("group flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-2 transition-all hover:bg-card", collapsed && "justify-center p-1")}>
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-xs font-semibold text-primary-foreground ring-2 ring-primary/30">
        {initials || <UserIcon className="h-4 w-4" />}
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-sidebar" />
      </div>
      {!collapsed && (
        <>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-foreground">{user.name}</div>
            <div className="truncate text-[11px] text-muted-foreground">{user.email}</div>
          </div>
          <Button onClick={onLogout} variant="ghost" size="icon" className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100" aria-label="Sign out">
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </>
      )}
    </div>
  );
}
