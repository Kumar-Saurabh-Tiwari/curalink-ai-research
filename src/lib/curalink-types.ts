export type SourceBadge = {
  id: string;
  source: "PubMed" | "OpenAlex" | "ClinicalTrials.gov";
  title: string;
  journal?: string;
  date?: string;
  doi?: string;
  url?: string;
};

export type ClinicalTrial = {
  id: string;
  name: string;
  phase: "Phase 1" | "Phase 2" | "Phase 3" | "Phase 4";
  participants: number;
  status: "Recruiting" | "Completed" | "Active";
  condition: string;
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  sources?: SourceBadge[];
  trials?: ClinicalTrial[];
  evidenceScore?: number; // 0-100
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
};
