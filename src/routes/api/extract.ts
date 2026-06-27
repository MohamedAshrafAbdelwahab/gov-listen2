import { createFileRoute } from "@tanstack/react-router";
import { createGeminiProvider } from "@/lib/ai-gateway.server";
import { generateText } from "ai";
import type { Lang } from "@/lib/i18n";

type ExtractRequest = {
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

const SYSTEM_EN = `You are Gov-Listen, an AI assistant that helps African citizens file civic reports (broken roads, water leaks, power cuts, waste, safety, etc.) to local government authorities.

You must respond in the same language as the user's request and the conversation context.

Your job each turn:
1. Read the conversation so far and extract any new fields.
2. Decide if you still need information. Required fields: title (short), description (clear), category, priority, address (text near where it happened). A photo is strongly encouraged but optional.
3. Allowed category values: roads, water, electricity, waste, safety, other.
4. Allowed priority values: low, medium, urgent.
5. If a key field is still missing, ask ONE short friendly follow-up question. If a photo would clearly help and none is attached, you may ask for one.
6. When you have enough, set done=true and return a polished professional report description (2-4 sentences) suitable for the authority.

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
6. عندما تكتمل البيانات اضبط done=true وأعد وصفاً احترافياً منمّقاً (2-4 جمل) صالحاً لإرساله للجهة.

أعد فقط كائن JSON واحد بدون أي شرح وبدون Markdown بالشكل:
{
  "updates": { "title"?: string, "description"?: string, "category"?: string, "priority"?: string, "address"?: string, "askPhoto"?: boolean },
  "nextQuestion": string | null,
  "done": boolean,
  "finalDescription"?: string
}

اكتب الأسئلة والوصف النهائي باللغة العربية.`;

export const Route = createFileRoute("/api/extract")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.GEMINI_API_KEY;
        if (!key) return new Response("Missing GEMINI_API_KEY", { status: 500 });

        const body = (await request.json()) as ExtractRequest;
        const gateway = createGeminiProvider(key);
        const model = gateway("gemini-3.5-flash");

        const context = `Context:
- Reporter: ${body.reporter.name}${body.reporter.phone ? `, phone ${body.reporter.phone}` : ""}
- Country: ${body.country}${body.city ? `, city ${body.city}` : ""}
- Fields so far: ${JSON.stringify(body.fields)}
- Photo attached: ${body.fields.hasPhoto ? "yes" : "no"}

Conversation:
${body.conversation.map((m) => `${m.role}: ${m.content}`).join("\n")}`;

        const systemPrompt = body.lang === "ar" ? SYSTEM_AR : SYSTEM_EN;
        const userPrompt = body.lang === "ar"
          ? `${context}\n
اتبع اللغة العربية في جميع الردود. أجب فقط بكائن JSON واحد بدون أي شرح.`
          : `${context}\n
Follow the same language as the user's conversation. Answer only with a single JSON object without any explanation.`;

        try {
          const { text } = await generateText({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          });

          const cleaned = text
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
            }
          }
          return Response.json(parsed);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "AI error";
          return new Response(msg, { status: 500 });
        }
      },
    },
  },
});
