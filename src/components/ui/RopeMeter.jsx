import React from 'react';
import { SUMMIT, teamMeta } from '../../game/engine';
import ClimberFace from '../art/ClimberFace';

// Progres sebagai tali dengan simpul (node). Simpul = node linked list, tali = pointer next.
export default function RopeMeter({ teamId, node, mood = 'happy', face = true, tone = 'dark' }) {
  const m = teamMeta(teamId);
  const pct = (node / SUMMIT) * 100;
  const knot = tone === 'dark' ? '#B98552' : '#B98552';
  return (
    <div
      className="relative h-8 w-full"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={SUMMIT}
      aria-valuenow={node}
      aria-label={`${m.short} di node ${node} dari ${SUMMIT}`}
    >
      <div
        className="absolute left-3 right-3 top-1/2 h-[7px] -translate-y-1/2 rounded-full"
        style={{
          background: 'repeating-linear-gradient(135deg, #D9A55B 0 5px, #A8732F 5px 8px)',
          boxShadow: '0 0 0 2px #0E0F24'
        }}
      />
      <div
        className="absolute left-3 top-1/2 h-[7px] -translate-y-1/2 rounded-full transition-[width] duration-500 ease-pop"
        style={{
          width: `calc((100% - 24px) * ${pct / 100})`,
          background: `repeating-linear-gradient(135deg, ${m.color} 0 5px, ${m.dark} 5px 8px)`
        }}
      />
      {Array.from({ length: SUMMIT - 1 }, (_, i) => i + 1).map((n) => (
        <span
          key={n}
          className="absolute top-1/2 h-[11px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ left: `calc(12px + (100% - 24px) * ${n / SUMMIT})`, background: n <= node ? m.dark : knot, boxShadow: '0 0 0 2px #0E0F24' }}
        />
      ))}
      <span
        className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[3px]"
        style={{ left: 'calc(100% - 12px)', background: '#FFC93C', boxShadow: '0 0 0 2px #0E0F24' }}
      />
      {face && (
        <span
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-500 ease-pop"
          style={{ left: `calc(12px + (100% - 24px) * ${pct / 100})` }}
        >
          <ClimberFace teamId={teamId} size={30} mood={mood} />
        </span>
      )}
    </div>
  );
}
