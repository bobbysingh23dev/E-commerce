import { apiFetch } from "./client";
import type { ReportSummary } from "../types";

// GET /reports/summary — admin only (token attached automatically; a non-admin
// gets 403, which surfaces as an ApiError).
export function getSummary(): Promise<ReportSummary> {
  return apiFetch<ReportSummary>("/reports/summary");
}
