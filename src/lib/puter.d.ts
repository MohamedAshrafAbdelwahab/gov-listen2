declare global {
  interface PuterAI {
    chat(
      messages: string | Array<{ role: string; content: string }>,
      options?: { model?: string; stream?: boolean },
    ): Promise<string>;
  }

  interface Puter {
    ai: PuterAI;
  }

  interface Window {
    puter?: Puter;
  }
}

export {};
