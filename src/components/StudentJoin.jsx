import React, { useState } from 'react';
import { TEAMS } from '../game/engine';
import ClimberFace from './art/ClimberFace';
import { Moon, Island, Stars } from './art/Scenery';
import { sounds } from '../utils/audio';
import { getDeviceId } from '../utils/deviceId';

// Layar pemilihan kelompok untuk HP siswa (1 device = 1 tim)
export default function StudentJoin({ roomState, onJoin, transport = 'local', onOpenAdminLogin }) {
  const [teamId, setTeamId] = useState(null);
  const [error, setError] = useState('');
  const myDeviceId = getDeviceId();

  const selectedTeam = teamId ? TEAMS.find((x) => x.id === teamId) : null;
  const availableSlots = TEAMS.filter((t) => {
    const roomTeam = roomState.teams.find((x) => x.id === t.id);
    const isClaimed = Boolean(roomTeam?.claimed || (roomTeam?.members && roomTeam.members.length > 0));
    const isMyDevice = roomTeam?.claimedBy && roomTeam.claimedBy === myDeviceId;
    return !isClaimed || isMyDevice;
  }).length;

  const submit = (e) => {
    e.preventDefault();
    if (!teamId) {
      setError('Silakan pilih salah satu kelompok yang masih kosong.');
      return;
    }

    const roomTeam = roomState.teams.find((x) => x.id === teamId);
    const isClaimed = Boolean(roomTeam?.claimed || (roomTeam?.members && roomTeam.members.length > 0));
    const isMyDevice = roomTeam?.claimedBy && roomTeam.claimedBy === myDeviceId;

    if (isClaimed && !isMyDevice) {
      setError(`Kelompok ${selectedTeam?.short} baru saja diambil oleh HP lain. Pilih kelompok yang masih kosong.`);
      setTeamId(null);
      return;
    }

    sounds.init();
    sounds.playPop();
    onJoin({
      teamId,
      name: selectedTeam.name,
      deviceId: myDeviceId
    });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-night text-white">
      {/* Header & Scenery */}
      <div className="relative shrink-0 overflow-hidden px-5 pb-20 pt-[max(24px,env(safe-area-inset-top))]">
        <div className="absolute right-4 top-[max(16px,env(safe-area-inset-top))] z-20 flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs backdrop-blur-md">
          <span
            className={`h-2 w-2 rounded-full ${transport === 'supabase-connecting' ? 'animate-pulse' : ''}`}
            style={{
              background: transport === 'supabase' ? '#3CE0A0' : transport === 'supabase-connecting' ? '#FFB800' : transport === 'supabase-error' ? '#FF4757' : '#FFB800'
            }}
          />
          <span className="text-white/80">
            {transport === 'supabase' ? 'Supabase Online' : transport === 'supabase-connecting' ? 'Menghubungkan...' : transport === 'supabase-error' ? 'Supabase Gagal' : 'Mode Lokal'}
          </span>
        </div>

        <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMin slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <Stars x={0} y={0} w={400} h={200} count={30} seed={2} />
          <Moon cx={300} cy={42} r={24} />
        </svg>

        <div className="relative max-w-[85%]">
          <div className="inline-block rounded-full bg-cyan/20 px-3 py-1 text-xs font-bold text-cyan mb-2">
            1 Device = 1 Kelompok
          </div>
          <h1 className="text-3xl font-extrabold leading-none">Panjat Tebing <span className="text-cyan">Strukdat</span></h1>
          <p className="mt-2 text-sm text-muted">Pilih slot kelompok yang masih kosong untuk mulai memanjat tebing bersama kelompokmu.</p>
        </div>

        <svg viewBox="0 0 400 90" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 h-20 w-full" aria-hidden="true">
          <Island x={-30} y={40} w={190} depth={60} seed={4} vines={2} />
          <Island x={250} y={62} w={190} depth={40} seed={6} vines={1} />
        </svg>
      </div>

      {/* Main Join Container */}
      <form onSubmit={submit} className="on-light relative -mt-6 flex flex-1 flex-col gap-5 rounded-t-[28px] bg-paper px-5 pb-8 pt-6 text-ink" noValidate>
        <fieldset>
          <div className="mb-3 flex items-center justify-between">
            <legend className="text-sm font-extrabold text-ink">Pilih Kelompok Tim</legend>
            <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-ink-2 shadow-sm">
              {availableSlots} dari 5 slot kosong
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {TEAMS.map((t) => {
              const roomTeam = roomState.teams.find((x) => x.id === t.id);
              const isClaimed = Boolean(roomTeam?.claimed || (roomTeam?.members && roomTeam.members.length > 0));
              const isMyDevice = roomTeam?.claimedBy && roomTeam.claimedBy === myDeviceId;
              const isTakenByOther = isClaimed && !isMyDevice;
              const isSelected = teamId === t.id;

              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={isTakenByOther}
                  aria-pressed={isSelected}
                  onClick={() => {
                    if (isTakenByOther) return;
                    setTeamId(t.id);
                    setError('');
                  }}
                  className={`relative flex flex-col items-center gap-1 rounded-[20px] py-3 px-1 transition-all ${
                    isTakenByOther
                      ? 'opacity-40 bg-[#E8E6F0] cursor-not-allowed text-ink-2/70'
                      : isSelected
                      ? 'scale-105 bg-ink text-white shadow-xl ring-2 ring-cyan'
                      : 'bg-white shadow-[0_4px_12px_rgba(20,16,60,0.08)] hover:scale-102 hover:shadow-md'
                  }`}
                >
                  {isTakenByOther && (
                    <span className="absolute -top-1.5 right-1 rounded-full bg-paper px-1.5 py-0.2 text-[9px] font-bold text-ink-2">
                      Terisi
                    </span>
                  )}
                  {isMyDevice && (
                    <span className="absolute -top-1.5 right-1 rounded-full bg-mint px-1.5 py-0.2 text-[9px] font-bold text-ink">
                      HP Ini
                    </span>
                  )}
                  <ClimberFace teamId={t.id} size={42} mood={isSelected ? 'wow' : isTakenByOther ? 'scared' : 'happy'} />
                  <span className="text-sm font-extrabold">{t.short}</span>
                  <span className={`text-[11px] font-bold ${
                    isSelected
                      ? 'text-cyan'
                      : isTakenByOther
                      ? 'text-ink-2/70'
                      : 'text-mint-dark font-extrabold'
                  }`}>
                    {isTakenByOther ? 'Terisi' : isMyDevice ? 'Aktif' : 'Kosong'}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {selectedTeam && (
          <div className="flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-sm border border-black/5 animate-fade-in">
            <div className="rounded-xl bg-paper p-1.5 shrink-0">
              <ClimberFace teamId={selectedTeam.id} size={44} mood="wow" />
            </div>
            <div>
              <p className="text-base font-extrabold text-ink">{selectedTeam.short} · {selectedTeam.name}</p>
              <p className="text-xs text-ink-2">HP ini akan menjadi perwakilan tunggal kelompok {selectedTeam.name}.</p>
            </div>
          </div>
        )}

        {availableSlots === 0 && !teamId && (
          <div className="rounded-2xl bg-coral/15 p-4 text-center text-sm font-bold text-[#D32F2F]">
            Semua 5 kelompok sudah terisi oleh HP siswa lain. Jika ingin berganti, silakan minta guru mereset sesi.
          </div>
        )}

        {error && <p role="alert" className="text-sm font-bold text-[#B3261E]">{error}</p>}

        <button
          type="submit"
          disabled={!teamId}
          className="btn btn-ink mt-auto min-h-[54px] w-full text-base font-extrabold disabled:opacity-50"
        >
          {selectedTeam ? `Masuk sebagai ${selectedTeam.short} (${selectedTeam.name})` : 'Pilih Salah Satu Kelompok'}
        </button>

        {onOpenAdminLogin && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onOpenAdminLogin}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-2 hover:text-ink transition-colors"
            >
              <span>🔒</span>
              <span>Masuk sebagai Guru / Pengawas</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
