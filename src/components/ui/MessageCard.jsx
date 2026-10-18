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

const ICONS = {
  dot: <span className="status-dot" />,
  briefcase: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5.5A2.5 2.5 0 0 1 11.5 3h1A2.5 2.5 0 0 1 15 5.5V7" />
      <path d="M3 12.5h18" />
    </svg>
  )
};

// Notification-style message card: one optional call-to-action row that reads
// as a soft interruption between sections rather than a banner.
function MessageCard({
  tone = "accent",
  icon = "dot",
  title,
  support,
  cta,
  href,
  kind = "hash"
}) {
  const content = (
    <>
      <span className="message-card-icon" aria-hidden="true">
        {ICONS[icon] || ICONS.dot}
      </span>
      <span className="message-card-body">
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
