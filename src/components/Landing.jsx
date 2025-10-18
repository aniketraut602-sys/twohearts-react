import React from "react";
export default function Landing({ onGetStarted }){
  return (
    <section aria-labelledby="landingTitle" className="card">
      <h1 id="landingTitle">TwoHearts — Connect with dignity</h1>
      <p className="lead">A simple, accessible place for people with disabilities to meet and connect (text-first).</p>
      <div className="actions">
        <button className="btn" onClick={onGetStarted}>Get started</button>
      </div>
    </section>
  );
}
