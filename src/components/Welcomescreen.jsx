import React, { useEffect, useState } from 'react';
import './WelcomeScreen.css';

const WelcomeScreen = ({ onDone }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [dotIdx, setDotIdx] = useState(0);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDotIdx(i => (i + 1) % 3);
    }, 1100);

    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 3400);

    const doneTimer = setTimeout(() => {
      onDone();
    }, 4600);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div className={`ws-root ${fadeOut ? 'ws-fade-out' : ''}`}>
      <svg className="ws-lines" viewBox="0 0 680 500" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <line x1="0"   y1="60"  x2="680" y2="60"  stroke="#f5f1ea" strokeWidth="1"/>
        <line x1="0"   y1="440" x2="680" y2="440" stroke="#f5f1ea" strokeWidth="1"/>
        <line x1="60"  y1="0"   x2="60"  y2="500" stroke="#f5f1ea" strokeWidth="1"/>
        <line x1="620" y1="0"   x2="620" y2="500" stroke="#f5f1ea" strokeWidth="1"/>
        <rect x="60" y="60" width="560" height="380" fill="none" stroke="#ede9e0" strokeWidth="0.5"/>
        <line x1="40"  y1="250" x2="80"  y2="250" stroke="#e4dfd4" strokeWidth="0.5"/>
        <line x1="600" y1="250" x2="640" y2="250" stroke="#e4dfd4" strokeWidth="0.5"/>
        <circle cx="340" cy="250" r="180" fill="none" stroke="#f5f1ea" strokeWidth="0.5"/>
        <circle cx="340" cy="250" r="120" fill="none" stroke="#f5f1ea" strokeWidth="0.5"/>
      </svg>

      <div className="ws-center">
        <p className="ws-eyebrow">Welcome to the</p>
        <div className="ws-logo">PAKTEX</div>
        <div className="ws-logo-sub">Textile Exchange</div>
        <div className="ws-divider" />
        <p className="ws-welcome">Inventory Management System</p>
        <p className="ws-tagline">Curated wholesale fabrics · Contract pricing · Global distribution</p>
        <div className="ws-dots">
          {[0, 1, 2].map(i => (
            <div key={i} className={`ws-dot ${dotIdx === i ? 'ws-dot--active' : ''}`} />
          ))}
        </div>
      </div>

      <div className="ws-progress-bar" />
    </div>
  );
};

export default WelcomeScreen;