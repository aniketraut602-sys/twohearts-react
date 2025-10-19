// src/components/Chat.jsx
import React, { useState, useEffect, useRef } from "react";

/**
 * Accessible Chat component:
 * - chat log uses role="log" + aria-live="polite"
 * - message send announces via global announcer and sets focus back to composer
 * - chat open announces via global announcer
 */

export default function Chat({ match, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const logRef = useRef(null);
  const composerRef = useRef(null);
  const liveRef = useRef(null);

  useEffect(() => {
    // announce chat opened and move focus into the chat region
    const who = match?.name || "your match";
    const openMsg = `Chat opened with ${who}`;
    if (window.twoHeartsAnnounce) window.twoHeartsAnnounce(openMsg);

    // focus composer for quick typing
    if (composerRef.current) {
      // small timeout to let screen reader process the live announce first
      setTimeout(() => composerRef.current.focus(), 150);
    }
  }, [match]);

  // add message locally
  const send = (e) => {
    e && e.preventDefault();
    const trimmed = (text || "").trim();
    if (!trimmed) {
      // announce no-empty message
      if (window.twoHeartsAnnounce) window.twoHeartsAnnounce("Cannot send an empty message");
      return;
    }
    const msg = { id: Date.now(), text: trimmed, who: "me" };
    setMessages((prev) => [...prev, msg]);
    setText("");

    // announce message sent via both announcer and a brief live region update
    if (liveRef.current) {
      liveRef.current.textContent = "Message sent";
      // clear after a short delay
      setTimeout(() => { if (liveRef.current) liveRef.current.textContent = ""; }, 1000);
    }
    if (window.twoHeartsAnnounce) {
      // slightly delay to ensure screen reader reads live region then announcer
      setTimeout(() => window.twoHeartsAnnounce("Message sent"), 150);
    }

    // keep focus in composer so user can type next message
    if (composerRef.current) {
      setTimeout(() => composerRef.current.focus(), 200);
    }

    // scroll chat to bottom
    setTimeout(() => {
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, 50);
  };

  return (
    <section className="card" aria-labelledby="chatTitle">
      <h2 id="chatTitle">Chat</h2>

      {/* hidden live region for brief statuses in addition to the global announcer */}
      <div
        aria-live="polite"
        aria-atomic="true"
        ref={liveRef}
        style={{ position: "absolute", left: "-9999px", height: "1px", width: "1px", overflow: "hidden" }}
      />

      <div
        ref={logRef}
        className="chat-window"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        tabIndex="0"
      >
        {messages.length === 0 && <div aria-hidden="false">No messages yet</div>}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`msg ${m.who === "me" ? "me" : "them"}`}
            role="article"
            aria-label={m.who === "me" ? "You said" : "They said"}
          >
            {m.text}
          </div>
        ))}
      </div>

      <form onSubmit={send} aria-label="Send message form">
        <label htmlFor="chatInput" className="sr-only">Write a message</label>
        <textarea
          id="chatInput"
          ref={composerRef}
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message"
          aria-label="Message composer"
        />
        <div className="actions">
          <button className="btn" type="submit">Send</button>
          <button className="btn btn-ghost" type="button" onClick={onClose}>Close</button>
        </div>
      </form>
    </section>
  );
}
