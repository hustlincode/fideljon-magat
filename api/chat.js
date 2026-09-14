import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import chatbotData from "./config/chatbotConfig.json" with { type: "json" };

// ---------------------------------------------------------------------------
// Server-side Gemini proxy.
//
// The API key used to be inlined into the client bundle by Vite, which meant
// anyone could read it out of the network tab and spend the owner's quota. The
// key now lives only here, in the GEMINI_API_KEY environment variable.
//
// Because this endpoint is public, it is deliberately NOT a generic relay:
//   - the model is fixed here, so callers cannot reach other/expensive models
//   - conversation size, turn count and per-message length are capped
//   - the system instruction is built here, so callers cannot inject one
//   - per-IP rate limiting and a concurrency cap limit brute-force abuse
// ---------------------------------------------------------------------------

const MODEL = "gemini-3.6-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const MAX_MESSAGES = 16;
const MAX_CHARS_PER_MESSAGE = 500;
const MAX_BODY_BYTES = 64 * 1024;

const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX_PER_WINDOW = 30;
const RATE_MAX_IN_FLIGHT = 3;

// Local development convenience: the key is only ever read on the server.
// Vercel injects it from the project environment, so this is a no-op there.
const loadLocalEnv = () => {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const raw = readFileSync(join(here, "..", ".env.local"), "utf8");

    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (!match) continue;

      const key = match[1];
      if (process.env[key]) continue;

      process.env[key] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    // No .env.local (e.g. on Vercel) - nothing to do.
  }
};

loadLocalEnv();

// Per-instance only. Serverless instances are recycled and not shared, so this
// is a speed bump rather than a hard quota. The real ceiling is the quota on
// the Gemini key itself; keep that low and rotate it if it leaks.
const buckets = new Map();
const inFlightByIp = new Map();

const clientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  if (typeof forwarded === "string") return forwarded;
  return req.socket?.remoteAddress || "unknown";
};

const takeToken = (ip) => {
  const now = Date.now();
  const hits = (buckets.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);

  if (hits.length >= RATE_MAX_PER_WINDOW) {
    buckets.set(ip, hits);
    return { ok: false, retryAfter: Math.ceil((RATE_WINDOW_MS - (now - hits[0])) / 1000) };
  }

  hits.push(now);
  buckets.set(ip, hits);

  // Opportunistic cleanup so the map cannot grow without bound.
  if (buckets.size > 5000) {
    for (const [key, value] of buckets) {
      if (!value.some((t) => now - t < RATE_WINDOW_MS)) buckets.delete(key);
    }
  }

  return { ok: true };
};

const buildSystemInstruction = (visitor = {}) => {
  const known = [];
  const covered = Array.isArray(visitor.covered) ? visitor.covered : [];

  if (visitor.type) {
    known.push(
      `Visitor type: ${visitor.type} (do not ask their type again — adapt to it instead)`
    );
  }
  if (covered.includes("design")) {
    known.push("Already explained the system design & architecture approach — don't repeat unless asked");
  }
  if (covered.includes("ai")) {
    known.push("Already explained AI usage in daily work — don't repeat unless asked");
  }
  if (covered.includes("about")) {
    known.push("Already introduced Fideljon's background — don't repeat unless asked");
  }

  return `
${chatbotData.system_instruction_template}

--- SYSTEM DESIGN & ARCHITECTURE APPROACH (explain when asked, in Aether's own voice about Fideljon) ---
${chatbotData.system_design_approach.map((point) => `- ${point}`).join("\n")}

--- HOW Fideljon USES AI IN DAILY ENGINEERING WORK ---
- ${chatbotData.ai_usage_philosophy.summary}
- ${chatbotData.ai_usage_philosophy.development_maintenance}
- ${chatbotData.ai_usage_philosophy.integrations}
- ${chatbotData.ai_usage_philosophy.stance}

--- QUALIFYING QUESTIONS BY VISITOR TYPE (use naturally, one at a time) ---
Recruiter: ${chatbotData.qualifying_questions.recruiter.join(" | ")}
Client: ${chatbotData.qualifying_questions.client.join(" | ")}
Developer: ${chatbotData.qualifying_questions.developer.join(" | ")}
Browsing: ${chatbotData.qualifying_questions.browsing.join(" | ")}

--- KNOWN CONTEXT ABOUT THIS VISITOR ---
${known.length > 0 ? known.join("\n") : "Nothing yet — learn naturally through conversation."}

--- FACTUAL DATA (your single source of truth; never contradict or invent beyond this) ---
Summary: ${chatbotData.professional_summary}
Info: ${JSON.stringify(chatbotData.personal_info)}
Skillset: ${JSON.stringify(chatbotData.skillset)}
Career: ${JSON.stringify(chatbotData.career_journey)}
Projects: ${JSON.stringify(chatbotData.projects)}
Contributions: ${JSON.stringify(chatbotData.contributions)}
Traits: ${JSON.stringify(chatbotData.personal_traits)}
`.trim();
};

// Returns either { contents } or { error, status }.
const normalizeContents = (input) => {
  if (!Array.isArray(input) || input.length === 0) {
    return { error: "No conversation supplied.", status: 400 };
  }

  const cleaned = [];

  for (const entry of input) {
    if (!entry || (entry.role !== "user" && entry.role !== "model")) {
      return { error: "Invalid message role.", status: 400 };
    }

    const parts = Array.isArray(entry.parts) ? entry.parts : [];
    const text = parts
      .map((part) => (part && typeof part.text === "string" ? part.text : ""))
      .join("");

    if (!text.trim()) continue;
    if (text.length > MAX_CHARS_PER_MESSAGE) {
      return { error: "Message is too long.", status: 413 };
    }

    cleaned.push({ role: entry.role, parts: [{ text }] });
  }

  if (cleaned.length === 0) {
    return { error: "No conversation supplied.", status: 400 };
  }

  const trimmed = cleaned.slice(-MAX_MESSAGES);

  if (trimmed[trimmed.length - 1].role !== "user") {
    return { error: "Conversation must end with a user message.", status: 400 };
  }

  return { contents: trimmed };
};

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not configured on the server.");
    return res.status(500).json({ error: "Chat is not configured." });
  }

  // Vercel parses JSON bodies; the Vite middleware path fills this in itself.
  let payload = req.body;

  if (typeof payload === "string") {
    if (payload.length > MAX_BODY_BYTES) {
      return res.status(413).json({ error: "Request is too large." });
    }
    try {
      payload = JSON.parse(payload);
    } catch {
      return res.status(400).json({ error: "Malformed request body." });
    }
  }

  if (!payload || typeof payload !== "object") {
    return res.status(400).json({ error: "Malformed request body." });
  }

  const { contents, error, status } = normalizeContents(payload.contents);
  if (error) return res.status(status).json({ error });

  const ip = clientIp(req);

  const currentInFlight = inFlightByIp.get(ip) || 0;
  if (currentInFlight >= RATE_MAX_IN_FLIGHT) {
    return res.status(429).json({ error: "Too many concurrent requests." });
  }

  const token = takeToken(ip);
  res.setHeader("X-RateLimit-Limit", String(RATE_MAX_PER_WINDOW));

  if (!token.ok) {
    res.setHeader("Retry-After", String(token.retryAfter));
    return res.status(429).json({ error: "Rate limit reached.", retryAfter: token.retryAfter });
  }

  inFlightByIp.set(ip, currentInFlight + 1);

  const releaseSlot = () => {
    const remaining = (inFlightByIp.get(ip) || 1) - 1;
    if (remaining <= 0) inFlightByIp.delete(ip);
    else inFlightByIp.set(ip, remaining);
  };

  const upstreamBody = {
    contents,
    systemInstruction: { parts: [{ text: buildSystemInstruction(payload.visitor) }] },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
    ],
    generationConfig: { topP: 1 }
  };

  const upstreamUrl = `${API_BASE}/${MODEL}:streamGenerateContent?alt=sse`;

  let upstream;

  try {
    upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(upstreamBody)
    });
  } catch (err) {
    releaseSlot();
    console.error("Upstream request failed:", err);
    return res.status(502).json({ error: "Could not reach the model." });
  }

  if (!upstream.ok || !upstream.body) {
    releaseSlot();

    let detail = "";
    try {
      detail = await upstream.text();
    } catch {
      // Ignore - the status code is enough.
    }

    console.error("Gemini error:", upstream.status, detail.slice(0, 500));

    // Preserve statuses the client can act on: 429 (quota) and 503 (model
    // overloaded) are transient and worth retrying, so do not flatten them into
    // a generic failure. Never leak upstream detail, which can echo key metadata.
    const passthrough = [400, 429, 503].includes(upstream.status) ? upstream.status : 502;

    return res.status(passthrough).json({
      error: "The assistant is unavailable right now.",
      rateLimited: upstream.status === 429
    });
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  // Stream plain "data: <text>" frames. Keeping this protocol minimal means the
  // client does not need a full SDK just to read a reply.
  const flush = (text) => {
    if (!text) return;
    res.write(`data: ${JSON.stringify({ t: text })}\n\n`);
  };

  const decoder = new TextDecoder();
  let buffer = "";

  const drainFrames = (frames) => {
    for (const frame of frames) {
      // A single SSE event may be split across several "data:" lines, so the
      // payload has to be reassembled before parsing. Reading only the first
      // line truncates the JSON and silently yields nothing.
      const payload = frame
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).replace(/^ /, ""))
        .join("");

      if (!payload || payload === "[DONE]") continue;

      try {
        const parsed = JSON.parse(payload);
        const parts = parsed?.candidates?.[0]?.content?.parts;
        if (!Array.isArray(parts)) continue;

        for (const part of parts) {
          // Skip "thought" parts so reasoning text never reaches the visitor.
          if (typeof part?.text === "string" && !part.thought) flush(part.text);
        }
      } catch {
        // Partial frame; the next read completes it.
      }
    }
  };

  try {
    for await (const chunk of upstream.body) {
      buffer += decoder.decode(chunk, { stream: true });

      // Gemini terminates SSE frames with CRLF, so splitting on "\n\n" alone
      // finds no boundaries and every event is silently dropped. Normalise the
      // line endings before looking for the blank-line separator.
      buffer = buffer.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";
      drainFrames(frames);
    }

    if (buffer) drainFrames([buffer]);

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("Streaming failed:", err);
    try {
      res.write(`data: ${JSON.stringify({ error: "Stream interrupted." })}\n\n`);
      res.end();
    } catch {
      // Response already closed by the client.
    }
  } finally {
    releaseSlot();
  }
}
