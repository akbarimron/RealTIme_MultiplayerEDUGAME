import React from 'react';

// Ikon skill digambar tangan dalam SVG (viewBox 64x64), gaya stiker:
// isi warna rata + garis tepi gelap tebal, sama seperti ilustrasi tebing.
const K = '#0E0F24';
const S = { stroke: K, strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round' };

// garis bertepi: lapisan gelap tebal di bawah, warna di atas
const Duo = ({ d, color, w = 5 }) => (
  <>
    <path d={d} fill="none" stroke={K} strokeWidth={w + 4} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </>
);

const GLYPHS = {
  bomb: (
    <>
      <path d="M44 15 C49 9 54 9 56 13" fill="none" {...S} />
      <path d="M57 3 C62 8 61 13 57 15 C53 13 52 8 57 3 Z" fill="#FF8A1F" {...S} strokeWidth={2.5} />
      <rect x="33" y="15" width="12" height="10" rx="3" transform="rotate(38 39 20)" fill="#6C6488" {...S} />
      <circle cx="28" cy="38" r="19" fill="#3A3352" {...S} />
      <path d="M16 33 C17 27 22 23 27 22" fill="none" stroke="#8E86B0" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M19 35 L26 38" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M37 35 L30 38" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="23" cy="43" rx="2.6" ry="3.4" fill="#fff" />
      <ellipse cx="33" cy="43" rx="2.6" ry="3.4" fill="#fff" />
    </>
  ),
  snip: (
    <>
      <Duo d="M40 6 L48 22" color="#D9A55B" w={5} />
      <Duo d="M8 46 L18 54" color="#D9A55B" w={5} />
      <path d="M29 35 L53 10 L57 15 Z" fill="#E6E9F2" {...S} />
      <path d="M29 35 L59 29 L58 35 Z" fill="#E6E9F2" {...S} />
      <Duo d="M29 35 L19 44" color="#FF5A5A" w={3} />
      <Duo d="M29 35 L17 33" color="#FF5A5A" w={3} />
      <circle cx="15" cy="48" r="7" fill="none" stroke={K} strokeWidth="9" />
      <circle cx="15" cy="48" r="7" fill="none" stroke="#FF5A5A" strokeWidth="4.5" />
      <circle cx="11" cy="30" r="7" fill="none" stroke={K} strokeWidth="9" />
      <circle cx="11" cy="30" r="7" fill="none" stroke="#FF5A5A" strokeWidth="4.5" />
      <circle cx="29" cy="35" r="3" fill={K} />
    </>
  ),
  magnet: (
    <>
      <path d="M14 18 L14 34 A18 18 0 0 0 50 34 L50 18 L39 18 L39 34 A7 7 0 0 1 25 34 L25 18 Z" fill="#FF5A5A" {...S} />
      <rect x="14" y="8" width="11" height="11" rx="2" fill="#E6E9F2" {...S} />
      <rect x="39" y="8" width="11" height="11" rx="2" fill="#E6E9F2" {...S} />
      <path d="M20 40 C22 46 28 48 32 48" fill="none" stroke="#FFB0B0" strokeWidth="3" strokeLinecap="round" />
      <path d="M58 6 L60 2 M60 12 L64 11 M4 6 L2 2 M4 12 L0 11" stroke={K} strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  swap: (
    <>
      <Duo d="M13 30 C14 18 24 11 36 12 C40 12 43 13 46 15" color="#1FE4CE" w={6} />
      <path d="M41 6 L54 17 L39 24 Z" fill="#1FE4CE" {...S} />
      <Duo d="M51 34 C50 46 40 53 28 52 C24 52 21 51 18 49" color="#FF6FB5" w={6} />
      <path d="M23 58 L10 47 L25 40 Z" fill="#FF6FB5" {...S} />
    </>
  ),
  chaos: (
    <>
      <path d="M50 54 C56 50 58 44 58 38" fill="none" stroke={K} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 5" />
      <g transform="rotate(-14 32 32)">
        <rect x="11" y="15" width="40" height="40" rx="10" fill="#C9C3E6" {...S} />
        <rect x="11" y="11" width="40" height="40" rx="10" fill="#FFFFFF" {...S} />
        <circle cx="21" cy="21" r="4" fill="#FF5A5A" />
        <circle cx="41" cy="21" r="4" fill={K} />
        <circle cx="31" cy="31" r="4" fill="#FF5A5A" />
        <circle cx="21" cy="41" r="4" fill={K} />
        <circle cx="41" cy="41" r="4" fill="#FF5A5A" />
      </g>
    </>
  ),
  spring: (
    <>
      <path d="M22 60 L42 56 L22 52 L42 48 L22 44 L42 40" fill="none" stroke={K} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 60 L42 56 L22 52 L42 48 L22 44 L42 40" fill="none" stroke="#C9CFE0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 34 C11 23 17 16 24 16 L30 16 C32 22 38 25 47 26 C55 27 58 31 56 36 L12 36 Z" fill="#3CE0A0" {...S} />
      <path d="M11 36 L57 36 L56 41 L12 41 Z" fill="#FFFFFF" {...S} />
      <path d="M27 21 L33 25 M30 17 L36 21" stroke={K} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M3 22 H8 M1 29 H7" stroke={K} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  ink: (
    <>
      <path d="M13 34 C13 18 21 9 32 9 C43 9 51 18 51 34 C51 38 49 40 46 40 C47 47 42 50 40 45 C38 52 33 52 32 46 C31 52 26 52 24 45 C22 50 17 47 18 40 C15 40 13 38 13 34 Z" fill="#A66BFF" {...S} />
      <path d="M19 26 C20 20 24 16 29 15" fill="none" stroke="#CDB0FF" strokeWidth="3" strokeLinecap="round" />
      <circle cx="25" cy="28" r="4.5" fill={K} />
      <circle cx="39" cy="28" r="4.5" fill={K} />
      <circle cx="26.6" cy="26.4" r="1.5" fill="#fff" />
      <circle cx="40.6" cy="26.4" r="1.5" fill="#fff" />
      <circle cx="32" cy="36" r="2.6" fill={K} />
      <path d="M52 47 C56 53 58 56 55 59 C52 61 47 59 48 55 C48 53 50 50 52 47 Z" fill={K} />
      <circle cx="58" cy="44" r="2" fill={K} />
      <circle cx="45" cy="60" r="1.6" fill={K} />
    </>
  ),
  fog: (
    <>
      <path d="M14 40 C5 40 5 27 15 27 C15 16 29 12 34 21 C38 13 53 15 51 27 C60 27 60 40 51 40 Z" fill="#EEF1F8" {...S} />
      <path d="M18 34 C20 31 22 30 25 30" fill="none" stroke="#C6CCDD" strokeWidth="3" strokeLinecap="round" />
      <path d="M25 33 C27 35 29 35 31 33 M37 33 C39 35 41 35 43 33" fill="none" stroke={K} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M8 48 H38 M20 55 H54" stroke="#9AA3BC" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  flip: (
    <>
      <Duo d="M53 16 C60 26 60 38 53 48" color="#1FE4CE" w={4} />
      <path d="M47 44 L54 53 L59 42 Z" fill="#1FE4CE" {...S} strokeWidth={2.5} />
      <rect x="13" y="6" width="30" height="52" rx="7" fill="#26244A" {...S} />
      <rect x="17" y="12" width="22" height="40" rx="3" fill="#FFB800" />
      <circle cx="23" cy="38" r="2.6" fill={K} />
      <circle cx="33" cy="38" r="2.6" fill={K} />
      <path d="M22 28 C25 23 31 23 34 28" fill="none" stroke={K} strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
  blackout: (
    <>
      <path d="M32 5 C20 5 13 14 13 24 C13 32 18 36 22 41 L42 41 C46 36 51 32 51 24 C51 14 44 5 32 5 Z" fill="#4A4466" {...S} />
      <path d="M19 22 C19 16 23 12 28 11" fill="none" stroke="#6E6890" strokeWidth="3" strokeLinecap="round" />
      <rect x="22" y="41" width="20" height="11" rx="2.5" fill="#C9CFE0" {...S} />
      <path d="M22 46.5 H42" stroke={K} strokeWidth="2.5" />
      <path d="M27 52 H37 V54 C37 58 27 58 27 54 Z" fill={K} />
      <path d="M23 25 C25 28 28 28 30 25 M34 25 C36 28 39 28 41 25" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50 4 H58 L50 12 H58" fill="none" stroke={K} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  ducks: (
    <>
      <path d="M4 57 C8 54 12 54 16 57 C20 60 24 60 28 57 C32 54 36 54 40 57 C44 60 48 60 52 57 C56 54 60 54 62 56" fill="none" stroke="#4C8DFF" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M8 40 C8 31 16 30 22 32 C20 22 25 12 35 12 C45 12 50 21 46 30 C54 28 59 34 56 42 C52 52 16 54 8 40 Z" fill="#FFD84D" {...S} />
      <path d="M45 21 C51 19 58 21 57 25 C53 28 48 27 45 26 Z" fill="#FF8A1F" {...S} strokeWidth={2.5} />
      <circle cx="37" cy="21" r="3.2" fill={K} />
      <circle cx="38.2" cy="19.8" r="1.1" fill="#fff" />
      <path d="M20 39 C26 34 35 36 37 42 C31 47 24 45 20 39 Z" fill="#F2C230" {...S} strokeWidth={2.5} />
      <path d="M26 17 C28 14 31 13 33 13" fill="none" stroke="#FFF1A8" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  freeze: (
    <>
      <path d="M11 23 L32 12 L53 23 L53 46 L32 57 L11 46 Z" fill="#9EDCFF" {...S} />
      <path d="M11 23 L32 12 L53 23 L32 34 Z" fill="#DDF3FF" {...S} />
      <path d="M32 34 V57" stroke={K} strokeWidth="3" />
      <path d="M41 30 L47 27 M44 36 L48 34" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <circle cx="18" cy="38" r="2.3" fill={K} />
      <circle cx="26" cy="42" r="2.3" fill={K} />
      <path d="M16 47 L19 45 L22 48 L25 46 L28 49" fill="none" stroke={K} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  hack: (
    <>
      <rect x="45" y="18" width="14" height="4" fill="#FF6FB5" />
      <rect x="4" y="46" width="12" height="4" fill="#1FE4CE" />
      <path d="M17 31 H9 M17 40 H8 M18 48 L12 53 M47 31 H55 M47 40 H56 M46 48 L52 53" stroke={K} strokeWidth="3" strokeLinecap="round" />
      <path d="M28 12 C25 6 21 4 17 6 M36 12 C39 6 43 4 47 6" fill="none" stroke={K} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="32" cy="38" rx="16" ry="18" fill="#3CE0A0" {...S} />
      <path d="M32 22 V56" stroke={K} strokeWidth="3" />
      <circle cx="32" cy="18" r="8.5" fill="#26244A" {...S} />
      <circle cx="29" cy="17" r="2" fill="#fff" />
      <circle cx="35" cy="17" r="2" fill="#fff" />
      <circle cx="25" cy="34" r="3.2" fill={K} />
      <circle cx="40" cy="43" r="3.2" fill={K} />
      <circle cx="24" cy="46" r="2.2" fill={K} />
      <path d="M38 28 C40 29 42 31 43 33" fill="none" stroke="#9CF5CF" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  banana: (
    <>
      <ellipse cx="32" cy="53" rx="16" ry="5" fill="#C99A1E" {...S} />
      <path d="M19 51 C12 44 10 33 16 24 C19 29 22 33 26 35 C27 26 29 18 34 11 C36 21 38 28 40 33 C45 28 51 28 56 30 C50 35 47 43 44 51 Z" fill="#FFD84D" {...S} />
      <path d="M26 50 C27 43 31 40 36 40 C39 44 39 48 37 51 Z" fill="#FFF6D6" {...S} strokeWidth={2.5} />
      <path d="M34 11 L35 6" stroke={K} strokeWidth="3" strokeLinecap="round" />
      <path d="M19 30 C18 35 19 40 21 44" fill="none" stroke="#FFF1A8" strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  steal: (
    <>
      <path d="M17 25 C9 33 7 50 17 56 C26 61 40 61 47 56 C57 50 55 33 47 25 Z" fill="#B98552" {...S} />
      <path d="M23 18 C21 10 28 8 32 14 C36 8 43 10 41 18" fill="#D9A55B" {...S} />
      <Duo d="M20 23 C26 20 38 20 44 23" color="#D9A55B" w={3.5} />
      <path d="M12 38 C20 33 44 33 52 38 L51 45 C43 42 21 42 13 45 Z" fill="#26244A" {...S} strokeWidth={2.5} />
      <ellipse cx="24" cy="40" rx="4" ry="2.4" fill="#FFFFFF" />
      <ellipse cx="40" cy="40" rx="4" ry="2.4" fill="#FFFFFF" />
      <path d="M26 52 C30 54 34 54 38 52" fill="none" stroke={K} strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  shield: (
    <>
      <path d="M32 5 L53 12 L53 30 C53 45 43 54 32 59 C21 54 11 45 11 30 L11 12 Z" fill="#FFB800" {...S} />
      <path d="M32 11 L47 16 L47 30 C47 41 40 48 32 52 Z" fill="#FFD45C" />
      <circle cx="32" cy="31" r="10" fill="none" stroke={K} strokeWidth="4" />
      <path d="M23 43 L41 19" stroke={K} strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  mirror: (
    <>
      <Duo d="M38 42 L51 57" color="#A66BFF" w={6} />
      <ellipse cx="28" cy="26" rx="18" ry="20" fill="#A66BFF" {...S} />
      <ellipse cx="28" cy="26" rx="12.5" ry="14.5" fill="#DDF3FF" {...S} strokeWidth={2.5} />
      <path d="M21 21 L27 15 M22 29 L33 18" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <path d="M62 8 L52 14 L62 21" fill="none" stroke="#FF5A5A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  cleanse: (
    <>
      <circle cx="47" cy="17" r="9" fill="#DDF3FF" {...S} />
      <circle cx="56" cy="34" r="5" fill="#DDF3FF" {...S} />
      <circle cx="33" cy="10" r="4.5" fill="#DDF3FF" {...S} />
      <path d="M43 13 C44 11 46 10 48 10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="7" y="31" width="42" height="24" rx="9" fill="#FF8FC0" {...S} />
      <path d="M12 31 C12 27 16 25 20 25 L36 25 C40 25 44 27 44 31" fill="#FFC2DC" {...S} />
      <path d="M18 41 C20 38 22 38 24 41 M32 41 C34 38 36 38 38 41" fill="none" stroke={K} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 47 C26 49 30 49 32 47" fill="none" stroke={K} strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  joker: (
    <>
      <g transform="rotate(10 32 34)">
        <rect x="14" y="12" width="36" height="48" rx="7" fill="#FFFFFF" {...S} />
        <path d="M25 33 C25 25 39 25 39 32 C39 37 32 38 32 43" fill="none" stroke="#A66BFF" strokeWidth="5" strokeLinecap="round" />
        <circle cx="32" cy="50" r="3" fill="#A66BFF" />
      </g>
      <path d="M12 16 C14 6 22 4 26 12 C28 4 36 2 38 10 C42 4 50 6 50 16 Z" fill="#FF5A5A" {...S} />
      <path d="M26 12 C28 4 36 2 38 10 L38 16 L26 16 Z" fill="#FFB800" />
      <path d="M12 16 C14 6 22 4 26 12 C28 4 36 2 38 10 C42 4 50 6 50 16 Z" fill="none" {...S} />
      <circle cx="12" cy="16" r="3.5" fill="#FFB800" {...S} strokeWidth={2} />
      <circle cx="31" cy="4.5" r="3.5" fill="#FFB800" {...S} strokeWidth={2} />
      <circle cx="50" cy="16" r="3.5" fill="#FFB800" {...S} strokeWidth={2} />
    </>
  ),
  spin: (
    <>
      <path d="M8 26 C4 36 10 46 20 50 M56 38 C60 28 54 18 44 14" fill="none" stroke="#1FE4CE" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="4 5" />
      <rect x="28" y="4" width="8" height="12" rx="3" fill="#B98552" {...S} />
      <path d="M12 26 C12 18 52 18 52 26 C52 36 40 44 32 58 C24 44 12 36 12 26 Z" fill="#FF5A5A" {...S} />
      <path d="M14 30 C22 33 42 33 50 30" fill="none" stroke="#FFB800" strokeWidth="5" />
      <path d="M19 39 C26 41 38 41 45 39" fill="none" stroke="#FFB800" strokeWidth="4" />
      <path d="M12 26 C12 18 52 18 52 26 C52 36 40 44 32 58 C24 44 12 36 12 26 Z" fill="none" {...S} />
    </>
  ),
  monster: (
    <>
      <path d="M18 16 L14 4 L25 12 Z M46 16 L50 4 L39 12 Z" fill="#FFB800" {...S} strokeWidth={2.5} />
      <path d="M10 44 C6 28 16 11 32 11 C48 11 58 28 54 44 C52 53 44 58 32 58 C20 58 12 53 10 44 Z" fill="#7B5CFF" {...S} />
      <circle cx="32" cy="29" r="10" fill="#FFFFFF" {...S} />
      <circle cx="34" cy="31" r="4.5" fill={K} />
      <path d="M17 41 C24 52 40 52 47 41 Z" fill="#2A1640" {...S} strokeWidth={2.5} />
      <path d="M20 42 L23 47 L26 43 L29 48 L32 43 L35 48 L38 43 L41 47 L44 42" fill="#FFFFFF" stroke={K} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14 24 C15 19 18 16 22 14" fill="none" stroke="#A88BFF" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  quake: (
    <>
      <path d="M6 14 C3 20 3 26 6 32 M58 14 C61 20 61 26 58 32 M10 18 C8 22 8 26 10 30 M54 18 C56 22 56 26 54 30" fill="none" stroke={K} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M14 12 L50 12 L50 30 L14 30 Z" fill="#FF8FC0" {...S} />
      <path d="M14 12 L32 2 L50 12 Z" fill="#FF5A5A" {...S} />
      <rect x="27" y="19" width="10" height="11" fill="#FFF6D6" {...S} strokeWidth={2.5} />
      <path d="M4 40 H60 V58 H4 Z" fill="#7A5442" {...S} />
      <path d="M4 40 H60" stroke="#3CE0A0" strokeWidth="5" />
      <path d="M30 40 L26 47 L33 50 L28 58" fill="none" stroke={K} strokeWidth="3" strokeLinejoin="round" />
    </>
  ),
  runaway: (
    <>
      <path d="M2 24 H12 M0 31 H10 M4 38 H12" stroke={K} strokeWidth="3" strokeLinecap="round" />
      <path d="M26 42 L22 52 L16 54 M40 42 L46 50 L52 48" fill="none" stroke={K} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="14" y="18" width="40" height="26" rx="13" fill="#1FE4CE" {...S} />
      <circle cx="28" cy="29" r="2.6" fill={K} />
      <circle cx="40" cy="29" r="2.6" fill={K} />
      <path d="M30 36 C32 34 36 34 38 36" fill="none" stroke={K} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M52 10 C55 14 56 17 53 19 C50 19 49 16 52 10 Z" fill="#4C8DFF" stroke={K} strokeWidth="1.8" />
    </>
  ),
  snail: (
    <>
      <path d="M6 50 C6 44 14 42 20 42 L52 42 C58 42 60 48 56 52 C54 54 50 54 46 54 L10 54 C7 54 6 52 6 50 Z" fill="#9BE15D" {...S} />
      <path d="M50 42 L54 28 M56 42 L60 30" stroke={K} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="54" cy="27" r="3" fill={K} />
      <circle cx="60" cy="29" r="3" fill={K} />
      <circle cx="30" cy="30" r="17" fill="#FFB800" {...S} />
      <path d="M30 30 C30 26 36 26 36 31 C36 37 26 38 24 31 C22 23 33 18 39 23 C45 29 42 41 32 44" fill="none" stroke="#B27D00" strokeWidth="3" strokeLinecap="round" />
      <path d="M2 30 H8 M1 37 H6" stroke={K} strokeWidth="2.5" strokeLinecap="round" opacity=".35" />
    </>
  ),
  mini: (
    <>
      <rect x="6" y="4" width="52" height="56" rx="10" fill="none" stroke={K} strokeWidth="3" strokeDasharray="5 5" />
      <path d="M12 10 L20 18 M52 10 L44 18 M12 54 L20 46 M52 54 L44 46" stroke={K} strokeWidth="3" strokeLinecap="round" />
      <path d="M16 18 H20 V14 M48 18 H44 V14 M16 46 H20 V50 M48 46 H44 V50" fill="none" stroke={K} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="25" y="22" width="14" height="22" rx="3.5" fill="#26244A" {...S} strokeWidth={2.5} />
      <rect x="27.5" y="25" width="9" height="15" rx="1.5" fill="#1FE4CE" />
    </>
  ),
  mirrorworld: (
    <>
      <path d="M32 4 V60" stroke="#A66BFF" strokeWidth="3" strokeDasharray="4 4" strokeLinecap="round" />
      <text x="17" y="42" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="800" fontSize="30" fill="#4C8DFF" stroke={K} strokeWidth="2" paintOrder="stroke">R</text>
      <g transform="translate(64 0) scale(-1 1)">
        <text x="17" y="42" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="800" fontSize="30" fill="#FF6FB5" stroke={K} strokeWidth="2" paintOrder="stroke">R</text>
      </g>
      <path d="M8 52 C14 58 22 58 26 54 M56 52 C50 58 42 58 38 54" fill="none" stroke={K} strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  timebomb: (
    <>
      <path d="M44 12 C48 6 54 6 56 10" fill="none" {...S} />
      <path d="M57 1 C62 6 61 11 57 13 C53 11 52 6 57 1 Z" fill="#FF8A1F" {...S} strokeWidth={2.5} />
      <circle cx="14" cy="14" r="6" fill="#FFB800" {...S} />
      <circle cx="44" cy="14" r="6" fill="#FFB800" {...S} />
      <circle cx="29" cy="36" r="22" fill="#FF5A5A" {...S} />
      <circle cx="29" cy="36" r="15" fill="#FFFFFF" {...S} strokeWidth={2.5} />
      <path d="M29 36 V26 M29 36 L36 40" stroke={K} strokeWidth="3" strokeLinecap="round" />
      <circle cx="29" cy="36" r="2.4" fill={K} />
      <path d="M18 57 L14 62 M40 57 L44 62" stroke={K} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  bagswap: (
    <>
      <Duo d="M16 14 C22 4 42 4 48 14" color="#1FE4CE" w={4} />
      <path d="M44 8 L52 16 L42 18 Z" fill="#1FE4CE" {...S} strokeWidth={2.5} />
      <path d="M8 30 C8 24 12 22 18 22 L22 22 C28 22 30 24 30 30 L30 54 L8 54 Z" fill="#B98552" {...S} />
      <path d="M13 22 C13 16 25 16 25 22" fill="none" {...S} />
      <rect x="12" y="36" width="14" height="9" rx="2" fill="#D9A55B" {...S} strokeWidth={2.2} />
      <path d="M34 30 C34 24 38 22 44 22 L48 22 C54 22 56 24 56 30 L56 54 L34 54 Z" fill="#A66BFF" {...S} />
      <path d="M39 22 C39 16 51 16 51 22" fill="none" {...S} />
      <rect x="38" y="36" width="14" height="9" rx="2" fill="#CDB0FF" {...S} strokeWidth={2.2} />
    </>
  ),
  teleport: (
    <>
      <path d="M14 60 V16 C14 8 22 4 32 4 C42 4 50 8 50 16 V60 Z" fill="#6B3BC2" {...S} />
      <path d="M20 58 V20 C20 13 25 10 32 10 C39 10 44 13 44 20 V58 Z" fill="#1FE4CE" {...S} strokeWidth={2.5} />
      <path d="M32 34 C32 30 37 30 37 35 C37 41 27 42 26 35 C25 26 37 22 41 30 C44 37 40 48 31 49" fill="none" stroke="#0A5C55" strokeWidth="3" strokeLinecap="round" />
      <circle cx="40" cy="40" r="2" fill="#FFB800" {...S} strokeWidth={1.5} />
      <path d="M8 60 H56" stroke={K} strokeWidth="3.5" strokeLinecap="round" />
    </>
  ),
  alien: (
    <>
      <path d="M40 6 H60 V22 H50 L44 28 L45 22 H40 Z" fill="#FFFFFF" {...S} strokeWidth={2.5} />
      <path d="M44 11 L47 15 L50 11 M52 11 V17 M55 14 H58" fill="none" stroke="#7B5CFF" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20 14 L16 6 M36 14 L40 8" stroke={K} strokeWidth="3" strokeLinecap="round" />
      <circle cx="16" cy="6" r="3" fill="#FF6FB5" {...S} strokeWidth={2} />
      <path d="M28 12 C14 12 6 22 6 34 C6 48 18 60 28 60 C38 60 50 48 50 34 C50 22 42 12 28 12 Z" fill="#9BE15D" {...S} />
      <path d="M12 32 C14 26 22 26 25 34 C22 40 14 40 12 32 Z" fill={K} />
      <path d="M44 32 C42 26 34 26 31 34 C34 40 42 40 44 32 Z" fill={K} />
      <circle cx="17" cy="31" r="1.6" fill="#fff" />
      <circle cx="39" cy="31" r="1.6" fill="#fff" />
      <path d="M24 50 C26 52 30 52 32 50" fill="none" stroke={K} strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  // Kotak skill (hadiah tiap 3 jawaban)
  crate: (
    <>
      <path d="M8 24 L32 14 L56 24 L56 50 L32 60 L8 50 Z" fill="#B98552" {...S} />
      <path d="M8 24 L32 34 L56 24 L32 14 Z" fill="#D9A55B" {...S} />
      <path d="M32 34 V60" stroke={K} strokeWidth="3" />
      <path d="M8 37 L32 47 L56 37" fill="none" stroke={K} strokeWidth="2.5" />
      <path d="M20 19 L44 29" stroke="#FFB800" strokeWidth="5" />
      <path d="M44 19 L20 29" stroke="#FFB800" strokeWidth="5" />
      <path d="M28 6 L30 1 M36 6 L34 1 M22 9 L18 5 M42 9 L46 5" stroke="#FFB800" strokeWidth="3" strokeLinecap="round" />
    </>
  )
};

export function SkillGlyph({ id }) {
  return GLYPHS[id] || null;
}

export default function SkillIcon({ id, size = 40, className = '', title }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {GLYPHS[id]}
    </svg>
  );
}
