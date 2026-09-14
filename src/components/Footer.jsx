import React from "react";
import { FaXTwitter } from "react-icons/fa6";
import { AiFillGithub, AiFillInstagram, AiFillFacebook } from "react-icons/ai";
import { FaLinkedinIn, FaArrowUp } from "react-icons/fa";

const SOCIALS = [
  {
    label: "GitHub",
    href: "https://github.com/hustlincode",
    icon: <AiFillGithub />
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/fidel-jon-magat",
    icon: <FaLinkedinIn />
  },
  {
    label: "Twitter / X",
    href: "https://twitter.com/fideljon_",
    icon: <FaXTwitter />
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/fideljon",
    icon: <AiFillInstagram />
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/maginoo21",
    icon: <AiFillFacebook />
  }
];

function Footer() {
  const year = new Date().getFullYear();

  const backToTop = (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer">
      <div className="container-x">
        <h2 className="footer-cta">
          Have an idea? Let&rsquo;s build it <span className="serif-accent">together.</span>
        </h2>

        <a className="link-sweep footer-email" href="mailto:fideljonmagat25@gmail.com">
          fideljonmagat25@gmail.com
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M7 17 17 7M8 7h9v9" />
          </svg>
        </a>

        <ul className="footer-socials">
          {SOCIALS.map((social) => (
            <li key={social.label}>
              <a href={social.href} target="_blank" rel="noreferrer noopener">
                <span aria-hidden="true">{social.icon}</span>
                {social.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="footer-bottom">
          <span>© {year} FJM — Designed and developed by Fidel Jon Magat</span>
          <a href="#top" className="back-top link-sweep" onClick={backToTop}>
            Back to top
            <FaArrowUp size={12} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
