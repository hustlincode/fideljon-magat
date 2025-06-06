// ContactForm.js
import React, { useState, useRef } from "react";
import { FaPaperPlane, FaUser, FaEnvelope, FaComment } from "react-icons/fa";
import emailjs from '@emailjs/browser';

const ContactForm = () => {
  const formRef = useRef(); // EmailJS uses a ref to access the form

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');

    try {
        // Send to second template
        await emailjs.sendForm(
            'service_myqa4bd',
            'template_ruvu8sz',
            formRef.current,
            'JGx4g-OCv2zLtpJEu'
        );

        // Send to second template
        await emailjs.sendForm(
            'service_myqa4bd',
            'template_n9gw0bo',
            formRef.current,
            'JGx4g-OCv2zLtpJEu'
        );

      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Email sending error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-form-container">
      <h1 style={{ fontSize: "2.6em", color: "#fff", textAlign: "center", marginBottom: "20px" }}>
        GET IN <span className="purple">TOUCH</span>
      </h1>
      <p style={{ textAlign: "center", color: "#c770f0", fontSize: "1.2em", marginBottom: "50px" }}>
        Have a project in mind? Let's work together!
      </p>

      <div className="contact-form-wrapper">
        <form ref={formRef} onSubmit={handleSubmit} className="contact-form">
          <div className="form-row">
            <div className="form-group">
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>
            <div className="form-group">
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <FaComment className="input-icon" />
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <FaComment className="input-icon textarea-icon" />
              <textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                className="form-textarea"
              />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="submit-button">
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                Sending...
              </>
            ) : (
              <>
                <FaPaperPlane />
                Send Message
              </>
            )}
          </button>

          {submitStatus === 'success' && (
            <div className="status-message success">
              Message sent successfully! I'll get back to you soon.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="status-message error">
              Failed to send message. Please try again or contact me directly.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
