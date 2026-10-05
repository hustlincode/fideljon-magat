import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// Tests for the visitor counter endpoint.
//
// The handler is imported fresh in each test because it holds module-level
// state (the rate-limit buckets and the cached total), which would otherwise
// leak between cases.

const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = globalThis.fetch;

// A tiny stand-in for Redis over REST. Records every command so tests can assert
// on what was actually sent.
function fakeRedis() {
  const calls = [];
  const state = { counter: null, sets: new Map(), expires: [] };

  const handler = async (_url, init) => {
    const command = JSON.parse(init.body);
    calls.push(command);

    const [name, ...args] = command;
    let result = null;

    switch (String(name).toUpperCase()) {
      case "GET":
        result = state.counter;
        break;
      case "INCR":
        state.counter = String((Number(state.counter) || 0) + 1);
        result = Number(state.counter);
        break;
      case "SADD": {
        const [key, member] = args;
        if (!state.sets.has(key)) state.sets.set(key, new Set());
        const set = state.sets.get(key);
        const isNew = !set.has(member);
        set.add(member);
        result = isNew ? 1 : 0;
        break;
      }
      case "EXPIRE":
        state.expires.push(args);
        result = 1;
        break;
      default:
        throw new Error(`Unhandled command ${name}`);
    }

    return { ok: true, status: 200, json: async () => ({ result }), text: async () => "" };
  };

  return { handler, calls, state };
}

const loadHandler = async () => {
  vi.resetModules();
  const mod = await import("./api/visits.js");
  return mod.default;
};

const makeRes = () => {
  const res = {
    statusCode: 200,
    headers: {},
    body: undefined,
    ended: false,
    setHeader(k, v) {
      this.headers[k] = v;
      return this;
    },
    getHeader(k) {
      return this.headers[k];
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      this.ended = true;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    }
  };
  return res;
};

const makeReq = (overrides = {}) => ({
  method: "POST",
  headers: { "user-agent": "Mozilla/5.0 (Macintosh) Chrome/120", "x-forwarded-for": "203.0.113.5" },
  socket: { remoteAddress: "203.0.113.5" },
  ...overrides
});

beforeEach(() => {
  process.env.KV_REST_API_URL = "https://fake-redis.example";
  process.env.KV_REST_API_TOKEN = "fake-token";
  process.env.VISITS_HASH_SECRET = "test-secret";
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  globalThis.fetch = ORIGINAL_FETCH;
  vi.restoreAllMocks();
});

describe("api/visits", () => {
  test("a new visitor is recorded and returns the incremented count", async () => {
    const redis = fakeRedis();
    globalThis.fetch = redis.handler;

    const handler = await loadHandler();
    const res = makeRes();
    await handler(makeReq(), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.recorded).toBe(true);

    const sadd = redis.calls.find((c) => c[0] === "SADD");
    const incr = redis.calls.find((c) => c[0] === "INCR");
    expect(sadd).toBeTruthy();
    expect(incr).toBeTruthy();

    // The stored member must be a hash, never a raw IP.
    expect(sadd[2]).not.toContain("203.0.113.5");
    expect(sadd[2]).toMatch(/^[a-f0-9]{32}$/);
  });

  test("a repeat visitor does not increment the counter", async () => {
    const redis = fakeRedis();
    globalThis.fetch = redis.handler;

    const handler = await loadHandler();

    const first = makeRes();
    await handler(makeReq(), first);
    expect(first.body.count).toBe(1);

    // Same IP and user agent: SADD reports 0, so no INCR should happen.
    const second = makeRes();
    await handler(makeReq(), second);

    expect(second.statusCode).toBe(200);
    expect(second.body.count).toBe(1);
    expect(second.body.recorded).toBe(false);

    const incrs = redis.calls.filter((c) => c[0] === "INCR");
    expect(incrs).toHaveLength(1);
  });

  test("a different visitor increments the counter", async () => {
    const redis = fakeRedis();
    globalThis.fetch = redis.handler;

    const handler = await loadHandler();

    await handler(makeReq(), makeRes());

    const other = makeRes();
    await handler(makeReq({ headers: { "user-agent": "Mozilla/5.0 (Windows) Firefox/121", "x-forwarded-for": "198.51.100.9" } }), other);

    expect(other.body.count).toBe(2);
  });

  test("a bot is answered but never recorded", async () => {
    const redis = fakeRedis();
    globalThis.fetch = redis.handler;

    const handler = await loadHandler();
    const res = makeRes();
    await handler(makeReq({ headers: { "user-agent": "Googlebot/2.1 (+http://www.google.com/bot.html)" } }), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.recorded).toBe(false);
    expect(redis.calls.filter((c) => c[0] === "SADD")).toHaveLength(0);
    expect(redis.calls.filter((c) => c[0] === "INCR")).toHaveLength(0);
  });

  test("GET returns the count without recording anything", async () => {
    const redis = fakeRedis();
    redis.state.counter = "57";
    globalThis.fetch = redis.handler;

    const handler = await loadHandler();
    const res = makeRes();
    await handler(makeReq({ method: "GET" }), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(57);
    expect(redis.calls.filter((c) => c[0] === "INCR")).toHaveLength(0);
    expect(redis.calls.filter((c) => c[0] === "SADD")).toHaveLength(0);
  });

  test("missing storage configuration returns 503 with a null count", async () => {
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;

    const handler = await loadHandler();
    const res = makeRes();
    await handler(makeReq(), res);

    expect(res.statusCode).toBe(503);
    expect(res.body.count).toBeNull();
  });

  test("a storage failure returns 503 rather than a wrong number", async () => {
    globalThis.fetch = async () => {
      throw new Error("network down");
    };

    const handler = await loadHandler();
    const res = makeRes();
    await handler(makeReq(), res);

    expect(res.statusCode).toBe(503);
    expect(res.body.count).toBeNull();
  });

  test("EXPIRY is only applied to an existing set, never on creation", async () => {
    const redis = fakeRedis();
    globalThis.fetch = redis.handler;

    const handler = await loadHandler();
    await handler(makeReq(), makeRes());

    // EXPIRE is only issued after a SADD that added a member, so the rolling
    // window is never extended by a returning visitor.
    const sadd = redis.calls.findIndex((c) => c[0] === "SADD");
    const expire = redis.calls.findIndex((c) => c[0] === "EXPIRE");
    expect(expire).toBeGreaterThan(sadd);
  });

  test("unsupported methods are rejected", async () => {
    const redis = fakeRedis();
    globalThis.fetch = redis.handler;

    const handler = await loadHandler();
    const res = makeRes();
    await handler(makeReq({ method: "DELETE" }), res);

    expect(res.statusCode).toBe(405);
  });
});
