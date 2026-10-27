import React, { useCallback, useEffect, useRef, useState } from 'react';
import TeacherDashboard from './components/TeacherDashboard';
import StudentClient from './components/StudentClient';
import StudentJoin from './components/StudentJoin';
import SupabaseConfigModal from './components/SupabaseConfigModal';
import ClimberFace from './components/art/ClimberFace';
import SkillIcon from './components/art/SkillIcon';
import { realtimeHub } from './utils/realtimeHub';
import { createInitialState, reduce, hasPendingExplosion, TEAMS } from './game/engine';
import { SKILLS, SKILL_IDS, GROUP_LABEL } from './game/skills';

const params = new URLSearchParams(window.location.search);
// HP siswa asli dibuka lewat QR (?role=student). Tab lain adalah tab guru = host permainan.
const IS_PHONE = params.get('role') === 'student';
const IS_HOST = !IS_PHONE;

const readSession = (key, fallback) => {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const writeSession = (key, value) => {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* mode privat */ }
};

const TRANSPORT_LABEL = {
  local: 'Lokal: antar tab di laptop ini',
  socket: 'Server Wi-Fi',
  supabase: 'Supabase online',
  'supabase-connecting': 'Menyambung ke Supabase...'
};

const VIEWS = [
  ['teacher', 'Layar guru'],
  ['student', 'HP siswa'],
  ['duel', 'Adu 2 HP']
];

export default function App() {
  const stateRef = useRef(null);
  if (!stateRef.current) stateRef.current = createInitialState();
  const [roomState, setRoomState] = useState(stateRef.current);
  const offsetRef = useRef(0);
  const [tick, setTick] = useState(() => Date.now());
  const [transport, setTransport] = useState('local');
  const [showConfig, setShowConfig] = useState(false);

  const [view, setView] = useState(() => (IS_PHONE ? 'student' : readSession('pt-view', 'teacher')));
  const [demoTeam, setDemoTeam] = useState(() => readSession('pt-demo-team', 1));
  const [duelTeams, setDuelTeams] = useState(() => readSession('pt-duel-teams', [1, 2]));
  const [player, setPlayer] = useState(() => (IS_PHONE ? readSession('pt-player', null) : null));

  useEffect(() => { if (IS_HOST) writeSession('pt-view', view); }, [view]);
  useEffect(() => { if (IS_HOST) writeSession('pt-demo-team', demoTeam); }, [demoTeam]);
  useEffect(() => { if (IS_HOST) writeSession('pt-duel-teams', duelTeams); }, [duelTeams]);

  useEffect(() => {
    realtimeHub.init((s) => {
      if (!s || s.v !== 2) return;
      offsetRef.current = IS_HOST ? 0 : (s.sentAt ? s.sentAt - Date.now() : 0);
      stateRef.current = s;
      setRoomState(s);
    });

    realtimeHub.setActionHandler(({ action, payload }) => {
      if (!IS_HOST) return;
      if (action === 'sync:request') {
        realtimeHub.broadcastState({ ...stateRef.current, sentAt: Date.now() });
        return;
      }
      const next = reduce(stateRef.current, action, payload, Date.now());
      realtimeHub.broadcastState({ ...next, sentAt: Date.now() });
    });

    realtimeHub.onReady(() => {
      if (!IS_HOST) {
        realtimeHub.emitAction('sync:request');
      } else {
        realtimeHub.broadcastState({ ...stateRef.current, sentAt: Date.now() });
      }
    });

    // Request sync berkala untuk siswa jika belum mulai (mengantisipasi jeda koneksi mobile)
    let syncTimer = null;
    if (!IS_HOST) {
      realtimeHub.emitAction('sync:request');
      syncTimer = setInterval(() => {
        if (!stateRef.current?.isPlaying) {
          realtimeHub.emitAction('sync:request');
        }
      }, 3000);
    }

    const poll = setInterval(() => setTransport(realtimeHub.transport), 1200);
    return () => {
      clearInterval(poll);
      if (syncTimer) clearInterval(syncTimer);
      realtimeHub.destroy();
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const now = tick + offsetRef.current;
  const emit = useCallback((action, payload) => realtimeHub.emitAction(action, payload), []);

  // host: siarkan denyut state berkala saat bermain agar HP siswa tidak pernah tertinggal
  useEffect(() => {
    if (!IS_HOST || !roomState.isPlaying) return;
    const heartbeat = setInterval(() => {
      realtimeHub.broadcastState({ ...stateRef.current, sentAt: Date.now() });
    }, 2500);
    return () => clearInterval(heartbeat);
  }, [roomState.isPlaying]);

  // host: akhiri permainan saat 15 menit habis, dan ledakkan Bom Waktu tepat waktu
  // (mode server Wi-Fi: server yang mengurus detak ini)
  useEffect(() => {
    if (!IS_HOST) return;
    if (roomState.isPlaying && roomState.gameEndsAt && now >= roomState.gameEndsAt) emit('game:timeup');
    else if (transport !== 'socket' && hasPendingExplosion(roomState, now)) emit('game:tick');
  }, [now, roomState, transport, emit]);

  const handleJoin = (p) => {
    writeSession('pt-player', p);
    setPlayer(p);
    emit('player:join', { teamId: p.teamId, playerName: p.name, role: p.role });
  };

  const phone = (teamId) => (
    <StudentClient
      key={teamId}
      roomState={roomState}
      now={now}
      teamId={teamId}
      playerName={`Uji coba ${TEAMS[teamId - 1].short}`}
      emit={emit}
      demo
    />
  );

  return (
    <div className="flex min-h-dvh flex-col bg-night">
      {IS_HOST && (
        <DemoBar view={view} setView={setView} transport={transport} onOpenConfig={() => setShowConfig(true)} />
      )}

      {view === 'teacher' && IS_HOST && (
        <TeacherDashboard roomState={roomState} now={now} emit={emit} transport={transport} />
      )}

      {view === 'student' && IS_HOST && (
        <div className="flex flex-1 justify-center bg-[#05060F] px-0 sm:px-4 sm:py-4">
          <div className="flex w-full max-w-[440px] flex-col gap-3">
            <DemoPhoneControls teamId={demoTeam} setTeamId={setDemoTeam} emit={emit} />
            <PhoneFrame>{phone(demoTeam)}</PhoneFrame>
          </div>
        </div>
      )}

      {view === 'duel' && IS_HOST && (
        <div className="flex flex-1 flex-wrap items-start justify-center gap-x-10 gap-y-6 bg-[#05060F] px-4 py-4">
          {[0, 1].map((slot) => (
            <div key={slot} className="flex w-full max-w-[400px] flex-col gap-3">
              <DemoPhoneControls
                teamId={duelTeams[slot]}
                setTeamId={(id) => setDuelTeams((d) => (slot === 0 ? [id, d[1]] : [d[0], id]))}
                emit={emit}
                label={slot === 0 ? 'HP kiri' : 'HP kanan'}
              />
              <PhoneFrame>{phone(duelTeams[slot])}</PhoneFrame>
            </div>
          ))}
        </div>
      )}

      {IS_PHONE && (player ? (
        <div className="h-dvh">
          <StudentClient
            key={player.teamId}
            roomState={roomState}
            now={now}
            teamId={player.teamId}
            playerName={player.name}
            emit={emit}
            onLeave={() => { sessionStorage.removeItem('pt-player'); setPlayer(null); }}
          />
        </div>
      ) : (
        <StudentJoin roomState={roomState} onJoin={handleJoin} />
      ))}

      <SupabaseConfigModal isOpen={showConfig} onClose={() => setShowConfig(false)} />
    </div>
  );
}

function PhoneFrame({ children }) {
  return (
    <div className="relative h-[calc(100dvh-120px)] w-full overflow-hidden sm:h-[min(820px,calc(100dvh-150px))] sm:rounded-[34px] sm:shadow-[0_0_0_10px_#1C1740,0_30px_80px_rgba(0,0,0,0.6)]">
      {children}
    </div>
  );
}

function DemoBar({ view, setView, transport, onOpenConfig }) {
  return (
    <div className="border-b border-white/10 bg-[#05060F] text-white">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 md:px-6">
        <span className="text-sm font-extrabold text-cyan">Mode uji coba</span>
        <div role="group" aria-label="Pilih tampilan" className="flex rounded-full bg-white/[0.07] p-1">
          {VIEWS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={view === id}
              onClick={() => setView(id)}
              className={`min-h-9 rounded-full px-3.5 text-sm font-bold transition-colors ${view === id ? 'bg-white text-ink' : 'text-white/80 hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </div>
        {view === 'duel' && (
          <span className="text-sm text-muted">Lempar skill dari satu HP, efeknya langsung terlihat di HP sebelah.</span>
        )}
        <button
          type="button"
          onClick={onOpenConfig}
          className="ml-auto flex min-h-9 items-center gap-2 rounded-full px-3 text-sm text-muted transition-colors hover:bg-white/[0.07] hover:text-white"
        >
          <span className="h-2 w-2 rounded-full" style={{ background: transport === 'local' ? '#FFB800' : '#3CE0A0' }} aria-hidden="true" />
          {TRANSPORT_LABEL[transport]}
        </button>
      </div>
    </div>
  );
}

// Kontrol uji coba per HP: pilih pendaki, beri skill tertentu, atau 2 skill acak
function DemoPhoneControls({ teamId, setTeamId, emit, label }) {
  const [skill, setSkill] = useState('joker');
  const groups = Object.keys(GROUP_LABEL);
  return (
    <div className="flex flex-col gap-2 px-3 pt-3 text-white sm:px-0 sm:pt-0">
      <div className="flex flex-wrap items-center gap-2">
        {label && <span className="text-sm font-extrabold">{label}</span>}
        <span className="text-sm text-muted">Main sebagai</span>
        <div role="group" aria-label={`${label || 'HP'}: pilih pendaki`} className="flex gap-1">
          {TEAMS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={teamId === t.id}
              aria-label={`Main sebagai ${t.short} ${t.name}`}
              onClick={() => setTeamId(t.id)}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-transform ${teamId === t.id ? 'scale-110 bg-white/15 ring-2 ring-white' : 'opacity-60 hover:opacity-100'}`}
            >
              <ClimberFace teamId={t.id} size={32} />
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-muted">
          <SkillIcon id={skill} size={28} />
          <span className="sr-only">Skill untuk dicoba</span>
          <select
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="h-9 rounded-full bg-[#1C1740] px-3 text-sm font-semibold text-white ring-1 ring-white/15"
          >
            {groups.map((g) => (
              <optgroup key={g} label={GROUP_LABEL[g]}>
                {SKILL_IDS.filter((id) => SKILLS[id].group === g).map((id) => (
                  <option key={id} value={id}>{SKILLS[id].name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <button type="button" onClick={() => emit('demo:give', { teamId, skillId: skill })} className="btn btn-white min-h-9 px-3.5 text-sm">
          Beri skill ini
        </button>
        <button type="button" onClick={() => emit('demo:gift', { teamId })} className="btn btn-ghost min-h-9 text-sm">
          <SkillIcon id="crate" size={22} />
          Acak 2
        </button>
      </div>
    </div>
  );
}
