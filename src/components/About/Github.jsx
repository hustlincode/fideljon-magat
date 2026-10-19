import React, { useEffect, useMemo, useState } from "react";

const USERNAME = "hustlincode";
const PROFILE_URL = `https://github.com/${USERNAME}`;
const API_URL = `https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`;

/*
  The API answers with one flat, chronological list of days. The graph paints
  that as GitHub does it: Sunday-first week columns, seven slots each. Weeks at
  the edges of the window are padded with empty slots so the first weekday
  lands on its own row and the last column stays square.
*/
const buildWeeks = (days) => {
  const weeks = [];
  let week = [];

  days.forEach((day) => {
    const weekday = new Date(`${day.date}T00:00:00Z`).getUTCDay();

    if (weekday === 0 && week.length > 0) {
      weeks.push(week);
      week = [];
    }

    while (week.length < weekday) {
      week.push(null);
    }

    week.push(day);
  });

  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
  }

  return weeks;
};

function Github() {
  const [days, setDays] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch(API_URL, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`GitHub contributions request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((payload) => {
        if (Array.isArray(payload?.contributions)) {
          setDays(payload.contributions);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });

    return () => controller.abort();
  }, []);

  const weeks = useMemo(() => (days ? buildWeeks(days) : null), [days]);

  const total = useMemo(
    () => (days ? days.reduce((sum, day) => sum + day.count, 0) : null),
    [days]
  );

  return (
    <section className="github" aria-labelledby="github-heading">
      <div className="github-head">
        <h2 id="github-heading" className="github-label">
          GitHub
        </h2>
        <a
          className="github-count"
          href={PROFILE_URL}
          target="_blank"
          rel="noreferrer noopener"
          data-haptic="light"
        >
          {total === null
            ? "GitHub profile"
            : `${total.toLocaleString("en-US")} contributions in the last year`}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 11l6-6M6 5h5v5" />
          </svg>
        </a>
      </div>

      {weeks && !failed ? (
        <div
          className="github-grid"
          role="img"
          aria-label="GitHub contribution graph"
        >
          {weeks.map((week, index) => (
            <div className="github-week" key={index}>
              {week.map((day, slot) =>
                day ? (
                  <span
                    key={day.date}
                    className={`github-day github-level-${day.level}`}
                    title={`${day.count} on ${day.date}`}
                  />
                ) : (
                  <span
                    key={`pad-${slot}`}
                    className="github-day is-pad"
                    aria-hidden="true"
                  />
                )
              )}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default Github;
