import { useEffect, useState } from "react";

// Reads the unique visitor count from /api/visits.
//
// Design notes:
//  - The count is fetched ONLY in the browser, never during prerendering. A
//    build-time request would inflate the counter once per prerendered route,
//    and baking a number into the static HTML would leave it permanently stale.
//  - The badge starts absent and only appears once a real count has loaded, so
//    the server markup and the first client render agree. Rendering a
//    placeholder server-side would guarantee a hydration mismatch.
//  - Any failure (no storage configured, offline, 503, network error) resolves
//    to null, which the UI treats as "show nothing". It never displays a zero or
//    an error value.
//  - The count is requested once per browser session, so moving between pages
//    does not re-request it.

const SESSION_KEY = "fjm_visits_recorded";

let cachedCount = null;
let pendingRequest = null;

const normalize = (payload) =>
  payload && typeof payload.count === "number" && Number.isFinite(payload.count)
    ? payload.count
    : null;

const request = async (method) => {
  const response = await fetch("/api/visits", {
    method,
    headers: method === "POST" ? { "Content-Type": "application/json" } : undefined,
    body: method === "POST" ? "{}" : undefined
  });

  if (!response.ok) return null;
  return normalize(await response.json());
};

const fetchCount = async () => {
  if (cachedCount !== null) return cachedCount;

  let alreadyRecorded = false;
  try {
    alreadyRecorded = window.sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    // Private mode or storage disabled: treat as not yet recorded.
  }

  // Record once per session; afterwards only read.
  const count = await request(alreadyRecorded ? "GET" : "POST");

  if (count !== null && !alreadyRecorded) {
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // Non-fatal.
    }
  }

  return count;
};

export default function useVisitorCount() {
  const [count, setCount] = useState(cachedCount);

  useEffect(() => {
    let active = true;

    if (cachedCount !== null) {
      setCount(cachedCount);
      return () => {
        active = false;
      };
    }

    // Share one in-flight request across components.
    if (!pendingRequest) {
      pendingRequest = fetchCount()
        .then((value) => {
          if (value !== null) cachedCount = value;
          return value;
        })
        .catch(() => null)
        .finally(() => {
          pendingRequest = null;
        });
    }

    pendingRequest.then((value) => {
      if (active && value !== null) setCount(value);
    });

    return () => {
      active = false;
    };
  }, []);

  return count;
}
