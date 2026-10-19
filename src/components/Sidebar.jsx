import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiFillGithub } from "react-icons/ai";
import { FaLinkedinIn } from "react-icons/fa";

import { useTheme } from "../theme/ThemeContext";
import useScrollProgress from "../hooks/useScrollProgress";
import HapticToggle from "./ui/HapticToggle";
import VisitorCount from "./Home/VisitorCount";
import { PROJECTS } from "../config/projectsData";

// Count of entries across GROUPS in About/Skills.jsx
// (7 + 3 + 6 + 2 + 6 + 6).
// Kept as a constant because the list is deliberately local to that file.
const SKILL_COUNT = 30;

const GITHUB_URL = "https://github.com/hustlincode";
const LINKEDIN_URL = "https://www.linkedin.com/in/fidel-jon-magat";

const icon = (children) => (
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
    {children}
  </svg>
);

// 16px line icons, 1.5 stroke, drawn on the same 16px grid as the reference
// sidebar. Keeping one grid and one weight is what makes the rail read calm.
const ICONS = {
  // Briefcase: the home page's selected-work section.
  work: icon(
    <>
      <rect x="2" y="5" width="12" height="8.5" rx="1.2" />
      <path d="M5.5 5V3.5h5V5" />
    </>
  ),
  user: icon(
    <>
      <circle cx="8" cy="5.5" r="2.8" />
      <path d="M2.5 14c.8-2.7 3-4 5.5-4s4.7 1.3 5.5 4" />
    </>
  ),
  // The portfolio grid: four small tiles.
  folder: icon(
    <>
      <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" />
      <rect x="9" y="2.5" width="4.5" height="4.5" rx="1" />
      <rect x="2.5" y="9" width="4.5" height="4.5" rx="1" />
      <rect x="9" y="9" width="4.5" height="4.5" rx="1" />
    </>
  ),
  layers: icon(
    <>
      <path d="M8 2 14 5 8 8 2 5z" />
      <path d="M2 8.5 8 11.5 14 8.5" />
      <path d="M2 11.5 8 14.5 14 11.5" />
    </>
  ),
  file: icon(
    <>
      <path d="M3 2.5h7.5L13 5v8.5H3z" />
      <path d="M5.5 8h5M5.5 10.5h3.5" />
    </>
  ),
  mail: icon(
    <>
      <rect x="2" y="3.5" width="12" height="9" rx="1.5" />
      <path d="m2.5 4.5 5.5 4 5.5-4" />
    </>
  )
};

const COLLAPSE_ICON = (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    <rect x="3" y="4" width="14" height="12" rx="2.5" />
    <path d="M8 4v12" />
  </svg>
);

const EXPAND_ICON = (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    <rect x="3" y="4" width="14" height="12" rx="2.5" />
    <path d="M12 4v12" />
  </svg>
);

const CLOSE_ICON = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

// Navigation, grouped the way the sidebar presents it. Section targets live
// on the home page; route targets are full pages. Badges mirror the counts
// shown in the stats row, so the two never drift apart in tone.
const NAV_GROUPS = [
  {
    label: null,
    items: [
      { label: "Work", type: "section", target: "work", icon: "work" },
      { label: "About", type: "route", target: "/about", icon: "user" }
    ]
  },
  {
    label: "Portfolio",
    items: [
      {
        label: "Projects",
        type: "route",
        target: "/project",
        icon: "folder",
        badge: String(PROJECTS.length).padStart(2, "0")
      },
      {
        label: "Skills",
        type: "section",
        target: "skills",
        icon: "layers",
        badge: String(SKILL_COUNT)
      }
    ]
  },
  {
    label: "Work with me",
    items: [
      { label: "Resume", type: "route", target: "/resume", icon: "file" },
      { label: "Contact", type: "section", target: "contact", icon: "mail" }
    ]
  }
];

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// The application frame: a floating paper sidebar on desktop (collapsible,
// remembered in localStorage) and a glass top bar plus slide-in drawer on
// mobile. Replaces the old top navbar.
function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem("fjm-shell") === "collapsed";
    } catch {
      return false;
    }
  });
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState("");
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const burgerRef = useRef(null);
  const menuRef = useRef(null);
  const progressRef = useRef(null);

  // Drives the hairline progress rail across the top of the viewport.
  // Decorative: it mirrors where the visitor is on the page, so it is
  // aria-hidden.
  useScrollProgress(progressRef);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("shell-collapsed", collapsed);
    try {
      window.localStorage.setItem("fjm-shell", collapsed ? "collapsed" : "open");
    } catch {
      // Private mode: the choice simply does not persist.
    }
    return () => root.classList.remove("shell-collapsed");
  }, [collapsed]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", menuOpen);
    return () => document.documentElement.classList.remove("menu-open");
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Move focus out of the drawer whenever it closes.
  //
  // `inert` stops the subtree from *receiving* focus, but it does not blur an
  // element that is already focused. Following a drawer link leaves focus on
  // that link, so the container ends up aria-hidden while holding the focused
  // element -- which the browser reports as "Blocked aria-hidden on an element
  // because its descendant retained focus", and which also leaves assistive
  // technology users focused on something invisible.
  //
  // Returning focus to the toggle is the standard disclosure pattern and keeps
  // keyboard users in a sensible place instead of dropping them to the body.
  useEffect(() => {
    if (menuOpen) return;

    const active = document.activeElement;
    const menu = menuRef.current;

    if (!active || !menu || !menu.contains(active)) return;

    // Blur first so focus never lingers inside a subtree as it goes inert.
    if (typeof active.blur === "function") active.blur();

    // Then return focus to the toggle. This effect only runs after the menu was
    // actually open, which means the toggle was reachable, so no extra
    // visibility check is needed -- focusing a hidden element is a no-op.
    const burger = burgerRef.current;
    if (burger && typeof burger.focus === "function") burger.focus();
  }, [menuOpen]);

  // Small live clock for the sidebar strip; Angeles City is fixed at GMT+8,
  // so no timezone selector is needed. Runs client-side only.
  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Manila"
    });
    const tick = () => setTime(formatter.format(new Date()));
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);

  const goToSection = (id) => (event) => {
    event.preventDefault();
    setMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      window.setTimeout(() => scrollToSection(id), 140);
    } else {
      scrollToSection(id);
    }
  };

  const renderItem = (item, isMobile) => {
    const active = item.type === "route" && location.pathname === item.target;
    const className = `nav-link sidebar-item${active ? " is-active" : ""}${
      isMobile ? " mobile-menu-link" : ""
    }`;
    const inner = (
      <>
        {ICONS[item.icon]}
        <span>{item.label}</span>
        {item.badge ? <span className="sidebar-item-badge">{item.badge}</span> : null}
      </>
    );

    if (item.type === "section") {
      return (
        <a
          key={item.label}
          href={`/#${item.target}`}
          className={className}
          onClick={goToSection(item.target)}
          data-haptic="light"
        >
          {inner}
        </a>
      );
    }

    return (
      <Link
        key={item.label}
        to={item.target}
        className={className}
        onClick={() => setMenuOpen(false)}
        aria-current={active ? "page" : undefined}
        data-haptic="light"
      >
        {inner}
      </Link>
    );
  };

  const renderGroups = (isMobile) =>
    NAV_GROUPS.map((group) => (
      <div className="sidebar-group" key={group.label || "main"}>
        {group.label ? (
          <p className="sidebar-group-label">{group.label}</p>
        ) : null}
        {group.items.map((item) => renderItem(item, isMobile))}
      </div>
    ));

  const themeToggle = (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      data-haptic="medium"
      aria-label={
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
      aria-pressed={theme === "light"}
    >
      {theme === "dark" ? (
        <svg key="sun" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.3 11.3 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg key="moon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      )}
    </button>
  );

  const contactLink = (
    <a
      href="/#contact"
      className="sidebar-contact"
      onClick={goToSection("contact")}
      data-haptic="light"
    >
      {ICONS.mail}
      Contact
    </a>
  );

  const socials = (
    <>
      <a
        className="sidebar-social"
        href={GITHUB_URL}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="GitHub"
        data-haptic="light"
      >
        <AiFillGithub aria-hidden="true" />
      </a>
      <a
        className="sidebar-social"
        href={LINKEDIN_URL}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="LinkedIn"
        data-haptic="light"
      >
        <FaLinkedinIn aria-hidden="true" />
      </a>
    </>
  );

  const timeChip = (
    <span className="sidebar-time" title="Local time — Angeles City (GMT+8)">
      GMT+8{time ? ` · ${time}` : ""}
    </span>
  );

  return (
    <>
      {/* <span
        className={`scroll-progress${scrolled ? " is-scrolled" : ""}`}
        ref={progressRef}
        aria-hidden="true"
      >
        <span className="scroll-progress-fill" />
      </span> */}

      <aside className="sidebar" aria-label="Sidebar">
        <div className="sidebar-panel">
          <div className="sidebar-head">
            <Link
              to="/"
              className="wordmark"
              aria-label="Fidel Jon Magat — home"
              data-haptic="light"
            >
              Fidel Jon Magat<span className="wordmark-dot">.</span>
            </Link>
            <button
              type="button"
              className="sidebar-collapse"
              onClick={() => setCollapsed(true)}
              data-haptic="light"
              aria-label="Collapse sidebar"
            >
              {COLLAPSE_ICON}
            </button>
          </div>

          {contactLink}

          <nav className="sidebar-nav" aria-label="Primary">
            {renderGroups(false)}
          </nav>

          <div className="sidebar-foot">
            <VisitorCount />
            <div className="sidebar-strip">
              {timeChip}
              {themeToggle}
              <HapticToggle />
              {socials}
            </div>
          </div>
        </div>
      </aside>

      <button
        type="button"
        className="shell-expand"
        onClick={() => setCollapsed(false)}
        data-haptic="light"
        aria-label="Expand sidebar"
      >
        {EXPAND_ICON}
      </button>

      <header className="mobile-topbar">
        <button
          type="button"
          ref={burgerRef}
          className={`nav-burger${menuOpen ? " is-open" : ""}`}
          onClick={() => setMenuOpen((open) => !open)}
          data-haptic="light"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span></span>
          <span></span>
        </button>

        <Link to="/" className="mobile-topbar-name" data-haptic="light">
          Fidel Jon Magat
        </Link>

        <HapticToggle />

        <span className="status-chip status-chip--mini">
          <span className="status-dot" aria-hidden="true"></span>
          Available
        </span>
      </header>

      <div
        className={`mobile-menu${menuOpen ? " is-open" : ""}`}
        id="mobile-menu"
        ref={menuRef}
        // The closed drawer is only visually hidden (visibility), so its links
        // would stay in the tab order. `inert` makes the whole subtree
        // unfocusable and removes it from the accessibility tree, which also
        // stops keyboard users from tabbing into an invisible menu. It mirrors
        // menuOpen, so no state changes are needed. Browsers without support
        // ignore it and fall back to the hidden state.
        inert={menuOpen ? undefined : ""}
        aria-hidden={!menuOpen}
        data-haptic="light"
        onClick={(event) => {
          if (event.target === event.currentTarget) setMenuOpen(false);
        }}
      >
        <div className="mobile-menu-panel">
          <div className="sidebar-head">
            <span className="wordmark">
              Fidel Jon Magat<span className="wordmark-dot">.</span>
            </span>
            <button
              type="button"
              className="sidebar-collapse"
              onClick={() => setMenuOpen(false)}
              data-haptic="light"
              aria-label="Close navigation"
            >
              {CLOSE_ICON}
            </button>
          </div>

          {contactLink}

          <nav className="sidebar-nav mobile-menu-links" aria-label="Primary">
            {renderGroups(true)}
          </nav>

          <div className="sidebar-foot">
            <div className="sidebar-strip">
              {timeChip}
              {themeToggle}
              {socials}
            </div>
            <p className="mobile-menu-footer">
              Fidel Jon Magat — Angeles City, Pampanga
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
