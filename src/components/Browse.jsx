import React from "react";
import { listProfiles } from "../lib/storage";

export default function Browse({ onView, onChat }){
  const profiles = listProfiles();
  return (
    <section className="card" aria-labelledby="browseTitle">
      <h2 id="browseTitle">Discover people</h2>
      <div role="list">
        {profiles.map(p => (
          <article role="listitem" aria-label={`${p.name} profile`} key={p.id} className="profile-card">
            <strong>{p.name} {p.age ? `, ${p.age}` : ''}</strong>
            <div>{p.about}</div>
            <div className="actions">
              <button className="btn" onClick={()=>onView(p.id)}>View profile</button>
              <button className="btn btn-ghost" onClick={()=>{ alert('Connect sent (simulated)'); }}>Connect</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
