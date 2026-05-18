import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { loginUser, registerUser, setAuthToken } from "@/api/chatApi";
import type { CuraUser } from "./UserProfile";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess: (user: CuraUser) => void;
  title?: string;
  description?: string;
}

export function AuthDialog({
  open,
  onOpenChange,
  onAuthSuccess,
  title = "Sign in to Curalink",
  description = "Save your research sessions and personalize medical context for every query.",
}: AuthDialogProps) {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [patientName, setPatientName] = useState("");
  const [disease, setDisease] = useState("");
  const [additionalQuery, setAdditionalQuery] = useState("");
  const [location, setLocation] = useState("");

  const resetForm = () => {
    setMode("register");
    setName("");
    setEmail("");
    setPassword("");
    setPatientName("");
    setDisease("");
    setAdditionalQuery("");
    setLocation("");
    setError("");
  };

  const handleClose = (next: boolean) => {
    onOpenChange(next);
    if (!next) resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill all required fields.");
      return;
    }
    if (
      mode === "register" &&
      (!name.trim() || !patientName.trim() || !disease.trim() || !additionalQuery.trim())
    ) {
      setError("Please fill all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      try {
        const response =
          mode === "register"
            ? await registerUser({
                name: name.trim(),
                email: email.trim(),
                password: password.trim(),
                patientName: patientName.trim(),
                disease: disease.trim(),
                additionalQuery: additionalQuery.trim(),
                location: location.trim() || undefined,
              })
            : await loginUser({ email: email.trim(), password: password.trim() });

        if (response?.token) setAuthToken(response.token);
        if (response?.user) {
          onAuthSuccess(response.user as CuraUser);
          handleClose(false);
        }
      } catch (err: any) {
        if (mode === "register" && err?.status === 409) {
          setMode("login");
          setError("Account already exists. Please sign in.");
          return;
        }
        const message = err?.data?.message || err?.message || "Unable to sign in.";
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-gradient">
            {mode === "register" ? "Create your Curalink profile" : "Sign in to Curalink"}
          </DialogTitle>
          <DialogDescription>
            {mode === "register" ? description : "Welcome back. Enter your credentials to continue."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/40 p-1 text-xs">
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 rounded-lg px-3 py-1.5 transition ${
              mode === "register" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-lg px-3 py-1.5 transition ${
              mode === "login" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            Login
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          {mode === "register" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Jane Smith" required />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@hospital.org" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a password"
              required
            />
          </div>
          {mode === "register" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="patientName">Patient name</Label>
                  <Input id="patientName" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="John Doe" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="disease">Disease / condition</Label>
                  <Input id="disease" value={disease} onChange={(e) => setDisease(e.target.value)} placeholder="Type 2 Diabetes" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="location">Location <span className="text-muted-foreground">(optional)</span></Label>
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Boston, MA" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="additionalQuery">Additional context</Label>
                  <Textarea
                    id="additionalQuery"
                    value={additionalQuery}
                    onChange={(e) => setAdditionalQuery(e.target.value)}
                    placeholder="Comorbidities, current medications, focus areas..."
                    rows={2}
                    required
                  />
                </div>
              </div>
            </>
          )}
          {error && <div className="text-xs text-red-400">{error}</div>}
          <DialogFooter>
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary-glow" disabled={loading}>
              {loading ? "Please wait..." : mode === "register" ? "Create account" : "Sign in"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
