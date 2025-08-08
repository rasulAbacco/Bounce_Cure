import React, { useState } from 'react';
import '../pages/contact.css';
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from 'react-icons/fa';
import Navbar from './Navbar';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    service: 'general',
    message: '',
    subscribe: false,
  });

  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const validate = () => {
    const temp = {};
    if (!formData.fullname.trim()) temp.fullname = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      temp.email = 'Please enter a valid email.';
    if (!formData.message.trim() || formData.message.length < 8)
      temp.message = 'Message is too short.';
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setFeedback('Sending...');
    setTimeout(() => {
      setFeedback('Thanks — your message has been sent. We will reply soon!');
      setFormData({
        fullname: '',
        email: '',
        phone: '',
        service: 'general',
        message: '',
        subscribe: false,
      });
    }, 1000);
  };

  return (
     <div>
      <Navbar/>
        <div className="contact-page">
      <section className="contact-hero mt-15">
        <div className="hero-left glass-card">
          <h1>Get in touch</h1>
          <p className="lead">
            Questions, feedback or want a demo? Fill the form and we'll get back
            within 1 business day.
          </p>
          <div className="contact-cards">
            <div className="card glass-card">
              <FaPhone />
              <div>
                <h4>Call us</h4>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="card glass-card">
              <FaEnvelope />
              <div>
                <h4>Email</h4>
                <p>support@bouncecure.com</p>
              </div>
            </div>
            <div className="card glass-card">
              <FaMapMarkerAlt />
              <div>
                <h4>Office</h4>
                <p>Hyderabad, India</p>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-right glass-card">
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="form-row two-col">
              <div className="form-field">
                <label htmlFor="fullname">Full name</label>
                <input
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  placeholder="Your full name"
                />
                {errors.fullname && <small className="error">{errors.fullname}</small>}
              </div>
              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@domain.com"
                />
                {errors.email && <small className="error">{errors.email}</small>}
              </div>
            </div>

            <div className="form-row two-col">
              <div className="form-field">
                <label htmlFor="phone">Phone</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
              <div className="form-field">
                <label htmlFor="service">Service</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                >
                  <option value="general">General inquiry</option>
                  <option value="support">Support</option>
                  <option value="sales">Sales / Demo</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="message">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your request"
              />
              {errors.message && <small className="error">{errors.message}</small>}
            </div>

            <div className="form-row form-actions">
              <label className="checkbox-inline">
                <input
                  type="checkbox"
                  name="subscribe"
                  checked={formData.subscribe}
                  onChange={handleChange}
                />{' '}
                Subscribe to product updates
              </label>
              <button type="submit" className="btn-primary">
                Send message
              </button>
            </div>

            {feedback && <div className="form-row form-feedback">{feedback}</div>}
          </form>

          
        </div>
      </section>

      <section className="newsletter glass-card">
        <div className="newsletter-inner">
          <h3>Stay updated</h3>
          <p>Join 10,000+ professionals getting product updates and tips.</p>
          <form
            className="newsletter-form"
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thanks for subscribing!');
            }}
          >
            <input type="email" placeholder="Email address" required />
            <button type="submit" className="btn-ghost">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
     </div>
  );
};

export default ContactPage;
