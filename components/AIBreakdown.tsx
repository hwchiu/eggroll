"use client";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Info,
  Brain,
  Layers,
} from "lucide-react";

export interface BreakdownItem {
  id: string;
  category: string;
  name: string;
  description: string;
  estimatedCost: number;
  confidence: number; // 0-100
  complexity: "Low" | "Medium" | "High" | "Critical";
  hours: number;
  references: { title: string; url: string }[];
  notes: string;
}

export interface AIAnalysis {
  projectName: string;
  totalEstimate: number;
  totalHours: number;
  modelVersion: string;
  analyzedAt: string;
  items: BreakdownItem[];
  summary: string;
  riskLevel: "Low" | "Medium" | "High";
}

const SAMPLE_ANALYSIS: AIAnalysis = {
  projectName: "Common KM Generator AI Agent with AI Chatbot Feature",
  totalEstimate: 87500,
  totalHours: 1750,
  modelVersion: "gpt-4o-2024-11-20",
  analyzedAt: new Date().toISOString(),
  riskLevel: "Medium",
  summary:
    "This project involves building a Knowledge Management (KM) generator powered by an AI agent with an integrated chatbot interface. The system will handle document ingestion, knowledge extraction, vector storage, and conversational retrieval. Estimated timeline is 8–12 months with a cross-functional team of 4–6 engineers.",
  items: [
    {
      id: "km-1",
      category: "Infrastructure",
      name: "Cloud Infrastructure & DevOps Setup",
      description:
        "AWS/GCP infrastructure setup including VPC, EKS clusters, CI/CD pipelines, monitoring (Prometheus/Grafana), and IaC with Terraform.",
      estimatedCost: 12000,
      confidence: 88,
      complexity: "High",
      hours: 240,
      references: [
        { title: "AWS EKS Pricing", url: "https://aws.amazon.com/eks/pricing/" },
        { title: "Terraform Best Practices", url: "https://developer.hashicorp.com/terraform/docs" },
      ],
      notes: "Assumes 2 engineers × 3 months for initial setup.",
    },
    {
      id: "km-2",
      category: "AI/ML",
      name: "LLM Integration & Prompt Engineering",
      description:
        "Integration with OpenAI GPT-4o / Anthropic Claude APIs, prompt chain design, RAG pipeline, token optimization, and fine-tuning evaluation.",
      estimatedCost: 18500,
      confidence: 75,
      complexity: "Critical",
      hours: 370,
      references: [
        { title: "OpenAI API Documentation", url: "https://platform.openai.com/docs" },
        { title: "LangChain RAG Guide", url: "https://python.langchain.com/docs/use_cases/question_answering/" },
      ],
      notes: "Confidence lower due to evolving model APIs and prompt iteration cycles.",
    },
    {
      id: "km-3",
      category: "Backend",
      name: "KM Backend Services",
      description:
        "REST/GraphQL API development, document processing pipeline, vector database (Pinecone/Weaviate), metadata indexing, and caching layer.",
      estimatedCost: 22000,
      confidence: 82,
      complexity: "High",
      hours: 440,
      references: [
        { title: "Pinecone Vector DB Pricing", url: "https://www.pinecone.io/pricing/" },
        { title: "FastAPI Documentation", url: "https://fastapi.tiangolo.com/" },
      ],
      notes: "Largest component; includes document ingestion worker queue.",
    },
    {
      id: "km-4",
      category: "Frontend",
      name: "AI Chatbot UI & KM Dashboard",
      description:
        "Next.js frontend with chat interface, document management dashboard, search & filtering, user authentication, and responsive design.",
      estimatedCost: 15000,
      confidence: 90,
      complexity: "Medium",
      hours: 300,
      references: [
        { title: "Next.js App Router Docs", url: "https://nextjs.org/docs/app" },
        { title: "Tailwind CSS", url: "https://tailwindcss.com/docs" },
      ],
      notes: "High confidence — mature toolchain with clear requirements.",
    },
    {
      id: "km-5",
      category: "Data",
      name: "Data Pipeline & Knowledge Extraction",
      description:
        "ETL pipelines for document ingestion (PDF, DOCX, HTML), entity extraction, knowledge graph construction, and automated tagging.",
      estimatedCost: 11000,
      confidence: 70,
      complexity: "High",
      hours: 220,
      references: [
        { title: "Apache Airflow Docs", url: "https://airflow.apache.org/docs/" },
        { title: "spaCy NLP", url: "https://spacy.io/usage" },
      ],
      notes: "Confidence lower due to variability in document format complexity.",
    },
    {
      id: "km-6",
      category: "Security & Compliance",
      name: "Security, Auth & Compliance",
      description:
        "OAuth2/OIDC integration, RBAC, data encryption at rest/transit, audit logging, GDPR compliance, and penetration testing.",
      estimatedCost: 9000,
      confidence: 85,
      complexity: "Medium",
      hours: 180,
      references: [
        { title: "OWASP Security Guidelines", url: "https://owasp.org/www-project-top-ten/" },
        { title: "Auth0 Documentation", url: "https://auth0.com/docs" },
      ],
      notes: "Includes one round of external pen-test.",
    },
  ],
};

function ConfidenceBadge({ value }: { value: number }) {
  const color =
    value >= 85 ? "text-green-400 border-green-500/40 bg-green-500/10"
    : value >= 70 ? "text-yellow-400 border-yellow-500/40 bg-yellow-500/10"
    : "text-red-400 border-red-500/40 bg-red-500/10";
  const icon =
    value >= 85 ? <CheckCircle2 size={12} />
    : value >= 70 ? <Info size={12} />
    : <AlertCircle size={12} />;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-mono font-semibold ${color}`}>
      {icon} {value}%
    </span>
  );
}

function ComplexityBadge({ level }: { level: BreakdownItem["complexity"] }) {
  const styles = {
    Low: "text-green-400 bg-green-500/10",
    Medium: "text-yellow-400 bg-yellow-500/10",
    High: "text-orange-400 bg-orange-500/10",
    Critical: "text-red-400 bg-red-500/10",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${styles[level]}`}>
      {level}
    </span>
  );
}

interface Props {
  analysis?: AIAnalysis;
  modelVersion: string;
}

export default function AIBreakdown({ analysis = SAMPLE_ANALYSIS, modelVersion }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const toggleItem = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const avgConfidence = Math.round(
    analysis.items.reduce((sum, i) => sum + i.confidence, 0) / analysis.items.length
  );

  return (
    <div className="w-full fade-in">
      {/* Header */}
      <div
        className="rounded-xl border p-5 mb-4"
        style={{ background: "#0f172a", borderColor: "#1e3a5f" }}
      >
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: "#1e3a5f" }}>
              <Brain size={20} className="text-blue-400" />
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">
                AI Estimation Result
              </div>
              <div className="font-semibold text-white">{analysis.projectName}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 px-2 py-1 rounded border border-gray-700 font-mono">
              {modelVersion}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded font-semibold ${
                analysis.riskLevel === "Low"
                  ? "bg-green-500/10 text-green-400"
                  : analysis.riskLevel === "Medium"
                  ? "bg-yellow-500/10 text-yellow-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {analysis.riskLevel} Risk
            </span>
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-400 leading-relaxed">{analysis.summary}</p>

        {/* Totals */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg p-3" style={{ background: "#111827" }}>
            <div className="text-xs text-gray-500 mb-1">Total Estimate</div>
            <div className="font-mono text-lg font-bold text-green-400">
              ${analysis.totalEstimate.toLocaleString()}
            </div>
          </div>
          <div className="rounded-lg p-3" style={{ background: "#111827" }}>
            <div className="text-xs text-gray-500 mb-1">Total Hours</div>
            <div className="font-mono text-lg font-bold text-blue-400">
              {analysis.totalHours.toLocaleString()}h
            </div>
          </div>
          <div className="rounded-lg p-3" style={{ background: "#111827" }}>
            <div className="text-xs text-gray-500 mb-1">Avg Confidence</div>
            <div className="font-mono text-lg font-bold text-yellow-400">{avgConfidence}%</div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {(showAll ? analysis.items : analysis.items.slice(0, 4)).map((item) => (
          <div
            key={item.id}
            className="rounded-xl border overflow-hidden"
            style={{ background: "#111827", borderColor: "#1f2937" }}
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center w-6 h-6 rounded text-xs font-bold text-blue-400 bg-blue-500/10 shrink-0">
                  <Layers size={14} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500 uppercase">{item.category}</span>
                    <ComplexityBadge level={item.complexity} />
                  </div>
                  <div className="font-medium text-white text-sm mt-0.5 truncate">{item.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <ConfidenceBadge value={item.confidence} />
                <div className="text-right">
                  <div className="font-mono font-bold text-green-400 text-sm">
                    ${item.estimatedCost.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">{item.hours}h</div>
                </div>
                {expanded.has(item.id) ? (
                  <ChevronUp size={16} className="text-gray-500" />
                ) : (
                  <ChevronDown size={16} className="text-gray-500" />
                )}
              </div>
            </button>

            {expanded.has(item.id) && (
              <div className="px-4 pb-4 border-t border-gray-800 pt-3 fade-in">
                <p className="text-sm text-gray-400 mb-3">{item.description}</p>
                {item.notes && (
                  <div className="flex gap-2 mb-3 p-2 rounded bg-blue-500/5 border border-blue-500/20">
                    <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-300">{item.notes}</p>
                  </div>
                )}
                {/* Confidence bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Confidence Level</span>
                    <span className="text-gray-400">{item.confidence}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-800">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${item.confidence}%`,
                        background:
                          item.confidence >= 85
                            ? "#22c55e"
                            : item.confidence >= 70
                            ? "#eab308"
                            : "#ef4444",
                      }}
                    />
                  </div>
                </div>
                {/* References */}
                {item.references.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">
                      References
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.references.map((ref) => (
                        <a
                          key={ref.url}
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-gray-700 text-blue-400 hover:border-blue-500 hover:text-blue-300 transition-colors"
                        >
                          <ExternalLink size={10} />
                          {ref.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {analysis.items.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 w-full py-2 text-sm text-gray-500 hover:text-gray-300 border border-gray-800 rounded-lg hover:border-gray-600 transition-all"
        >
          {showAll ? "Show less" : `Show ${analysis.items.length - 4} more items`}
        </button>
      )}
    </div>
  );
}
