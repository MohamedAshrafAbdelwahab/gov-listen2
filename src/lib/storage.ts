import type { Category } from "./authorities";

export type UserProfile = {
  name: string;
  phone?: string;
  lang: "en" | "ar";
  country: string; // ISO-2
  city?: string;
  consented: boolean;
};

export type ReportStatus = "received" | "forwarded" | "review";

export type Report = {
  id: string; // tracking id like GL-EG-8421
  createdAt: number;
  title: string;
  description: string;
  category: Category;
  priority: "low" | "medium" | "urgent";
  location: { city?: string; address?: string; lat?: number; lng?: number; country: string };
  authority: { name: string; email: string };
  photoDataUrl?: string;
  reporter: { name: string; phone?: string };
  status: ReportStatus;
  timeline: { at: number; label: string }[];
};

const PROFILE_KEY = "govlisten.profile.v1";
const REPORTS_KEY = "govlisten.reports.v1";

export function getProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  return raw ? (JSON.parse(raw) as UserProfile) : null;
}
export function saveProfile(p: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

export function getReports(): Report[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(REPORTS_KEY);
  return raw ? (JSON.parse(raw) as Report[]) : [];
}
export function saveReport(r: Report) {
  const all = getReports();
  all.unshift(r);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(all));
}
export function getReport(id: string): Report | undefined {
  return getReports().find((r) => r.id === id);
}

export function newTrackingId(countryCode: string): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `GL-${countryCode.toUpperCase()}-${n}`;
}
