import React, { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import Reveal from "../Reveal";

const ContactForm = () => {
  const formRef = useRef();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("");

    try {
      await emailjs.sendForm(
        "service_myqa4bd",
        "template_ruvu8sz",
        formRef.current,
        "JGx4g-OCv2zLtpJEu"
      );

      await emailjs.sendForm(
        "service_myqa4bd",
        "template_n9gw0bo",
        formRef.current,
        "JGx4g-OCv2zLtpJEu"
      );

      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Email sending error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section" id="contact">
      <div className="container-x">
        <Reveal>
          <div className="contact-grid">
            <div>
              <p className="eyebrow">04 &mdash; Contact</p>
              <h2 className="display-1 contact-heading">
                Get in <span className="serif-accent">touch</span>
              </h2>
              <p className="contact-sub body-copy">
                Have a project in mind? Let&rsquo;s work together — my inbox is
                always open.
              </p>

              <a
                href="mailto:fideljonmagat25@gmail.com"
                className="link-sweep contact-email"
              >
                fideljonmagat25@gmail.com
              </a>

              <p className="avail-note">
                <span className="status-dot" aria-hidden="true"></span>
                Currently available for freelance &amp; full-time roles
              </p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="contact-form">
              <div className="form-field">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                  aria-label="Your Name"
                />
              </div>

              <div className="form-field">
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                  aria-label="Your Email"
                />
              </div>

              <div className="form-field">
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="form-input"
                  aria-label="Subject"
                />
              </div>

              <div className="form-field">
                <textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="form-input"
                  aria-label="Your Message"
                />
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? "Sending…" : "Send Message"}
                {!isSubmitting && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M7 17 17 7M8 7h9v9" />
                  </svg>
                )}
              </button>

              {submitStatus === "success" && (
                <div className="status-message success" role="status">
                  Message sent successfully! I&rsquo;ll get back to you soon.
                </div>
              )}

              {submitStatus === "error" && (
                <div className="status-message error" role="alert">
                  Failed to send message. Please try again, or email me directly
                  at{" "}
                  <a href="mailto:fideljonmagat25@gmail.com" className="link-sweep">
                    fideljonmagat25@gmail.com
                  </a>
                  .
                </div>
              )}
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ContactForm;
