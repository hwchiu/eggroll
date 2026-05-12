export type ReportStatus = "not_published" | "partial_ready" | "fully_reported";
export type OverallReadiness = "not_ready" | "partial_ready" | "fully_ready";

export interface CompanyMonitoringRecord {
  id: string;
  companyName: string;
  ticker: string;
  sector: string;
  region: string;
  earningsEventDatetime: string | null;
  earningsPublished: boolean;
  financialReportStatus: ReportStatus;
  segmentReportStatus: ReportStatus;
  sources: string[];
  readiness: OverallReadiness;
  issueTags: string[];
}

const SECTORS = [
  "Technology",
  "Financial Services",
  "Healthcare",
  "Consumer",
  "Industrial",
  "Energy",
  "Communication",
  "Materials",
  "Real Estate",
  "Utilities",
] as const;

const REGIONS = ["US", "Europe", "Japan", "Taiwan", "Korea", "ASEAN"] as const;

const NAME_PREFIXES = [
  "Alpha",
  "Atlas",
  "Beacon",
  "Bluewave",
  "Catalyst",
  "Cedar",
  "Core",
  "Delta",
  "Ever",
  "First",
  "Global",
  "Helios",
  "Horizon",
  "Insight",
  "Lumen",
  "Meridian",
  "Metro",
  "Nova",
  "Omni",
  "Pacific",
  "Pioneer",
  "Prime",
  "Quantum",
  "Radiant",
  "Summit",
  "United",
  "Vertex",
  "Vision",
  "Zenith",
] as const;

const NAME_SUFFIXES = [
  "Holdings",
  "Group",
  "Technologies",
  "Systems",
  "Industries",
  "Capital",
  "Healthcare",
  "Energy",
  "Retail",
  "Networks",
  "Partners",
  "Resources",
  "Logistics",
  "Manufacturing",
  "Solutions",
] as const;

function toTicker(index: number): string {
  return `EGR${String(index + 1).padStart(3, "0")}`;
}

function toDatetime(index: number, published: boolean): string | null {
  if (!published) return null;
  const dayOffset = index % 42;
  const hourOffset = index % 7;
  const minuteOffset = (index * 7) % 60;
  const date = new Date(Date.UTC(2026, 6, 10 + dayOffset, 12 + hourOffset, minuteOffset, 0));
  return date.toISOString();
}

function normalizeReadiness(
  earningsPublished: boolean,
  financialReportStatus: ReportStatus,
  segmentReportStatus: ReportStatus
): OverallReadiness {
  if (!earningsPublished) return "not_ready";
  if (financialReportStatus === "fully_reported" && segmentReportStatus === "fully_reported") {
    return "fully_ready";
  }
  if (
    financialReportStatus !== "not_published" ||
    segmentReportStatus !== "not_published"
  ) {
    return "partial_ready";
  }
  return "not_ready";
}

function buildIssueTags(
  earningsPublished: boolean,
  financialReportStatus: ReportStatus,
  segmentReportStatus: ReportStatus
): string[] {
  const tags: string[] = [];
  if (!earningsPublished) tags.push("Earnings datetime missing");
  if (financialReportStatus === "not_published") tags.push("Financial report missing");
  if (financialReportStatus === "partial_ready") tags.push("Financial report partial");
  if (segmentReportStatus === "not_published") tags.push("Segment report missing");
  if (segmentReportStatus === "partial_ready") tags.push("Segment report partial");
  return tags;
}

function buildCompanyName(index: number): string {
  const prefix = NAME_PREFIXES[index % NAME_PREFIXES.length];
  const suffix = NAME_SUFFIXES[Math.floor(index / NAME_PREFIXES.length) % NAME_SUFFIXES.length];
  return `${prefix} ${suffix}`;
}

export const monitoringRecords: CompanyMonitoringRecord[] = Array.from({ length: 253 }, (_, index) => {
  const earningsPublished = index % 6 !== 0;
  const financialReportStatus: ReportStatus = !earningsPublished
    ? "not_published"
    : index % 5 === 0
      ? "partial_ready"
      : "fully_reported";
  const segmentReportStatus: ReportStatus = !earningsPublished
    ? "not_published"
    : index % 4 === 0
      ? "partial_ready"
      : index % 11 === 0
        ? "not_published"
        : "fully_reported";

  const readiness = normalizeReadiness(
    earningsPublished,
    financialReportStatus,
    segmentReportStatus
  );

  return {
    id: `company-${index + 1}`,
    companyName: buildCompanyName(index),
    ticker: toTicker(index),
    sector: SECTORS[index % SECTORS.length],
    region: REGIONS[index % REGIONS.length],
    earningsEventDatetime: toDatetime(index, earningsPublished),
    earningsPublished,
    financialReportStatus,
    segmentReportStatus,
    sources: [
      "Investor Relations Website",
      "Press Release Feed",
      "Regulatory Disclosure Portal",
    ],
    readiness,
    issueTags: buildIssueTags(earningsPublished, financialReportStatus, segmentReportStatus),
  };
});
