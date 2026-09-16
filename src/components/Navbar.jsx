import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeContext";

const NAV_LINKS = [
  { label: "Work", type: "section", target: "work" },
  { label: "About", type: "route", target: "/about" },
  { label: "Resume", type: "route", target: "/resume" },
  { label: "Contact", type: "section", target: "contact" }
];

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const burgerRef = useRef(null);
  const menuRef = useRef(null);

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

  // Move focus out of the menu whenever it closes.
  //
  // `inert` stops the subtree from *receiving* focus, but it does not blur an
  // element that is already focused. Following a menu link leaves focus on that
  // link, so the container ends up aria-hidden while holding the focused
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

  const goToSection = (id) => (event) => {
    event.preventDefault();
    setMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => scrollToSection(id), 140);
    } else {
      scrollToSection(id);
    }
  };

  const renderLink = (link, isMobile) => {
    const className = `nav-link${isMobile ? " mobile-menu-link" : ""}`;
    if (link.type === "section") {
      return (
        <a href={`/#${link.target}`} className={className} onClick={goToSection(link.target)}>
          {isMobile && <small>0{NAV_LINKS.indexOf(link) + 1}</small>}
          {link.label}
        </a>
      );
    }
    return (
      <Link
        to={link.target}
        className={`${className}${location.pathname === link.target ? " active" : ""}`}
        onClick={() => setMenuOpen(false)}
      >
        {isMobile && <small>0{NAV_LINKS.indexOf(link) + 1}</small>}
        {link.label}
      </Link>
    );
  };

  return (
    <>
      <header className={`nav${scrolled || menuOpen ? " is-scrolled" : ""}`}>
        <div className="container-x nav-inner">
          <Link to="/" className="wordmark" aria-label="Fidel Jon Magat — home">
            FJM<span className="wordmark-dot">.</span>
          </Link>

          <div className="nav-right">
            <nav className="nav-links" aria-label="Primary">
              {NAV_LINKS.map((link) => (
                <React.Fragment key={link.label}>{renderLink(link, false)}</React.Fragment>
              ))}
            </nav>

            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
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

            <button
              type="button"
              ref={burgerRef}
              className={`nav-burger${menuOpen ? " is-open" : ""}`}
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      <div
        className={`mobile-menu${menuOpen ? " is-open" : ""}`}
        id="mobile-menu"
        ref={menuRef}
        // The closed menu is only visually hidden (opacity/visibility), so its
        // links stay in the tab order. That is what triggers "Blocked
        // aria-hidden on an element because its descendant retained focus":
        // focusing a link inside an aria-hidden tree is a contradiction.
        //
        // `inert` is the correct fix rather than dropping aria-hidden: it makes
        // the whole subtree unfocusable and removes it from the accessibility
        // tree, which also stops keyboard users from tabbing into an invisible
        // menu. It mirrors menuOpen, so no state changes are needed. Browsers
        // without support ignore it and fall back to today's behaviour.
        inert={menuOpen ? undefined : ""}
        aria-hidden={!menuOpen}
        onClick={(event) => {
          if (event.target === event.currentTarget) setMenuOpen(false);
        }}
      >
        <div className="mobile-menu-links">
          {NAV_LINKS.map((link) => (
            <React.Fragment key={link.label}>{renderLink(link, true)}</React.Fragment>
          ))}
        </div>
        <p className="mobile-menu-footer">Fidel Jon Magat — Angeles City, Pampanga</p>
      </div>
    </>
  );
}

export default NavBar;
