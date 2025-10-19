// src/App.jsx
import React, { useEffect, useState } from "react";
import Landing from "./components/Landing";
import Auth from "./components/Auth";
import Browse from "./components/Browse";
import ProfileDetail from "./components/ProfileDetail";
import Chat from "./components/Chat";
import Help from "./components/Help";
import { loadCurrentUser } from "./lib/storage";

export default function App() {
  const [route, setRoute] = useState("landing");
  const [user, setUser] = useState(null);
  const [activeMatch, setActiveMatch] = useState(null);

  useEffect(()=>{
    const u = loadCurrentUser();
    if(u){ setUser(u); setRoute("browse"); }
  }, []);

  return (
    <div className="app-container" >
      <header className="app-header" role="banner">
        <a className="logo" href="#" onClick={(e)=>{e.preventDefault(); setRoute("landing")}}>TwoHearts</a>
        <nav aria-label="main nav">
          <button onClick={()=>setRoute("help")} className="btn">Help</button>
          {!user && <button onClick={()=>setRoute("auth")} className="btn btn-ghost">Sign in</button>}
        </nav>
      </header>

      <main id="main" tabIndex="-1">
        {route==="landing" && <Landing onGetStarted={()=>setRoute("auth")} />}
        {route==="auth" && <Auth onCreated={(u)=>{ setUser(u); setRoute("browse") }} />}
        {route==="browse" && <Browse onView={(id)=>setRoute(`profile:${id}`)} onChat={(m)=>{ setActiveMatch(m); setRoute("chat") }} />}
        {route.startsWith("profile:") && <ProfileDetail id={route.split(":")[1]} onBack={()=>setRoute("browse")} onConnect={()=>setRoute("browse")} />}
        {route==="chat" && <Chat match={activeMatch} onClose={()=>setRoute("browse")} />}
        {route==="help" && <Help onClose={()=>setRoute("landing")} />}
      </main>

      <footer className="app-footer">Prototype — TwoHearts (text-first). Data stored locally in this browser.</footer>
    </div>
  );
}
