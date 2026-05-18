import { useEffect, useState } from "react";
import { LogIn, LogOut, User as UserIcon, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { clearAuthToken, setAuthToken } from "@/api/chatApi";
import { AuthDialog } from "./AuthDialog";

export type CuraUser = {
  id?: string;
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
    const syncFromStorage = () => {
      try {
        const raw = localStorage.getItem(KEY);
        setUser(raw ? JSON.parse(raw) : null);
      } catch {
        setUser(null);
      }
    };

    syncFromStorage();

    const handleUserUpdate = () => syncFromStorage();
    window.addEventListener("curalink:user-updated", handleUserUpdate);

    return () => {
      window.removeEventListener("curalink:user-updated", handleUserUpdate);
    };
  }, []);
  const login = (u: CuraUser, token?: string) => {
    localStorage.setItem(KEY, JSON.stringify(u));
    if (token) setAuthToken(token);
    setUser(u);
    window.dispatchEvent(new Event("curalink:user-updated"));
  };
  const logout = () => {
    localStorage.removeItem(KEY);
    clearAuthToken();
    setUser(null);
    window.dispatchEvent(new Event("curalink:user-updated"));
  };
  const update = (patch: Partial<CuraUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem(KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("curalink:user-updated"));
      return next;
    });
  };
  return { user, login, logout, update };
}

interface Props {
  collapsed?: boolean;
  user: CuraUser | null;
  onLogin: (u: CuraUser, token?: string) => void;
  onLogout: () => void;
  onUpdate?: (patch: Partial<CuraUser>) => void;
}

export function UserProfile({ collapsed, user, onLogin, onLogout, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [disease, setDisease] = useState("");
  const [additionalQuery, setAdditionalQuery] = useState("");
  const [location, setLocation] = useState("");

  const initials = user?.name
    ? user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
    : "";

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
        <AuthDialog
          open={open}
          onOpenChange={setOpen}
          onAuthSuccess={(u) => onLogin(u)}
        />
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
