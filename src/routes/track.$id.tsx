import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Phone, User, Mail } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAppLang, useT } from "@/lib/use-lang";
import { getReport, type Report } from "@/lib/storage";

export const Route = createFileRoute("/track/$id")({
  head: () => ({ meta: [{ title: "Gov-Listen — Report details" }] }),
  component: TrackDetail,
});

function TrackDetail() {
  const { id } = Route.useParams();
  const [lang] = useAppLang();
  const t = useT(lang);
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    const r = getReport(id);
    if (!r) { navigate({ to: "/track" }); return; }
    setReport(r);
  }, [id, navigate]);

  if (!report) return null;

  const dateStr = new Date(report.createdAt).toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <AppShell dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="flex-1 flex flex-col px-5 pt-10 pb-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate({ to: "/track" })} className="size-10 rounded-xl card-soft grid place-items-center">
            <ArrowLeft className={`size-4 text-foreground ${lang === "ar" ? "rotate-180" : ""}`} />
          </button>
          <h1 className="font-display text-lg font-bold text-primary">{report.title}</h1>
          <div className="size-10" />
        </div>

        <div className="card-soft p-5 mb-4">
          <p className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase">{t.trackingId}</p>
          <p className="font-mono text-2xl font-bold text-primary mt-1">{report.id}</p>
          <p className="text-xs text-muted-foreground mt-1">{dateStr}</p>
        </div>

        {report.photoDataUrl && (
          <div className="rounded-2xl overflow-hidden border border-border mb-4">
            <img src={report.photoDataUrl} alt="report" className="w-full aspect-video object-cover" />
          </div>
        )}

        <div className="card-soft p-5 mb-4 space-y-3">
          <DetailRow icon={<MapPin className="size-4" />} label={t.location} value={`${report.location.address ?? ""} ${report.location.city ?? ""}`.trim() || report.location.country} />
          <DetailRow icon={<Mail className="size-4" />} label={t.forwardedTo} value={`${report.authority.name} · ${report.authority.email}`} />
          <DetailRow icon={<User className="size-4" />} label={t.yourName} value={report.reporter.name} />
          {report.reporter.phone && <DetailRow icon={<Phone className="size-4" />} label={t.yourPhone} value={report.reporter.phone} />}
        </div>

        <div className="card-soft p-5 mb-4">
          <p className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase mb-2">{t.description}</p>
          <p className="text-sm text-foreground leading-relaxed">{report.description}</p>
        </div>

        {/* Timeline */}
        <div className="card-soft p-5 mb-6">
          <p className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase mb-4">Timeline</p>
          <div className="space-y-4">
            {report.timeline.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="size-2.5 rounded-full bg-success shadow-[0_0_0_4px_oklch(0.55_0.18_145/0.15)]" />
                  {i < report.timeline.length - 1 && <div className="w-px h-8 bg-border" />}
                </div>
                <div className="flex-1 -mt-1">
                  <p className="text-sm font-semibold text-foreground">{step.label}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(step.at).toLocaleString(lang === "ar" ? "ar-EG" : "en-US", { dateStyle: "short", timeStyle: "short" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1" />
        <Link to="/home" className="bg-primary text-primary-foreground rounded-2xl py-4 text-center font-semibold shadow-soft active:scale-[0.98]">
          {t.home}
        </Link>
      </div>
    </AppShell>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-8 rounded-lg bg-secondary grid place-items-center text-muted-foreground shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">{label}</p>
        <p className="text-sm font-medium text-foreground break-words">{value}</p>
      </div>
    </div>
  );
}
