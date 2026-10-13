import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import Modal, { CloseButton } from './ui/Modal';
import ClimberFace from './art/ClimberFace';
import { Moon, Stars, Island, Portal } from './art/Scenery';
import { SUMMIT, TEAMS, teamMeta } from '../game/engine';
import { sounds } from '../utils/audio';

export default function VictorySnacksModal({ isOpen, ranked = [], winner, onClose }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    sounds.playVictory();
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const colors = TEAMS.map((t) => t.color);
    const end = Date.now() + 3500;
    const id = setInterval(() => {
      if (Date.now() > end) { clearInterval(id); return; }
      confetti({ particleCount: 40, spread: 70, startVelocity: 38, origin: { x: 0.15, y: 0.75 }, angle: 60, colors, zIndex: 1000 });
      confetti({ particleCount: 40, spread: 70, startVelocity: 38, origin: { x: 0.85, y: 0.75 }, angle: 120, colors, zIndex: 1000 });
    }, 300);
    return () => clearInterval(id);
  }, [isOpen]);

  if (!winner) return null;
  const w = teamMeta(winner.id);

  return (
    <Modal open={isOpen} onClose={onClose} label="Pengumuman juara" size="lg" sheetOnMobile={false}>
      <div className="relative h-56 overflow-hidden bg-night">
        <svg viewBox="0 0 700 230" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <Stars x={0} y={0} w={700} h={160} count={40} seed={9} />
          <Moon cx={90} cy={60} r={38} />
          <Island x={170} y={180} w={360} depth={60} seed={14} vines={3} />
          <Portal cx={350} base={176} scale={0.9} />
        </svg>
        <div className="absolute inset-x-0 bottom-6 flex justify-center">
          <div className="climb-hop rounded-full bg-white p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
            <ClimberFace teamId={winner.id} size={96} mood="wow" />
          </div>
        </div>
        <div className="absolute right-3 top-3"><CloseButton onClick={onClose} /></div>
      </div>

      <div className="flex flex-col gap-5 p-6">
        <div className="text-center">
          <p className="text-sm font-bold text-ink-2">Juara panjat hari ini</p>
          <h2 className="text-3xl font-extrabold md:text-4xl">
            <span className="rounded-xl px-2" style={{ background: w.color }}>{w.short}</span> {winner.name}
          </h2>
          <p className="mt-1 text-[15px] text-ink-2">
            Sampai node {winner.node} dari {SUMMIT} dengan {winner.correct} jawaban benar.
          </p>
        </div>

        <ol className="flex flex-col gap-2">
          {ranked.map((t) => (
            <li key={t.id} className={`flex items-center gap-3 rounded-2xl p-2 ${t.id === winner.id ? 'bg-[#FFF3CC]' : 'bg-paper'}`}>
              <span className="w-7 text-center text-lg font-extrabold">#{t.rank}</span>
              <ClimberFace teamId={t.id} size={36} mood={t.id === winner.id ? 'wow' : 'happy'} />
              <span className="flex-1 font-bold">{teamMeta(t.id).short} · {t.name}</span>
              <span className="text-sm text-ink-2">{t.correct} benar</span>
              <span className="w-12 text-right font-extrabold tabular-nums">{t.node}/{SUMMIT}</span>
            </li>
          ))}
        </ol>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-[22px] bg-gold p-4">
            <p className="text-sm font-bold">Untuk juara 1</p>
            <p className="text-lg font-extrabold">Paket jajan spesial</p>
            <p className="text-sm">Untuk semua anggota {winner.name}.</p>
          </div>
          <div className="rounded-[22px] bg-mint p-4">
            <p className="text-sm font-bold">Untuk semua kelompok</p>
            <p className="text-lg font-extrabold">Jajan apresiasi</p>
            <p className="text-sm">Semua pendaki sudah berlatih mengubah kait, bukan menggeser.</p>
          </div>
        </div>

        <button type="button" onClick={onClose} className="btn btn-ink min-h-[52px] self-center px-8 text-base">
          Lanjut ke refleksi penutup
        </button>
      </div>
    </Modal>
  );
}
