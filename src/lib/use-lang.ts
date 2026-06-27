import { useEffect, useState } from "react";
import { translations, type Lang } from "@/lib/i18n";
import { getProfile, saveProfile } from "@/lib/storage";

export function useAppLang(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    const p = getProfile();
    if (p?.lang) {
      setLang(p.lang);
      document.documentElement.lang = p.lang;
      document.documentElement.dir = p.lang === "ar" ? "rtl" : "ltr";
    } else {
      const initial: Lang = "en";
      setLang(initial);
      document.documentElement.lang = initial;
      document.documentElement.dir = "ltr";
    }
  }, []);
  const setAndPersist = (l: Lang) => {
    setLang(l);
    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    const p = getProfile();
    if (p) saveProfile({ ...p, lang: l });
  };
  return [lang, setAndPersist];
}

export function useT(lang: Lang) {
  return translations[lang];
}
