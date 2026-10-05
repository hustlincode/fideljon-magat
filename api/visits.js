import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// ---------------------------------------------------------------------------
// Unique visitor counter.
//
// Storage is Redis (Upstash, provisioned through the Vercel Marketplace). A
// durable store is genuinely required: serverless instances are ephemeral and
// not shared, so an in-memory counter would reset on every deploy and disagree
// between concurrent instances.
//
// Written against the Redis REST API with fetch rather than an SDK, matching how
// api/chat.js talks to Gemini. No extra dependency.
//
// Privacy: no cookies, and no raw IP addresses are stored. A visitor is
// identified by a salted SHA-256 hash that cannot be reversed without the
// secret, and only the hash is written to Redis.
// ---------------------------------------------------------------------------

const COUNTER_KEY = "visits:total";

// Hashed visitor IDs are grouped into buckets so the set stays bounded and can
// expire. A single never-expiring set would grow forever, and a per-day key
// would not expire under SADD (TTL only applies when the key is created), which
// would silently turn this into a per-day count. Bucketing keeps one rolling
// window of uniques instead.
const BUCKET_DAYS = 90;
const BUCKET_SECONDS = BUCKET_DAYS * 24 * 60 * 60;
const BUCKET_KEY_TTL = BUCKET_SECONDS * 2;

const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX_PER_WINDOW = 60;

// Cached copy of the counter, to keep reads cheap under bursty traffic.
const TOTAL_CACHE_MS = 60 * 1000;

// Local development convenience. Vercel injects the real values from the
// project environment, so this is a no-op there.
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

const getRedisConfig = () => {
  // Upstash injects KV_REST_API_*; the direct Upstash integration injects
  // UPSTASH_REDIS_REST_*. Accept either so setup cannot silently half-work.
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  return url && token ? { url: url.replace(/\/+$/, ""), token } : null;
};

// Executes a single Redis command over REST. Returns the `result` field.
const redisCommand = async (config, command) => {
  const response = await fetch(`${config.url}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Redis command failed (${response.status}) ${detail.slice(0, 200)}`);
  }

  const payload = await response.json();
  if (payload && payload.error) throw new Error(`Redis error: ${payload.error}`);
  return payload?.result;
};

const bucketId = () => Math.floor(Date.now() / 1000 / BUCKET_SECONDS);

const visitorId = (ip, userAgent) => {
  const secret = process.env.VISITS_HASH_SECRET || "fjm-visits";
  return createHash("sha256")
    .update(`${ip}|${userAgent}|${secret}`)
    .digest("hex")
    .slice(0, 32);
};

const clientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
};

// Uptime monitors, link previewers and crawlers should not inflate the count.
// The counter is only ever recorded from the browser, so the prerendered HTML
// that crawlers receive never triggers it.
const BOT_PATTERN =
  /bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|embedly|quora|pinterest|vkshare|whatsapp|telegram|headlesschrome|lighthouse|pingdom|uptimerobot|monitoring|preview/i;

const isBot = (userAgent) => !userAgent || BOT_PATTERN.test(userAgent);

// Per-instance only, so this is a speed bump rather than a hard limit. The real
// protection is that a repeat visitor cannot increment anything.
const buckets = new Map();

const takeToken = (ip) => {
  const now = Date.now();
  const hits = (buckets.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);

  if (hits.length >= RATE_MAX_PER_WINDOW) {
    buckets.set(ip, hits);
    return false;
  }

  hits.push(now);
  buckets.set(ip, hits);

  if (buckets.size > 5000) {
    for (const [key, value] of buckets) {
      if (!value.some((t) => now - t < RATE_WINDOW_MS)) buckets.delete(key);
    }
  }

  return true;
};

let cachedTotal = { value: null, at: 0 };

const readTotal = async (config, { fresh = false } = {}) => {
  if (!fresh && cachedTotal.value !== null && Date.now() - cachedTotal.at < TOTAL_CACHE_MS) {
    return cachedTotal.value;
  }

  const raw = await redisCommand(config, ["GET", COUNTER_KEY]);
  const value = Number(raw) || 0;

  cachedTotal = { value, at: Date.now() };
  return value;
};

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(204).end();
  }

  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const config = getRedisConfig();

  // Not configured locally, or the integration was removed. Reported as 503 so
  // the client hides the badge rather than showing a wrong number.
  if (!config) {
    return res.status(503).json({ count: null, reason: "storage-unavailable" });
  }

  // Readings never write, so no rate limit or bot check is needed.
  if (req.method === "GET") {
    try {
      const count = await readTotal(config);
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ count });
    } catch (err) {
      console.error("[visits] read failed:", err.message);
      return res.status(503).json({ count: null, reason: "storage-error" });
    }
  }

  const ip = clientIp(req);
  const userAgent = req.headers["user-agent"] || "";

  if (!takeToken(ip)) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({ error: "Too many requests." });
  }

  if (isBot(userAgent)) {
    // Answer with the current total but record nothing.
    try {
      const count = await readTotal(config);
      return res.status(200).json({ count, recorded: false });
    } catch (err) {
      console.error("[visits] read failed:", err.message);
      return res.status(503).json({ count: null, reason: "storage-error" });
    }
  }

  const id = visitorId(ip, userAgent);
  const setKey = `visits:seen:${bucketId()}`;

  try {
    // SADD returns 1 only when the member is new, which is what makes this a
    // unique count rather than a pageview count.
    const added = await redisCommand(config, ["SADD", setKey, id]);

    let count;

    if (added === 1) {
      // Only extend the TTL when the key already existed. Passing EX on SADD
      // would otherwise reset the window and keep stale visitors alive.
      await redisCommand(config, ["EXPIRE", setKey, String(BUCKET_KEY_TTL)]);
      count = await redisCommand(config, ["INCR", COUNTER_KEY]);
      count = Number(count) || 0;
      cachedTotal = { value: count, at: Date.now() };
    } else {
      // Returning visitor: read only, never increment.
      count = await readTotal(config, { fresh: true });
    }

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ count, recorded: added === 1 });
  } catch (err) {
    console.error("[visits] write failed:", err.message);
    return res.status(503).json({ count: null, reason: "storage-error" });
  }
}
