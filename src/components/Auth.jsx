import React, { useState } from "react";
import { saveUser } from "../lib/storage";

export default function Auth({ onCreated }){
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");

  const submit = (e)=>{
    e.preventDefault();
    if(!email) return alert('Email required');
    const user = { id: 'u'+Date.now(), email, name: name||'Anonymous', about, prefs:{} };
    saveUser(user);
    onCreated(user);
  }
  return (
    <form className="card" aria-labelledby="authTitle" onSubmit={submit}>
      <h2 id="authTitle">Create account</h2>
      <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
      <label>Display name<input type="text" value={name} onChange={e=>setName(e.target.value)} /></label>
      <label>About<textarea value={about} onChange={e=>setAbout(e.target.value)} rows={4}></textarea></label>
      <div className="actions"><button className="btn" type="submit">Create account</button></div>
    </form>
  );
}
