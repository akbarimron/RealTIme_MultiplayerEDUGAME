import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import MountainArena from './MountainArena';
import LinkedListDemoModal from './LinkedListDemoModal';
import VictorySnacksModal from './VictorySnacksModal';
import Modal, { CloseButton } from './ui/Modal';
import RopeMeter from './ui/RopeMeter';
import ClimberFace from './art/ClimberFace';
import SkillIcon from './art/SkillIcon';
import { SUMMIT, GAME_MS, teamMeta, isActive, eventParts } from '../game/engine';
import { SKILLS, TIMED_EFFECTS } from '../game/skills';
import { useFlip } from '../utils/useFlip';
import { sounds } from '../utils/audio';

// Alur microteaching 35 menit
const PHASES = [
  { label: 'Pembuka', min: 5 },
  { label: 'Materi', min: 5 },
  { label: 'Panjat', min: 15 },
  { label: 'Hadiah', min: 5 },
  { label: 'Penutup', min: 5 }
];
const SESSION_SEC = PHASES.reduce((s, p) => s + p.min * 60, 0);

const mmss = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

export default function TeacherDashboard({ roomState, now, emit }) {
  const [showDemo, setShowDemo] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [muted, setMuted] = useState(false);

  const teams = roomState.teams;
  const ranked = [...teams].sort((a, b) => a.rank - b.rank);
  const winner = roomState.winnerId ? teams.find((t) => t.id === roomState.winnerId) : null;

  const remaining = roomState.gameEndsAt
    ? Math.max(0, roomState.gameEndsAt - now)
    : roomState.pausedRemaining ?? GAME_MS;

  const toggleGame = () => {
    sounds.init();
    sounds.playWhistle();
    emit('teacher:toggle_game');
  };

  const reset = () => {
    if (window.confirm('Reset permainan? Semua posisi, skill, dan waktu kembali ke awal. Siswa yang sudah gabung tetap ada.')) {
      emit('teacher:reset');
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    sounds.setMuted(next);
  };

  return (
    <div className="flex flex-1 flex-col text-white">
      {/* navbar */}
      <header className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 pb-2 pt-4 md:px-6">
        <div className="mr-auto lg:mr-0">
          <p className="text-xl font-extrabold leading-none md:text-2xl">
            Panjat Tebing <span className="text-cyan">Strukdat</span>
          </p>
          <p className="mt-1 text-xs text-muted">Linked List, kelas XI fase F</p>
        </div>

        <nav aria-label="Alat guru" className="order-3 flex w-full flex-wrap gap-1 lg:order-none lg:mr-auto lg:w-auto">
          <button type="button" className="btn btn-ghost" onClick={() => setShowDemo(true)}>Materi 5 menit</button>
          <button type="button" className="btn btn-ghost" onClick={() => setShowQr(true)}>QR untuk siswa</button>
          <button type="button" className="btn btn-ghost" onClick={() => setShowVictory(true)}>Hadiah jajan</button>
        </nav>

        <div className="flex items-center gap-2">
          <div className="mr-1 text-right">
            <p className="text-[11px] font-bold text-muted">{roomState.finished ? 'Selesai' : roomState.isPlaying ? 'Sisa waktu' : 'Waktu main'}</p>
            <p className="text-2xl font-extrabold leading-none tabular-nums">{mmss(remaining / 1000)}</p>
          </div>
          {roomState.finished ? (
            <button type="button" className="btn btn-white" onClick={reset}>Main lagi</button>
          ) : (
            <button type="button" className={`btn ${roomState.isPlaying ? 'btn-white' : 'btn-cyan'}`} onClick={toggleGame}>
              {roomState.isPlaying ? 'Jeda' : roomState.startedOnce ? 'Lanjutkan' : 'Mulai panjat'}
            </button>
          )}
          <button type="button" className="btn btn-icon" onClick={toggleMute} aria-label={muted ? 'Nyalakan suara' : 'Matikan suara'} aria-pressed={muted}>
            <SpeakerIcon off={muted} />
          </button>
          <button type="button" className="btn btn-icon" onClick={reset} aria-label="Reset permainan">
            <ResetIcon />
          </button>
        </div>
      </header>

      <PhaseRail />

      <main className="grid flex-1 grid-cols-1 gap-4 px-4 pb-6 pt-3 md:px-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="flex min-h-0 flex-col gap-3" aria-label="Arena tebing">
          {winner && (
            <div className="pop-in flex flex-wrap items-center gap-3 rounded-[20px] bg-gold px-4 py-2.5 text-ink">
              <ClimberFace teamId={winner.id} size={40} mood="wow" />
              <p className="flex-1 font-extrabold">
                {teamMeta(winner.id).short} · {winner.name} {roomState.finished ? 'juara panjat hari ini!' : 'sampai puncak pertama!'}
              </p>
              <button type="button" className="btn btn-ink min-h-10" onClick={() => setShowVictory(true)}>Buka layar hadiah</button>
            </div>
          )}
          <div className="h-[62vh] min-h-[380px] lg:h-[calc(100dvh-210px)]">
            <MountainArena roomState={roomState} now={now} soundOn={!muted} />
          </div>
        </section>

        <aside className="flex min-h-0 flex-col gap-4 lg:h-[calc(100dvh-210px)]">
          <Standings ranked={ranked} now={now} emit={emit} playing={roomState.isPlaying} />
          <Feed events={roomState.events} />
        </aside>
      </main>

      <LinkedListDemoModal isOpen={showDemo} onClose={() => setShowDemo(false)} />
      <VictorySnacksModal isOpen={showVictory} ranked={ranked} winner={winner || ranked[0]} onClose={() => setShowVictory(false)} />
      <QrModal open={showQr} onClose={() => setShowQr(false)} />
    </div>
  );
}

function PhaseRail() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setElapsed((e) => Math.min(SESSION_SEC, e + 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  let acc = 0;
  return (
    <div className="flex items-center gap-3 px-4 md:px-6">
      <button
        type="button"
        onClick={() => setRunning((r) => !r)}
        className="btn btn-icon h-10 min-h-10 w-10 shrink-0"
        aria-label={running ? 'Jeda jam sesi' : 'Jalankan jam sesi 35 menit'}
      >
        {running ? (
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M7 5 V19 M17 5 V19" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M7 4 L20 12 L7 20 Z" fill="currentColor" /></svg>
        )}
      </button>
      <ol className="flex h-10 min-w-0 flex-1 gap-1 overflow-hidden rounded-full bg-white/[0.06] p-1" aria-label={`Sesi microteaching, berjalan ${mmss(elapsed)} dari 35 menit`}>
        {PHASES.map((p) => {
          const start = acc;
          const len = p.min * 60;
          acc += len;
          const fill = Math.max(0, Math.min(1, (elapsed - start) / len));
          const current = elapsed >= start && elapsed < start + len;
          return (
            <li
              key={p.label}
              className={`relative overflow-hidden rounded-full ${current ? 'min-w-[72px]' : ''}`}
              style={{ flexGrow: p.min, flexBasis: 0 }}
              aria-current={current ? 'step' : undefined}
            >
              <span className={`absolute inset-y-0 left-0 ${p.label === 'Panjat' ? 'bg-mint' : 'bg-white/25'}`} style={{ width: `${fill * 100}%` }} />
              <span className={`relative h-full items-center justify-center gap-1 truncate px-2 text-xs font-bold ${current ? 'flex' : 'hidden sm:flex'} ${fill > 0.55 && p.label === 'Panjat' ? 'text-ink' : current ? 'text-white' : 'text-white/60'}`}>
                {p.label}
                <span className="hidden font-semibold opacity-70 sm:inline">{p.min}m</span>
              </span>
            </li>
          );
        })}
      </ol>
      <span className="shrink-0 whitespace-nowrap text-right text-sm font-bold tabular-nums text-muted">{mmss(elapsed)} / 35:00</span>
    </div>
  );
}

function Standings({ ranked, now, emit, playing }) {
  const flip = useFlip(ranked.map((t) => t.id).join());
  return (
    <section className="panel-dark flex shrink-0 flex-col p-4" aria-label="Klasemen">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-extrabold">Klasemen</h2>
        <span className="text-xs text-muted">puncak = node {SUMMIT}</span>
      </div>
      <ol className="flex flex-col gap-1.5">
        {ranked.map((t) => {
          const m = teamMeta(t.id);
          const fx = TIMED_EFFECTS.filter((k) => isActive(t.effects?.[k], now));
          const mood = isActive(t.effects?.freeze, now) ? 'frozen' : t.done ? 'wow' : fx.length ? 'dizzy' : 'happy';
          return (
            <li key={t.id} ref={flip(t.id)} className="flex items-center gap-2.5 rounded-2xl bg-white/[0.04] px-2 py-1.5">
              <span className={`w-6 text-center text-lg font-extrabold ${t.rank === 1 ? 'text-gold' : 'text-white/70'}`}>{t.rank}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-extrabold">{m.short} · {t.name}</span>
                  {t.shield && <SkillIcon id="shield" size={18} title="Perisai aktif" />}
                  {fx.map((k) => <SkillIcon key={k} id={k} size={18} title={SKILLS[k].name} />)}
                  <span className="ml-auto shrink-0 text-xs text-muted">
                    {t.members.length ? `${t.members.length} siswa · ` : ''}{t.bag.length} skill
                  </span>
                </div>
                <RopeMeter teamId={t.id} node={t.node} mood={mood} />
              </div>
              <span className="w-10 text-right text-xl font-extrabold tabular-nums">{t.node}</span>
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        disabled={!playing}
        onClick={() => emit('teacher:gift')}
        className="btn btn-ghost mt-3 self-start text-sm text-cyan"
        title={playing ? undefined : 'Aktif saat permainan berjalan'}
      >
        <SkillIcon id="crate" size={22} />
        Bagikan kotak skill ke semua kelompok
      </button>
    </section>
  );
}

function Feed({ events }) {
  const list = [...events].reverse().filter((e) => eventParts(e).text).slice(0, 12);
  return (
    <section className="panel-dark flex min-h-[220px] flex-1 flex-col overflow-hidden p-4" aria-label="Siaran tebing">
      <h2 className="mb-3 text-lg font-extrabold">Siaran tebing</h2>
      {list.length === 0 ? (
        <p className="text-sm text-muted">Belum ada kejadian. Tekan Mulai panjat, lalu kejadian dari HP siswa muncul di sini.</p>
      ) : (
        <ol className="on-light -mr-2 flex flex-col gap-2 overflow-y-auto pr-2" aria-live="polite">
          {list.map((ev) => {
            const actor = ev.fromId || ev.toId;
            const icon = ev.secret ? null : ev.skillId || (ev.type === 'loot' || ev.type === 'gift' ? 'crate' : null);
            return (
              <li key={ev.id} className="chip pop-in rounded-[18px] py-1.5 pl-1.5 pr-3">
                <span className="num-dot">{ev.id}</span>
                {actor && <ClimberFace teamId={actor} size={26} />}
                {icon && <SkillIcon id={icon} size={24} />}
                <span className="text-[13px] font-semibold leading-snug">{eventParts(ev).text}</span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function QrModal({ open, onClose }) {
  const [ips, setIps] = useState([]);
  const [host, setHost] = useState(window.location.hostname);
  const [qr, setQr] = useState('');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!open) return;
    fetch('/api/network-info')
      .then((r) => r.json())
      .then((data) => {
        if (data.ips?.length) {
          setIps(data.ips);
          if (['localhost', '127.0.0.1'].includes(window.location.hostname)) setHost(data.ips[0].address);
        }
      })
      .catch(() => {});
  }, [open]);

  const port = window.location.port ? `:${window.location.port}` : '';
  const url = `${window.location.protocol}//${host}${port}/?role=student`;

  useEffect(() => {
    if (!open) return;
    setStatus('loading');
    QRCode.toDataURL(url, { width: 320, margin: 1, color: { dark: '#0E0F24', light: '#FFFFFF' } })
      .then((d) => { setQr(d); setStatus('ok'); })
      .catch(() => setStatus('error'));
  }, [url, open]);

  return (
    <Modal open={open} onClose={onClose} label="QR untuk HP siswa" size="md" sheetOnMobile={false}>
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold">Scan untuk ikut memanjat</h2>
            <p className="text-sm text-ink-2">HP siswa harus tersambung ke Wi-Fi yang sama dengan laptop ini.</p>
          </div>
          <CloseButton onClick={onClose} />
        </div>

        {ips.length > 1 && (
          <label className="flex items-center justify-between gap-3 rounded-2xl bg-paper px-3 py-2 text-sm font-semibold">
            Jaringan
            <select value={host} onChange={(e) => setHost(e.target.value)} className="min-h-10 rounded-xl bg-white px-2 font-mono text-sm">
              {ips.map((n) => <option key={n.address} value={n.address}>{n.address} ({n.name})</option>)}
              <option value="localhost">localhost</option>
            </select>
          </label>
        )}

        <div className="flex h-72 items-center justify-center rounded-[24px] bg-paper">
          {status === 'loading' && <p className="text-sm text-ink-2">Membuat kode QR...</p>}
          {status === 'error' && <p className="text-sm font-bold text-[#B3261E]">Kode QR gagal dibuat. Pakai alamat di bawah.</p>}
          {status === 'ok' && <img src={qr} alt={`Kode QR menuju ${url}`} className="h-64 w-64 rounded-2xl" />}
        </div>

        <div className="rounded-2xl bg-paper p-3 text-center">
          <p className="text-xs font-bold text-ink-2">Atau ketik di browser HP</p>
          <p className="select-all break-all font-mono text-sm font-bold">{url}</p>
        </div>

        <a href="/?role=student" target="_blank" rel="noreferrer" className="btn btn-ink">Buka layar siswa di tab baru</a>
      </div>
    </Modal>
  );
}

function SpeakerIcon({ off }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" fill="currentColor" />
      {off ? (
        <path d="M16 9 L21 15 M21 9 L16 15" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      ) : (
        <path d="M16.5 8.5 C18.5 10.5 18.5 13.5 16.5 15.5 M19 6 C22.5 9.5 22.5 14.5 19 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      )}
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M5 12 A7 7 0 1 0 8 6.3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M8.5 2.5 L8 6.8 L3.8 6.2" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
