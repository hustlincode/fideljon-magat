import React from "react";
import { Link } from "react-router-dom";
import Reveal from "../Reveal";

const ARROW = (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

// Pastel banner card, marwieang-style: a colored micro-label, a title, one
// support line, and an arrow that leans in on hover.
//
// Both tones stay light in EITHER theme, on purpose: the banner is a "paper
// note" pinned over the page, and its ink is fixed dark so legibility never
// depends on the active theme.
function MessageCard({
  tone = "green",
  label,
  title,
  support,
  cta,
  href,
  kind = "hash"
}) {
  const content = (
    <>
      <span className="message-card-body">
        {label ? <span className="message-card-label">{label}</span> : null}
        <strong className="message-card-title">{title}</strong>
        <span className="message-card-support">{support}</span>
      </span>
      <span className="message-card-cta">
        <span className="message-card-cta-label">{cta}</span>
        {ARROW}
      </span>
    </>
  );

  const className = `message-card message-card--${tone}`;

  return (
    <Reveal>
      {kind === "route" ? (
        <Link to={href} className={className} data-haptic="light">
          {content}
        </Link>
      ) : (
        <a href={href} className={className} data-haptic="light">
          {content}
        </a>
      )}
    </Reveal>
  );
}

export default MessageCard;
