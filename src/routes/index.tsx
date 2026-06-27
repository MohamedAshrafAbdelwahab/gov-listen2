import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Mic, Building2, MapPin, Globe, ChevronRight, CheckCircle2, User, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gov-Listen — Your direct line to local governance" },
      { name: "description", content: "AI-powered civic reporting for all 55 African Union states. Speak — our AI writes the report, finds the right authority, and tracks the response." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div dir="ltr" className="app-shell flex flex-col">
      <div className="flex-1 flex flex-col px-5 pt-8 pb-12">
        {/* Hero */}
        <div className="text-center mb-10 animate-fade-up">
          <div className="size-14 rounded-2xl bg-primary grid place-items-center mx-auto mb-4 shadow-soft">
            <Sparkles className="size-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-[28px] font-extrabold text-primary leading-tight mb-2">Gov-Listen</h1>
          <p className="text-muted-foreground text-[15px] max-w-sm mx-auto">
            Your direct line to local governance — AI-powered civic reporting for Africa.
          </p>
        </div>

        {/* The Problem */}
        <section className="mb-8 animate-fade-up [animation-delay:80ms]">
          <h2 className="font-display text-lg font-bold text-primary mb-3">The Problem</h2>
          <div className="card-soft p-4">
            <p className="text-[14px] text-foreground/85 leading-relaxed">
              Across Africa, millions of civic issues go unreported every day. Citizens face broken roads,
              water leaks, power cuts, waste dumping, and safety hazards — but the reporting process is
              broken. You need to know which government agency to contact, write a formal report, navigate
              bureaucratic red tape, and wonder whether anyone even read your complaint. Most citizens
              simply give up.
            </p>
          </div>
        </section>

        {/* The Solution */}
        <section className="mb-8 animate-fade-up [animation-delay:120ms]">
          <h2 className="font-display text-lg font-bold text-primary mb-3">The Solution</h2>
          <div className="card-soft p-4">
            <p className="text-[14px] text-foreground/85 leading-relaxed">
              Gov-Listen is an AI-powered civic reporting platform built for African citizens. Instead of
              filling forms or writing official letters, you simply speak — in your own language, natural
              and unfiltered. Our AI transcribes your voice, extracts the key details, classifies the
              issue, and automatically routes it to the exact government authority responsible.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-8 animate-fade-up [animation-delay:160ms]">
          <h2 className="font-display text-lg font-bold text-primary mb-3">How It Works</h2>
          <div className="space-y-3">
            <div className="card-soft p-4 flex items-start gap-3">
              <div className="size-9 rounded-xl bg-primary/10 grid place-items-center shrink-0 mt-0.5">
                <Mic className="size-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">01</span>
                  <h3 className="font-semibold text-[14px] text-foreground">Speak or Type</h3>
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  Describe the problem naturally in your own language. The AI guides you with smart
                  follow-up questions.
                </p>
              </div>
            </div>
            <div className="card-soft p-4 flex items-start gap-3">
              <div className="size-9 rounded-xl bg-primary/10 grid place-items-center shrink-0 mt-0.5">
                <Sparkles className="size-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">02</span>
                  <h3 className="font-semibold text-[14px] text-foreground">AI Extracts the Facts</h3>
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  Our system identifies the category, priority level, location, and generates a
                  professional report.
                </p>
              </div>
            </div>
            <div className="card-soft p-4 flex items-start gap-3">
              <div className="size-9 rounded-xl bg-primary/10 grid place-items-center shrink-0 mt-0.5">
                <Building2 className="size-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">03</span>
                  <h3 className="font-semibold text-[14px] text-foreground">Auto-Routed to the Right Authority</h3>
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  Based on your country and issue type, the report is matched to the correct government
                  agency.
                </p>
              </div>
            </div>
            <div className="card-soft p-4 flex items-start gap-3">
              <div className="size-9 rounded-xl bg-primary/10 grid place-items-center shrink-0 mt-0.5">
                <MapPin className="size-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">04</span>
                  <h3 className="font-semibold text-[14px] text-foreground">Track in Real Time</h3>
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  A unique tracking ID lets you follow your report from submission to resolution.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mb-8 animate-fade-up [animation-delay:200ms]">
          <h2 className="font-display text-lg font-bold text-primary mb-3">Why Citizens Love Gov-Listen</h2>
          <div className="space-y-2">
            <div className="card-soft p-3 flex items-start gap-3">
              <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[13px] text-foreground">No forms, no bureaucracy</p>
                <p className="text-[12px] text-muted-foreground">Just speak naturally — the AI handles all the paperwork for you.</p>
              </div>
            </div>
            <div className="card-soft p-3 flex items-start gap-3">
              <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[13px] text-foreground">Speak your own language</p>
                <p className="text-[12px] text-muted-foreground">English and Arabic supported now. More African languages coming soon.</p>
              </div>
            </div>
            <div className="card-soft p-3 flex items-start gap-3">
              <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[13px] text-foreground">Knows exactly who to contact</p>
                <p className="text-[12px] text-muted-foreground">No more guessing which government agency — we route it to the right one automatically.</p>
              </div>
            </div>
            <div className="card-soft p-3 flex items-start gap-3">
              <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[13px] text-foreground">Track your report anywhere</p>
                <p className="text-[12px] text-muted-foreground">Every report gets a unique tracking ID so you can follow up anytime.</p>
              </div>
            </div>
            <div className="card-soft p-3 flex items-start gap-3">
              <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[13px] text-foreground">Attach photo evidence</p>
                <p className="text-[12px] text-muted-foreground">A picture is worth a thousand words — add photos to strengthen your report.</p>
              </div>
            </div>
            <div className="card-soft p-3 flex items-start gap-3">
              <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[13px] text-foreground">Made for all 55 African Union states</p>
                <p className="text-[12px] text-muted-foreground">Every country gets its own instance with its own authorities, languages, and laws.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Africa */}
        <section className="mb-8 animate-fade-up [animation-delay:240ms]">
          <h2 className="font-display text-lg font-bold text-primary mb-3">
            <Globe className="size-4 inline mr-1.5 mb-0.5" />
            Why This Matters for Africa
          </h2>
          <div className="card-soft p-4 space-y-2">
            <div className="flex items-start gap-2">
              <span className="size-1.5 rounded-full bg-primary shrink-0 mt-2" />
              <p className="text-[13px] text-foreground/85 leading-relaxed">
                Lowers the barrier to civic participation — anyone with a phone can report an issue,
                regardless of literacy level.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="size-1.5 rounded-full bg-primary shrink-0 mt-2" />
              <p className="text-[13px] text-foreground/85 leading-relaxed">
                Creates accountability — trackable reports mean citizens can follow up and authorities
                are held responsible.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="size-1.5 rounded-full bg-primary shrink-0 mt-2" />
              <p className="text-[13px] text-foreground/85 leading-relaxed">
                Data-driven governance — aggregated reports give local governments real-time visibility
                into what matters most to their communities.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="size-1.5 rounded-full bg-primary shrink-0 mt-2" />
              <p className="text-[13px] text-foreground/85 leading-relaxed">
                Built by Africans, for Africans — addressing the specific governance structures of our
                continent.
              </p>
            </div>
          </div>
        </section>

        {/* Built for 55 */}
        <section className="mb-8 animate-fade-up [animation-delay:280ms]">
          <h2 className="font-display text-lg font-bold text-primary mb-3">
            <Globe className="size-4 inline mr-1.5 mb-0.5" />
            Built for All 55 African Union States
          </h2>
          <div className="card-soft p-4 border-primary/20" style={{ borderColor: "color-mix(in oklab, var(--color-primary) 25%, var(--color-border))" }}>
            <p className="text-[14px] text-foreground/85 leading-relaxed">
              Architected for every African Union member state from day one. Each country runs its own
              sovereign instance — with its own government authorities, official languages, local
              regulations, and branding — all powered by the same intelligent engine. No bloated single
              app, no one-size-fits-none.
            </p>
          </div>
        </section>

        {/* Author */}
        <section className="mb-8 animate-fade-up [animation-delay:320ms]">
          <h2 className="font-display text-lg font-bold text-primary mb-3">Built by</h2>
          <div className="card-soft p-4 flex items-center gap-4">
            <div className="size-14 rounded-full bg-primary grid place-items-center text-primary-foreground font-bold text-lg shrink-0">
              M
            </div>
            <div>
              <p className="font-display font-bold text-[16px] text-foreground">Mohamed Ashraf Abdelwahab</p>
              <p className="text-[13px] text-muted-foreground">16 years old</p>
              <p className="text-[13px] text-muted-foreground">
                Student at <a href="https://deci.gov.eg/" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">Digital Egypt Cubs Initiative (DECI)</a>
              </p>
              <p className="text-[12px] text-muted-foreground">
                An initiative of the <span className="font-medium text-foreground/80">Ministry of Communications and Information Technology (MCIT)</span>, Egypt
              </p>
              <p className="text-[12px] text-muted-foreground mt-1">Built with React, TanStack Start, AI SDK, and a vision for a better Africa.</p>
            </div>
          </div>
        </section>

        {/* Competition */}
        <section className="mb-6 animate-fade-up [animation-delay:340ms]">
          <div className="card-soft p-3 border-primary/20 text-center" style={{ borderColor: "color-mix(in oklab, var(--color-primary) 25%, var(--color-border))" }}>
            <p className="text-[11px] text-muted-foreground">
              Submitted for the Ele-Vate African Youth in AI & Robotics competition, in partnership with DECI.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-2 animate-fade-up [animation-delay:360ms]">
          <a
            href="/welcome"
            className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 shadow-soft transition-all active:scale-[0.98]"
          >
            Get Started
            <ChevronRight className="size-5" />
          </a>
          <p className="text-center text-[10px] text-muted-foreground mt-3">
            &copy; 2026 Gov-Listen — AI for civic engagement in Africa
          </p>
        </div>
      </div>
    </div>
  );
}
