// src/components/Auth.jsx
import React, { useState, useRef, useEffect } from "react";
import { saveUser } from "../lib/storage";

export default function Auth({ onCreated }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [errors, setErrors] = useState({});
  const emailRef = useRef(null);
  const nameRef = useRef(null);
  const aboutRef = useRef(null);
  const errorRef = useRef(null);

  useEffect(() => {
    // focus first input on mount
    if (emailRef.current) emailRef.current.focus();
  }, []);

  // simple email validation
  function isValidEmail(e) {
    if (!e) return false;
    // basic RFC-like check (not exhaustive)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  function announceAndFocus(message, focusRef) {
    // announce via global announcer if present
    if (window.twoHeartsAnnounce) window.twoHeartsAnnounce(message);
    // also set focus to the first invalid input
    if (focusRef && focusRef.current) {
      focusRef.current.focus();
    }
  }

  const validate = () => {
    const next = {};
    if (!email.trim()) {
      next.email = "Email address is required.";
    } else if (!isValidEmail(email.trim())) {
      next.email = "Please enter a valid email address.";
    }
    // display name optional but keep min length check
    if (name && name.trim().length > 0 && name.trim().length < 2) {
      next.name = "Display name should be at least 2 characters.";
    }
    if (about && about.length > 500) {
      next.about = "About text must be 500 characters or less.";
    }
    setErrors(next);
    return next;
  };

  const submit = (e) => {
    e.preventDefault();
    const next = validate();
    const keys = Object.keys(next);
    if (keys.length > 0) {
      // focus first error and announce
      if (next.email) {
        announceAndFocus(next.email, emailRef);
      } else if (next.name) {
        announceAndFocus(next.name, nameRef);
      } else if (next.about) {
        announceAndFocus(next.about, aboutRef);
      } else {
        // fallback announce
        if (window.twoHeartsAnnounce) window.twoHeartsAnnounce("Please correct the highlighted fields.");
      }
      // put a short text in the error container for screen readers
      if (errorRef.current) {
        errorRef.current.textContent = keys.map(k => next[k]).join(" ");
      }
      return;
    }

    // all good — create user
    const user = { id: "u" + Date.now(), email: email.trim(), name: name.trim() || "Anonymous", about: about.trim(), prefs: {} };
    saveUser(user);
    if (window.twoHeartsAnnounce) window.twoHeartsAnnounce("Account created successfully.");
    // call parent callback
    if (onCreated) onCreated(user);
  };

  return (
    <form className="card" aria-labelledby="authTitle" onSubmit={submit} noValidate>
      <h2 id="authTitle">Create account</h2>

      {/* Accessible error region — role="alert" for assertive announcement; also keep a visually hidden region for NVDA */}
      <div
        ref={errorRef}
        role="alert"
        aria-live="assertive"
        style={{ color: "#b00020", marginBottom: "8px" }}
      />

      <div>
        <label htmlFor="email">Email address <span aria-hidden="true">*</span></label>
        <input
          id="email"
          ref={emailRef}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-required="true"
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={errors.email ? "input-error" : undefined}
        />
        {errors.email && (
          <div id="email-error" style={{ color: "#b00020" }} aria-live="assertive">
            {errors.email}
          </div>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <label htmlFor="name">Display name</label>
        <input
          id="name"
          ref={nameRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={errors.name ? "true" : "false"}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <div id="name-error" style={{ color: "#b00020" }} aria-live="assertive">
            {errors.name}
          </div>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <label htmlFor="about">About</label>
        <textarea
          id="about"
          ref={aboutRef}
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          rows={4}
          aria-invalid={errors.about ? "true" : "false"}
          aria-describedby={errors.about ? "about-error" : undefined}
        />
        {errors.about && (
          <div id="about-error" style={{ color: "#b00020" }} aria-live="assertive">
            {errors.about}
          </div>
        )}
      </div>

      <div className="actions" style={{ marginTop: 12 }}>
        <button className="btn" type="submit">Create account</button>
      </div>
    </form>
  );
}
