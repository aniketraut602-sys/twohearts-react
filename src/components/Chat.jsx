import React, { useState } from "react";

export default function Chat({ match, onClose }){
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const send = (e) => {
    e.preventDefault();
    if(!text.trim()) return;
    setMessages(prev => [...prev, {id:Date.now(), text, who:'me'}]);
    setText('');
  }
  return (
    <section className="card" aria-labelledby="chatTitle">
      <h2 id="chatTitle">Chat</h2>
      <div className="chat-window" role="log" aria-live="polite">
        {messages.map(m=> <div key={m.id} className={`msg ${m.who==='me' ? 'me' : 'them'}`}>{m.text}</div>)}
      </div>
      <form onSubmit={send}>
        <label className="sr-only">Message</label>
        <textarea rows="2" value={text} onChange={e=>setText(e.target.value)}></textarea>
        <div className="actions">
          <button className="btn" type="submit">Send</button>
          <button className="btn btn-ghost" type="button" onClick={onClose}>Close</button>
        </div>
      </form>
    </section>
  );
}
