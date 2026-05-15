import { ChatSession, Message } from "./curalink-types";

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

export const seedSessions: ChatSession[] = [
  {
    id: "s1",
    title: "GLP-1 agonists in cardiovascular outcomes",
    createdAt: now - 2 * 60 * 60 * 1000,
    messages: [],
  },
  {
    id: "s2",
    title: "CAR-T therapy long-term remission rates",
    createdAt: now - 5 * 60 * 60 * 1000,
    messages: [],
  },
  {
    id: "s3",
    title: "SGLT2 inhibitors in heart failure",
    createdAt: now - 1 * day - 3 * 60 * 60 * 1000,
    messages: [],
  },
  {
    id: "s4",
    title: "Microbiome and IBD pathogenesis",
    createdAt: now - 6 * day,
    messages: [],
  },
  {
    id: "s5",
    title: "Lecanemab Alzheimer's trial review",
    createdAt: now - 14 * day,
    messages: [],
  },
];

export function generateMockResponse(prompt: string): Omit<Message, "id" | "timestamp"> {
  return {
    role: "assistant",
    content: `Based on a synthesis of recent peer-reviewed literature and active clinical trials, here is what current evidence indicates regarding **${prompt.slice(0, 80)}**:\n\n- Multiple Phase 3 RCTs report statistically significant improvements (HR 0.74, 95% CI 0.66–0.83).\n- Mechanistic studies in *Nature Medicine* (2024) corroborate the proposed pathway.\n- ClinicalTrials.gov lists 14 active interventional studies as of this quarter.\n\nEvidence quality is **high** (GRADE A) with consistent findings across populations. Sources are linked in the detail panel.`,
    sources: [
      {
        id: "src1",
        source: "PubMed",
        title: "Cardiovascular outcomes of GLP-1 receptor agonists: a meta-analysis",
        journal: "The Lancet",
        date: "2024-08-12",
        doi: "10.1016/S0140-6736(24)01234-5",
        url: "https://pubmed.ncbi.nlm.nih.gov/",
      },
      {
        id: "src2",
        source: "OpenAlex",
        title: "Mechanistic basis of incretin-mediated cardioprotection",
        journal: "Nature Medicine",
        date: "2024-05-03",
        doi: "10.1038/s41591-024-02991-x",
        url: "https://openalex.org/",
      },
      {
        id: "src3",
        source: "ClinicalTrials.gov",
        title: "SELECT-CV: Semaglutide in High-Risk Cardiovascular Patients",
        date: "2023-11-20",
        url: "https://clinicaltrials.gov/",
      },
    ],
    trials: [
      { id: "t1", name: "SELECT-CV", phase: "Phase 3", participants: 17604, status: "Completed", condition: "ASCVD" },
      { id: "t2", name: "STEP-HFpEF", phase: "Phase 3", participants: 529, status: "Completed", condition: "Heart Failure" },
      { id: "t3", name: "FLOW", phase: "Phase 3", participants: 3534, status: "Active", condition: "Diabetic Nephropathy" },
    ],
    evidenceScore: 87,
  };
}
