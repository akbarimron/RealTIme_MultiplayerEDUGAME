import React, { useState } from 'react';
import { TEAMS } from '../game/engine';
import ClimberFace from './art/ClimberFace';
import { Moon, Island, Stars } from './art/Scenery';
import { sounds } from '../utils/audio';

const ROLES = [
  ['Pendaki Utama', 'menjawab soal di HP'],
  ['Navigator Tali', 'mencocokkan pointer di LKPD'],
  ['Pencatat Node', 'menyalin pseudocode'],
  ['Juru Bicara', 'presentasi akhir']
];

// Layar gabung untuk HP siswa yang membuka link/QR dari proyektor
export default function StudentJoin({ roomState, onJoin }) {
  const [teamId, setTeamId] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState(ROLES[0][0]);
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!teamId) { setError('Pilih kelompokmu dulu.'); return; }
    if (!name.trim()) { setError('Tulis nama panggilanmu.'); return; }
    sounds.init();
    sounds.playPop();
    onJoin({ teamId, name: name.trim(), role });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-night text-white">
      <div className="relative shrink-0 overflow-hidden px-5 pb-24 pt-[max(28px,env(safe-area-inset-top))]">
        <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMin slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <Stars x={0} y={0} w={400} h={200} count={30} seed={2} />
          <Moon cx={300} cy={42} r={24} />
        </svg>
        <div className="relative max-w-[78%]">
          <h1 className="text-3xl font-extrabold leading-none">Panjat Tebing <span className="text-cyan">Strukdat</span></h1>
          <p className="mt-2 text-sm text-muted">Tiap jawaban benar naik 1 node, salah tetap di tempat. Tiap 3 jawaban dapat 2 skill.</p>
        </div>
        <svg viewBox="0 0 400 90" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 h-24 w-full" aria-hidden="true">
          <Island x={-30} y={40} w={190} depth={60} seed={4} vines={2} />
          <Island x={250} y={62} w={190} depth={40} seed={6} vines={1} />
        </svg>
      </div>

      <form onSubmit={submit} className="on-light relative -mt-6 flex flex-1 flex-col gap-5 rounded-t-[28px] bg-paper px-5 pb-8 pt-6 text-ink" noValidate>
        <fieldset>
          <legend className="mb-2 text-sm font-extrabold">Kelompokmu</legend>
          <div className="grid grid-cols-5 gap-2">
            {TEAMS.map((t) => {
              const team = roomState.teams.find((x) => x.id === t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={teamId === t.id}
                  aria-label={`${t.short} ${t.name}, ${team?.members.length || 0} siswa`}
                  onClick={() => { setTeamId(t.id); setError(''); }}
                  className={`flex flex-col items-center gap-1 rounded-[18px] py-2 transition-transform ${teamId === t.id ? 'scale-105 bg-ink text-white' : 'bg-white shadow-[0_4px_12px_rgba(20,16,60,0.08)]'}`}
                >
                  <ClimberFace teamId={t.id} size={40} mood={teamId === t.id ? 'wow' : 'happy'} />
                  <span className="text-sm font-extrabold">{t.short}</span>
                  <span className={`text-[11px] ${teamId === t.id ? 'text-muted' : 'text-ink-2'}`}>{team?.members.length || 0} siswa</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor="nama" className="mb-2 block text-sm font-extrabold">Nama panggilan</label>
          <input
            id="nama"
            type="text"
            autoComplete="nickname"
            maxLength={24}
            placeholder="Nama panggilanmu"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            className="h-12 w-full rounded-2xl bg-white px-4 text-base font-semibold shadow-[0_4px_12px_rgba(20,16,60,0.08)] outline-none ring-2 ring-transparent placeholder:text-ink-2/70 focus:ring-ink"
          />
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-extrabold">Peran di kelompok</legend>
          <div className="flex flex-col gap-2">
            {ROLES.map(([r, hint]) => (
              <label key={r} className={`chip cursor-pointer rounded-[18px] py-2.5 pl-3.5 pr-4 ${role === r ? 'ring-2 ring-ink' : ''}`}>
                <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="h-4 w-4 shrink-0 accent-[#0E0F24]" />
                <span className="flex flex-col leading-tight">
                  <span className="font-bold">{r}</span>
                  <span className="text-sm text-ink-2">{hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {error && <p role="alert" className="text-sm font-bold text-[#B3261E]">{error}</p>}

        <button type="submit" className="btn btn-ink mt-auto min-h-[54px] w-full text-base">Gabung ke tebing</button>
      </form>
    </div>
  );
}
