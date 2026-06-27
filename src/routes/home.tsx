import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mic, ListChecks, ArrowRight, MapPin } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAppLang, useT } from "@/lib/use-lang";
import { getProfile, getReports } from "@/lib/storage";
import { COUNTRY_NAMES } from "@/lib/authorities";
import type { UserProfile, Report } from "@/lib/storage";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "Gov-Listen — Home" }] }),
  component: HomePage,
});

function HomePage() {
  const [lang] = useAppLang();
  const t = useT(lang);
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const p = getProfile();
    if (!p || !p.name) { navigate({ to: "/" }); return; }
    setProfile(p);
    setReports(getReports());
  }, [navigate]);

  if (!profile) return null;
  const countryLabel = `${profile.city ? profile.city + ", " : ""}${COUNTRY_NAMES[profile.country]?.[lang] ?? profile.country}`;

  return (
    <AppShell dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="flex-1 flex flex-col px-6 pt-12 pb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-muted-foreground text-sm">{t.homeHello},</p>
            <h1 className="font-display text-2xl font-extrabold text-primary">{profile.name}</h1>
          </div>
          <div className="size-11 rounded-full bg-primary grid place-items-center text-primary-foreground font-bold">
            {profile.name.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <MapPin className="size-3.5" />
          <span>{countryLabel}</span>
        </div>

        <p className="text-foreground/70 text-[15px] mb-6">{t.homeAsk}</p>

        {/* Primary action - filled */}
        <Link
          to="/report"
          className="block group bg-primary text-primary-foreground rounded-3xl p-6 mb-4 shadow-soft active:scale-[0.98] transition-transform relative overflow-hidden"
        >
          <div className="absolute -end-6 -bottom-6 size-32 rounded-full border-[6px] border-primary-foreground/10" />
          <div className="absolute -end-2 -bottom-2 size-16 rounded-full bg-success/30" />
          <div className="relative">
            <div className="size-11 rounded-2xl bg-primary-foreground/10 grid place-items-center mb-4">
              <Mic className="size-5 text-primary-foreground" />
            </div>
            <h2 className="font-display text-xl font-bold mb-1">{t.newReport}</h2>
            <p className="text-primary-foreground/70 text-sm">{t.newReportSub}</p>
            <div className="mt-5 flex items-center gap-2 text-sm font-semibold">
              <span>{t.tapToSpeak}</span>
              <ArrowRight className={`size-4 ${lang === "ar" ? "rotate-180" : ""}`} />
            </div>
          </div>
        </Link>

        {/* Secondary action */}
        <Link
          to="/track"
          className="block card-soft p-6 active:scale-[0.98] transition-transform"
        >
          <div className="flex items-start gap-4">
            <div className="size-11 rounded-2xl bg-secondary grid place-items-center shrink-0">
              <ListChecks className="size-5 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-lg font-bold text-foreground">{t.trackReport}</h2>
              <p className="text-muted-foreground text-sm mt-0.5">{t.trackReportSub}</p>
              {reports.length > 0 && (
                <p className="mt-2 text-xs font-semibold text-success">
                  {reports.length} {lang === "ar" ? "بلاغ" : reports.length === 1 ? "active report" : "active reports"}
                </p>
              )}
            </div>
            <ArrowRight className={`size-5 text-muted-foreground self-center ${lang === "ar" ? "rotate-180" : ""}`} />
          </div>
        </Link>

        <div className="flex-1" />

        <div className="text-center pt-8 space-y-2">
          <Link to="/" className="inline-block text-[11px] text-primary font-semibold hover:underline transition-all">
            {t.about}
          </Link>
          <div className="text-[10px] text-muted-foreground/70 tracking-widest uppercase">
            Gov-Listen · by Mohamed Ashraf
          </div>
        </div>
      </div>
    </AppShell>
  );
}
