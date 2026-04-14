export interface HistoryEntry {
  id: string;
  name: string;
  description: string;
  type: "add" | "deduct";
  amount: number;
  date: string; // YYYY-MM-DD
  status: "Active" | "Completed" | "Pending";
  model: string;
  category: string;
}
