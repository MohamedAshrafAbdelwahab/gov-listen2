export type LocationResult =
  | { status: "ok"; country: string; city?: string; lat?: number; lng?: number }
  | { status: "unavailable" };

const LANG_TO_COUNTRY: Record<string, string> = {
  "ar-eg": "EG", "ar": "EG",
  "en-ke": "KE", "sw": "KE",
  "en-ng": "NG", "yo": "NG", "ig": "NG", "ha": "NG",
  "en-za": "ZA", "af": "ZA", "zu": "ZA",
  "en-gh": "GH",
};

function fallbackCountry(): string {
  const l = (typeof navigator !== "undefined" ? navigator.language?.toLowerCase() : "") ?? "";
  return LANG_TO_COUNTRY[l] ?? LANG_TO_COUNTRY[l.split("-")[0]] ?? "";
}

export async function detectLocation(timeoutMs = 30000): Promise<LocationResult> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return { status: "unavailable" };
  }

  const pos = await new Promise<GeolocationPosition | null>((resolve) => {
    const t = setTimeout(() => { console.log("geo: timeout fired"); resolve(null); }, timeoutMs);
    navigator.geolocation.getCurrentPosition(
      (p) => { console.log("geo: position obtained"); clearTimeout(t); resolve(p); },
      (err) => { console.log("geo: error", err.code, err.message); clearTimeout(t); resolve(null); },
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 300_000 },
    );
  });
  if (!pos) { console.log("geo: no position — returning unavailable"); return { status: "unavailable" }; }

  const { latitude: lat, longitude: lng } = pos.coords;
  console.log("geo: got position", lat, lng);
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) },
    );
    if (r.ok) {
      const data = (await r.json()) as { address?: { country_code?: string; city?: string; town?: string; village?: string; state?: string } };
      const cc = (data.address?.country_code ?? "").toUpperCase();
      const city = data.address?.city ?? data.address?.town ?? data.address?.village ?? data.address?.state;
      console.log("geo: reverse geocode result", cc, city);
      return { status: "ok", country: cc || fallbackCountry(), city, lat, lng };
    }
    console.log("geo: nominatim not ok", r.status);
  } catch (e) {
    console.log("geo: nominatim error", e);
  }
  const fallback = fallbackCountry();
  console.log("geo: using fallback country", fallback);
  return { status: "ok", country: fallback, lat, lng };
}
