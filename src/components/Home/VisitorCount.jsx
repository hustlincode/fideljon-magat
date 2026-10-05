import React from "react";

import useVisitorCount from "../../hooks/useVisitorCount";

// Small badge showing how many unique visitors the site has had.
//
// Renders nothing until a real count arrives, and nothing at all below the
// threshold. A portfolio that advertises "4 visitors" reads worse than showing
// no number, so the badge stays hidden until the count is worth showing.
//
// This is intentionally client-only: see the notes in useVisitorCount for why
// it must not appear in prerendered HTML.
const MIN_VISITORS_TO_SHOW = 100;

function VisitorCount() {
  const count = useVisitorCount();

  if (count === null || count < MIN_VISITORS_TO_SHOW) return null;

  return (
    <span className="visitor-chip rise rise-d1">
      <span className="visitor-chip-number">{count.toLocaleString("en-US")}</span>
      {count === 1 ? "visitor" : "visitors"}
    </span>
  );
}

export default VisitorCount;
