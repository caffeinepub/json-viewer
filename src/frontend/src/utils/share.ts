export type ShareState =
  | { mode: "single"; json: string }
  | { mode: "compare"; a: string; b: string };

/** Encode a string to URL-safe base64 */
function encodeB64(str: string): string {
  return btoa(encodeURIComponent(str));
}

/** Decode a URL-safe base64 string, returns null on failure */
function decodeB64(encoded: string): string | null {
  try {
    return decodeURIComponent(atob(encoded));
  } catch {
    return null;
  }
}

/** Encode share state into a URL string */
export function encodeShareState(state: ShareState): string {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";

  if (state.mode === "single") {
    url.searchParams.set("mode", "single");
    url.searchParams.set("json", encodeB64(state.json));
  } else {
    url.searchParams.set("mode", "compare");
    url.searchParams.set("a", encodeB64(state.a));
    url.searchParams.set("b", encodeB64(state.b));
  }

  return url.toString();
}

/** Decode share state from current URL params, returns null if no params present */
export function decodeShareState(): ShareState | null {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");

  if (mode === "single") {
    const jsonParam = params.get("json");
    if (!jsonParam) return null;
    const json = decodeB64(jsonParam);
    if (json === null) return null;
    return { mode: "single", json };
  }

  if (mode === "compare") {
    const aParam = params.get("a");
    const bParam = params.get("b");
    if (!aParam || !bParam) return null;
    const a = decodeB64(aParam);
    const b = decodeB64(bParam);
    if (a === null || b === null) return null;
    return { mode: "compare", a, b };
  }

  return null;
}
