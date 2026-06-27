import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Sparkles, User } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAppLang, useT } from "@/lib/use-lang";
import { getProfile, saveProfile } from "@/lib/storage";

export const Route = createFileRoute("/onboard")({
  head: () => ({ meta: [{ title: "Gov-Listen — Get started" }] }),
  component: OnboardPage,
});

function OnboardPage() {
  const [lang] = useAppLang();
  const t = useT(lang);
  const navigate = useNavigate();
  const profile = getProfile();
  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [nameError, setNameError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedName = name.trim();
    if (!normalizedName) {
      setNameError(t.nameRequired ?? "Name is required");
      return;
    }

    setNameError("");
    const normalizedPhone = phone.trim() || undefined;

    saveProfile({
      ...(profile ?? { lang, country: "", consented: true }),
      name: normalizedName,
      phone: normalizedPhone,
      lang,
      country: profile?.country ?? "",
      city: profile?.city,
      consented: profile?.consented ?? true,
    });

    navigate({ to: "/home" });
  };

  return (
    <AppShell dir={lang === "ar" ? "rtl" : "ltr"}>
      <form onSubmit={submit} className="flex-1 flex flex-col px-6 pt-12 pb-8">
        <div className="size-12 rounded-2xl bg-primary/10 grid place-items-center mb-6">
          <Sparkles className="size-6 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-extrabold text-primary mb-2">{t.aboutTitle}</h1>
        <p className="text-muted-foreground text-[15px] leading-relaxed mb-8">{t.aboutBody}</p>

        <div className="card-soft p-5 mb-4">
          <label className="block text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase mb-2">
            {t.yourName}
          </label>
          <div className="flex items-center gap-3">
            <User className="size-5 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError("");
              }}
              placeholder={t.namePlaceholder}
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-medium"
              required
            />
          </div>
          {nameError ? <p className="mt-2 text-sm text-destructive">{nameError}</p> : null}
        </div>

        <div className="card-soft p-5 mb-8">
          <label className="block text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase mb-2">
            {t.yourPhone}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t.phonePlaceholder}
            className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-medium"
          />
        </div>

        <div className="flex-1" />

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 shadow-soft active:scale-[0.98]"
        >
          {t.save}
          <ArrowRight className={`size-5 ${lang === "ar" ? "rotate-180" : ""}`} />
        </button>
      </form>
    </AppShell>
  );
}
