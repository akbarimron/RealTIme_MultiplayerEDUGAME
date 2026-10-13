import React, { useEffect, useMemo, useRef, useState } from 'react';
import SkillIcon from '../art/SkillIcon';
import { sounds } from '../../utils/audio';

// Lapisan gangguan di layar HP. Semua posisinya absolute di dalam bingkai HP,
// jadi di mode uji coba dua HP, gangguan tidak bocor ke HP sebelah.

// ---------- pengubah teks ----------

const ZALGO = Array.from({ length: 0x36f - 0x300 + 1 }, (_, i) => String.fromCharCode(0x300 + i));
const NOISE = '█▓▒░#%@&$!?<>/\\|01';
const rand = (list) => list[Math.floor(Math.random() * list.length)];

// Hack: huruf diganti simbol + tanda diakritik bertumpuk (teks "zalgo"), diacak ulang tiap render
export function hackText(str) {
  return String(str).split('').map((c) => {
    if (c === ' ') return Math.random() < 0.15 ? '_' : ' ';
    let out = Math.random() < 0.4 ? rand(NOISE) : c;
    const marks = Math.random() < 0.7 ? 1 + Math.floor(Math.random() * 4) : 0;
    for (let i = 0; i < marks; i++) out += rand(ZALGO);
    return out;
  }).join('');
}

const ALIEN = 'ᐊᐅᐸᑐᑕᑭᒋᒥᓂᓯᔨᕆᕼᖃᖕᗅᗩᘔ᙭⏃⏚⟒⊑⟟⋔⌇⍜⏁⎍☊⌰';
// Bahasa Alien: setiap huruf diganti rune tetap (konsisten, tapi tidak terbaca)
export function alienText(str) {
  return String(str).replace(/[a-z]/gi, (c) => ALIEN[(c.toLowerCase().charCodeAt(0) - 97) % ALIEN.length]);
}

// ---------- pelacak jari (untuk senter & gosok kabut) ----------

export function usePointerTrack(rootRef, active, onMove) {
  const cb = useRef(onMove);
  cb.current = onMove;
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !active) return undefined;
    const handle = (x, y) => {
      const r = el.getBoundingClientRect();
      cb.current(x - r.left, y - r.top);
    };
    const onPointer = (e) => handle(e.clientX, e.clientY);
    const onTouch = (e) => { const t = e.touches[0]; if (t) handle(t.clientX, t.clientY); };
    el.addEventListener('pointermove', onPointer);
    el.addEventListener('pointerdown', onPointer);
    el.addEventListener('touchmove', onTouch, { passive: true });
    el.addEventListener('touchstart', onTouch, { passive: true });
    return () => {
      el.removeEventListener('pointermove', onPointer);
      el.removeEventListener('pointerdown', onPointer);
      el.removeEventListener('touchmove', onTouch);
      el.removeEventListener('touchstart', onTouch);
    };
  }, [rootRef, active]);
}

// ---------- kabut: harus digosok ----------

export function FogLayer({ rootRef, ratio }) {
  const canvas = useRef(null);
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const { width, height } = c.getBoundingClientRect();
    c.width = width * dpr;
    c.height = height * dpr;
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.fillStyle = 'rgba(232,236,246,0.97)';
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = 30 + Math.random() * 70;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(255,255,255,0.9)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  usePointerTrack(rootRef, true, (x, y) => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    const g = ctx.createRadialGradient(x, y, 0, x, y, 42);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  return (
    <div className="pointer-events-none absolute inset-0 z-[50]" style={{ opacity: Math.min(1, 0.25 + ratio * 1.4) }}>
      <canvas ref={canvas} className="h-full w-full" />
      <p className="absolute inset-x-0 top-28 text-center text-sm font-extrabold text-ink">Kabut tebal! Gosok layar pakai jari</p>
    </div>
  );
}

// ---------- tinta: tiap noda dilap dua kali ----------

const SPLAT = 'M50 8 C62 6 66 20 74 18 C86 15 92 30 84 40 C96 46 94 62 82 64 C86 78 72 88 62 80 C58 94 40 94 38 82 C26 90 12 80 18 68 C4 64 4 48 16 44 C8 32 18 18 30 24 C32 12 42 8 50 8 Z';

export function InkLayer() {
  const splats = useMemo(() => Array.from({ length: 9 }, (_, i) => ({
    id: i,
    x: -10 + Math.random() * 70,
    y: 12 + Math.random() * 70,
    size: 160 + Math.random() * 100,
    rot: `${Math.floor(Math.random() * 360)}deg`
  })), []);
  const [wipes, setWipes] = useState({});
  return (
    <div className="pointer-events-none absolute inset-0 z-[50] overflow-hidden">
      {splats.map((s, i) => {
        const w = wipes[s.id] || 0;
        return (
          <button
            key={s.id}
            type="button"
            aria-label={w ? 'Lap sekali lagi' : 'Lap tinta'}
            onClick={() => { setWipes((m) => ({ ...m, [s.id]: (m[s.id] || 0) + 1 })); sounds.playSplat(); }}
            className={`pointer-events-auto absolute transition-[opacity,transform] duration-200 ${w >= 2 ? 'splat-wiped' : 'splat'}`}
            style={{
              left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, '--rot': s.rot,
              opacity: w === 1 ? 0.6 : 1,
              animationDelay: w >= 2 ? '0ms' : `${i * 60}ms`
            }}
          >
            <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
              <path d={SPLAT} fill="#16122B" />
              <circle cx="88" cy="88" r="7" fill="#16122B" />
              <circle cx="8" cy="92" r="5" fill="#16122B" />
              <path d="M30 96 C30 100 26 100 26 96" fill="#16122B" />
              <path d="M36 30 C40 26 46 25 50 26" fill="none" stroke="#3A3360" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </button>
        );
      })}
      <p className="absolute inset-x-0 bottom-24 text-center text-sm font-extrabold text-ink">Ketuk tiap noda dua kali untuk mengelap</p>
    </div>
  );
}

// ---------- bebek karet raksasa ----------

export function DuckLayer() {
  const ducks = useMemo(() => Array.from({ length: 9 }, (_, i) => ({
    id: i,
    top: 8 + (i % 6) * 14 + Math.random() * 5,
    dur: `${6.5 + Math.random() * 3.5}s`,
    delay: `${-Math.random() * 6}s`,
    size: 120 + Math.random() * 70,
    rev: i % 3 === 2
  })), []);
  const [hits, setHits] = useState({});

  // kwek kwek berkala selama efek aktif
  useEffect(() => {
    const id = setInterval(() => sounds.playSqueak(), 1300);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-[50] overflow-hidden">
      {ducks.map((d) => {
        const h = hits[d.id] || 0;
        return (
          <div key={d.id} className={`duck absolute ${d.rev ? 'duck-rev' : ''}`} style={{ top: `${d.top}%`, '--dur': d.dur, '--delay': d.delay }}>
            <button
              type="button"
              aria-label={h ? 'Tekan sekali lagi' : 'Usir bebek'}
              onClick={() => { setHits((m) => ({ ...m, [d.id]: (m[d.id] || 0) + 1 })); sounds.playSqueak(); }}
              className={`pointer-events-auto block ${h >= 2 ? 'duck-gone' : ''}`}
              style={{ transform: h === 1 ? 'scale(0.8, 0.6)' : undefined }}
            >
              <span className="duck-body block" style={{ transform: d.rev ? 'scaleX(-1)' : undefined }}>
                <SkillIcon id="ducks" size={d.size} />
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ---------- mati lampu ----------

export function BlackoutLayer({ rootRef }) {
  const light = useRef(null);
  usePointerTrack(rootRef, true, (x, y) => {
    light.current?.style.setProperty('--x', `${x}px`);
    light.current?.style.setProperty('--y', `${y}px`);
  });
  return (
    <div
      ref={light}
      className="pointer-events-none absolute inset-0 z-[51]"
      style={{
        '--x': '50%',
        '--y': '45%',
        background: 'radial-gradient(circle 70px at var(--x) var(--y), transparent 0 38px, rgba(3,3,10,0.985) 76px)'
      }}
    >
      <p className="absolute inset-x-0 top-24 text-center text-sm font-bold text-white/60">Mati lampu! Geser jarimu untuk menyenter</p>
    </div>
  );
}

// ---------- hack: layar glitch ----------

export function HackLayer() {
  const bars = Array.from({ length: 6 }, (_, i) => ({
    i,
    top: Math.random() * 100,
    h: 3 + Math.random() * 18,
    x: (Math.random() - 0.5) * 40,
    c: ['rgba(255,111,181,0.35)', 'rgba(31,228,206,0.35)', 'rgba(14,15,36,0.55)'][i % 3]
  }));
  return (
    <div className="pointer-events-none absolute inset-0 z-[49] overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0 2px, transparent 2px 4px)' }} />
      <div className="absolute inset-0 mix-blend-multiply" style={{ background: 'rgba(60,224,160,0.18)' }} />
      {bars.map((b) => (
        <div key={b.i} className="absolute inset-x-0" style={{ top: `${b.top}%`, height: b.h, background: b.c, transform: `translateX(${b.x}px)` }} />
      ))}
      <p className="text-glitch absolute inset-x-0 top-[18%] text-center font-mono text-lg font-bold text-[#B0246A]">{hackText('SISTEM DIBOBOL')}</p>
    </div>
  );
}

// ---------- siput lemot ----------

export function SnailLayer({ lagging }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[49] overflow-hidden">
      <div className="snail-crawl absolute bottom-24"><SkillIcon id="snail" size={70} /></div>
      {lagging && (
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-ink/85 px-4 py-2 text-sm font-bold text-white">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Sabar, HP-mu lemot...
        </div>
      )}
    </div>
  );
}

// ---------- monster: harus dikalahkan ----------

const MONSTER_HP = 12;

export function MonsterLayer({ secondsLeft, onDefeat }) {
  const [hp, setHp] = useState(MONSTER_HP);
  const [pos, setPos] = useState({ x: 50, y: 48 });
  const [hitKey, setHitKey] = useState(0);
  const [gone, setGone] = useState(false);

  const hit = () => {
    if (gone) return;
    const next = hp - 1;
    setHp(next);
    setHitKey((k) => k + 1);
    sounds.playSplat();
    if (next <= 0) {
      setGone(true);
      sounds.playPop();
      setTimeout(onDefeat, 350);
      return;
    }
    // monster melompat menghindar setelah dipukul
    setPos({ x: 22 + Math.random() * 56, y: 30 + Math.random() * 40 });
  };

  return (
    <div className="absolute inset-0 z-[54] flex flex-col items-center bg-[#1C0F38]/92 px-5 pt-20 text-center text-white" role="dialog" aria-label="Monster Bug menghalangi layar">
      <p className="text-2xl font-extrabold">Monster Bug menyerang!</p>
      <p className="mt-1 text-sm text-muted">Pukul monsternya sampai kalah. Baru bisa menjawab lagi.</p>
      <div className="mt-4 flex gap-1" aria-label={`Nyawa monster ${hp} dari ${MONSTER_HP}`}>
        {Array.from({ length: MONSTER_HP }, (_, i) => (
          <span key={i} className={`h-3 w-4 rounded-sm ${i < hp ? 'bg-coral' : 'bg-white/15'}`} />
        ))}
      </div>
      <button
        type="button"
        onClick={hit}
        aria-label="Pukul monster"
        className={`absolute -translate-x-1/2 -translate-y-1/2 transition-[left,top] duration-200 ease-snap ${gone ? 'duck-gone' : ''}`}
        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      >
        <span key={`m-${hitKey}`} className={`block ${hitKey ? 'monster-hit' : 'monster-idle'}`}>
          <SkillIcon id="monster" size={190} />
        </span>
        {hitKey > 0 && !gone && (
          <span key={`d${hitKey}`} className="icon-pop absolute -top-2 left-1/2 text-2xl font-extrabold text-gold">-1</span>
        )}
      </button>
      <p className="absolute bottom-6 inset-x-0 text-xs text-muted">Monster pergi sendiri dalam {secondsLeft} detik</p>
    </div>
  );
}

// ---------- bom waktu ----------

export function TimeBombBar({ secondsLeft }) {
  useEffect(() => {
    const id = setInterval(() => sounds.playTick(), secondsLeft <= 8 ? 400 : 1000);
    return () => clearInterval(id);
  }, [secondsLeft <= 8]);
  const urgent = secondsLeft <= 8;
  return (
    <div className={`mx-4 mt-3 flex items-center gap-3 rounded-[20px] p-3 ${urgent ? 'bg-coral' : 'bg-[#FFE3E3]'}`} role="alert">
      <span className={urgent ? 'bomb-shake-fast' : 'bomb-shake'}><SkillIcon id="timebomb" size={46} /></span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold leading-tight">Bom waktu terpasang di HP-mu!</p>
        <p className="text-xs font-semibold">Jawab benar sebelum meledak, atau turun 1 node.</p>
      </div>
      <span className="text-3xl font-extrabold tabular-nums">{secondsLeft}</span>
    </div>
  );
}

export function ExplodeFlash() {
  return <div className="boom-screen pointer-events-none absolute inset-0 z-[57]" />;
}
