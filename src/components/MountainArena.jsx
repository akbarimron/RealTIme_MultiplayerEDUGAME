import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { SUMMIT, TEAMS, teamMeta, isActive, eventParts } from '../game/engine';
import { SKILLS, TIMED_EFFECTS } from '../game/skills';
import { Island, CloudBank, Moon, Stars, Portal, Gem, FarHills } from './art/Scenery';
import { SkillGlyph } from './art/SkillIcon';
import ClimberFace from './art/ClimberFace';
import { sounds } from '../utils/audio';

// Koordinat panggung (viewBox). Tali tiap kelompok tergantung dari pulau puncak.
const VB_W = 1200;
const VB_H = 760;
const LANE_X = { 1: 420, 2: 510, 3: 600, 4: 690, 5: 780 };
const BASE_Y = 680;          // posisi pinggang di node 0
const STEP = 45;             // jarak antar node
const ISLAND_Y = 160;        // permukaan rumput pulau puncak
const STAND_Y = ISLAND_Y - 27;
const ROPE_TOP = 206;
const nodeY = (n) => BASE_Y - n * STEP;
const knotY = (n) => nodeY(n) - 22;

const K = '#0E0F24';
const PANTS = '#2B3A67';

const SKILL_TINT = {
  ink: '#A66BFF', fog: '#EEF1F8', flip: '#1FE4CE', blackout: '#4A4466', ducks: '#FFD84D',
  freeze: '#9EDCFF', hack: '#3CE0A0', banana: '#FFD84D', steal: '#D9A55B', bomb: '#FF8A1F',
  snip: '#FF5A5A', swap: '#1FE4CE', magnet: '#FF5A5A', chaos: '#FFFFFF', spin: '#FFB800',
  quake: '#7A5442', mini: '#1FE4CE', mirrorworld: '#A66BFF', alien: '#9BE15D', monster: '#7B5CFF',
  runaway: '#1FE4CE', snail: '#9BE15D', timebomb: '#FF5A5A', bagswap: '#A66BFF', joker: '#FFB800'
};

function joint(ax, ay, bx, by, len, cap, side) {
  const dx = bx - ax;
  const dy = by - ay;
  const d = Math.hypot(dx, dy) || 1;
  const h = Math.min(cap, Math.sqrt(Math.max(0, (len / 2) ** 2 - (d / 2) ** 2)));
  let px = -dy / d;
  let py = dx / d;
  if (px * side < 0) { px = -px; py = -py; }
  return [(ax + bx) / 2 + px * h, (ay + by) / 2 + py * h];
}

const MOUTH = {
  smile: 'M-5 -40 C-2 -36.5 2 -36.5 5 -40',
  grin: 'M-6 -41 C-3 -35 3 -35 6 -41 Z',
  o: 'M-2.6 -39.5 a2.6 3.2 0 1 0 5.2 0 a2.6 3.2 0 1 0 -5.2 0',
  wavy: 'M-5 -39 L-2.5 -40.5 L0 -38.8 L2.5 -40.5 L5 -39'
};

function ClimberRig({ team, now, register }) {
  const m = teamMeta(team.id);
  const fx = team.effects || {};
  const on = (k) => isActive(fx[k], now);
  const reg = (part) => (el) => register(team.id, part, el);
  const activeIcons = TIMED_EFFECTS.filter((k) => on(k) && k !== 'timebomb');
  if (team.shield) activeIcons.unshift('shield');

  return (
    <g ref={reg('root')}>
      {team.shield && (
        <circle className="shield-bubble" cx="0" cy="-26" r="48" fill="#FFB800" fillOpacity=".14" stroke="#FFB800" strokeWidth="3" />
      )}
      <g ref={reg('body')} className={on('hack') ? 'svg-glitch' : undefined}>
        {/* kaki */}
        <polyline ref={reg('legLk')} fill="none" stroke={K} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <polyline ref={reg('legL')} fill="none" stroke={PANTS} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <polyline ref={reg('legRk')} fill="none" stroke={K} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <polyline ref={reg('legR')} fill="none" stroke={PANTS} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse ref={reg('shoeL')} rx="6" ry="4" fill="#3D2A1D" stroke={K} strokeWidth="2.5" />
        <ellipse ref={reg('shoeR')} rx="6" ry="4" fill="#3D2A1D" stroke={K} strokeWidth="2.5" />
        {/* badan */}
        <rect x="-12" y="-33" width="24" height="32" rx="10" fill={m.color} stroke={K} strokeWidth="3" />
        <path d="M0 -31 V-12" stroke={m.dark} strokeWidth="2" />
        <path d="M-12 -9 H12" stroke="#2A2340" strokeWidth="4" />
        <circle cx="0" cy="-9" r="3" fill="#FFB800" stroke={K} strokeWidth="1.5" />
        {/* lengan */}
        <polyline ref={reg('armLk')} fill="none" stroke={K} strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round" />
        <polyline ref={reg('armL')} fill="none" stroke={m.color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <polyline ref={reg('armRk')} fill="none" stroke={K} strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round" />
        <polyline ref={reg('armR')} fill="none" stroke={m.color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        {/* tangan di tali: digambar sebelum kepala, jadi saat lewat depan wajah ia tertutup kepala */}
        <circle ref={reg('handL')} r="4.2" fill={m.skin} stroke={K} strokeWidth="2.5" />
        <circle ref={reg('handR')} r="4.2" fill={m.skin} stroke={K} strokeWidth="2.5" />
        {/* kepala */}
        <circle cx="-15" cy="-46" r="4" fill={m.skin} stroke={K} strokeWidth="2.5" />
        <circle cx="15" cy="-46" r="4" fill={m.skin} stroke={K} strokeWidth="2.5" />
        <circle cx="0" cy="-47" r="15.5" fill={m.skin} stroke={K} strokeWidth="3" />
        <path d="M-16.5 -49 C-16.5 -61 -9 -67 0 -67 C9 -67 16.5 -61 16.5 -49 Z" fill={m.color} stroke={K} strokeWidth="3" strokeLinejoin="round" />
        <path d="M-12 -55 C-10 -60 -6 -63 -2 -64" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M-19 -49 H19" stroke={K} strokeWidth="3.5" strokeLinecap="round" />
        <rect x="-4.5" y="-62.5" width="9" height="7" rx="2.5" fill="#FFF6D6" stroke={K} strokeWidth="2" />
        <ellipse ref={reg('eyeL')} cx="-5.5" cy="-44" rx="2.3" ry="3" fill={K} />
        <ellipse ref={reg('eyeR')} cx="5.5" cy="-44" rx="2.3" ry="3" fill={K} />
        <ellipse cx="-10" cy="-39" rx="2.8" ry="1.7" fill="#FF7E95" opacity=".6" />
        <ellipse cx="10" cy="-39" rx="2.8" ry="1.7" fill="#FF7E95" opacity=".6" />
        <path ref={reg('mouth')} d={MOUTH.smile} fill={K} fillOpacity="0" stroke={K} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        {on('ink') && (
          <path
            d="M-9 -54 C-3 -60 6 -58 9 -52 C14 -50 13 -44 9 -42 C11 -36 5 -33 1 -37 C-1 -31 -7 -33 -6 -39 C-12 -39 -14 -46 -9 -48 C-12 -50 -12 -53 -9 -54 Z"
            fill="#16122B"
          />
        )}
      </g>
      {on('fog') && (
        <g className="fog-drift" opacity=".92">
          <circle cx="-16" cy="-52" r="13" fill="#EEF1F8" />
          <circle cx="2" cy="-60" r="15" fill="#EEF1F8" />
          <circle cx="18" cy="-48" r="12" fill="#EEF1F8" />
          <circle cx="0" cy="-42" r="12" fill="#EEF1F8" />
        </g>
      )}
      {on('blackout') && <circle cx="0" cy="-38" r="38" fill="#05060F" opacity=".85" />}
      {on('monster') && (
        <g transform="translate(26 -40)">
          <g className="monster-bob">
            <svg x="-20" y="-20" width="40" height="40" viewBox="0 0 64 64"><SkillGlyph id="monster" /></svg>
          </g>
        </g>
      )}
      {on('timebomb') && (
        <g transform="translate(-34 -100)">
          <g className="bomb-shake">
            <svg x="-15" y="-15" width="30" height="30" viewBox="0 0 64 64"><SkillGlyph id="timebomb" /></svg>
          </g>
          <text x="0" y="28" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="800" fontSize="14" fill="#FF5A5A" stroke={K} strokeWidth="3" paintOrder="stroke">
            {Math.max(0, Math.ceil((fx.timebomb - now) / 1000))}
          </text>
        </g>
      )}
      {on('freeze') && (
        <g>
          <rect x="-30" y="-78" width="60" height="112" rx="12" fill="#9EDCFF" fillOpacity=".5" stroke="#DDF3FF" strokeWidth="3" />
          <path d="M-20 -66 L-12 -74 M-20 -52 L-4 -68" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {/* label kelompok (tidak ikut terbalik) */}
      <g transform="translate(0 -96)">
        <rect x="-17" y="-11" width="34" height="22" rx="11" fill={m.color} stroke={K} strokeWidth="2.5" />
        <text x="0" y="5" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="800" fontSize="13" fill={K}>
          {m.short}
        </text>
      </g>
      {activeIcons.length > 0 && (
        <g transform={`translate(${-((activeIcons.length - 1) * 24) / 2} -124)`}>
          {activeIcons.map((id, i) => (
            <svg key={id} x={i * 24 - 11} y="-11" width="22" height="22" viewBox="0 0 64 64">
              <SkillGlyph id={id} />
            </svg>
          ))}
        </g>
      )}
      {team.hitKey && (
        <g key={team.hitKey} className="dizzy-stars" transform="translate(0 -70)">
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              className={`dizzy-star dizzy-star-${i}`}
              d="M0 -6 L1.8 -1.8 L6 0 L1.8 1.8 L0 6 L-1.8 1.8 L-6 0 L-1.8 -1.8 Z"
              fill="#FFC93C"
              stroke={K}
              strokeWidth="1.5"
            />
          ))}
        </g>
      )}
    </g>
  );
}

// partikel ledakan / debu / daun / konfeti
function Burst({ fx }) {
  const parts = useMemo(() => {
    const n = fx.style === 'confetti' ? 22 : fx.style === 'boom' ? 14 : 9;
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
      const dist = (fx.style === 'boom' ? 40 : fx.style === 'confetti' ? 70 : 26) * (0.6 + Math.random() * 0.7);
      const up = fx.style === 'dust' ? -Math.abs(Math.sin(a)) * 0.4 : 1;
      return { dx: Math.cos(a) * dist, dy: Math.sin(a) * dist * up - (fx.style === 'confetti' ? 30 : 0), r: 3 + Math.random() * 4, i };
    });
  }, [fx.style]);
  const palette = {
    boom: ['#FF8A1F', '#FFC93C', '#FF5A5A', '#8E86B0'],
    dust: ['#C9C3E6', '#8E86B0'],
    leaf: ['#3CE0A0', '#8AF7C9', '#FFFFFF'],
    swirl: ['#A66BFF', '#1FE4CE', '#FFFFFF'],
    shield: ['#FFB800', '#FFE07A'],
    mirror: ['#DDF3FF', '#A66BFF', '#FFFFFF'],
    confetti: ['#FF5A5A', '#FFB800', '#4C8DFF', '#9BE15D', '#A66BFF', '#1FE4CE'],
    splash: [fx.color || '#FFFFFF', '#FFFFFF']
  }[fx.style] || ['#fff'];
  return (
    <g transform={`translate(${fx.x} ${fx.y})`}>
      {fx.style === 'boom' && <circle className="boom-flash" r="26" fill="#FFE07A" />}
      {parts.map((p) => {
        const fill = palette[p.i % palette.length];
        const style = { '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, animationDelay: `${(p.i % 4) * 18}ms` };
        return fx.style === 'confetti' ? (
          <rect key={p.i} className="particle" x={-p.r} y={-p.r / 2} width={p.r * 2} height={p.r} fill={fill} style={style} />
        ) : (
          <circle key={p.i} className="particle" r={p.r} fill={fill} stroke={fx.style === 'dust' ? 'none' : K} strokeWidth="1.5" style={style} />
        );
      })}
    </g>
  );
}

function Callout({ ev }) {
  const { text } = eventParts(ev);
  const actor = ev.fromId || ev.toId;
  const target = ev.type === 'hit' || ev.type === 'reflect' || ev.type === 'block' ? ev.toId : null;
  const icon = ev.type === 'summit' ? 'crate' : ev.skillId || (ev.type === 'chaos' ? 'chaos' : null);
  return (
    <div className="callout-in pointer-events-none absolute left-1/2 top-3 z-20 flex max-w-[92%] -translate-x-1/2 items-center gap-2.5 rounded-full bg-white py-1.5 pl-1.5 pr-4 text-ink shadow-[0_10px_30px_rgba(5,4,20,0.45)]">
      {actor && <ClimberFace teamId={actor} size={34} mood={ev.type === 'summit' ? 'wow' : 'happy'} />}
      {icon && <SkillGlyphBox id={icon} />}
      {target && <ClimberFace teamId={target} size={34} mood={ev.type === 'hit' ? 'dizzy' : 'happy'} />}
      <span className="truncate text-sm font-extrabold md:text-base">{text}</span>
    </div>
  );
}

function SkillGlyphBox({ id }) {
  return (
    <svg viewBox="0 0 64 64" width="34" height="34" aria-hidden="true">
      <SkillGlyph id={id} />
    </svg>
  );
}

export default function MountainArena({ roomState, now, soundOn = true }) {
  const teams = roomState.teams;
  const svgRef = useRef(null);
  const rigs = useRef({});
  const sim = useRef({});
  const propsRef = useRef({ teams, now });
  propsRef.current = { teams, now };
  const projRefs = useRef({});
  const projMeta = useRef({});
  const lastSeen = useRef(null);
  const reduceMotion = useRef(false);

  const [zoom, setZoom] = useState('pack');
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const vb = useRef([0, 0, VB_W, VB_H]);

  const [fx, setFx] = useState([]);
  const [callouts, setCallouts] = useState([]);
  const [hitKeys, setHitKeys] = useState({});

  useEffect(() => {
    reduceMotion.current = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const register = useCallback((id, part, el) => {
    if (!rigs.current[id]) rigs.current[id] = {};
    rigs.current[id][part] = el;
  }, []);

  // posisi awal tiap pendaki
  teams.forEach((t) => {
    if (!sim.current[t.id]) {
      const y = t.done ? STAND_Y : nodeY(t.node);
      sim.current[t.id] = { x: LANE_X[t.id], y, c: 0.3, flipA: 0, hitT: -1e9, blinkAt: 0, blinkEnd: 0, mouth: '' };
    }
  });

  const addFx = useCallback((item, ttl = 1200) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setFx((list) => [...list, { ...item, id }]);
    if (item.kind !== 'proj') setTimeout(() => setFx((list) => list.filter((f) => f.id !== id)), ttl);
    return id;
  }, []);

  const chestOf = (id) => {
    const s = sim.current[id];
    return s ? { x: s.x, y: s.y - 34 } : { x: 600, y: 400 };
  };

  const throwAt = useCallback((skillId, fromId, toId, onArrive, delay = 0) => {
    setTimeout(() => {
      const a = chestOf(fromId);
      const b = chestOf(toId);
      const id = addFx({ kind: 'proj', skillId });
      projMeta.current[id] = { t0: performance.now(), dur: 620, a, b, onArrive };
    }, delay);
  }, [addFx]);

  const knock = (id) => {
    if (sim.current[id]) sim.current[id].hitT = performance.now();
    setHitKeys((k) => ({ ...k, [id]: Date.now() }));
  };

  // reaksi visual untuk event baru
  useEffect(() => {
    const events = roomState.events || [];
    if (lastSeen.current === null) {
      lastSeen.current = events.length ? events[events.length - 1].id : 0;
      return;
    }
    const fresh = events.filter((e) => e.id > lastSeen.current);
    if (!fresh.length) return;
    lastSeen.current = fresh[fresh.length - 1].id;

    let delay = 0;
    fresh.forEach((ev) => {
      if (ev.at < propsRef.current.now - 5000) return;
      const d = delay;
      const show = () => {
        setCallouts((list) => [...list.slice(-2), { key: ev.id, ev }]);
        setTimeout(() => setCallouts((list) => list.filter((c) => c.key !== ev.id)), 2600);
      };
      switch (ev.type) {
        case 'correct': {
          const p = chestOf(ev.toId);
          addFx({ kind: 'burst', style: 'leaf', x: p.x, y: p.y - 40 });
          break;
        }
        case 'wrong': {
          const p = chestOf(ev.toId);
          addFx({ kind: 'burst', style: 'dust', x: p.x, y: p.y - 40 });
          break;
        }
        case 'loot': {
          const p = chestOf(ev.toId);
          addFx({ kind: 'pop', icon: 'crate', x: p.x, y: p.y - 100 }, 1400);
          break;
        }
        case 'summit':
          addFx({ kind: 'burst', style: 'confetti', x: 600, y: 90 }, 1600);
          if (soundOn) sounds.playVictory();
          show();
          break;
        case 'hit': {
          const sk = ev.skillId;
          setTimeout(show, d);
          if (soundOn) setTimeout(() => sounds.playSkill(sk, 'throw'), d);
          throwAt(sk, ev.fromId, ev.toId, () => {
            const p = chestOf(ev.toId);
            if (sk === 'bomb' || sk === 'snip') {
              addFx({ kind: 'burst', style: 'boom', x: p.x, y: p.y });
              knock(ev.toId);
            } else if (sk === 'swap' || sk === 'magnet') {
              const q = chestOf(ev.fromId);
              addFx({ kind: 'burst', style: 'swirl', x: p.x, y: p.y });
              addFx({ kind: 'burst', style: 'swirl', x: q.x, y: q.y });
            } else {
              addFx({ kind: 'burst', style: 'splash', color: SKILL_TINT[sk], x: p.x, y: p.y - 20 });
              addFx({ kind: 'pop', icon: sk, x: p.x, y: p.y - 70 }, 1300);
            }
            if (soundOn) sounds.playSkill(sk, 'hit');
          }, d);
          break;
        }
        case 'reflect':
          setTimeout(show, d);
          throwAt(ev.skillId, ev.fromId, ev.toId, () => {
            const p = chestOf(ev.toId);
            addFx({ kind: 'burst', style: 'mirror', x: p.x, y: p.y });
            addFx({ kind: 'pop', icon: 'mirror', x: p.x, y: p.y - 70 }, 1200);
            if (soundOn) sounds.playSkill('mirror', 'hit');
          }, d);
          break;
        case 'block':
          setTimeout(show, d);
          throwAt(ev.skillId, ev.fromId, ev.toId, () => {
            const p = chestOf(ev.toId);
            addFx({ kind: 'burst', style: 'shield', x: p.x, y: p.y });
            if (soundOn) sounds.playSkill('shield', 'hit');
          }, d);
          break;
        case 'self': {
          if (ev.secret) break;
          const p = chestOf(ev.fromId);
          if (ev.skillId === 'teleport') {
            addFx({ kind: 'burst', style: 'swirl', x: p.x, y: p.y });
            addFx({ kind: 'burst', style: 'swirl', x: p.x, y: nodeY(ev.toNode) - 34 });
            show();
          }
          addFx({ kind: 'pop', icon: ev.skillId, x: p.x, y: p.y - 80 }, 1300);
          addFx({ kind: 'burst', style: ev.skillId === 'shield' ? 'shield' : 'leaf', x: p.x, y: p.y });
          if (soundOn) sounds.playSkill(ev.skillId, 'hit');
          break;
        }
        case 'joker': {
          const p = chestOf(ev.fromId);
          addFx({ kind: 'pop', icon: 'joker', x: p.x, y: p.y - 80 }, 1300);
          if (ev.backfire) {
            addFx({ kind: 'burst', style: 'splash', color: SKILL_TINT[ev.rolled] || '#FFB800', x: p.x, y: p.y - 20 });
            setTimeout(() => addFx({ kind: 'pop', icon: ev.rolled, x: p.x, y: p.y - 80 }, 1300), 500);
            knock(ev.fromId);
          }
          if (soundOn) sounds.playPop();
          show();
          break;
        }
        case 'defeat': {
          const p = chestOf(ev.toId);
          addFx({ kind: 'burst', style: 'swirl', x: p.x + 20, y: p.y - 10 });
          addFx({ kind: 'pop', icon: 'monster', x: p.x, y: p.y - 80 }, 1200);
          show();
          break;
        }
        case 'defuse': {
          const p = chestOf(ev.toId);
          addFx({ kind: 'burst', style: 'leaf', x: p.x, y: p.y - 40 });
          addFx({ kind: 'pop', icon: 'timebomb', x: p.x, y: p.y - 80 }, 1200);
          show();
          break;
        }
        case 'explode': {
          const p = chestOf(ev.toId);
          addFx({ kind: 'burst', style: 'boom', x: p.x, y: p.y - 30 });
          addFx({ kind: 'burst', style: 'boom', x: p.x + 14, y: p.y - 50 });
          knock(ev.toId);
          if (soundOn) sounds.playBomb();
          show();
          break;
        }
        case 'chaos':
          if (!ev.fizzled) {
            [ev.aId, ev.bId].forEach((id) => {
              const p = chestOf(id);
              addFx({ kind: 'pop', icon: 'chaos', x: p.x, y: p.y - 80 }, 1300);
              addFx({ kind: 'burst', style: 'swirl', x: p.x, y: p.y });
            });
            if (soundOn) sounds.playSkill('chaos', 'hit');
          }
          show();
          break;
        case 'start':
        case 'timeup':
        case 'gift':
          show();
          break;
        default:
          break;
      }
    });
  }, [roomState.events, addFx, throwAt, soundOn]);

  // loop animasi utama
  useEffect(() => {
    let raf;
    let last = performance.now();
    const setPts = (el, pts) => { if (el) el.setAttribute('points', pts); };

    const frame = (t) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const { teams: list, now: clock } = propsRef.current;
      const calm = reduceMotion.current;
      let minY = Infinity;
      let maxY = -Infinity;

      list.forEach((team) => {
        const s = sim.current[team.id];
        const r = rigs.current[team.id];
        if (!s || !r || !r.root) return;
        const fxs = team.effects || {};
        const frozen = isActive(fxs.freeze, clock);
        const flipped = isActive(fxs.flip, clock);
        const ty = team.done ? STAND_Y : nodeY(team.node);
        const dy = ty - s.y;
        let mode = team.done ? 'stand' : 'idle';

        if (Math.abs(dy) > 0.5) {
          const up = dy < 0;
          const speed = calm ? 2000 : up ? 85 : 170;
          const step = Math.sign(dy) * Math.min(Math.abs(dy), speed * dt);
          s.y += step;
          s.c += Math.abs(step) / 42;
          mode = up ? 'climb' : 'slide';
        }
        minY = Math.min(minY, s.y);
        maxY = Math.max(maxY, s.y);

        // pose
        let hl; let hr; let fl; let fr; let sway = 0; let bounce = 0; let mouth = 'smile';
        if (mode === 'climb') {
          const k = (1 - Math.cos(s.c * Math.PI * 2)) / 2;
          hl = [-4, -71 + 46 * k]; hr = [4, -71 + 46 * (1 - k)];
          fl = [-4, 12 + 14 * (1 - k)]; fr = [4, 12 + 14 * k];
        } else if (mode === 'slide') {
          hl = [-4, -72]; hr = [4, -70];
          fl = [-3, 27]; fr = [3, 27];
          mouth = 'o';
        } else if (mode === 'stand') {
          const w = calm ? 0 : Math.sin(t / 160);
          hl = [-22, -64 + w * 5]; hr = [22, -64 - w * 5];
          fl = [-7, 25]; fr = [7, 25];
          bounce = calm ? 0 : -Math.abs(Math.sin(t / 280)) * 9;
          mouth = 'grin';
        } else {
          hl = [-4, -71]; hr = [4, -25];
          fl = [-4, 16]; fr = [4, 24];
          sway = frozen || calm ? 0 : Math.sin(t / 700 + team.id) * 3;
        }
        if (frozen) mouth = 'wavy';
        if (t - s.hitT < 1600) mouth = 'o';

        const shL = [-11, -27]; const shR = [11, -27];
        const hpL = [-5, -3]; const hpR = [5, -3];
        const eL = joint(shL[0], shL[1], hl[0], hl[1], 50, 15, -1);
        const eR = joint(shR[0], shR[1], hr[0], hr[1], 50, 15, 1);
        const kL = joint(hpL[0], hpL[1], fl[0], fl[1], 34, 13, -1);
        const kR = joint(hpR[0], hpR[1], fr[0], fr[1], 34, 13, 1);
        const arm = (a, e, h) => `${a[0]},${a[1]} ${e[0]},${e[1]} ${h[0]},${h[1]}`;
        if (!frozen || !s.posed) {
          setPts(r.armLk, arm(shL, eL, hl)); setPts(r.armL, arm(shL, eL, hl));
          setPts(r.armRk, arm(shR, eR, hr)); setPts(r.armR, arm(shR, eR, hr));
          setPts(r.legLk, arm(hpL, kL, fl)); setPts(r.legL, arm(hpL, kL, fl));
          setPts(r.legRk, arm(hpR, kR, fr)); setPts(r.legR, arm(hpR, kR, fr));
          r.handL?.setAttribute('cx', hl[0]); r.handL?.setAttribute('cy', hl[1]);
          r.handR?.setAttribute('cx', hr[0]); r.handR?.setAttribute('cy', hr[1]);
          r.shoeL?.setAttribute('cx', fl[0]); r.shoeL?.setAttribute('cy', fl[1] + 2);
          r.shoeR?.setAttribute('cx', fr[0]); r.shoeR?.setAttribute('cy', fr[1] + 2);
          s.posed = true;
        }

        if (mouth !== s.mouth && r.mouth) {
          r.mouth.setAttribute('d', MOUTH[mouth]);
          r.mouth.setAttribute('fill-opacity', mouth === 'grin' || mouth === 'o' ? '1' : '0');
          s.mouth = mouth;
        }

        // kedip
        if (!frozen && !calm) {
          if (t > s.blinkAt) { s.blinkEnd = t + 120; s.blinkAt = t + 2500 + Math.random() * 3000; }
          const ry = t < s.blinkEnd ? 0.4 : 3;
          r.eyeL?.setAttribute('ry', ry); r.eyeR?.setAttribute('ry', ry);
        }

        // terbalik (Layar Jungkir) dan putaran saat kena bom
        const targetFlip = flipped ? 180 : 0;
        s.flipA += (targetFlip - s.flipA) * Math.min(1, dt * 8);
        const ht = (t - s.hitT) / 700;
        const spin = ht >= 0 && ht < 1 && !calm ? 360 * (1 - Math.pow(1 - ht, 3)) : 0;
        const shake = ht >= 0 && ht < 0.5 && !calm ? Math.sin(t / 18) * 4 : 0;
        const spinning = isActive(fxs.spin, clock) && !calm ? (t * 0.5) % 360 : 0;
        const quaking = isActive(fxs.quake, clock) && !calm;
        const qx = quaking ? Math.sin(t / 23) * 5 : 0;
        const qy = quaking ? Math.cos(t / 29) * 4 : 0;
        const miniTarget = isActive(fxs.mini, clock) ? 0.5 : 1;
        s.mini = (s.mini ?? 1) + (miniTarget - (s.mini ?? 1)) * Math.min(1, dt * 6);
        const mx = isActive(fxs.mirrorworld, clock) ? -1 : 1;
        r.body.setAttribute(
          'transform',
          `translate(0 -30) scale(${mx * s.mini} ${s.mini}) rotate(${s.flipA + spin + spinning}) translate(0 30) rotate(${sway} 0 -71)`
        );
        r.root.setAttribute('transform', `translate(${s.x + shake + qx} ${s.y + bounce + qy})`);
      });

      // lemparan skill: lengkung parabola dari pelempar ke target
      Object.entries(projMeta.current).forEach(([id, p]) => {
        const el = projRefs.current[id];
        const u = Math.min(1, (t - p.t0) / p.dur);
        const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        const cx = (p.a.x + p.b.x) / 2;
        const cy = Math.min(p.a.y, p.b.y) - 110;
        const x = (1 - e) ** 2 * p.a.x + 2 * (1 - e) * e * cx + e ** 2 * p.b.x;
        const y = (1 - e) ** 2 * p.a.y + 2 * (1 - e) * e * cy + e ** 2 * p.b.y;
        if (el) el.setAttribute('transform', `translate(${x} ${y}) rotate(${e * 540}) scale(${0.8 + Math.sin(u * Math.PI) * 0.5})`);
        if (u >= 1) {
          delete projMeta.current[id];
          delete projRefs.current[id];
          setFx((list) => list.filter((f) => f.id !== id));
          p.onArrive?.();
        }
      });

      // kamera: zoom halus ke rombongan pendaki
      let target = [0, 0, VB_W, VB_H];
      if (zoomRef.current === 'pack' && Number.isFinite(minY)) {
        const el = svgRef.current;
        const aspect = el && el.clientHeight ? el.clientWidth / el.clientHeight : VB_W / VB_H;
        const top = minY - 160;
        const bottom = maxY + 90;
        // tinggi minimal supaya 5 tali + penggaris node (lebar +-620) selalu masuk
        let h = Math.max(400, bottom - top, 620 / aspect);
        h = Math.min(h, Math.max(VB_H, 620 / aspect));
        const w = h * aspect;
        const y = Math.min(Math.max(0, VB_H - h), Math.max(0, (top + bottom) / 2 - h / 2));
        target = [605 - w / 2, y, w, h];
      }
      const cur = vb.current;
      const k = Math.min(1, dt * (calm ? 50 : 2.2));
      for (let i = 0; i < 4; i++) cur[i] += (target[i] - cur[i]) * k;
      svgRef.current?.setAttribute('viewBox', cur.map((n) => n.toFixed(2)).join(' '));

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const scenery = useMemo(() => (
    <g>
      <Stars x={-400} y={-120} w={2000} h={560} count={70} seed={5} />
      <Moon cx={150} cy={96} r={64} />
      <FarHills y={500} />
      {/* air terjun di tebing kanan */}
      <g>
        <rect x="948" y="330" width="34" height="460" fill="#7E6CF0" />
        {[0, 1, 2].map((i) => (
          <path key={i} className="waterfall-line" d={`M${955 + i * 10} 330 V790`} stroke="#D5CCFF" strokeWidth="3" strokeDasharray="14 22" />
        ))}
      </g>
      <Island x={-80} y={330} w={290} depth={120} seed={21} vines={3} />
      <Island x={130} y={560} w={120} depth={40} seed={33} vines={1} />
      <Island x={960} y={322} w={260} depth={420} seed={44} vines={4} taper={0.2} />
      <Island x={300} y={ISLAND_Y} w={600} depth={78} seed={9} vines={5} taper={0.7} />
      <Portal cx={600} base={ISLAND_Y - 4} scale={1} />
      <Gem x={700} y={96} size={0.9} />
      {/* penggaris node */}
      {Array.from({ length: SUMMIT }, (_, i) => i + 1).map((n) => (
        <g key={n} transform={`translate(352 ${knotY(n)})`}>
          <rect x="-15" y="-11" width="30" height="22" rx="8" fill={n === SUMMIT ? '#FFC93C' : '#5C3E30'} stroke="#24170F" strokeWidth="2.5" />
          <text x="0" y="5" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="800" fontSize="12" fill={n === SUMMIT ? K : '#F4E3D3'}>{n}</text>
        </g>
      ))}
      {/* tali kelompok */}
      {TEAMS.map((m) => {
        const x = LANE_X[m.id];
        return (
          <g key={m.id}>
            <path d={`M${x} ${ROPE_TOP} V${VB_H + 40}`} stroke={K} strokeWidth="9" />
            <path d={`M${x} ${ROPE_TOP} V${VB_H + 40}`} stroke="#D9A55B" strokeWidth="5" />
            <path d={`M${x} ${ROPE_TOP} V${VB_H + 40}`} stroke="#A8732F" strokeWidth="5" strokeDasharray="3 7" />
            {Array.from({ length: SUMMIT - 1 }, (_, i) => i + 1).map((n) => (
              <ellipse key={n} cx={x} cy={knotY(n)} rx="6" ry="4.5" fill="#B98552" stroke={K} strokeWidth="2" />
            ))}
            <circle cx={x} cy={ROPE_TOP - 2} r="6" fill="none" stroke="#9AA3BC" strokeWidth="4" />
            <path d={`M${x + 4} ${ROPE_TOP + 4} L${x + 26} ${ROPE_TOP + 11} L${x + 4} ${ROPE_TOP + 18} Z`} fill={m.color} stroke={K} strokeWidth="2.5" strokeLinejoin="round" />
          </g>
        );
      })}
    </g>
  ), []);

  const frontClouds = useMemo(() => (
    <g>
      <CloudBank x={-560} y={690} w={820} seed={3} />
      <CloudBank x={350} y={786} w={500} seed={8} rMin={28} rMax={46} />
      <CloudBank x={900} y={700} w={840} seed={12} />
    </g>
  ), []);

  const hitTeams = teams.map((t) => ({ ...t, hitKey: hitKeys[t.id] && Date.now() - hitKeys[t.id] < 1700 ? hitKeys[t.id] : null }));

  return (
    <div className="arena-sky relative h-full w-full overflow-hidden rounded-[22px]">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        overflow="visible"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Tebing panjat: posisi tiap kelompok di tali"
      >
        {scenery}
        {hitTeams.map((t) => (
          <ClimberRig key={t.id} team={t} now={now} register={register} />
        ))}
        {fx.map((f) => {
          if (f.kind === 'burst') return <Burst key={f.id} fx={f} />;
          if (f.kind === 'pop') {
            return (
              <g key={f.id} transform={`translate(${f.x} ${f.y})`}>
                <g className="icon-pop">
                  <svg x="-22" y="-22" width="44" height="44" viewBox="0 0 64 64"><SkillGlyph id={f.icon} /></svg>
                </g>
              </g>
            );
          }
          if (f.kind === 'proj') {
            return (
              <g key={f.id} ref={(el) => { if (el) projRefs.current[f.id] = el; }} transform="translate(-200 -200)">
                <svg x="-18" y="-18" width="36" height="36" viewBox="0 0 64 64"><SkillGlyph id={f.skillId} /></svg>
              </g>
            );
          }
          return null;
        })}
        {frontClouds}
      </svg>

      <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex flex-col items-center gap-2">
        {callouts.map((c) => <Callout key={c.key} ev={c.ev} />)}
      </div>

      <div className="absolute bottom-3 right-3 z-10 flex rounded-full bg-night/85 p-1 text-xs font-bold ring-1 ring-white/15">
        {[
          ['pack', 'Dekat'],
          ['all', 'Seluruh tebing']
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setZoom(id)}
            aria-pressed={zoom === id}
            className={`rounded-full px-3 py-1.5 transition-colors ${zoom === id ? 'bg-white text-ink' : 'text-white/80 hover:text-white'}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
