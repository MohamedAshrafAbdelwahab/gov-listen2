import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, MapPin, ArrowRight, Sparkles, MapPinOff, RefreshCcw, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAppLang, useT } from "@/lib/use-lang";
import { detectLocation, type LocationResult } from "@/lib/geo";
import { COUNTRY_NAMES } from "@/lib/authorities";
import { saveProfile } from "@/lib/storage";
import { Map } from "@/components/ui/map";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const SUPPORTED_COUNTRIES = Object.keys(COUNTRY_NAMES) as Array<keyof typeof COUNTRY_NAMES>;

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Gov-Listen — Welcome" },
      { name: "description", content: "Your direct line to local governance. AI-powered civic reporting for Africa." },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  const [lang, setLang] = useAppLang();
  const t = useT(lang);
  const navigate = useNavigate();

  const [loc, setLoc] = useState<LocationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [manualMode, setManualMode] = useState(false);
  const [manualCountry, setManualCountry] = useState<keyof typeof COUNTRY_NAMES>(SUPPORTED_COUNTRIES[0]);
  const [manualCity, setManualCity] = useState("");
  const [selectedMapLat, setSelectedMapLat] = useState<number | null>(null);
  const [selectedMapLng, setSelectedMapLng] = useState<number | null>(null);
  const [showComingSoonDialog, setShowComingSoonDialog] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const g = await detectLocation();
      if (!cancelled) {
        setLoc(g);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Retry location detection when user returns to tab (after granting permissions from prompt)
  useEffect(() => {
    let mounted = true;
    const handleVisibilityChange = async () => {
      if (!mounted || document.hidden || loading || loc?.status === "ok") return;
      // Only retry if we're currently showing the "unavailable" state
      if (loc?.status === "unavailable") {
        setLoading(true);
        const g = await detectLocation();
        if (mounted) {
          setLoc(g);
          setLoading(false);
        }
      }
    };

    const handleFocus = async () => {
      if (!mounted || loading || loc?.status === "ok") return;
      if (loc?.status === "unavailable") {
        setLoading(true);
        const g = await detectLocation();
        if (mounted) {
          setLoc(g);
          setLoading(false);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    return () => {
      mounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [loc, loading]);

  const handleContinue = (country?: string, city?: string) => {
    saveProfile({
      name: "",
      lang,
      country: country ?? "",
      city,
      consented: true,
    });
    navigate({ to: "/onboard" });
  };

  const handleRetry = () => {
    setLoading(true);
    setLoc(null);
    detectLocation()
      .then((g) => {
        setLoc(g);
        setLoading(false);
      })
      .catch(() => {
        setLoc({ status: "unavailable" });
        setLoading(false);
      });
  };

  const countryLabel =
    loc?.status === "ok" && loc.country
      ? `${loc.city ? loc.city + ", " : ""}${COUNTRY_NAMES[loc.country]?.[lang] ?? loc.country}`
      : "";

  return (
    <AppShell dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="flex-1 flex flex-col px-6 pt-12 pb-8">

        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <div className="size-9 rounded-xl bg-primary grid place-items-center">
            <Sparkles className="size-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">Gov-Listen</span>
        </div>

        {loading ? (
          <>
            <h1 className="font-display text-[28px] font-extrabold text-primary leading-tight mb-2 animate-fade-up">
              {t.welcomeTitle}
            </h1>
            <p className="text-muted-foreground text-[15px] mb-8 animate-fade-up [animation-delay:60ms]">
              {t.welcomeSubtitle}
            </p>
            <div className="card-soft p-4 flex items-center gap-3 animate-fade-up [animation-delay:120ms]">
              <div className="size-10 rounded-xl bg-secondary/50 grid place-items-center shrink-0">
                <MapPin className="size-5 text-muted-foreground animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">{t.currentLocation}</p>
                <p className="font-semibold text-foreground">{t.detecting}</p>
              </div>
            </div>
          </>
        ) : loc?.status === "ok" && loc.country ? (
          <>
            {/* Location found */}
            <h1 className="font-display text-[28px] font-extrabold text-primary leading-tight mb-2 animate-fade-up">
              {t.welcomeTitle}
            </h1>
            <p className="text-muted-foreground text-[15px] mb-8 animate-fade-up [animation-delay:60ms]">
              {t.welcomeSubtitle}
            </p>

            <div className="card-soft p-4 mb-3 flex items-center gap-3 border-success/40 animate-fade-up [animation-delay:120ms]"
              style={{ borderColor: "color-mix(in oklab, var(--color-success) 35%, var(--color-border))" }}>
              <div className="size-10 rounded-xl bg-success/10 grid place-items-center shrink-0">
                <MapPin className="size-5 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">{t.currentLocation}</p>
                <p className="font-semibold text-foreground truncate">{countryLabel}</p>
              </div>
              <CheckCircle2 className="size-5 text-success shrink-0" />
            </div>

            {/* Interactive Map */}
            {loc && loc.status === "ok" && loc.lat && loc.lng && (
              <div className="mb-8 animate-fade-up [animation-delay:180ms]">
                <div className="h-48 w-full rounded-2xl overflow-hidden border border-border shadow-sm">
                  <Map
                    lat={selectedMapLat ?? loc.lat}
                    lng={selectedMapLng ?? loc.lng}
                    markerLabel={`${loc.city ?? "Location"}, ${COUNTRY_NAMES[loc.country]?.[lang] ?? loc.country}`}
                    interactive={false}
                  />
                </div>
              </div>
            )}

            {/* Language selection */}
            <p className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase mb-3">
              {t.selectLanguage}
            </p>

            <div className="space-y-2 mb-2">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`w-full card-soft p-4 flex items-center gap-3 transition-all active:scale-[0.98] ${lang === "en" ? "ring-2 ring-primary" : ""}`}
              >
                <span className="size-9 rounded-lg bg-secondary grid place-items-center font-bold text-primary text-sm">EN</span>
                <span className="flex-1 text-start font-semibold text-foreground">English</span>
                {lang === "en" && <CheckCircle2 className="size-5 text-primary" />}
              </button>

              <button
                type="button"
                onClick={() => setLang("ar")}
                className={`w-full card-soft p-4 flex items-center gap-3 transition-all active:scale-[0.98] ${lang === "ar" ? "ring-2 ring-primary" : ""}`}
              >
                <span className="flex-1 text-start font-semibold text-foreground" style={{ fontFamily: "Cairo, sans-serif" }}>العربية</span>
                <span className="size-9 rounded-lg bg-accent grid place-items-center font-bold text-accent-foreground text-sm" style={{ fontFamily: "Cairo, sans-serif" }}>ع</span>
                {lang === "ar" && <CheckCircle2 className="size-5 text-primary" />}
              </button>

              <button
                type="button"
                onClick={() => setLang("sw")}
                className={`w-full card-soft p-4 flex items-center gap-3 transition-all active:scale-[0.98] ${lang === "sw" ? "ring-2 ring-primary" : ""}`}
              >
                <span className="size-9 rounded-lg bg-blue-500/20 grid place-items-center font-bold text-blue-600 text-sm">SW</span>
                <span className="flex-1 text-start font-semibold text-foreground">Kiswahili</span>
                {lang === "sw" && <CheckCircle2 className="size-5 text-primary" />}
              </button>
            </div>

            {/* Coming Soon Languages */}
            <p className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase mb-2 mt-4">قريباً | Coming Soon</p>
            <div className="grid grid-cols-2 gap-2 mb-8">
              {[
                { code: "yo", name: "Yorùbá", flag: "🇳🇬" },
                { code: "ha", name: "Hausa", flag: "🇳🇪" },
                { code: "am", name: "አማርኛ", flag: "🇪🇹" },
                { code: "xh", name: "isiXhosa", flag: "🇿🇦" },
                { code: "zu", name: "isiZulu", flag: "🇿🇦" },
              ].map((l) => (
                <div key={l.code} className="card-soft p-3 rounded-xl flex items-center gap-2 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                  <span className="text-2xl">{l.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{l.name}</p>
                  </div>
                  <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-[8px] font-bold px-2 py-0.5 rounded-full">
                    Soon
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-muted-foreground italic">{t.moreLanguages}</p>

            <button
              onClick={() => handleContinue(loc.country, loc.city)}
              className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 shadow-soft transition-all active:scale-[0.98]"
            >
              {t.next}
              <ArrowRight className={`size-5 ${lang === "ar" ? "rotate-180" : ""}`} />
            </button>
          </>
        ) : (
          <>
            {/* Location permission needed */}
            <div className="flex flex-col text-center animate-fade-up">
              <div className="size-20 rounded-full bg-destructive/10 grid place-items-center mb-6 mx-auto">
                <MapPinOff className="size-9 text-destructive" />
              </div>

              <h1 className="font-display text-[24px] font-extrabold text-primary leading-tight mb-3">
                {t.locationNeeded}
              </h1>

              <p className="text-muted-foreground text-[14px] leading-relaxed mb-8 max-w-xs mx-auto">
                {t.locationExplain}
              </p>

              <button
                onClick={handleRetry}
                className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 shadow-soft transition-all active:scale-[0.98] mb-3"
              >
                <RefreshCcw className="size-5" />
                {t.allowLocation}
              </button>

              {!manualMode ? (
                <button
                  onClick={() => setManualMode(true)}
                  className="w-full bg-secondary text-foreground rounded-2xl py-4 font-semibold transition-all active:scale-[0.98]"
                >
                  {t.enterManually}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="card-soft p-5 rounded-3xl">
                    <label className="block text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase mb-2">
                      {t.chooseCountry}
                    </label>
                    <select
                      value={manualCountry}
                      onChange={(e) => setManualCountry(e.target.value as keyof typeof COUNTRY_NAMES)}
                      className="w-full bg-transparent outline-none text-foreground font-medium p-3 rounded-2xl border border-border"
                    >
                      {SUPPORTED_COUNTRIES.map((country) => (
                        <option key={country} value={country}>
                          {COUNTRY_NAMES[country]?.[lang] ?? country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="card-soft p-5 rounded-3xl">
                    <label className="block text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase mb-2">
                      {t.cityLabel}
                    </label>
                    <input
                      value={manualCity}
                      onChange={(e) => setManualCity(e.target.value)}
                      placeholder={t.cityPlaceholder}
                      className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setManualMode(false)}
                      className="w-full bg-secondary text-foreground rounded-2xl py-4 font-semibold transition-all active:scale-[0.98]"
                    >
                      {lang === "ar" ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                      onClick={() => handleContinue(manualCountry, manualCity)}
                      className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold transition-all active:scale-[0.98]"
                    >
                      {t.next}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Language selection */}
            <div className="mt-auto pt-8 border-t border-border">
              <p className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase mb-3 text-center">
                {t.selectLanguage}
              </p>
              <div className="space-y-2 mb-2">
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`w-full card-soft p-4 flex items-center gap-3 transition-all active:scale-[0.98] ${lang === "en" ? "ring-2 ring-primary" : ""}`}
                >
                  <span className="size-9 rounded-lg bg-secondary grid place-items-center font-bold text-primary text-sm">EN</span>
                  <span className="flex-1 text-start font-semibold text-foreground">English</span>
                  {lang === "en" && <CheckCircle2 className="size-5 text-primary" />}
                </button>
                <button
                  type="button"
                  onClick={() => setLang("ar")}
                  className={`w-full card-soft p-4 flex items-center gap-3 transition-all active:scale-[0.98] ${lang === "ar" ? "ring-2 ring-primary" : ""}`}
                >
                  <span className="flex-1 text-start font-semibold text-foreground" style={{ fontFamily: "Cairo, sans-serif" }}>العربية</span>
                  <span className="size-9 rounded-lg bg-accent grid place-items-center font-bold text-accent-foreground text-sm" style={{ fontFamily: "Cairo, sans-serif" }}>ع</span>
                  {lang === "ar" && <CheckCircle2 className="size-5 text-primary" />}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Terms */}
        {loc?.status === "ok" && loc.country && !loading && (
          <p className="text-center text-[11px] text-muted-foreground mt-4">
            {t.termsHint} <span className="underline">{t.terms}</span>
          </p>
        )}
      </div>

    </AppShell>
  );
}
