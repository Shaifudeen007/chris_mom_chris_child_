import React from 'react';
import './Snowflakes.css';

export default function Snowflakes() {
  // Generate 60 snowflakes with random properties for a natural effect
  const flakes = Array.from({ length: 60 }).map((_, i) => {
    const style = {
      left: `${Math.random() * 100}vw`,
      animationDuration: `${Math.random() * 5 + 3}s`, // Between 3s and 8s
      animationDelay: `${Math.random() * 5}s`,
      opacity: Math.random() * 0.5 + 0.3,
      width: `${Math.random() * 6 + 3}px`,
      height: `${Math.random() * 6 + 3}px`,
    };
    return <div key={i} className="snowflake" style={style}></div>;
  });

  return <div className="snow-container" aria-hidden="true">{flakes}</div>;
}
