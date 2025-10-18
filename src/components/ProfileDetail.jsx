import React from "react";
import { getProfile } from "../lib/storage";

export default function ProfileDetail({ id, onBack, onConnect }){
  const p = getProfile(id);
  if(!p) return <div className="card">Profile not found <button onClick={onBack}>Back</button></div>;
  return (
    <section className="card" aria-labelledby="profileTitle">
      <h2 id="profileTitle">{p.name}</h2>
      <div>{p.about}</div>
      <div><small>Interests: {p.interests.join(', ')}</small></div>
      <div className="actions">
        <button className="btn" onClick={()=>{ alert('Connect sent (simulated)'); onConnect(); }}>Connect</button>
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
      </div>
    </section>
  );
}
