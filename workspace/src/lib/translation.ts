const GOOGLE_TRANSLATE_ENDPOINT = "https://translate.googleapis.com/translate_a/single";
const TRANSLATION_TIMEOUT_MS = 10_000;
const TRANSLATION_ATTEMPTS = 2;

export class TranslationProviderError extends Error {
  constructor(message = "El servicio de traducción no está disponible. No se guardaron cambios.") {
    super(message);
    this.name = "TranslationProviderError";
  }
}

type TranslationAdapter = (text: string) => Promise<string>;

function normalizeSource(text: string) {
  return text.trim();
}

function parseGoogleTranslatePayload(payload: unknown) {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) return "";
  return payload[0]
    .map((part) => (Array.isArray(part) && typeof part[0] === "string" ? part[0] : ""))
    .join("")
    .trim();
}

const googleTranslateAdapter: TranslationAdapter = async (text) => {
  const url = new URL(GOOGLE_TRANSLATE_ENDPOINT);
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "es");
  url.searchParams.set("tl", "en");
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TRANSLATION_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) {
      throw new TranslationProviderError();
    }

    const translated = parseGoogleTranslatePayload(await response.json());
    if (!translated) {
      throw new TranslationProviderError("La traducción recibida es inválida. No se guardaron cambios.");
    }
    return translated;
  } catch (error) {
    if (error instanceof TranslationProviderError) throw error;
    throw new TranslationProviderError();
  } finally {
    clearTimeout(timeout);
  }
};

export async function translateSpanishToEnglish(sourceText: string) {
  const text = normalizeSource(sourceText);
  if (!text) {
    throw new TranslationProviderError("El texto en español no puede estar vacío. No se guardaron cambios.");
  }

  let lastError: unknown;
  for (let attempt = 1; attempt <= TRANSLATION_ATTEMPTS; attempt += 1) {
    try {
      return await googleTranslateAdapter(text);
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError instanceof TranslationProviderError) throw lastError;
  throw new TranslationProviderError();
}
