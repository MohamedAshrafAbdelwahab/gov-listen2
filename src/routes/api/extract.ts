import { createFileRoute } from "@tanstack/react-router";
import type { Lang } from "@/lib/i18n";

type ExtractRequest = {
  action?: "greet";
  lang: Lang;
  country: string;
  city?: string;
  reporter: { name: string; phone?: string };
  fields: {
    title?: string;
    description?: string;
    category?: string;
    priority?: string;
    address?: string;
    hasPhoto?: boolean;
  };
  conversation: { role: "user" | "assistant"; content: string }[];
};

const GREET_EN = `You are Gov-Listen, an AI assistant that helps African citizens file civic reports.
Generate a short, warm, personalized welcome greeting (1-2 sentences) for the user.
Mention their name, optionally their location, and invite them to describe the problem.
Respond in the user's conversation language.
Output STRICTLY a single JSON object: { "greeting": "..." }`;

const GREET_AR = `أنت Gov-Listen، مساعد ذكي يساعد المواطنين الأفارقة على تقديم بلاغات مدنية.
أنشئ ترحيباً قصيراً ودافئاً مخصصاً للمستخدم (1-2 جمل).
اذكر اسمه، وموقعه إن وُجد، وادعه لوصف المشكلة.
أجب بنفس لغة المستخدم.
أخرج فقط كائن JSON واحد: { "greeting": "..." }`;

const SYSTEM_EN = `You are Gov-Listen, an AI assistant that helps African citizens file civic reports (broken roads, water leaks, power cuts, waste, safety, etc.) to local government authorities.

You must respond in the same language as the user's request and the conversation context.

Your job each turn:
1. Read the conversation so far and extract any new fields.
2. Decide if you still need information. Required fields: title (short), description (clear), category, priority, address (text near where it happened). A photo is strongly encouraged but optional.
3. Allowed category values: roads, water, electricity, waste, safety, other.
4. Allowed priority values: low, medium, urgent.
5. If a key field is still missing, ask ONE short friendly follow-up question. If a photo would clearly help and none is attached, you may ask for one.
6. When you have enough, set done=true and return a comprehensive professional report description (6-10 sentences) structured as follows:
   - **Summary**: One sentence stating the issue type and location.
   - **Incident Details**: 2-3 sentences describing the problem, when it occurs, and current conditions.
   - **Impact Assessment**: 2-3 sentences explaining the impact on citizens, safety risks, and urgency.
   - **Recommended Actions**: 2-3 sentences suggesting specific actions the authority should take and expected outcome.

Output STRICTLY a single JSON object, no prose, no markdown, with shape:
{
  "updates": { "title"?: string, "description"?: string, "category"?: string, "priority"?: string, "address"?: string, "askPhoto"?: boolean },
  "nextQuestion": string | null,
  "done": boolean,
  "finalDescription"?: string
}`;

const SYSTEM_AR = `أنت Gov-Listen، مساعد ذكي يساعد المواطنين الأفارقة على تقديم بلاغات مدنية (طرق مكسورة، تسرّب مياه، انقطاع كهرباء، نفايات، سلامة، إلخ) للجهات الحكومية المحلية.

مهمتك في كل دور:
1. اقرأ المحادثة واستخرج أي حقول جديدة.
2. الحقول المطلوبة: عنوان قصير، وصف واضح، التصنيف، الأولوية، عنوان أو وصف للموقع. الصورة مستحبّة لكنها اختيارية.
3. قيم التصنيف المسموحة: roads, water, electricity, waste, safety, other.
4. قيم الأولوية: low, medium, urgent.
5. إذا نقص حقل مهم اسأل سؤالاً واحداً قصيراً وودوداً. يمكنك طلب صورة إن كانت ستساعد.
6. عندما تكتمل البيانات اضبط done=true وأعد وصفاً احترافياً منمّقاً (6-10 جمل) مُقسّماً كالتالي:
   - **ملخص**: جملة واحدة تحدد نوع المشكلة وموقعها.
   - **تفاصيل الحادث**: 2-3 جمل تصف المشكلة والحالات الراهنة.
   - **تقييم التأثير**: 2-3 جمل تشرح التأثير على المواطنين ومخاطر السلامة والمستوى الإلحاحي.
   - **الإجراءات المقترحة**: 2-3 جمل تقترح إجراءات محددة يتعين على الجهة اتخاذها والمخرج المتوقع.

أعد فقط كائن JSON واحد بدون أي شرح وبدون Markdown بالشكل:
{
  "updates": { "title"?: string, "description"?: string, "category"?: string, "priority"?: string, "address"?: string, "askPhoto"?: boolean },
  "nextQuestion": string | null,
  "done": boolean,
  "finalDescription"?: string
}

اكتب الأسئلة والوصف النهائي باللغة العربية.`;

const CF_AI_MODEL = "@cf/meta/llama-3.1-8b-instruct";

async function runAI(messages: { role: string; content: string }[]): Promise<string> {
  const CF_ACCOUNT_ID = process.env.CF_AI_ACCOUNT_ID;
  const CF_API_TOKEN = process.env.CF_AI_API_TOKEN;
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    throw new Error("Missing CF_AI_ACCOUNT_ID or CF_AI_API_TOKEN in env");
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_AI_MODEL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    },
  );

  const json = (await res.json()) as Record<string, unknown>;
  
  if (!json.success) {
    const errors = json.errors as Array<{ code?: number; message?: string }> | undefined;
    const errorCode = errors?.[0]?.code;
    if (errorCode === 11001 || errorCode === 10040) {
      throw new Error("QUOTA_EXCEEDED");
    }
    throw new Error(JSON.stringify(json.errors ?? "AI request failed"));
  }

  const result = json.result as Record<string, unknown> | undefined;
  const response = result?.response;
  
  if (typeof response === "string") return response;
  if (response != null) return String(response);
  throw new Error("Unexpected AI response: " + JSON.stringify(json.result));
}

export const Route = createFileRoute("/api/extract")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ExtractRequest;

        if (body.action === "greet") {
          const greetSystem = body.lang === "ar" ? GREET_AR : GREET_EN;
          const greetUser = body.lang === "ar"
            ? `المستخدم: ${body.reporter.name}${body.city ? `، من ${body.city}` : ""}${body.country ? `، ${body.country}` : ""}\nاللغة: العربية.`
            : `User: ${body.reporter.name}${body.city ? `, from ${body.city}` : ""}${body.country ? `, ${body.country}` : ""}\nLanguage: ${body.lang}.`;
          try {
            const text = await runAI([
              { role: "system", content: greetSystem },
              { role: "user", content: greetUser },
            ]);
            const cleaned = String(text).trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
            const parsed = JSON.parse(cleaned);
            return Response.json(parsed);
          } catch (err) {
            if (err instanceof Error && err.message === "QUOTA_EXCEEDED") {
              return Response.json(
                { error: "quota_exceeded", message: body.lang === "ar" ? "تم استنفاد حد الاستخدام اليومي للذكاء الاصطناعي. يرجى المحاولة مرة أخرى غداً." : "AI daily quota exceeded. Please try again tomorrow." },
                { status: 429 },
              );
            }
            return Response.json({ greeting: "" });
          }
        }

        const context = `Context:
- Reporter: ${body.reporter.name}${body.reporter.phone ? `, phone ${body.reporter.phone}` : ""}
- Country: ${body.country}${body.city ? `, city ${body.city}` : ""}
- Fields so far: ${JSON.stringify(body.fields)}
- Photo attached: ${body.fields.hasPhoto ? "yes" : "no"}

Conversation:
${body.conversation.map((m) => `${m.role}: ${m.content}`).join("\n")}`;

        const systemPrompt = body.lang === "ar" ? SYSTEM_AR : SYSTEM_EN;
        const userPrompt = body.lang === "ar"
          ? `${context}\nاتبع اللغة العربية في جميع الردود. أجب فقط بكائن JSON واحد بدون أي شرح.`
          : `${context}\nFollow the same language as the user's conversation. Answer only with a single JSON object without any explanation.`;

        try {
          const text = await runAI([
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ]);

          const cleaned = String(text)
            .trim()
            .replace(/^```(?:json)?/i, "")
            .replace(/```$/, "")
            .trim();

          const extractJsonObject = (value: string): string | null => {
            const start = value.indexOf("{");
            if (start === -1) return null;
            let depth = 0;
            for (let i = start; i < value.length; i += 1) {
              if (value[i] === "{") depth += 1;
              else if (value[i] === "}") {
                depth -= 1;
                if (depth === 0) return value.slice(start, i + 1);
              }
            }
            return null;
          };

          let parsed: unknown = {};
          try {
            parsed = JSON.parse(cleaned);
          } catch {
            const jsonText = extractJsonObject(cleaned);
            if (jsonText) {
              parsed = JSON.parse(jsonText);
            } else {
              throw new Error("No JSON object found in AI response");
            }
          }
          return Response.json(parsed);
        } catch (err) {
          if (err instanceof Error && err.message === "QUOTA_EXCEEDED") {
            return Response.json(
              { error: "quota_exceeded", message: body.lang === "ar" ? "تم استنفاد حد الاستخدام اليومي للذكاء الاصطناعي. يرجى المحاولة مرة أخرى غداً." : "AI daily quota exceeded. Please try again tomorrow." },
              { status: 429 },
            );
          }
          const msg = err instanceof Error ? err.message : "AI error";
          return new Response(msg, { status: 500 });
        }
      },
    },
  },
});
