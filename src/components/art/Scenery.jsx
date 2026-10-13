import React, { useId, useMemo } from 'react';

// Potongan ilustrasi gaya platformer: pulau melayang (rumput mint + batu kerikil),
// awan, bulan, portal. Semua dibuat dari bentuk SVG dengan RNG ber-seed agar stabil.

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ROCK_OUT = '#24170F';
const STONES = ['#6B4A3A', '#7A5442', '#5C3E30', '#835C47'];

// Pulau melayang: tutup rumput dengan tetesan + badan batu kerikil + sulur
export function Island({ x, y, w, depth = 90, seed = 1, vines = 3, taper = 0.55, grass = true }) {
  const uid = useId().replace(/:/g, '');
  const geo = useMemo(() => {
    const r = rng(seed);
    // sisi bawah bergelombang, makin ke tengah makin dalam
    const pts = [];
    const steps = Math.max(6, Math.round(w / 40));
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const px = x + u * w;
      const bulge = Math.sin(u * Math.PI);
      const py = y + 10 + depth * Math.pow(bulge, taper) * (0.8 + r() * 0.3);
      pts.push([px, py]);
    }
    let under = `M${x} ${y + 4} `;
    pts.forEach(([px, py], i) => {
      if (i === 0) under += `L${px} ${py} `;
      else {
        const [qx, qy] = pts[i - 1];
        under += `Q${(qx + px) / 2 + (r() - 0.5) * 10} ${Math.max(qy, py) + 10} ${px} ${py} `;
      }
    });
    under += `L${x + w} ${y + 4} Z`;

    const stones = [];
    const maxY = y + depth + 20;
    for (let sy = y + 12; sy < maxY; sy += 17) {
      for (let sx = x - 6; sx < x + w + 6; sx += 24) {
        stones.push({
          cx: sx + (r() - 0.5) * 10 + ((Math.round((sy - y) / 17) % 2) * 12),
          cy: sy + (r() - 0.5) * 6,
          rx: 9 + r() * 4,
          ry: 6.5 + r() * 2.5,
          rot: (r() - 0.5) * 40,
          fill: STONES[Math.floor(r() * STONES.length)]
        });
      }
    }

    // tutup rumput: tepi bawah dengan tetesan
    const gy = y + 8;
    let cap = `M${x - 8} ${y - 4} Q${x + w / 2} ${y - 14} ${x + w + 8} ${y - 4} L${x + w + 8} ${gy} `;
    let cx = x + w + 8;
    while (cx > x - 8) {
      const seg = 16 + r() * 18;
      const nx = Math.max(x - 8, cx - seg);
      const drip = r() < 0.45 ? 10 + r() * 14 : 3 + r() * 4;
      cap += `C${cx - 2} ${gy + drip} ${nx + 2} ${gy + drip} ${nx} ${gy} `;
      cx = nx;
    }
    cap += 'Z';

    const vineList = Array.from({ length: vines }, () => {
      const vx = x + 20 + r() * (w - 40);
      const len = 40 + r() * 90;
      const sway = (r() - 0.5) * 30;
      return { vx, len, sway, leaf: r() };
    });

    return { under, stones, cap, vineList };
  }, [x, y, w, depth, seed, vines, taper]);

  return (
    <g>
      <defs>
        <clipPath id={`clip-${uid}`}>
          <path d={geo.under} />
        </clipPath>
      </defs>
      <path d={geo.under} fill="#3D2A1D" />
      <g clipPath={`url(#clip-${uid})`}>
        {geo.stones.map((s, i) => (
          <ellipse
            key={i}
            cx={s.cx}
            cy={s.cy}
            rx={s.rx}
            ry={s.ry}
            transform={`rotate(${s.rot} ${s.cx} ${s.cy})`}
            fill={s.fill}
            stroke={ROCK_OUT}
            strokeWidth="2.5"
          />
        ))}
      </g>
      <path d={geo.under} fill="none" stroke={ROCK_OUT} strokeWidth="3.5" strokeLinejoin="round" />
      {geo.vineList.map((v, i) => (
        <g key={i}>
          <path
            d={`M${v.vx} ${y + 6} C${v.vx + v.sway} ${y + v.len * 0.4} ${v.vx - v.sway} ${y + v.len * 0.7} ${v.vx + v.sway * 0.4} ${y + v.len}`}
            fill="none" stroke="#0B3B2B" strokeWidth="6" strokeLinecap="round"
          />
          <path
            d={`M${v.vx} ${y + 6} C${v.vx + v.sway} ${y + v.len * 0.4} ${v.vx - v.sway} ${y + v.len * 0.7} ${v.vx + v.sway * 0.4} ${y + v.len}`}
            fill="none" stroke="#2BC489" strokeWidth="3" strokeLinecap="round"
          />
        </g>
      ))}
      {grass && (
        <>
          <path d={geo.cap} fill="#3CE0A0" stroke="#0B3B2B" strokeWidth="3.5" strokeLinejoin="round" />
          <path
            d={`M${x + 6} ${y - 4} Q${x + w / 2} ${y - 12} ${x + w - 6} ${y - 4}`}
            fill="none" stroke="#8AF7C9" strokeWidth="4" strokeLinecap="round"
          />
        </>
      )}
    </g>
  );
}

// Tumpukan awan putih (tanpa garis tepi, bayangan biru keabu-abuan)
export function CloudBank({ x, y, w, seed = 7, height = 700, rMin = 34, rMax = 80 }) {
  const puffs = useMemo(() => {
    const r = rng(seed);
    const list = [];
    let cx = x;
    while (cx < x + w) {
      const rad = rMin + r() * (rMax - rMin);
      list.push({ cx, cy: y + (r() - 0.3) * 26, r: rad });
      cx += rad * (0.9 + r() * 0.5);
    }
    return list;
  }, [x, y, w, seed, rMin, rMax]);
  return (
    <g>
      {puffs.map((p, i) => <circle key={`s${i}`} cx={p.cx - 6} cy={p.cy + 10} r={p.r} fill="#C9D3EC" />)}
      <rect x={x - 60} y={y + 20} width={w + 120} height={height} fill="#C9D3EC" />
      {puffs.map((p, i) => <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="#FFFFFF" />)}
      <rect x={x - 60} y={y + 30} width={w + 120} height={height} fill="#FFFFFF" />
    </g>
  );
}

export function Moon({ cx, cy, r }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#D5F9EB" />
      <circle cx={cx - r * 0.3} cy={cy + r * 0.25} r={r * 0.16} fill="#BDEFDC" />
      <circle cx={cx + r * 0.35} cy={cy - r * 0.2} r={r * 0.1} fill="#BDEFDC" />
      <circle cx={cx + r * 0.15} cy={cy + r * 0.5} r={r * 0.07} fill="#BDEFDC" />
    </g>
  );
}

export function Stars({ x, y, w, h, count = 40, seed = 3 }) {
  const list = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => ({
      cx: x + r() * w,
      cy: y + r() * h,
      r: r() < 0.15 ? 2.4 : 1.2 + r(),
      tw: r() < 0.2,
      d: (r() * 4).toFixed(2)
    }));
  }, [x, y, w, h, count, seed]);
  return (
    <g>
      {list.map((s, i) => (
        <circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="#FFFFFF"
          opacity={s.tw ? 1 : 0.55}
          className={s.tw ? 'twinkle' : undefined}
          style={s.tw ? { animationDelay: `${s.d}s` } : undefined}
        />
      ))}
    </g>
  );
}

// Gerbang kuno di puncak (tujuan akhir)
export function Portal({ cx, base, scale = 1 }) {
  const uid = useId().replace(/:/g, '');
  const stones = [];
  const n = 13;
  for (let i = 0; i < n; i++) {
    const a = Math.PI + (i / (n - 1)) * Math.PI;
    stones.push({ x: Math.cos(a) * 46, y: Math.sin(a) * 52 - 40, rot: (a * 180) / Math.PI + 90 });
  }
  return (
    <g transform={`translate(${cx} ${base}) scale(${scale})`}>
      <defs>
        <radialGradient id={`pg-${uid}`} cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#B9FFF6" />
          <stop offset="60%" stopColor="#1FE4CE" />
          <stop offset="100%" stopColor="#0E9C90" />
        </radialGradient>
      </defs>
      <ellipse cx="0" cy="-50" rx="80" ry="86" fill="#1FE4CE" opacity=".13" className="portal-breathe" />
      <path d="M-34 0 L-34 -40 A34 40 0 0 1 34 -40 L34 0 Z" fill={`url(#pg-${uid})`} stroke="#0A5C55" strokeWidth="3" />
      <path d="M-22 0 L-22 -38 A22 26 0 0 1 22 -38 L22 0" fill="none" stroke="#0B8A80" strokeWidth="3" />
      <path d="M-11 0 L-11 -36 A11 13 0 0 1 11 -36 L11 0" fill="none" stroke="#0B8A80" strokeWidth="3" />
      <path d="M0 -62 L7 -52 L0 -42 L-7 -52 Z" fill="#B9FFF6" stroke="#0A5C55" strokeWidth="2.5" />
      <rect x="-56" y="-44" width="18" height="44" rx="4" fill="#5E8A8A" stroke="#132B2B" strokeWidth="3" />
      <rect x="38" y="-44" width="18" height="44" rx="4" fill="#5E8A8A" stroke="#132B2B" strokeWidth="3" />
      {stones.map((s, i) => (
        <rect
          key={i}
          x={s.x - 10}
          y={s.y - 8}
          width="20"
          height="16"
          rx="4"
          transform={`rotate(${s.rot} ${s.x} ${s.y})`}
          fill={i % 2 ? '#6F9C9A' : '#5E8A8A'}
          stroke="#132B2B"
          strokeWidth="3"
        />
      ))}
      <rect x="-62" y="-4" width="124" height="10" rx="4" fill="#4F7676" stroke="#132B2B" strokeWidth="3" />
    </g>
  );
}

export function Gem({ x, y, size = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <g className="gem-bob">
        <path d="M0 -20 L13 0 L0 22 L-13 0 Z" fill="#FFC93C" stroke="#5A3D00" strokeWidth="3" strokeLinejoin="round" />
        <path d="M0 -20 L0 22 L-13 0 Z" fill="#FFE07A" />
        <path d="M0 -20 L13 0 L0 22 L-13 0 Z" fill="none" stroke="#5A3D00" strokeWidth="3" strokeLinejoin="round" />
      </g>
    </g>
  );
}

// Lapisan bukit ungu jauh + air beriak, seperti latar game platformer malam
export function FarHills({ y = 540, from = -500, to = 1700 }) {
  const shapes = useMemo(() => {
    const r = rng(11);
    let back = `M${from} ${y + 160} L${from} ${y + 40} `;
    for (let x = from; x <= to; x += 110) back += `Q${x + 55} ${y - 30 - r() * 60} ${x + 110} ${y + 30 + r() * 20} `;
    back += `L${to} ${y + 160} Z`;
    let mid = `M${from} ${y + 170} L${from} ${y + 90} `;
    for (let x = from; x <= to; x += 80) mid += `Q${x + 40} ${y + 30 - r() * 40} ${x + 80} ${y + 80 + r() * 16} `;
    mid += `L${to} ${y + 170} Z`;
    const shrooms = Array.from({ length: 9 }, () => ({ x: from + 200 + r() * (to - from - 400), h: 14 + r() * 16 }));
    const ripples = Array.from({ length: 16 }, () => ({ x: from + r() * (to - from), w: 30 + r() * 70, dy: r() * 40 }));
    return { back, mid, shrooms, ripples };
  }, [y, from, to]);
  return (
    <g>
      <path d={shapes.back} fill="#2A1E5C" />
      <path d={shapes.mid} fill="#3A2A7E" />
      {shapes.shrooms.map((m, i) => (
        <g key={i} transform={`translate(${m.x} ${y + 92})`}>
          <path d={`M-2 0 L-2 ${-m.h} L2 ${-m.h} L2 0 Z`} fill="#8A64E8" />
          <path d={`M-10 ${-m.h} C-10 ${-m.h - 12} 10 ${-m.h - 12} 10 ${-m.h} Z`} fill="#C35BFF" />
        </g>
      ))}
      <rect x={from} y={y + 120} width={to - from} height="120" fill="#4A35B0" />
      {shapes.ripples.map((p, i) => (
        <path key={i} d={`M${p.x} ${y + 132 + p.dy} h${p.w}`} stroke="#8C7CF0" strokeWidth="3" strokeLinecap="round" />
      ))}
    </g>
  );
}
