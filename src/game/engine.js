// Mesin permainan: fungsi murni (state lama + aksi -> state baru).
// Dipakai oleh tab guru (host) di browser dan oleh server Socket.IO,
// supaya aturan main hanya ditulis satu kali.

import { SKILLS, SKILL_IDS, TIMED_EFFECTS, drawSkill } from './skills.js';

export const SUMMIT = 10;            // jumlah node sampai puncak
export const ANSWERS_PER_DROP = 3;   // tiap 3 jawaban (benar atau salah) dapat kotak skill
export const DROP_SIZE = 2;          // isi kotak skill
export const BAG_CAP = 6;            // kapasitas tas skill
export const GAME_MS = 15 * 60 * 1000;

export const TEAMS = [
  { id: 1, short: 'K1', name: 'Kelompok 1', label: 'Merah', color: '#FF5A5A', dark: '#B83535', skin: '#F2C291' },
  { id: 2, short: 'K2', name: 'Kelompok 2', label: 'Emas', color: '#FFB800', dark: '#B27D00', skin: '#C98B5B' },
  { id: 3, short: 'K3', name: 'Kelompok 3', label: 'Biru', color: '#4C8DFF', dark: '#2E5DB8', skin: '#E0A877' },
  { id: 4, short: 'K4', name: 'Kelompok 4', label: 'Hijau', color: '#9BE15D', dark: '#5E9A2A', skin: '#A86E46' },
  { id: 5, short: 'K5', name: 'Kelompok 5', label: 'Ungu', color: '#A66BFF', dark: '#6B3BC2', skin: '#EDB98A' }
];

export const teamMeta = (id) => TEAMS.find((t) => t.id === id) || TEAMS[0];

const clone = (s) => JSON.parse(JSON.stringify(s));
export const isActive = (until, now) => Boolean(until) && until > now;

function makeTeam(meta, rng, now) {
  return {
    id: meta.id,
    name: meta.name,
    node: 0,
    nodeAt: now,
    rank: meta.id,
    done: false,
    answered: 0,
    correct: 0,
    // tiap kelompok mulai dari soal berbeda supaya tidak saling contek
    qIndex: (meta.id - 1) * 3,
    bag: [drawSkill(rng), drawSkill(rng)],
    effects: {},
    shield: false,
    mirror: false,
    members: [],
    lootSeq: 0,
    lastLoot: null
  };
}

export function createInitialState({ now = Date.now(), rng = Math.random } = {}) {
  return {
    v: 2,
    now,
    seq: 0,
    isPlaying: false,
    startedOnce: false,
    finished: false,
    gameEndsAt: null,
    pausedRemaining: null,
    winnerId: null,
    events: [],
    teams: TEAMS.map((m) => makeTeam(m, rng, now))
  };
}

function rerank(s) {
  const sorted = [...s.teams].sort((a, b) => (b.node - a.node) || (a.nodeAt - b.nodeAt));
  sorted.forEach((t, i) => { t.rank = i + 1; });
}

export function reduce(prev, action, payload = {}, now = Date.now(), rng = Math.random) {
  if (!prev || prev.v !== 2) prev = createInitialState({ now, rng });
  const s = clone(prev);
  s.now = now;

  const team = (id) => s.teams.find((t) => t.id === id);
  const push = (ev) => {
    s.seq += 1;
    s.events = [...s.events, { id: s.seq, at: now, ...ev }].slice(-30);
  };
  const pick = (list) => list[Math.floor(rng() * list.length)];

  const moveTo = (t, n) => {
    const next = Math.max(0, Math.min(SUMMIT, n));
    if (next !== t.node) { t.node = next; t.nodeAt = now; }
  };

  // gangguan kedaluwarsa dibuang; Bom Waktu yang habis waktunya meledak dulu
  s.teams.forEach((t) => {
    Object.keys(t.effects).forEach((k) => {
      if (isActive(t.effects[k], now)) return;
      if (k === 'timebomb' && !t.done) {
        moveTo(t, t.node - 1);
        push({ type: 'explode', toId: t.id, node: t.node });
      }
      delete t.effects[k];
    });
  });

  const checkSummit = (t) => {
    if (t.node >= SUMMIT && !t.done) {
      t.done = true;
      t.effects = {};
      if (!s.winnerId) s.winnerId = t.id;
      push({ type: 'summit', toId: t.id, first: s.winnerId === t.id });
      if (s.teams.every((x) => x.done)) endGame();
    }
  };

  const giveLoot = (t, n) => {
    const drawn = Array.from({ length: n }, () => drawSkill(rng));
    const room = Math.max(0, BAG_CAP - t.bag.length);
    const kept = drawn.slice(0, room);
    t.bag.push(...kept);
    t.lootSeq += 1;
    t.lastLoot = { seq: t.lootSeq, skills: drawn, kept: kept.length, at: now };
    push({ type: 'loot', toId: t.id, skills: drawn, kept: kept.length });
  };

  function endGame() {
    s.isPlaying = false;
    s.finished = true;
    s.gameEndsAt = null;
    s.pausedRemaining = 0;
    rerank(s);
    if (!s.winnerId) s.winnerId = [...s.teams].sort((a, b) => a.rank - b.rank)[0].id;
  }

  // efek serangan ke pendaki dst, dikirim oleh src
  function applyAttack(src, dst, sk, reflected, via) {
    const detail = {};
    switch (sk.id) {
      case 'bomb': moveTo(dst, dst.node - 1); break;
      case 'snip': moveTo(dst, dst.node - 2); break;
      case 'swap': {
        const a = src.node; const b = dst.node;
        moveTo(src, b); moveTo(dst, a);
        checkSummit(src);
        break;
      }
      case 'magnet': {
        if (dst.node > 0) { moveTo(dst, dst.node - 1); moveTo(src, src.node + 1); checkSummit(src); }
        else detail.empty = true;
        break;
      }
      case 'steal': {
        if (dst.bag.length) {
          const idx = Math.floor(rng() * dst.bag.length);
          const [taken] = dst.bag.splice(idx, 1);
          detail.stolen = taken;
          if (src.bag.length < BAG_CAP) src.bag.push(taken); else detail.lost = true;
        } else detail.empty = true;
        break;
      }
      case 'bagswap': {
        const mine = src.bag;
        src.bag = dst.bag;
        dst.bag = mine;
        detail.got = src.bag.length;
        detail.gave = dst.bag.length;
        break;
      }
      default:
        if (sk.duration) dst.effects[sk.id] = now + sk.duration * 1000;
    }
    push({ type: 'hit', skillId: sk.id, fromId: src.id, toId: dst.id, reflected, via, ...detail });
  }

  // serangan ke lawan: cermin dulu, lalu perisai, baru kena
  function resolveEnemy(from, to, sk, via) {
    if (to.mirror) {
      to.mirror = false;
      if (sk.id === 'swap' || sk.id === 'bagswap') {
        push({ type: 'reflect', skillId: sk.id, fromId: from.id, toId: to.id, fizzled: true, via });
        return;
      }
      push({ type: 'reflect', skillId: sk.id, fromId: from.id, toId: to.id, via });
      if (from.shield) {
        from.shield = false;
        push({ type: 'block', skillId: sk.id, fromId: to.id, toId: from.id, via });
      } else if (!from.done) {
        applyAttack(to, from, sk, true, via);
      }
      return;
    }
    if (to.shield) {
      to.shield = false;
      push({ type: 'block', skillId: sk.id, fromId: from.id, toId: to.id, via });
      return;
    }
    applyAttack(from, to, sk, false, via);
  }

  function applySelf(from, sk, via) {
    const detail = {};
    if (sk.id === 'spring') { moveTo(from, from.node + 1); checkSummit(from); }
    if (sk.id === 'shield') from.shield = true;
    if (sk.id === 'mirror') from.mirror = true;
    if (sk.id === 'cleanse') from.effects = {};
    if (sk.id === 'teleport') {
      const leader = Math.max(0, ...s.teams.filter((t) => !t.done).map((t) => t.node));
      const ceiling = Math.min(SUMMIT - 1, leader + 1);
      detail.fromNode = from.node;
      moveTo(from, Math.floor(rng() * (ceiling + 1)));
      detail.toNode = from.node;
    }
    // cermin dirahasiakan dari lawan: event tetap dicatat, layar umum menyamarkannya
    push({ type: 'self', skillId: sk.id, fromId: from.id, secret: sk.id === 'mirror', via, ...detail });
  }

  function doChaos(from, via) {
    const pool = s.teams.filter((t) => !t.done);
    if (pool.length < 2) {
      push({ type: 'chaos', fromId: from.id, fizzled: true, via });
      return;
    }
    const a = pool.splice(Math.floor(rng() * pool.length), 1)[0];
    const b = pick(pool);
    const na = a.node; const nb = b.node;
    moveTo(a, nb); moveTo(b, na);
    push({ type: 'chaos', skillId: 'chaos', fromId: from.id, aId: a.id, bId: b.id, via });
  }

  switch (action) {
    case 'player:join': {
      const t = team(payload.teamId);
      const name = String(payload.playerName || '').trim().slice(0, 24);
      if (!t || !name) break;
      if (!t.members.find((m) => m.name === name)) t.members.push({ name, role: payload.role || 'Pendaki' });
      push({ type: 'join', toId: t.id, name });
      break;
    }

    case 'player:answer': {
      const t = team(payload.teamId);
      if (!t || !s.isPlaying || t.done) break;
      if (isActive(t.effects.freeze, now) || isActive(t.effects.monster, now)) break;
      t.answered += 1;
      t.qIndex += 1;
      if (payload.isCorrect) {
        t.correct += 1;
        moveTo(t, t.node + 1);
        push({ type: 'correct', toId: t.id, node: t.node });
        if (isActive(t.effects.timebomb, now)) {
          delete t.effects.timebomb;
          push({ type: 'defuse', toId: t.id });
        }
      } else {
        // salah jawab tidak menurunkan posisi; pendaki tetap di node yang sama
        push({ type: 'wrong', toId: t.id, node: t.node });
      }
      if (t.answered % ANSWERS_PER_DROP === 0) giveLoot(t, DROP_SIZE);
      checkSummit(t);
      break;
    }

    case 'player:skill': {
      const from = team(payload.teamId);
      const sk = SKILLS[payload.skillId];
      if (!from || !sk || !s.isPlaying) break;
      const idx = from.bag.indexOf(sk.id);
      if (idx < 0) break;

      if (sk.target === 'enemy') {
        const to = team(payload.targetId);
        if (!to || to.id === from.id || to.done) break;
        from.bag.splice(idx, 1);

        if (sk.id === 'joker') {
          // 20% senjata makan tuan: gangguan acak kena pelempar sendiri
          if (rng() < 0.2 && !from.done) {
            const rolled = pick(TIMED_EFFECTS.filter((id) => id !== 'monster' && id !== 'timebomb'));
            from.effects[rolled] = now + SKILLS[rolled].duration * 1000;
            push({ type: 'joker', fromId: from.id, toId: to.id, rolled, backfire: true });
          } else {
            const rolled = pick(SKILL_IDS.filter((id) => id !== 'joker'));
            const r = SKILLS[rolled];
            push({ type: 'joker', fromId: from.id, toId: to.id, rolled });
            if (r.target === 'self') applySelf(from, r, 'joker');
            else if (r.target === 'none') doChaos(from, 'joker');
            else resolveEnemy(from, to, r, 'joker');
          }
        } else {
          resolveEnemy(from, to, sk);
        }
      } else if (sk.target === 'self') {
        from.bag.splice(idx, 1);
        applySelf(from, sk);
      } else {
        from.bag.splice(idx, 1);
        doChaos(from);
      }
      break;
    }

    // monster dikalahkan di HP target
    case 'player:clear': {
      const t = team(payload.teamId);
      if (t && payload.effect === 'monster' && isActive(t.effects.monster, now)) {
        delete t.effects.monster;
        push({ type: 'defeat', toId: t.id });
      }
      break;
    }

    // detak berkala dari host/server, supaya Bom Waktu meledak tepat waktu
    case 'game:tick':
      break;

    case 'teacher:toggle_game': {
      if (s.finished) break;
      if (s.isPlaying) {
        s.isPlaying = false;
        s.pausedRemaining = Math.max(0, (s.gameEndsAt || now) - now);
        s.gameEndsAt = null;
        push({ type: 'pause' });
      } else {
        s.isPlaying = true;
        s.gameEndsAt = now + (s.pausedRemaining ?? GAME_MS);
        s.pausedRemaining = null;
        push({ type: s.startedOnce ? 'resume' : 'start' });
        s.startedOnce = true;
      }
      break;
    }

    case 'game:timeup': {
      if (s.isPlaying && s.gameEndsAt && now >= s.gameEndsAt - 500) {
        endGame();
        push({ type: 'timeup' });
      }
      break;
    }

    case 'teacher:reset': {
      const fresh = createInitialState({ now, rng });
      fresh.teams.forEach((t) => { t.members = team(t.id)?.members || []; });
      fresh.seq = s.seq;
      return fresh;
    }

    case 'teacher:gift': {
      s.teams.filter((t) => !t.done).forEach((t) => giveLoot(t, DROP_SIZE));
      push({ type: 'gift' });
      break;
    }

    // khusus mode uji coba: beri 2 skill acak ke satu pendaki
    case 'demo:gift': {
      const t = team(payload.teamId);
      if (t) giveLoot(t, DROP_SIZE);
      break;
    }

    // khusus mode uji coba: beri skill tertentu (kalau tas penuh, skill paling lama dibuang)
    case 'demo:give': {
      const t = team(payload.teamId);
      if (!t || !SKILLS[payload.skillId]) break;
      if (t.bag.length >= BAG_CAP) t.bag.shift();
      t.bag.push(payload.skillId);
      break;
    }

    default:
      break;
  }

  rerank(s);
  return s;
}

/** true bila ada Bom Waktu yang sudah lewat waktunya dan perlu diledakkan */
export function hasPendingExplosion(s, now = Date.now()) {
  return Boolean(s?.teams?.some((t) => t.effects?.timebomb && t.effects.timebomb <= now));
}

// Kalimat event untuk siaran di proyektor dan notifikasi di HP
export function eventParts(ev) {
  const T = (id) => teamMeta(id).short;
  const sk = ev.skillId ? SKILLS[ev.skillId] : null;
  switch (ev.type) {
    case 'join': return { text: `${ev.name} gabung ke ${T(ev.toId)}` };
    case 'correct': return { text: `${T(ev.toId)} menjawab benar, naik ke node ${ev.node}` };
    case 'wrong': return { text: `${T(ev.toId)} salah jawab, tetap di node ${ev.node}` };
    case 'loot': return { text: `${T(ev.toId)} membuka kotak skill` };
    case 'summit': return { text: ev.first ? `${T(ev.toId)} sampai puncak pertama!` : `${T(ev.toId)} sampai puncak` };
    case 'hit': {
      let tail = '';
      if (ev.skillId === 'steal' && ev.stolen) tail = `, dapat ${SKILLS[ev.stolen].name}`;
      if (ev.empty) tail = ', tapi tidak ada hasil';
      if (ev.skillId === 'bagswap') tail = ', tas ditukar';
      return { text: `${T(ev.fromId)} pakai ${sk.name} ke ${T(ev.toId)}${ev.reflected ? ' (pantulan)' : ''}${tail}` };
    }
    case 'reflect': return { text: `Cermin ${T(ev.toId)} memantulkan ${sk.name} dari ${T(ev.fromId)}${ev.fizzled ? ', tukar batal' : ''}` };
    case 'block': return { text: `Perisai ${T(ev.toId)} menahan ${sk.name} dari ${T(ev.fromId)}` };
    case 'self':
      if (ev.secret) return { text: `${T(ev.fromId)} menyiapkan sesuatu...` };
      if (ev.skillId === 'teleport') return { text: `${T(ev.fromId)} lewat Pintu Ajaib: node ${ev.fromNode} ke node ${ev.toNode}` };
      return { text: `${T(ev.fromId)} pakai ${sk.name}` };
    case 'chaos': return { text: ev.fizzled ? `Dadu Kacau ${T(ev.fromId)} gagal, pendaki kurang` : `Dadu Kacau ${T(ev.fromId)}: ${T(ev.aId)} dan ${T(ev.bId)} bertukar tempat` };
    case 'joker': return {
      text: ev.backfire
        ? `Kartu Joker ${T(ev.fromId)} senjata makan tuan: ${SKILLS[ev.rolled].name} kena ${T(ev.fromId)} sendiri`
        : `${T(ev.fromId)} kocok Kartu Joker ke ${T(ev.toId)}: keluar ${SKILLS[ev.rolled].name}`
    };
    case 'defeat': return { text: `${T(ev.toId)} mengalahkan Monster Bug` };
    case 'defuse': return { text: `${T(ev.toId)} menjinakkan Bom Waktu dengan jawaban benar` };
    case 'explode': return { text: `Bom Waktu meledak di ${T(ev.toId)}, turun ke node ${ev.node}` };
    case 'start': return { text: 'Panjat dimulai! Waktu 15 menit' };
    case 'resume': return { text: 'Panjat dilanjutkan' };
    case 'pause': return { text: 'Guru menjeda permainan' };
    case 'gift': return { text: 'Guru membagikan kotak skill ke semua pendaki' };
    case 'timeup': return { text: 'Waktu habis!' };
    default: return { text: '' };
  }
}
