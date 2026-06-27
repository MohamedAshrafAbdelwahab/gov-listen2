import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, FileText, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAppLang, useT } from "@/lib/use-lang";
import { getReports, type Report } from "@/lib/storage";

export const Route = createFileRoute("/track")({
  head: () => ({ meta: [{ title: "Gov-Listen — My reports" }] }),
  component: TrackList,
});

function TrackList() {
  const [lang] = useAppLang();
  const t = useT(lang);
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  useEffect(() => { setReports(getReports()); }, []);

  return (
    <AppShell dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="flex-1 flex flex-col px-5 pt-10 pb-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate({ to: "/home" })} className="size-10 rounded-xl card-soft grid place-items-center">
            <ArrowLeft className={`size-4 text-foreground ${lang === "ar" ? "rotate-180" : ""}`} />
          </button>
          <h1 className="font-display text-lg font-bold text-primary">{t.trackReport}</h1>
          <div className="size-10" />
        </div>

        {reports.length === 0 && (
          <div className="card-soft p-8 text-center mt-8">
            <div className="size-12 rounded-2xl bg-secondary grid place-items-center mx-auto mb-4">
              <FileText className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{t.noReports}</p>
          </div>
        )}

        <div className="space-y-3">
          {reports.map((r) => (
            <Link
              key={r.id}
              to="/track/$id"
              params={{ id: r.id }}
              className="block card-soft p-4 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start gap-3">
                <div className="size-11 rounded-xl bg-secondary grid place-items-center shrink-0">
                  <FileText className="size-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold text-muted-foreground tracking-wide">{r.id}</span>
                    <StatusPill status={r.status} lang={lang} t={t} />
                  </div>
                  <h3 className="font-semibold text-foreground truncate">{r.title}</h3>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{r.authority.name}</p>
                </div>
                <ChevronRight className={`size-5 text-muted-foreground self-center shrink-0 ${lang === "ar" ? "rotate-180" : ""}`} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function StatusPill({ status, lang, t }: { status: Report["status"]; lang: "en" | "ar"; t: ReturnType<typeof useT> }) {
  const label =
    status === "received" ? t.statusReceived :
    status === "forwarded" ? t.statusForwarded :
    t.statusReview;
  const cls =
    status === "forwarded" ? "bg-success/15 text-success" :
    status === "review" ? "bg-warning/15 text-[oklch(0.45_0.15_60)]" :
    "bg-secondary text-foreground";
  void lang;
  return <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}
