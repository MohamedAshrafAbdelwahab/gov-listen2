import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Mic, Square, ArrowLeft, Camera, Send, X, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAppLang, useT } from "@/lib/use-lang";
import { getProfile, saveReport, newTrackingId, type Report } from "@/lib/storage";
import { resolveAuthority, getLocalizedName, type Category, CATEGORIES } from "@/lib/authorities";
import type { Lang } from "@/lib/i18n";

export const Route = createFileRoute("/report")({
  head: () => ({ meta: [{ title: "Gov-Listen — New report" }] }),
  component: ReportPage,
});

type Msg = { role: "user" | "assistant"; content: string };

type SpeechRecognitionAlternative = { transcript: string; confidence: number };

type SpeechRecognitionResultItem = ArrayLike<SpeechRecognitionAlternative> & {
  isFinal: boolean;
  length: number;
  item: (index: number) => SpeechRecognitionAlternative;
};

type SpeechRecognitionResult = ArrayLike<SpeechRecognitionResultItem> & {
  length: number;
  item: (index: number) => SpeechRecognitionResultItem;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { resultIndex: number; results: SpeechRecognitionResult }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type Fields = {
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  address?: string;
  hasPhoto?: boolean;
};

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    SpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

function getSpeechRecognitionCtor() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

async function fetchAI(endpoint: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const err = new Error((json.message as string) ?? "AI request failed");
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return json;
}

function ReportPage() {
  const [lang] = useAppLang();
  const t = useT(lang);
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: t.aiGreeting }]);
  const [fields, setFields] = useState<Fields>({});
  const [photo, setPhoto] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [typed, setTyped] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [done, setDone] = useState(false);
  const [finalReport, setFinalReport] = useState<Report | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking, photo]);

  useEffect(() => {
    const profile = getProfile();
    if (!profile || !profile.name) return;
    fetchAI("/api/extract", {
      action: "greet",
      lang,
      country: profile.country,
      city: profile.city,
      reporter: { name: profile.name },
      fields: {},
      conversation: [],
    })
      .then((data) => {
        if (data.greeting) {
          setMessages([{ role: "assistant", content: String(data.greeting) }]);
        }
      })
      .catch(() => {});
  }, [lang]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const callAI = async (next: Msg[], nextFields: Fields, hasPhoto: boolean) => {
    const profile = getProfile()!;
    setThinking(true);
    try {
      const data = await fetchAI("/api/extract", {
        lang,
        country: profile.country,
        city: profile.city,
        reporter: { name: profile.name, phone: profile.phone },
        fields: nextFields,
        conversation: next,
      });

      if (data.error === "quota_exceeded") {
        setQuotaExceeded(true);
        setMessages((m) => [
          ...m,
          { role: "assistant", content: t.quotaExceeded },
        ]);
        return;
      }

      const updates = data.updates as (Fields & { askPhoto?: boolean }) | undefined;
      const merged: Fields = { ...nextFields, ...(updates ?? {}), hasPhoto };
      delete (merged as Fields & { askPhoto?: boolean }).askPhoto;
      setFields(merged);

      if (data.done && data.finalDescription) {
        await finalize(merged, String(data.finalDescription));
        return;
      }
      if (data.nextQuestion) {
        setMessages((m) => [...m, { role: "assistant", content: String(data.nextQuestion) }]);
      }
    } catch (err) {
      console.error(err);
      const status = (err as Error & { status?: number }).status;
      if (status === 429) {
        setQuotaExceeded(true);
        setMessages((m) => [
          ...m,
          { role: "assistant", content: t.quotaExceeded },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: lang === "ar" ? "حدث خطأ مؤقت، حاول مرة أخرى." : "Sorry, something went wrong. Please try again." },
        ]);
      }
    } finally {
      setThinking(false);
    }
  };

  const finalize = async (f: Fields, finalDescription: string) => {
    setGenerating(true);
    const profile = getProfile()!;
    const category = (CATEGORIES.includes(f.category as Category) ? f.category : "other") as Category;
    const authority = resolveAuthority(profile.country, category);
    const id = newTrackingId(profile.country);
    const now = Date.now();
    const report: Report = {
      id,
      createdAt: now,
      title: f.title ?? (lang === "ar" ? "بلاغ جديد" : "New report"),
      description: finalDescription,
      category,
      priority: ((["low", "medium", "urgent"] as const).includes(f.priority as "low" | "medium" | "urgent") ? f.priority : "medium") as Report["priority"],
      location: { address: f.address, city: profile.city, country: profile.country },
      authority: { name: getLocalizedName(authority.name, lang), email: authority.email },
      photoDataUrl: photo ?? undefined,
      reporter: { name: profile.name, phone: profile.phone },
      status: "forwarded",
      timeline: [
        { at: now, label: lang === "ar" ? "تم استلام البلاغ" : "Report received" },
        { at: now + 1000, label: lang === "ar" ? `تم إحالته إلى ${getLocalizedName(authority.name, lang)}` : `Forwarded to ${getLocalizedName(authority.name, lang)}` },
      ],
    };
    await new Promise((r) => setTimeout(r, 1200));
    saveReport(report);
    setFinalReport(report);
    setDone(true);
    setGenerating(false);
  };

  const sendVoiceMessage = async (text: string) => {
    const content = text.trim();
    if (!content) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setTyped(content);
    setLiveTranscript("");
    await callAI(next, fields, !!photo);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const SpeechRecognitionCtor = getSpeechRecognitionCtor();
      if (SpeechRecognitionCtor) {
        const recognition = new SpeechRecognitionCtor();
        recognition.lang = ({ en: "en-US", ar: "ar-EG", sw: "sw-KE", yo: "yo-NG", ha: "ha-NG", am: "am-ET", xh: "xh-ZA", zu: "zu-ZA" } as Record<string, string>)[lang] ?? "en-US";
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.onresult = (event) => {
          let interim = "";
          let finalText = "";
          for (let i = event.resultIndex; i < event.results.length; i += 1) {
            const result = event.results[i];
            let transcript = "";
            for (let j = 0; j < result.length; j++) {
              transcript += result[j].transcript;
            }
            if (result.isFinal) {
              finalText += `${transcript} `;
            } else {
              interim += transcript;
            }
          }
          if (finalText.trim()) {
            setLiveTranscript(finalText.trim());
            void sendVoiceMessage(finalText.trim());
          } else if (interim.trim()) {
            setLiveTranscript(interim.trim());
          }
        };
        recognition.onerror = (event) => {
          console.error("speech recognition error", event.error);
          setLiveTranscript("");
        };
        recognition.onend = () => {
          recognitionRef.current = null;
          setRecording(false);
          streamRef.current?.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        };
        recognitionRef.current = recognition;
        recognition.start();
        setRecording(true);
        setLiveTranscript("");
        return;
      }

      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
    } catch {
      alert(t.micPermission);
    }
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setRecording(false);
  };

  const sendTyped = async () => {
    if (!typed.trim() || thinking || recording) return;
    const next = [...messages, { role: "user" as const, content: typed.trim() }];
    setMessages(next);
    setTyped("");
    await callAI(next, fields, !!photo);
  };

  const onPhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPhoto(dataUrl);
      const next: Msg[] = [...messages, { role: "user", content: lang === "ar" ? "[تم إرفاق صورة]" : "[Photo attached]" }];
      setMessages(next);
      await callAI(next, fields, true);
    };
    reader.readAsDataURL(file);
  };

  if (done && finalReport) {
    return <SuccessView report={finalReport} lang={lang} t={t} />;
  }

  return (
    <AppShell dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="flex-1 flex flex-col min-h-dvh">
        {/* Header */}
        <div className="px-5 pt-10 pb-4 flex items-center justify-between bg-background/80 backdrop-blur sticky top-0 z-10">
          <button onClick={() => navigate({ to: "/home" })} className="size-10 rounded-xl card-soft grid place-items-center">
            <ArrowLeft className={`size-4 text-foreground ${lang === "ar" ? "rotate-180" : ""}`} />
          </button>
          <div className="text-center">
            <p className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase">{t.newReport}</p>
            <p className="text-xs text-foreground/60 mt-0.5">
              {Object.values(fields).filter((v) => typeof v === "string" && v).length} / 5
            </p>
          </div>
          <div className="size-10" />
        </div>

        {/* Conversation */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {quotaExceeded && (
            <div className="card-soft p-4 rounded-2xl border-warning/40 bg-warning/5 animate-fade-up">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="size-5 text-warning shrink-0" />
                <p className="font-semibold text-sm text-foreground">{t.quotaExceeded}</p>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}>
              <div
                className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-md"
                    : "card-soft text-foreground rounded-2xl rounded-tl-md"
                }`}
              >
                {m.role === "assistant" && (
                  <p className="text-[9px] font-bold tracking-[0.18em] text-success uppercase mb-1">AI</p>
                )}
                {m.content}
              </div>
            </div>
          ))}

          {photo && (
            <div className="flex justify-end animate-fade-up">
              <div className="relative">
                <img src={photo} alt="attached" className="size-32 rounded-2xl object-cover border border-border" />
                <button onClick={() => setPhoto(null)} className="absolute -top-2 -end-2 size-7 rounded-full bg-destructive text-destructive-foreground grid place-items-center shadow-soft">
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          )}

          {thinking && (
            <div className="flex justify-start animate-fade-up">
              <div className="card-soft px-4 py-3 rounded-2xl rounded-tl-md flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">{t.sending}</span>
              </div>
            </div>
          )}

          {generating && (
            <div className="card-soft p-5 rounded-2xl border-success/40 animate-fade-up">
              <div className="flex items-center gap-3 mb-2">
                <Loader2 className="size-5 animate-spin text-success" />
                <p className="font-semibold text-foreground">{t.generating}</p>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-success animate-pulse" style={{ width: "70%" }} />
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="p-4 pb-6 bg-background/95 backdrop-blur border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onPhotoSelected} className="hidden" />
            <button onClick={() => fileRef.current?.click()} disabled={!!photo} className="size-11 rounded-xl card-soft grid place-items-center disabled:opacity-40">
              <Camera className="size-5 text-foreground" />
            </button>

            <div className="flex-1 card-soft px-3 py-2 flex items-center gap-2">
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") sendTyped(); }}
                placeholder={t.typeHere}
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                disabled={recording || thinking}
              />
              {typed.trim() && (
                <button onClick={sendTyped} className="size-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
                  <Send className="size-4" />
                </button>
              )}
            </div>
          </div>

          {/* Mic button */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {recording && (
                <>
                  <div className="absolute inset-0 rounded-full bg-success/30 animate-mic-pulse" />
                  <div className="absolute inset-0 rounded-full bg-success/20 animate-mic-pulse [animation-delay:0.4s]" />
                </>
              )}
              <button
                onClick={recording ? stopRecording : startRecording}
                disabled={thinking || generating}
                className={`relative size-20 rounded-full grid place-items-center transition-all active:scale-90 disabled:opacity-50 ${
                  recording
                    ? "bg-success text-success-foreground shadow-[0_0_0_8px_oklch(0.55_0.18_145/0.15)]"
                    : "bg-primary text-primary-foreground shadow-soft"
                }`}
              >
                {recording ? <Square className="size-7 fill-current" /> : <Mic className="size-8" />}
              </button>
            </div>
            <div className="mt-3 min-h-5 flex flex-col items-center">
              {recording ? (
                <div className="flex items-end gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span key={i} className="w-1 bg-success rounded-full animate-wave" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">{thinking ? t.sending : t.tapToSpeak}</p>
              )}
              {liveTranscript ? <p className="text-xs text-foreground/70 mt-1 text-center">{liveTranscript}</p> : null}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function SuccessView({ report, lang, t }: { report: Report; lang: Lang; t: ReturnType<typeof useT> }) {
  return (
    <AppShell dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="flex-1 flex flex-col px-6 pt-12 pb-8">
        <div className="size-16 rounded-3xl bg-success/15 grid place-items-center mb-5 animate-fade-up">
          <CheckCircle2 className="size-8 text-success" />
        </div>
        <h1 className="font-display text-3xl font-extrabold text-primary mb-2 animate-fade-up [animation-delay:80ms]">
          {t.reportSubmitted}
        </h1>
        <p className="text-muted-foreground mb-6 animate-fade-up [animation-delay:140ms]">
          {t.forwardedTo} <span className="text-foreground font-semibold">{report.authority.name}</span>
        </p>

        <div className="card-soft p-5 mb-4 animate-fade-up [animation-delay:200ms]">
          <p className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase">{t.trackingId}</p>
          <p className="font-mono text-2xl font-bold text-primary mt-1">{report.id}</p>
        </div>

        <div className="card-soft p-5 space-y-3 mb-6 animate-fade-up [animation-delay:260ms]">
          <Row label={t.category} value={report.category} />
          <Row label={t.priority} value={report.priority} pill={report.priority === "urgent" ? "destructive" : report.priority === "medium" ? "warning" : "muted"} />
          <Row label={t.location} value={`${report.location.address ?? ""} ${report.location.city ?? ""}`.trim() || report.location.country} />
        </div>

        <div className="card-soft p-5 mb-6 animate-fade-up [animation-delay:320ms]">
          <p className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase mb-2">{t.description}</p>
          <p className="text-sm text-foreground leading-relaxed">{report.description}</p>
        </div>

        <div className="flex-1" />

        <div className="grid grid-cols-2 gap-3">
          <Link to="/track/$id" params={{ id: report.id }} className="card-soft py-4 text-center font-semibold text-foreground active:scale-[0.98]">
            {t.viewDetails}
          </Link>
          <Link to="/home" className="bg-primary text-primary-foreground rounded-2xl py-4 text-center font-semibold shadow-soft active:scale-[0.98]">
            {t.home}
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value, pill }: { label: string; value: string; pill?: "destructive" | "warning" | "muted" }) {
  const pillCls =
    pill === "destructive"
      ? "bg-destructive/10 text-destructive"
      : pill === "warning"
      ? "bg-warning/15 text-[oklch(0.45_0.15_60)]"
      : "bg-secondary text-foreground";
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${pillCls}`}>
        {value}
      </span>
    </div>
  );
}
