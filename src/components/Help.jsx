import React from "react";
export default function Help({ onClose }){
  return (
    <section className="card" aria-labelledby="helpTitle">
      <h2 id="helpTitle">Safety & Help</h2>
      <p>Prototype tips: do not share private data. Use Report/Block in production.</p>
      <div className="actions"><button className="btn" onClick={onClose}>Close</button></div>
    </section>
  );
}
