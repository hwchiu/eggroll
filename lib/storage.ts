// Shared types and seed data for the payment tracker.

export interface HistoryEntry {
  id: string;
  name: string;
  description: string;
  type: "add" | "deduct";
  amount: number;
  date: string;
  status: "Active" | "Completed" | "Pending";
  model: string;
  category: string;
}

// Initial seed data shown on first load (resets on page refresh / re-deploy).
export const SEED_HISTORY: HistoryEntry[] = [
  {
    id: "h1",
    name: "GPT-4o Enterprise API Integration",
    description:
      "Full-stack integration of OpenAI GPT-4o for enterprise knowledge base with RAG pipeline, custom embeddings, and multi-tenant isolation.",
    type: "add",
    amount: 87500,
    date: "2026-04-14",
    status: "Active",
    model: "gpt-4o-2024-11-20",
    category: "AI/ML",
  },
  {
    id: "h2",
    name: "Autonomous AI Code Review Agent",
    description:
      "AI-powered code review system with GitHub integration, security scanning, style enforcement, and automated PR feedback generation.",
    type: "add",
    amount: 54200,
    date: "2026-03-28",
    status: "Active",
    model: "gpt-4-turbo-2024-04-09",
    category: "DevOps/AI",
  },
  {
    id: "h3",
    name: "AI-Powered Customer Support Platform",
    description:
      "Multi-channel customer support with LLM-based intent detection, ticket routing, automated response generation, and escalation logic.",
    type: "add",
    amount: 62800,
    date: "2026-03-15",
    status: "Completed",
    model: "claude-3-5-sonnet-20241022",
    category: "AI/ML",
  },
  {
    id: "h4",
    name: "Predictive Analytics Dashboard",
    description:
      "Business intelligence platform with ML forecasting, anomaly detection, real-time data pipelines, and interactive visualization.",
    type: "add",
    amount: 41000,
    date: "2026-02-20",
    status: "Completed",
    model: "gpt-4-0125-preview",
    category: "Data/ML",
  },
  {
    id: "h5",
    name: "Vendor Contract Optimization Discount",
    description:
      "Annual subscription discount applied for cloud services and API usage optimization through vendor negotiation.",
    type: "deduct",
    amount: 15000,
    date: "2026-02-01",
    status: "Completed",
    model: "gpt-4o-2024-11-20",
    category: "Finance",
  },
  {
    id: "h6",
    name: "AI Document Processing Pipeline",
    description:
      "Automated document ingestion, OCR, classification, extraction, and indexing pipeline for legal and financial documents.",
    type: "add",
    amount: 33500,
    date: "2026-01-18",
    status: "Completed",
    model: "gpt-4-turbo-2024-04-09",
    category: "AI/ML",
  },
];

