export interface OpenUrlAction {
  action: "open_url";
  url: string;
}

export interface ParseActionResult {
  isAction: boolean;
  action?: OpenUrlAction;
  cleanText: string;
}

/**
 * True only while the streamed text could still become {"action": ...}.
 * Normal answers (including code blocks) are not hidden.
 */
export function isStreamingActionCandidate(text: string): boolean {
  if (!text) return false;
  const stripped = text
    .trimStart()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s+/g, "");
  if (!stripped.startsWith("{")) return false;
  const prefix = '{"action"';
  return stripped.length < prefix.length
    ? prefix.startsWith(stripped)
    : stripped.startsWith(prefix);
}

export function parseAction(text: string): ParseActionResult {
  if (!text || typeof text !== "string") {
    return { isAction: false, cleanText: text || "" };
  }

  // Match the action object itself (works with fences, prose, extra braces elsewhere)
  const match = text.match(/\{[^{}]*"action"\s*:\s*"open_url"[^{}]*\}/);
  if (!match) return { isAction: false, cleanText: text };

  try {
    const parsed = JSON.parse(match[0]);
    if (parsed?.action !== "open_url" || typeof parsed.url !== "string") {
      return { isAction: false, cleanText: text };
    }

    let rawUrl = parsed.url.trim();

    // Reject non-http(s) schemes (javascript:, data:, file:, ...)
    const scheme = rawUrl.match(/^([a-z][a-z0-9+.-]*):(?!\d)/i);
    if (scheme && !/^https?$/i.test(scheme[1])) {
      return { isAction: false, cleanText: text };
    }
    if (!scheme) rawUrl = `https://${rawUrl}`;

    const validated = new URL(rawUrl);
    if (validated.protocol !== "http:" && validated.protocol !== "https:") {
      return { isAction: false, cleanText: text };
    }

    return {
      isAction: true,
      action: { action: "open_url", url: validated.toString() },
      cleanText: `Opening ${validated.hostname}…`,
    };
  } catch {
    return { isAction: false, cleanText: text };
  }
}

/**
 * Returns true if the tab opened, false if blocked (show a clickable link then).
 */
export function executeOpenUrl(url: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    // Don't pass "noopener" in features: it makes window.open always return null,
    // so success would be reported as failure.
    const win = window.open(url, "_blank");
    if (!win) return false;
    win.opener = null; // same protection as noopener
    return true;
  } catch (e) {
    console.warn("Failed to open URL:", e);
    return false;
  }
}