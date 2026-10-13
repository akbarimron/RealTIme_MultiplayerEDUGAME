import React from 'react';
import { teamMeta } from '../../game/engine';

const K = '#0E0F24';

// Wajah pendaki untuk UI (avatar). Karakter yang sama dengan yang memanjat di arena.
// mood: 'happy' | 'dizzy' | 'frozen' | 'wow' | 'sleep'
export default function ClimberFace({ teamId, size = 40, mood = 'happy', className = '' }) {
  const t = teamMeta(teamId);
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden="true">
      <circle cx="13" cy="39" r="5" fill={t.skin} stroke={K} strokeWidth="3" />
      <circle cx="51" cy="39" r="5" fill={t.skin} stroke={K} strokeWidth="3" />
      <circle cx="32" cy="37" r="19" fill={t.skin} stroke={K} strokeWidth="3" />
      <path d="M12 35 C12 20 21 11 32 11 C43 11 52 20 52 35 Z" fill={t.color} stroke={K} strokeWidth="3" strokeLinejoin="round" />
      <path d="M17 27 C19 20 24 16 29 15" fill="none" stroke="#FFFFFF" strokeOpacity=".55" strokeWidth="3" strokeLinecap="round" />
      <path d="M9 35 H55" stroke={K} strokeWidth="4" strokeLinecap="round" />
      <rect x="26" y="17" width="12" height="9" rx="3" fill="#FFF6D6" stroke={K} strokeWidth="2.5" />
      <circle cx="32" cy="21.5" r="2" fill="#FFB800" />

      {mood === 'dizzy' && (
        <path d="M21 39 L27 45 M27 39 L21 45 M37 39 L43 45 M43 39 L37 45" stroke={K} strokeWidth="2.6" strokeLinecap="round" />
      )}
      {mood === 'sleep' && (
        <path d="M21 42 C23 44 26 44 28 42 M36 42 C38 44 41 44 43 42" fill="none" stroke={K} strokeWidth="2.6" strokeLinecap="round" />
      )}
      {(mood === 'happy' || mood === 'frozen' || mood === 'wow') && (
        <>
          <ellipse cx="24.5" cy="42" rx="2.8" ry={mood === 'wow' ? 4 : 3.4} fill={K} />
          <ellipse cx="39.5" cy="42" rx="2.8" ry={mood === 'wow' ? 4 : 3.4} fill={K} />
          <circle cx="25.6" cy="40.6" r="1" fill="#fff" />
          <circle cx="40.6" cy="40.6" r="1" fill="#fff" />
        </>
      )}

      <ellipse cx="19" cy="48" rx="3.6" ry="2.2" fill="#FF7E95" opacity=".55" />
      <ellipse cx="45" cy="48" rx="3.6" ry="2.2" fill="#FF7E95" opacity=".55" />

      {mood === 'wow' || mood === 'dizzy' ? (
        <ellipse cx="32" cy="50" rx="2.6" ry="3.2" fill={K} />
      ) : mood === 'frozen' ? (
        <path d="M26 50 L28.5 48.5 L31 50.5 L33.5 48.5 L36 50.5 L38 49" fill="none" stroke={K} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M27 48.5 C29.5 52 34.5 52 37 48.5" fill="none" stroke={K} strokeWidth="2.6" strokeLinecap="round" />
      )}

      {mood === 'frozen' && (
        <rect x="6" y="8" width="52" height="52" rx="12" fill="#9EDCFF" fillOpacity=".45" stroke="#DDF3FF" strokeWidth="2.5" />
      )}
    </svg>
  );
}
