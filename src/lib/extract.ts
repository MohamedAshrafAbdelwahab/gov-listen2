import { createServerFn } from "@tanstack/react-start";
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
   - **تقييم التأثير**: 2-3 جمل تشرح التأثير على المواطنين و安全隐患 والمستوى الإلحاحي.
   - **الإجراءات المقترحة**: 2-3 جمل تقترح إجراءات محددة يتعين على الجهة اتخاذها والمخرج المتوقع.

أعد فقط كائن JSON واحد بدون أي شرح وبدون Markdown بالشكل:
{
  "updates": { "title"?: string, "description"?: string, "category"?: string, "priority"?: string, "address"?: string, "askPhoto"?: boolean },
  "nextQuestion": string | null,
  "done": boolean,
  "finalDescription"?: string
}

اكتب الأسئلة والوصف النهائي باللغة العربية.`;

const ZEN_MODEL = "deepseek-v4-flash-free";
const ZEN_ENDPOINT = "https://opencode.ai/zen/v1/chat/completions";

async function runAI(messages: { role: string; content: string }[]): Promise<string> {
  const ZEN_API_KEY = process.env.ZEN_API_KEY;
  if (!ZEN_API_KEY) {
    throw new Error("Missing ZEN_API_KEY in env");
  }

  const res = await fetch(ZEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ZEN_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: ZEN_MODEL,
      messages,
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) throw new Error("QUOTA_EXCEEDED");
    throw new Error(`Zen API error ${res.status}: ${body}`);
  }

  const json = (await res.json()) as Record<string, unknown>;
  const choices = json.choices as Array<{ message?: { content?: string } }> | undefined;
  const content = choices?.[0]?.message?.content;

  if (typeof content === "string" && content.trim()) return content;
  throw new Error("Unexpected Zen API response: " + JSON.stringify(json));
}

function extractJsonObject(value: string): string | null {
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
}

function parseAIResponse(text: string): Record<string, unknown> {
  const cleaned = String(text).trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const jsonText = extractJsonObject(cleaned);
    if (jsonText) return JSON.parse(jsonText);
    throw new Error("No JSON object found in AI response");
  }
}

const QUOTA_MSG_EN = "Our AI has reached its daily usage limit. You can type your report manually below, or try again tomorrow. Thank you for your patience!";
const QUOTA_MSG_AR = "تم استنفاد الحد اليومي للذكاء الاصطناعي. يمكنك كتابة بلاغك يدوياً أدناه، أو المحاولة مجدداً غداً. شكراً لصبرك!";

export const extractData = createServerFn({ method: "POST" })
  .validator((data: ExtractRequest) => data)
  .handler(async ({ data }) => {
    if (data.action === "greet") {
      const greetSystem = data.lang === "ar" ? GREET_AR : GREET_EN;
      const greetUser = data.lang === "ar"
        ? `المستخدم: ${data.reporter.name}${data.city ? `، من ${data.city}` : ""}${data.country ? `، ${data.country}` : ""}\nاللغة: العربية.`
        : `User: ${data.reporter.name}${data.city ? `, from ${data.city}` : ""}${data.country ? `, ${data.country}` : ""}\nLanguage: ${data.lang}.`;
      try {
        const text = await runAI([
          { role: "system", content: greetSystem },
          { role: "user", content: greetUser },
        ]);
        return parseAIResponse(text);
      } catch (err) {
        if (err instanceof Error && err.message === "QUOTA_EXCEEDED") {
          return { error: "quota_exceeded", message: data.lang === "ar" ? QUOTA_MSG_AR : QUOTA_MSG_EN };
        }
        return { greeting: "" };
      }
    }

    const context = `Context:
- Reporter: ${data.reporter.name}${data.reporter.phone ? `, phone ${data.reporter.phone}` : ""}
- Country: ${data.country}${data.city ? `, city ${data.city}` : ""}
- Fields so far: ${JSON.stringify(data.fields)}
- Photo attached: ${data.fields.hasPhoto ? "yes" : "no"}

Conversation:
${data.conversation.map((m) => `${m.role}: ${m.content}`).join("\n")}`;

    const systemPrompt = data.lang === "ar" ? SYSTEM_AR : SYSTEM_EN;
    const userPrompt = data.lang === "ar"
      ? `${context}\nاتبع اللغة العربية في جميع الردود. أجب فقط بكائن JSON واحد بدون أي شرح.`
      : `${context}\nFollow the same language as the user's conversation. Answer only with a single JSON object without any explanation.`;

    try {
      const text = await runAI([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ]);
      return parseAIResponse(text);
    } catch (err) {
      if (err instanceof Error && err.message === "QUOTA_EXCEEDED") {
        return { error: "quota_exceeded", message: data.lang === "ar" ? QUOTA_MSG_AR : QUOTA_MSG_EN };
      }
      throw err;
    }
  });
