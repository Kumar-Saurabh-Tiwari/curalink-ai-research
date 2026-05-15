import { useEffect, useState } from "react";
import { LogIn, LogOut, User as UserIcon, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type CuraUser = {
  name: string;
  email: string;
  // Medical context — consumed automatically by src/api/chatApi.js
  patientName?: string;
  disease?: string;
  additionalQuery?: string;
  location?: string;
};

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
  const update = (patch: Partial<CuraUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };
  return { user, login, logout, update };
}

interface Props {
  collapsed?: boolean;
  user: CuraUser | null;
  onLogin: (u: CuraUser) => void;
  onLogout: () => void;
  onUpdate?: (patch: Partial<CuraUser>) => void;
}

export function UserProfile({ collapsed, user, onLogin, onLogout, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [patientName, setPatientName] = useState("");
  const [disease, setDisease] = useState("");
  const [additionalQuery, setAdditionalQuery] = useState("");
  const [location, setLocation] = useState("");

  const initials = user?.name
    ? user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
    : "";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onLogin({
      name: name.trim(),
      email: email.trim(),
      patientName: patientName.trim() || name.trim(),
      disease: disease.trim(),
      additionalQuery: additionalQuery.trim(),
      location: location.trim() || undefined,
    });
    setOpen(false);
    setName(""); setEmail(""); setPatientName(""); setDisease(""); setAdditionalQuery(""); setLocation("");
  };

  const openEditor = () => {
    if (!user) return;
    setPatientName(user.patientName || user.name || "");
    setDisease(user.disease || "");
    setAdditionalQuery(user.additionalQuery || "");
    setLocation(user.location || "");
    setEditOpen(true);
  };

  const saveContext = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate?.({
      patientName: patientName.trim(),
      disease: disease.trim(),
      additionalQuery: additionalQuery.trim(),
      location: location.trim() || undefined,
    });
    setEditOpen(false);
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
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gradient">Sign in to Curalink</DialogTitle>
              <DialogDescription>
                Save your research sessions and personalize medical context for every query.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Jane Smith" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@hospital.org" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="patientName">Patient name</Label>
                  <Input id="patientName" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="John Doe" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="disease">Disease / condition</Label>
                  <Input id="disease" value={disease} onChange={(e) => setDisease(e.target.value)} placeholder="Type 2 Diabetes" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Location <span className="text-muted-foreground">(optional)</span></Label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Boston, MA" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="additionalQuery">Additional context</Label>
                <Textarea id="additionalQuery" value={additionalQuery} onChange={(e) => setAdditionalQuery(e.target.value)} placeholder="Comorbidities, current medications, focus areas…" rows={2} />
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
    <>
      <div className={cn("group flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-2 transition-all hover:bg-card", collapsed && "justify-center p-1")}>
        <button
          onClick={openEditor}
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-xs font-semibold text-primary-foreground ring-2 ring-primary/30"
          aria-label="Edit medical context"
        >
          {initials || <UserIcon className="h-4 w-4" />}
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-sidebar" />
        </button>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-foreground">{user.name}</div>
              <div className="truncate text-[11px] text-muted-foreground">
                {user.disease ? user.disease : user.email}
              </div>
            </div>
            <Button onClick={openEditor} variant="ghost" size="icon" className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100" aria-label="Edit context">
              <Settings2 className="h-3.5 w-3.5" />
            </Button>
            <Button onClick={onLogout} variant="ghost" size="icon" className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100" aria-label="Sign out">
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gradient">Medical context</DialogTitle>
            <DialogDescription>
              Sent automatically with every chat request as <code>context</code>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={saveContext} className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="e-patientName">Patient name</Label>
              <Input id="e-patientName" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-disease">Disease / condition</Label>
              <Input id="e-disease" value={disease} onChange={(e) => setDisease(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-location">Location <span className="text-muted-foreground">(optional)</span></Label>
              <Input id="e-location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-additionalQuery">Additional context</Label>
              <Textarea id="e-additionalQuery" value={additionalQuery} onChange={(e) => setAdditionalQuery(e.target.value)} rows={3} />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary-glow">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
