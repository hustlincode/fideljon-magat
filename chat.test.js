import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const message = (role, text) => ({ role, parts: [{ text }] });

const makeRes = () => ({
  statusCode: 200,
  setHeader: vi.fn(),
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
  write: vi.fn(),
  end: vi.fn(),
});

let handler;

beforeEach(async () => {
  vi.resetModules();
  vi.stubEnv("DEEPSEEK_API_KEY", "mock-key");
  vi.stubGlobal("fetch", vi.fn(async () => new Response(
    'data: {"choices":[{"delta":{"content":"Mock reply"}}]}\n\ndata: [DONE]\n\n',
    { status: 200 },
  )));
  handler = (await import("./api/chat.js")).default;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const request = (body) => ({ method: "POST", headers: {}, body });

describe("chat conversation limits", () => {
  test.each([501, 2000])("accepts a follow-up after a %i-character assistant reply", async (length) => {
    const reply = "a".repeat(length);
    const res = makeRes();
    await handler(request({ contents: [
      message("user", "Tell me about Fideljon"),
      message("model", reply),
      message("user", "What are his skills?"),
    ] }), res);

    expect(res.statusCode).toBe(200);
    const upstream = JSON.parse(fetch.mock.calls[0][1].body);
    expect(upstream.messages.slice(1)).toEqual([
      { role: "user", content: "Tell me about Fideljon" },
      { role: "assistant", content: reply },
      { role: "user", content: "What are his skills?" },
    ]);
    expect(res.write).toHaveBeenCalledWith('data: {"t":"Mock reply"}\n\n');
    expect(res.end).toHaveBeenCalled();
  });

  test.each([500, 501])("keeps the user input limit at 500 characters (%i)", async (length) => {
    const res = makeRes();
    await handler(request({ contents: [message("user", "a".repeat(length))] }), res);

    expect(res.statusCode).toBe(length === 500 ? 200 : 413);
    if (length > 500) {
      expect(res.body).toEqual({ error: "Message is too long." });
      expect(fetch).not.toHaveBeenCalled();
    }
  });

  test.each([false, true])("rejects oversized UTF-8 history before calling DeepSeek (serialized: %s)", async (serialized) => {
    const body = { contents: [
      message("user", "Hello"),
      message("model", "\u20ac".repeat(23000)),
      message("user", "Tell me more"),
    ] };
    const res = makeRes();
    await handler(request(serialized ? JSON.stringify(body) : body), res);

    expect(res.statusCode).toBe(413);
    expect(res.body).toEqual({ error: "Request is too large." });
    expect(fetch).not.toHaveBeenCalled();
  });
});
