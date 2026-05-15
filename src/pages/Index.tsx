import { useEffect, useRef, useState } from "react";
import { ArrowUp, PanelRightOpen, Stethoscope, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CuralinkSidebar } from "@/components/curalink/Sidebar";
import { MessageBubble } from "@/components/curalink/MessageBubble";
import { ResearchDrawer } from "@/components/curalink/ResearchDrawer";
import { FetchingIndicator } from "@/components/curalink/FetchingIndicator";
import { ChatSession, Message } from "@/lib/curalink-types";
import { generateMockResponse, seedSessions } from "@/lib/curalink-mock";

const SUGGESTIONS = [
  { label: "Latest treatment for lung cancer", icon: "🫁" },
  { label: "Clinical trials for diabetes", icon: "💉" },
  { label: "Top researchers in Alzheimer's disease", icon: "🧠" },
  { label: "Recent studies on heart disease", icon: "❤️" },
];

const Index = () => {
  const [sessions, setSessions] = useState<ChatSession[]>(seedSessions);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeMsgId, setActiveMsgId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeMessage = messages.find((m) => m.id === activeMsgId) ?? null;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const persistCurrent = () => {
    if (messages.length === 0) return;
    const title =
      messages.find((m) => m.role === "user")?.content.slice(0, 60) || "Untitled session";
    if (activeId) {
      setSessions((prev) => prev.map((s) => (s.id === activeId ? { ...s, title, messages } : s)));
    } else {
      const id = crypto.randomUUID();
      setSessions((prev) => [{ id, title, messages, createdAt: Date.now() }, ...prev]);
    }
  };

  const handleNewChat = () => {
    persistCurrent();
    setActiveId(null);
    setMessages([]);
    setActiveMsgId(null);
    setDrawerOpen(false);
    setInput("");
  };

  const handleSelectSession = (id: string) => {
    persistCurrent();
    const s = sessions.find((x) => x.id === id);
    setActiveId(id);
    setMessages(s?.messages ?? []);
    setActiveMsgId(null);
  };

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    const reply = generateMockResponse(text);
    const aiMsg: Message = { ...reply, id: crypto.randomUUID(), timestamp: Date.now() };
    setMessages((m) => [...m, aiMsg]);
    setActiveMsgId(aiMsg.id);
    setLoading(false);
  };

  const onMessageClick = (id: string) => {
    setActiveMsgId(id);
    setDrawerOpen(true);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* SEO landing — visually hidden, accessible to crawlers */}
      <section className="sr-only">
        <h1>Curalink — AI Medical Research Assistant</h1>
        <p>
          Curalink is an AI Medical Research Assistant using OpenAlex, PubMed, and ClinicalTrials.gov.
          It helps clinicians, researchers, and life-science teams synthesize peer-reviewed evidence,
          interpret randomized clinical trials, and quantify the strength of grounded reasoning behind
          every answer. Curalink links DOIs, journal metadata, trial phases, and participant counts
          so every recommendation is auditable.
        </p>
        <h2>Trusted medical data sources</h2>
        <ul>
          <li>PubMed peer-reviewed biomedical literature</li>
          <li>OpenAlex open scholarly graph</li>
          <li>ClinicalTrials.gov registry of interventional studies</li>
        </ul>
      </section>

      <CuralinkSidebar
        sessions={sessions}
        activeId={activeId}
        onSelect={handleSelectSession}
        onNewChat={handleNewChat}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />

      <main className="flex h-full min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border/60 px-6 py-3">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {messages.length > 0 ? sessions.find((s) => s.id === activeId)?.title || "New research session" : "New research session"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => setDrawerOpen((d) => !d)}
          >
            <PanelRightOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Research Drawer</span>
          </Button>
        </header>

        <div ref={scrollRef} className="scrollbar-thin flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 py-6">
            {messages.length === 0 && !loading && (
              <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/30 glow">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-3xl font-semibold tracking-tight">
                  <span className="text-gradient">Evidence-grounded</span> medical research
                </h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Ask any clinical question. Curalink searches PubMed, OpenAlex, and ClinicalTrials.gov,
                  then shows you the studies behind every claim.
                </p>
                <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-xl border border-border/60 bg-card/40 p-3 text-left text-sm text-foreground/80 transition-all hover:border-primary/40 hover:bg-card hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                active={m.id === activeMsgId}
                onClick={() => onMessageClick(m.id)}
              />
            ))}

            {loading && (
              <div className="px-4 py-5 animate-fade-in">
                <FetchingIndicator />
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border/60 bg-background/80 px-4 py-4 backdrop-blur">
          <div className="mx-auto w-full max-w-3xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="relative rounded-2xl border border-border bg-card/60 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/40 transition-all"
            >
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask a clinical research question…"
                rows={1}
                className="min-h-[56px] resize-none border-0 bg-transparent px-4 py-4 pr-14 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || loading}
                className="absolute bottom-2.5 right-2.5 h-9 w-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </form>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Curalink synthesizes literature for research support — verify with primary sources before clinical use.
            </p>
          </div>
        </div>
      </main>

      <ResearchDrawer message={activeMessage} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
};

export default Index;
