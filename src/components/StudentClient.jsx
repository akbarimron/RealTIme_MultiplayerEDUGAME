import React, { useCallback, useEffect, useRef, useState } from 'react';
import { QUESTIONS } from '../data/questions';
import { SKILLS, GROUP_LABEL } from '../game/skills';
import { SUMMIT, BAG_CAP, ANSWERS_PER_DROP, teamMeta, isActive } from '../game/engine';
import SkillIcon from './art/SkillIcon';
import ClimberFace from './art/ClimberFace';
import RopeMeter from './ui/RopeMeter';
import { CloseButton } from './ui/Modal';
import {
  hackText, alienText, FogLayer, InkLayer, DuckLayer, BlackoutLayer, HackLayer,
  SnailLayer, MonsterLayer, TimeBombBar, ExplodeFlash
} from './phone/Sabotage';
import { sounds } from '../utils/audio';

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const clock = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

// warna kilatan layar saat kena serangan
const HIT_TINT = {
  bomb: '#FF8A1F', snip: '#FF5A5A', timebomb: '#FF5A5A', ink: '#16122B', fog: '#EEF1F8', flip: '#1FE4CE',
  spin: '#FFB800', quake: '#7A5442', mini: '#1FE4CE', mirrorworld: '#A66BFF', blackout: '#000000',
  ducks: '#FFD84D', alien: '#9BE15D', freeze: '#9EDCFF', monster: '#7B5CFF', hack: '#3CE0A0',
  banana: '#FFD84D', runaway: '#1FE4CE', snail: '#9BE15D', steal: '#D9A55B', bagswap: '#A66BFF',
  swap: '#1FE4CE', magnet: '#FF5A5A', chaos: '#FFFFFF'
};

// Pesan pribadi untuk HP ini dari event permainan
function personal(ev, me) {
  const T = (id) => teamMeta(id).short;
  const sk = ev.skillId ? SKILLS[ev.skillId] : null;
  if (ev.type === 'joker') {
    if (ev.backfire && ev.fromId === me) return { tone: 'bad', icon: ev.rolled, hit: true, text: `Joker senjata makan tuan! Kamu kena ${SKILLS[ev.rolled].name}` };
    if (ev.backfire && ev.toId === me) return { tone: 'good', icon: 'joker', text: `Joker ${T(ev.fromId)} meledak di tangannya sendiri` };
    if (ev.toId === me) return { tone: 'bad', icon: 'joker', face: ev.fromId, text: `${T(ev.fromId)} kocok Kartu Joker ke kamu: keluar ${SKILLS[ev.rolled].name}!` };
    if (ev.fromId === me) return { tone: 'info', icon: ev.rolled, text: `Kartu Joker: keluar ${SKILLS[ev.rolled].name}` };
    return null;
  }
  if (ev.type === 'hit' && ev.toId === me) {
    if (ev.reflected) return { tone: 'bad', icon: ev.skillId, hit: true, text: `Dipantulkan ${T(ev.fromId)}! Kamu kena ${sk.name} sendiri` };
    let extra = '';
    if (ev.skillId === 'steal') extra = ev.stolen ? `, ${SKILLS[ev.stolen].name} dicuri` : ', untung tasmu kosong';
    if (ev.skillId === 'swap') extra = ', posisimu ditukar';
    if (ev.skillId === 'bagswap') extra = ', tasmu ditukar';
    if (ev.skillId === 'magnet') extra = ev.empty ? ', tapi kamu di node 0' : ', 1 node ditarik';
    return { tone: 'bad', icon: ev.skillId, face: ev.fromId, hit: true, quiet: ev.via === 'joker', text: `${T(ev.fromId)} pakai ${sk.name} ke kamu${extra}` };
  }
  if (ev.type === 'hit' && ev.fromId === me) {
    if (ev.reflected) return { tone: 'good', icon: 'mirror', text: `Pantulan cerminmu mengenai ${T(ev.toId)}` };
    let extra = '';
    if (ev.skillId === 'steal') extra = ev.stolen ? `, kamu dapat ${SKILLS[ev.stolen].name}` : ', tasnya kosong';
    else if (ev.skillId === 'bagswap') extra = `, kamu dapat ${ev.got} skill`;
    else if (ev.empty) extra = ', tapi tidak ada hasil';
    return { tone: 'good', icon: ev.skillId, face: ev.toId, text: `${sk.name} kena ${T(ev.toId)}${extra}` };
  }
  if (ev.type === 'reflect' && ev.toId === me) return { tone: 'good', icon: 'mirror', text: `Cerminmu memantulkan ${sk.name} dari ${T(ev.fromId)}` };
  if (ev.type === 'reflect' && ev.fromId === me && ev.fizzled) return { tone: 'info', icon: 'mirror', text: `${T(ev.toId)} punya cermin. ${sk.name} batal` };
  if (ev.type === 'block' && ev.toId === me) return { tone: 'good', icon: 'shield', text: `Perisaimu menahan ${sk.name} dari ${T(ev.fromId)}` };
  if (ev.type === 'block' && ev.fromId === me) return { tone: 'info', icon: 'shield', text: `${T(ev.toId)} berperisai. ${sk.name} tertahan` };
  if (ev.type === 'chaos' && !ev.fizzled) {
    if (ev.aId === me || ev.bId === me) return { tone: 'info', icon: 'chaos', hit: true, text: `Dadu Kacau! Kamu bertukar tempat dengan ${T(ev.aId === me ? ev.bId : ev.aId)}` };
    if (ev.fromId === me) return { tone: 'info', icon: 'chaos', text: `Dadu Kacau: ${T(ev.aId)} dan ${T(ev.bId)} bertukar` };
  }
  if (ev.type === 'chaos' && ev.fizzled && ev.fromId === me) return { tone: 'info', icon: 'chaos', text: 'Dadu Kacau gagal, pendaki yang tersisa kurang' };
  if (ev.type === 'self' && ev.fromId === me) {
    const text = {
      spring: 'Sepatu Pegas! Naik 1 node',
      shield: 'Perisai NULL aktif',
      mirror: 'Cermin terpasang diam-diam',
      cleanse: 'Semua gangguan hilang',
      teleport: `Pintu Ajaib: node ${ev.fromNode} ke node ${ev.toNode}`
    }[ev.skillId];
    return { tone: 'good', icon: ev.skillId, text };
  }
  if (ev.type === 'defeat' && ev.toId === me) return { tone: 'good', icon: 'monster', text: 'Monster kalah! Lanjut panjat' };
  if (ev.type === 'defuse' && ev.toId === me) return { tone: 'good', icon: 'timebomb', text: 'Bom waktu dijinakkan!' };
  if (ev.type === 'explode' && ev.toId === me) return { tone: 'bad', icon: 'timebomb', hit: true, boom: true, text: `DUAR! Bom waktu meledak, turun ke node ${ev.node}` };
  if (ev.type === 'start') return { tone: 'info', icon: 'spring', text: 'Panjat dimulai! Waktu 15 menit' };
  if (ev.type === 'pause') return { tone: 'info', icon: 'freeze', text: 'Guru menjeda permainan' };
  if (ev.type === 'resume') return { tone: 'info', icon: 'spring', text: 'Panjat dilanjutkan' };
  if (ev.type === 'summit' && ev.toId !== me && ev.first) return { tone: 'info', icon: 'crate', face: ev.toId, text: `${T(ev.toId)} sampai puncak pertama!` };
  return null;
}

export default function StudentClient({ roomState, now, teamId, playerName, emit, demo = false, onLeave, transport = 'local' }) {
  const team = roomState.teams.find((t) => t.id === teamId);
  const meta = teamMeta(teamId);
  const q = QUESTIONS[(team?.qIndex || 0) % QUESTIONS.length];
  const fx = team?.effects || {};
  const on = (k) => isActive(fx[k], now);
  const left = (k) => Math.max(0, (fx[k] || 0) - now);
  const secs = (k) => Math.ceil(left(k) / 1000);

  const playing = roomState.isPlaying;
  const finished = roomState.finished;

  const [order, setOrder] = useState(() => (q.type === 'drag_order' ? shuffle(q.items) : []));
  const [choice, setChoice] = useState(null);
  const [display, setDisplay] = useState(() => (q.options ? q.options.map((_, i) => i) : []));
  const [feedback, setFeedback] = useState(null);
  const [slipped, setSlipped] = useState(0);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(null);
  const [boom, setBoom] = useState(0);
  const [sheet, setSheet] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [loot, setLoot] = useState(null);
  const [lagging, setLagging] = useState(false);
  const [runPos, setRunPos] = useState({ x: 50, y: 80 });
  const [monsterDown, setMonsterDown] = useState(0);
  const seenLoot = useRef(team?.lootSeq || 0);
  const seenEv = useRef(roomState.events.length ? roomState.events[roomState.events.length - 1].id : 0);
  const rootRef = useRef(null);
  const nowRef = useRef(now);
  nowRef.current = now;

  // soal baru: acak ulang urutan & reset pilihan
  useEffect(() => {
    if (q.type === 'drag_order') setOrder(shuffle(q.items));
    setChoice(null);
    setDisplay(q.options ? q.options.map((_, i) => i) : []);
  }, [q.id]);

  // Hack Jawaban: urutan pilihan terus diacak
  const hacked = on('hack');
  useEffect(() => {
    if (!hacked) {
      setDisplay(q.options ? q.options.map((_, i) => i) : []);
      return undefined;
    }
    if (q.type === 'drag_order') setOrder((o) => shuffle(o));
    const id = setInterval(() => {
      if (q.options) setDisplay((d) => shuffle(d));
      if (q.type === 'drag_order' && Math.random() < 0.5) setOrder((o) => shuffle(o));
    }, 1100);
    return () => clearInterval(id);
  }, [hacked, q.id]);

  const pushToast = useCallback((msg) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((list) => [...list.slice(-2), { ...msg, id }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3600);
  }, []);

  // kena serangan: langsung bereaksi, menutup apa pun yang sedang terbuka
  useEffect(() => {
    const fresh = roomState.events.filter((e) => e.id > seenEv.current);
    if (!fresh.length) return;
    seenEv.current = fresh[fresh.length - 1].id;
    fresh.forEach((ev) => {
      // event lama (misal setelah muat ulang) tidak dimunculkan lagi
      if (ev.at < nowRef.current - 5000) return;
      const msg = personal(ev, teamId);
      if (!msg) return;
      if (!msg.quiet) pushToast(msg);
      if (msg.icon && SKILLS[msg.icon]) sounds.playSkill(msg.icon, 'hit');
      if (msg.hit) {
        setSheet(null);
        setLoot(null);
        setShake(true);
        setTimeout(() => setShake(false), 420);
        setFlash({ key: ev.id, color: HIT_TINT[msg.icon] || '#FF5A5A' });
      }
      if (msg.boom) {
        setBoom(ev.id);
        sounds.playBomb();
      }
    });
  }, [roomState.events, teamId, pushToast]);

  // kotak skill baru
  useEffect(() => {
    if (!team) return;
    if (team.lootSeq > seenLoot.current && team.lastLoot?.seq === team.lootSeq) {
      seenLoot.current = team.lootSeq;
      // kotak lama (misal setelah muat ulang) tidak dibuka ulang
      const lootEv = [...roomState.events].reverse().find((e) => e.type === 'loot' && e.toId === teamId);
      if ((team.lastLoot.at || lootEv?.at || 0) < nowRef.current - 5000) return;
      setLoot(team.lastLoot);
      sounds.playPop();
    }
  }, [team?.lootSeq]);

  if (!team) {
    return (
      <div className="flex h-full items-center justify-center bg-night p-6 text-center text-white">
        <p>Kelompok tidak ditemukan. Muat ulang halaman lalu pilih kelompok lagi.</p>
      </div>
    );
  }

  const frozen = on('freeze');
  const monster = on('monster') && monsterDown !== fx.monster;
  const canAnswer = playing && !team.done && !frozen && !monster && !feedback;
  const canSubmit = canAnswer && (q.type === 'drag_order' || choice !== null);
  const remaining = roomState.gameEndsAt ? roomState.gameEndsAt - now : (roomState.pausedRemaining ?? 15 * 60 * 1000);
  const answeredMod = team.answered % ANSWERS_PER_DROP;
  const hudMood = frozen ? 'frozen' : team.done ? 'wow' : on('blackout') ? 'sleep' : Object.keys(fx).some(on) ? 'dizzy' : 'happy';

  // Siput Lemot: setiap ketukan baru bereaksi setelah jeda
  const lag = (fn) => (...args) => {
    if (!on('snail')) { fn(...args); return; }
    setLagging(true);
    setTimeout(() => { setLagging(false); fn(...args); }, 1400);
  };

  // tulisan soal: Bahasa Alien lalu Hack
  const txt = (s) => {
    let out = String(s);
    if (on('alien')) out = alienText(out);
    if (hacked) out = hackText(out);
    return out;
  };

  const pick = lag((idx) => {
    if (!canAnswer) return;
    let target = idx;
    if (on('banana') && Math.random() < 0.8) {
      const pos = display.indexOf(idx);
      const options = [display[pos - 1], display[pos + 1]].filter((v) => v !== undefined);
      target = options[Math.floor(Math.random() * options.length)];
      setSlipped((n) => n + 1);
      sounds.playSlip();
    }
    setChoice(target);
  });

  const move = lag((index, dir) => {
    if (!canAnswer) return;
    let d = dir;
    if (on('banana') && Math.random() < 0.65) {
      d = -dir;
      setSlipped((n) => n + 1);
      sounds.playSlip();
    }
    const to = index + d;
    if (to < 0 || to >= order.length) return;
    const copy = [...order];
    [copy[index], copy[to]] = [copy[to], copy[index]];
    setOrder(copy);
  });

  const doSubmit = () => {
    if (!canSubmit) return;
    const ok = q.type === 'drag_order'
      ? order.map((i) => i.id).join() === q.correctOrder.join()
      : choice === q.correct;
    emit('player:answer', { teamId, isCorrect: ok, questionId: q.id });
    const answered = team.answered + 1;
    setFeedback({
      ok,
      q,
      node: ok ? Math.min(SUMMIT, team.node + 1) : team.node,
      loot: answered % ANSWERS_PER_DROP === 0,
      toLoot: ANSWERS_PER_DROP - (answered % ANSWERS_PER_DROP),
      defused: ok && on('timebomb')
    });
    if (ok) sounds.playCorrect();
    else {
      sounds.playWrong();
      setShake(true);
      setTimeout(() => setShake(false), 420);
    }
  };
  const submit = lag(doSubmit);

  // Tombol Kabur: tombol lompat menghindar sebelum bisa ditekan
  const dodge = () => {
    setRunPos({ x: 20 + Math.random() * 60, y: 22 + Math.random() * 62 });
    sounds.playSlip();
  };
  const runawayPress = () => {
    if (!canSubmit) return;
    if (Math.random() < 0.72) dodge();
    else submit();
  };

  const cast = lag((skillId, targetId) => {
    emit('player:skill', { teamId, skillId, targetId });
    sounds.playThrow();
    setSheet(null);
  });

  const openSheet = lag((id) => setSheet(id));

  // transformasi layar: Jungkir, Cermin, Semut (luar) + Gasing, Gempa (dalam)
  const outer = [
    on('flip') ? 'rotate(180deg)' : '',
    on('mirrorworld') ? 'scaleX(-1)' : '',
    on('mini') ? 'scale(0.42)' : ''
  ].join(' ').trim() || 'none';
  const inner = `${on('spin') ? 'spin-screen' : ''} ${on('quake') ? 'quake-screen' : ''} ${hacked ? 'hack-shift' : ''}`;
  const runaway = on('runaway') && canSubmit;

  return (
    <div
      ref={rootRef}
      className={`relative flex h-full min-h-0 flex-col overflow-hidden bg-[#05060F] text-ink ${shake ? 'animate-shake' : ''}`}
    >
      <div className="flex min-h-0 flex-1 flex-col bg-paper transition-transform duration-500 ease-snap" style={{ transform: outer }}>
        <div className={`flex min-h-0 flex-1 flex-col ${inner}`}>
          {/* HUD */}
          <header className="night-sky relative shrink-0 px-4 pb-1 pt-[max(14px,env(safe-area-inset-top))] text-white">
            <div className="flex items-center gap-3">
              <ClimberFace teamId={teamId} size={48} mood={hudMood} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-extrabold leading-tight">{meta.short} · {meta.name}</p>
                <p className="truncate text-xs text-muted">
                  {playerName}
                  {onLeave && (
                    <button type="button" onClick={onLeave} className="ml-2 font-bold text-cyan underline-offset-2 hover:underline">
                      ganti
                    </button>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-muted">Peringkat</p>
                <p className="text-xl font-extrabold leading-none">#{team.rank}</p>
              </div>
              <div className="border-l border-white/15 pl-3 text-right">
                <p className="text-[11px] font-bold text-muted">Waktu</p>
                <p className="text-xl font-extrabold leading-none tabular-nums">{clock(remaining)}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1"><RopeMeter teamId={teamId} node={team.node} mood={hudMood} /></div>
              <span className="w-12 text-right text-sm font-extrabold tabular-nums">{team.node}<span className="text-muted">/{SUMMIT}</span></span>
            </div>
          </header>
          <div className="grass-edge relative z-10 -mb-3 shrink-0" aria-hidden="true" />

          {/* isi yang bisa digulir */}
          <div className="on-light min-h-0 flex-1 overflow-y-auto">
            <SkillTray team={team} onOpen={openSheet} answeredMod={answeredMod} />
            <ActiveEffects team={team} now={now} left={left} />
            {on('timebomb') && playing && !team.done && <TimeBombBar secondsLeft={secs('timebomb')} />}

            <main className="relative px-4 pb-5 pt-2">
              {finished ? (
                <FinishedCard roomState={roomState} teamId={teamId} />
              ) : team.done ? (
                <SummitCard team={team} />
              ) : !playing ? (
                <WaitingCard paused={roomState.startedOnce} demo={demo} onStart={() => emit('teacher:toggle_game')} transport={transport} />
              ) : feedback ? (
                <FeedbackCard fb={feedback} teamId={teamId} />
              ) : (
                <QuestionBlock
                  q={q}
                  number={team.answered + 1}
                  txt={txt}
                  hacked={hacked}
                  alien={on('alien')}
                  banana={on('banana')}
                  slipped={slipped}
                  order={order}
                  move={move}
                  display={display}
                  choice={choice}
                  pick={pick}
                />
              )}

              {frozen && playing && !team.done && (
                <div className="pop-in absolute inset-x-2 inset-y-0 z-20 flex flex-col items-center justify-center gap-3 rounded-[24px] border-[3px] border-[#DDF3FF] bg-[#9EDCFF]/90 p-6 text-center">
                  <SkillIcon id="freeze" size={84} />
                  <p className="text-xl font-extrabold">Tanganmu membeku!</p>
                  <p className="text-sm font-semibold text-ink-2">Belum bisa menjawab. Skill di tas tetap bisa dipakai, termasuk Sabun Bersih.</p>
                  <p className="text-4xl font-extrabold tabular-nums">{secs('freeze')}</p>
                </div>
              )}
            </main>
          </div>

          {/* tombol aksi utama */}
          {playing && !team.done && !finished && (
            <div className="relative shrink-0 bg-night px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
              {feedback ? (
                <button type="button" className="btn btn-white min-h-[54px] w-full text-base" onClick={() => setFeedback(null)}>
                  Soal berikutnya
                </button>
              ) : runaway ? (
                <p className="flex min-h-[54px] items-center justify-center text-center text-sm font-bold text-cyan">Tombolnya kabur! Kejar dan tekan</p>
              ) : (
                <button type="button" className="btn btn-cyan min-h-[54px] w-full text-base" disabled={!canSubmit} onClick={submit}>
                  {frozen ? 'Masih membeku...' : monster ? 'Kalahkan monster dulu' : q.type === 'multiple_choice' && choice === null ? 'Pilih satu jawaban dulu' : 'Kaitkan tali, panjat!'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* tombol kabur berkeliaran di layar */}
      {runaway && !feedback && (
        <button
          type="button"
          onPointerEnter={(e) => { if (e.pointerType === 'mouse' && Math.random() < 0.6) dodge(); }}
          onClick={runawayPress}
          className="btn btn-cyan absolute z-[48] min-h-[50px] -translate-x-1/2 -translate-y-1/2 px-5 shadow-[0_8px_24px_rgba(5,4,20,0.4)] transition-[left,top] duration-150 ease-snap"
          style={{ left: `${runPos.x}%`, top: `${runPos.y}%` }}
        >
          Kirim!
        </button>
      )}

      {/* ---------- gangguan layar ---------- */}
      {hacked && <HackLayer />}
      {on('snail') && <SnailLayer lagging={lagging} />}
      {on('fog') && <FogLayer key={`fog-${fx.fog}`} rootRef={rootRef} ratio={left('fog') / (SKILLS.fog.duration * 1000)} />}
      {on('ink') && <InkLayer key={`ink-${fx.ink}`} />}
      {on('ducks') && <DuckLayer key={`ducks-${fx.ducks}`} />}
      {on('blackout') && <BlackoutLayer rootRef={rootRef} />}
      {monster && playing && !team.done && (
        <MonsterLayer
          key={`monster-${fx.monster}`}
          secondsLeft={secs('monster')}
          onDefeat={() => { setMonsterDown(fx.monster); emit('player:clear', { teamId, effect: 'monster' }); }}
        />
      )}
      {flash && <div key={`flash-${flash.key}`} className="hit-flash pointer-events-none absolute inset-0 z-[56]" style={{ '--flash': flash.color }} />}
      {boom > 0 && <ExplodeFlash key={`boom-${boom}`} />}

      {/* notifikasi */}
      <div className="pointer-events-none absolute inset-x-3 top-3 z-[70] flex flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pop-in flex items-center gap-2.5 rounded-2xl py-2 pl-2 pr-3 shadow-[0_10px_30px_rgba(5,4,20,0.35)] ${
              t.tone === 'bad' ? 'bg-coral text-ink' : t.tone === 'good' ? 'bg-mint text-ink' : 'bg-white text-ink'
            }`}
          >
            {t.face && <ClimberFace teamId={t.face} size={30} />}
            {t.icon && <SkillIcon id={t.icon} size={30} />}
            <span className="text-sm font-bold leading-snug">{t.text}</span>
          </div>
        ))}
      </div>

      {loot && <LootReveal loot={loot} onClose={() => setLoot(null)} />}

      {sheet && (
        <SkillSheet
          skillId={sheet}
          team={team}
          teams={roomState.teams}
          playing={playing}
          onCast={cast}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}

function SkillTray({ team, onOpen, answeredMod }) {
  return (
    <section className="px-4 pt-6" aria-label="Tas skill">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-sm font-extrabold">
          Tas skill <span className="font-semibold text-ink-2">{team.bag.length}/{BAG_CAP}</span>
        </h2>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-2" title="Tiap 3 jawaban, benar atau salah, kamu dapat 2 skill acak">
          <SkillIcon id="crate" size={20} />
          <span>Kotak berikutnya</span>
          <span className="flex gap-1" aria-label={`${answeredMod} dari ${ANSWERS_PER_DROP} jawaban`}>
            {Array.from({ length: ANSWERS_PER_DROP }, (_, i) => (
              <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < answeredMod ? 'bg-gold' : 'bg-[#D6D2EA]'}`} />
            ))}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: BAG_CAP }, (_, i) => {
          const id = team.bag[i];
          return id ? (
            <button
              key={`${id}-${i}`}
              type="button"
              onClick={() => onOpen(id)}
              aria-label={`${SKILLS[id].name}: ${SKILLS[id].desc}`}
              className="pop-in flex aspect-square items-center justify-center rounded-2xl bg-white shadow-[0_4px_12px_rgba(20,16,60,0.12)] ring-1 ring-[#E3E0F3] transition-transform active:scale-90"
            >
              <SkillIcon id={id} size={38} />
            </button>
          ) : (
            <div key={`empty-${i}`} className="aspect-square rounded-2xl border-2 border-dashed border-[#D6D2EA]" aria-hidden="true" />
          );
        })}
      </div>
      {team.bag.length === 0 && (
        <p className="mt-2 text-xs text-ink-2">Tas masih kosong. Jawab 3 soal untuk membuka kotak skill.</p>
      )}
    </section>
  );
}

function ActiveEffects({ team, now, left }) {
  const list = Object.keys(team.effects || {}).filter((k) => isActive(team.effects[k], now) && k !== 'timebomb');
  if (!list.length && !team.shield && !team.mirror) return null;
  return (
    <div className="flex flex-wrap gap-2 px-4 pt-3" aria-label="Status aktif">
      {team.shield && <StatusChip icon="shield" text="Perisai siap" tone="good" />}
      {team.mirror && <StatusChip icon="mirror" text="Cermin siap" tone="good" />}
      {list.map((k) => (
        <StatusChip key={k} icon={k} text={`${SKILLS[k].name} ${Math.ceil(left(k) / 1000)}d`} tone="bad" />
      ))}
    </div>
  );
}

function StatusChip({ icon, text, tone }) {
  return (
    <span className={`flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-xs font-bold ${tone === 'bad' ? 'bg-coral/20 text-ink' : 'bg-mint/30 text-ink'}`}>
      <SkillIcon id={icon} size={22} />
      {text}
    </span>
  );
}

function QuestionBlock({ q, number, txt, hacked, alien, banana, slipped, order, move, display, choice, pick }) {
  const glitch = hacked ? 'text-glitch' : '';
  return (
    <div className="flex flex-col gap-4">
      <article className={`overflow-hidden rounded-[24px] bg-white p-4 shadow-[0_8px_24px_rgba(20,16,60,0.10)] ${hacked ? 'ring-4 ring-[#FF6FB5]' : ''}`}>
        <div className="mb-2 flex items-center justify-between gap-2 text-xs">
          <span className="rounded-full bg-[#ECE9FB] px-2.5 py-1 font-bold text-[#3B3480]">{q.category}</span>
          <span className="font-semibold text-ink-2">Soal ke-{number}</span>
        </div>
        <h2 className={`text-lg font-extrabold leading-snug ${glitch}`}>{txt(q.title)}</h2>
        <p className={`mt-1.5 text-[15px] leading-relaxed text-ink-2 ${glitch}`}>{txt(q.question)}</p>
        {q.codeSnippet && (
          <pre className="mt-3 overflow-x-auto rounded-2xl bg-night px-3 py-2.5 font-mono text-[13px] text-mint"><code>{txt(q.codeSnippet)}</code></pre>
        )}
        {hacked && <p className="mt-2 text-xs font-bold text-[#B0246A]">Kode kamu di-hack! Tulisan rusak dan pilihan terus berpindah.</p>}
        {alien && <p className="mt-2 text-xs font-bold text-[#3E6B12]">Bahasa alien! Tunggu terjemahannya kembali.</p>}
        {banana && <p className="mt-2 text-xs font-bold text-[#8A6A00]">Jarimu licin, pilihan hampir selalu meleset. Cek lagi sebelum kirim.</p>}
      </article>

      {q.type === 'drag_order' && (
        <div>
          <p className="mb-2 text-sm font-bold text-ink-2">Susun urutan baris kode dengan tombol naik/turun</p>
          <ol className="flex flex-col gap-2">
            {order.map((item, idx) => (
              <li key={item.id} className={`chip overflow-hidden py-1.5 pl-2 pr-1.5 ${banana ? 'banana-wobble' : ''}`}>
                <span className="num-dot">{idx + 1}</span>
                <code className={`min-w-0 flex-1 whitespace-pre-wrap break-words font-mono text-[13px] ${glitch}`}>{txt(item.text)}</code>
                <span className="flex shrink-0">
                  <button type="button" disabled={idx === 0} onClick={() => move(idx, -1)} aria-label={`Naikkan baris ${idx + 1}`} className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-paper disabled:opacity-25">
                    <Arrow up />
                  </button>
                  <button type="button" disabled={idx === order.length - 1} onClick={() => move(idx, 1)} aria-label={`Turunkan baris ${idx + 1}`} className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-paper disabled:opacity-25">
                    <Arrow />
                  </button>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {q.type === 'multiple_choice' && (
        <div role="radiogroup" aria-label="Pilihan jawaban" className="flex flex-col gap-2">
          {display.map((optIdx, pos) => {
            const selected = choice === optIdx;
            return (
              <button
                key={`${optIdx}-${selected ? slipped : 0}`}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => pick(optIdx)}
                className={`flex items-start gap-3 overflow-hidden rounded-[20px] p-3 text-left text-[15px] font-semibold leading-snug transition-colors ${
                  selected ? 'climb-hop bg-ink text-white' : 'bg-white text-ink shadow-[0_4px_14px_rgba(20,16,60,0.08)] hover:bg-[#F8F7FF]'
                } ${banana ? 'banana-wobble' : ''}`}
                style={banana ? { animationDelay: `${pos * 90}ms` } : undefined}
              >
                <span className={`num-dot ${selected ? 'bg-cyan text-ink' : ''}`}>{String.fromCharCode(65 + pos)}</span>
                <span className={`mt-0.5 ${glitch}`}>{txt(q.options[optIdx])}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Arrow({ up = false }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" style={{ transform: up ? 'none' : 'rotate(180deg)' }}>
      <path d="M12 5 L19 13 H14 V19 H10 V13 H5 Z" fill="currentColor" />
    </svg>
  );
}

function FeedbackCard({ fb, teamId }) {
  const { ok, q } = fb;
  const correctText = q.type === 'multiple_choice'
    ? q.options[q.correct]
    : q.correctOrder.map((id) => q.items.find((i) => i.id === id).text);
  return (
    <div className="pop-in overflow-hidden rounded-[24px] bg-white shadow-[0_8px_24px_rgba(20,16,60,0.10)]">
      <div className={`flex items-center gap-3 p-4 ${ok ? 'bg-mint' : 'bg-coral'}`}>
        <span className={ok ? 'climb-hop' : 'animate-shake'}>
          <ClimberFace teamId={teamId} size={56} mood={ok ? 'wow' : 'dizzy'} />
        </span>
        <div>
          <p className="text-xl font-extrabold leading-tight">{ok ? `Naik ke node ${fb.node}!` : `Belum tepat, tetap di node ${fb.node}`}</p>
          <p className="text-sm font-semibold">
            {fb.defused ? 'Bom waktu dijinakkan! ' : ''}
            {fb.loot ? 'Kotak skill terbuka!' : `${fb.toLoot} jawaban lagi menuju kotak skill`}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3 p-4">
        {!ok && (
          <div>
            <p className="mb-1 text-xs font-bold text-ink-2">Jawaban yang benar</p>
            {Array.isArray(correctText) ? (
              <ol className="flex flex-col gap-1">
                {correctText.map((line, i) => (
                  <li key={i} className="flex gap-2 font-mono text-[13px]"><span className="text-ink-2">{i + 1}.</span><code className="whitespace-pre-wrap">{line}</code></li>
                ))}
              </ol>
            ) : (
              <p className="text-[15px] font-semibold">{correctText}</p>
            )}
          </div>
        )}
        <div>
          <p className="mb-1 text-xs font-bold text-ink-2">Kenapa?</p>
          <p className="text-[15px] leading-relaxed">{q.explanation}</p>
        </div>
      </div>
    </div>
  );
}

function WaitingCard({ paused, demo, onStart, transport }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[24px] bg-white p-6 text-center shadow-[0_8px_24px_rgba(20,16,60,0.10)]">
      <SkillIcon id={paused ? 'freeze' : 'crate'} size={72} />
      <h2 className="text-xl font-extrabold">{paused ? 'Permainan dijeda guru' : 'Menunggu guru menekan Mulai'}</h2>
      <p className="text-[15px] text-ink-2">
        {paused ? 'Tunggu sebentar, posisi dan tas skillmu aman.' : 'Soal pertamamu sudah siap. Sambil menunggu, ketuk skill di tas untuk membaca gunanya.'}
      </p>
      <div className="mt-1 flex items-center gap-2 rounded-full bg-paper px-3 py-1.5 text-xs font-semibold text-ink-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{
            background: transport === 'supabase' ? '#3CE0A0' : transport === 'supabase-connecting' ? '#FFB800' : '#FF5A5A'
          }}
        />
        <span>
          {transport === 'supabase'
            ? 'Terhubung ke Cloud (Supabase Online)'
            : transport === 'supabase-connecting'
            ? 'Menyambung ke Supabase...'
            : 'Mode Lokal (Belum terhubung ke Supabase)'}
        </span>
      </div>
      {demo && (
        <button type="button" onClick={onStart} className="btn btn-ink mt-1">
          {paused ? 'Lanjutkan (uji coba)' : 'Mulai permainan (uji coba)'}
        </button>
      )}
    </div>
  );
}

function SummitCard({ team }) {
  return (
    <div className="pop-in flex flex-col items-center gap-3 rounded-[24px] bg-white p-6 text-center shadow-[0_8px_24px_rgba(20,16,60,0.10)]">
      <ClimberFace teamId={team.id} size={88} mood="wow" />
      <h2 className="text-2xl font-extrabold">Sampai puncak!</h2>
      <p className="text-[15px] text-ink-2">
        Kelompokmu finis di peringkat <strong className="text-ink">#{team.rank}</strong> dengan {team.correct} jawaban benar.
        Kamu aman dari serangan, tapi skill di tas masih bisa dilempar ke yang lain.
      </p>
    </div>
  );
}

function FinishedCard({ roomState, teamId }) {
  const ranked = [...roomState.teams].sort((a, b) => a.rank - b.rank);
  return (
    <div className="pop-in rounded-[24px] bg-white p-5 shadow-[0_8px_24px_rgba(20,16,60,0.10)]">
      <h2 className="text-2xl font-extrabold">Waktu habis!</h2>
      <p className="mb-3 text-[15px] text-ink-2">Lihat proyektor untuk pengumuman hadiah.</p>
      <ol className="flex flex-col gap-2">
        {ranked.map((t) => (
          <li key={t.id} className={`flex items-center gap-3 rounded-2xl p-2 ${t.id === teamId ? 'bg-[#ECE9FB]' : ''}`}>
            <span className="w-7 text-center text-lg font-extrabold">#{t.rank}</span>
            <ClimberFace teamId={t.id} size={34} mood={t.rank === 1 ? 'wow' : 'happy'} />
            <span className="flex-1 font-bold">{teamMeta(t.id).short} · {t.name}{t.id === teamId ? ' (kamu)' : ''}</span>
            <span className="font-extrabold tabular-nums">{t.node}/{SUMMIT}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// Lembar skill di dalam bingkai HP (bukan menutupi seluruh jendela),
// supaya di mode dua HP masing-masing HP tetap bisa dipakai.
function SkillSheet({ skillId, team, teams, playing, onCast, onClose }) {
  const sk = SKILLS[skillId];
  const panel = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const t = setTimeout(() => panel.current?.querySelector('button:not([disabled])')?.focus(), 30);
    return () => { window.removeEventListener('keydown', onKey); clearTimeout(t); };
  }, [onClose]);

  if (!sk) return null;
  return (
    <div className="fade-in absolute inset-0 z-[62] flex items-end bg-[#05060F]/70" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={panel} role="dialog" aria-modal="true" aria-label={`Skill ${sk.name}`} className="on-light sheet-up max-h-[85%] w-full overflow-y-auto rounded-t-[28px] bg-white p-5 text-ink">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-[22px] bg-paper p-2"><SkillIcon id={sk.id} size={68} /></div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-ink-2">{GROUP_LABEL[sk.group]}</p>
            <h2 className="text-xl font-extrabold leading-tight">{sk.name}</h2>
            <p className="mt-1 text-[15px] leading-snug text-ink-2">{sk.desc}</p>
          </div>
          <CloseButton onClick={onClose} />
        </div>

        {!playing && (
          <p className="mt-4 rounded-2xl bg-paper p-3 text-sm font-semibold text-ink-2">Skill bisa dipakai setelah guru menekan Mulai.</p>
        )}

        {playing && sk.target === 'enemy' && (
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-extrabold">Pilih target</h3>
            <ul className="flex flex-col gap-2">
              {teams.filter((t) => t.id !== team.id).map((t) => {
                const m = teamMeta(t.id);
                let hint = `node ${t.node}`;
                if (sk.id === 'swap') hint = `node ${t.node}, kamu jadi node ${t.node}`;
                if (sk.id === 'magnet') hint = t.node > 0 ? `node ${t.node}, kamu +1 dia -1` : 'node 0, tidak ada yang ditarik';
                if (sk.id === 'steal' || sk.id === 'bagswap') hint = `tasnya berisi ${t.bag.length} skill`;
                if (t.done) hint = 'sudah di puncak, aman';
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      disabled={t.done}
                      onClick={() => onCast(sk.id, t.id)}
                      className="flex w-full items-center gap-3 rounded-[20px] bg-paper p-2 pr-3 text-left transition-colors hover:bg-[#E6E3F7] disabled:opacity-40"
                    >
                      <ClimberFace teamId={t.id} size={44} />
                      <span className="min-w-0 flex-1">
                        <span className="block font-extrabold">{m.short} · {m.name}</span>
                        <span className="block text-xs font-semibold text-ink-2">{hint}</span>
                      </span>
                      {t.shield && <SkillIcon id="shield" size={28} title="Berperisai" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {playing && sk.target !== 'enemy' && (
          <button type="button" className="btn btn-ink mt-5 min-h-[52px] w-full text-base" onClick={() => onCast(sk.id, null)}>
            Pakai {sk.name}
          </button>
        )}
      </div>
    </div>
  );
}

function LootReveal({ loot, onClose }) {
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOpened(true), 650);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' || (opened && e.key === 'Enter')) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [opened, onClose]);
  const lost = loot.skills.length - loot.kept;
  return (
    <div className="fade-in absolute inset-0 z-[60] flex flex-col items-center justify-center gap-5 bg-[#07081A]/92 p-5 text-white" role="dialog" aria-modal="true" aria-label="Kotak skill">
      {!opened ? (
        <div className="crate-shake"><SkillIcon id="crate" size={120} /></div>
      ) : (
        <>
          <h2 className="pop-in text-2xl font-extrabold">Kotak skill terbuka!</h2>
          <div className="grid w-full max-w-sm grid-cols-2 gap-3">
            {loot.skills.map((id, i) => (
              <div
                key={i}
                className={`card-deal flex flex-col items-center gap-2 rounded-[22px] bg-white p-3 text-center text-ink ${i >= loot.kept ? 'opacity-50' : ''}`}
                style={{ '--tilt': i % 2 ? '8deg' : '-8deg', animationDelay: `${i * 120}ms` }}
              >
                <SkillIcon id={id} size={64} />
                <p className="text-base font-extrabold leading-tight">{SKILLS[id].name}</p>
                <p className="text-xs leading-snug text-ink-2">{SKILLS[id].desc}</p>
              </div>
            ))}
          </div>
          {lost > 0 && <p className="text-sm font-semibold text-gold">Tas penuh (maksimal {BAG_CAP}). {lost} skill tidak muat.</p>}
          <button type="button" autoFocus className="btn btn-cyan min-h-[52px] px-8 text-base" onClick={onClose}>
            Masukkan ke tas
          </button>
        </>
      )}
    </div>
  );
}
