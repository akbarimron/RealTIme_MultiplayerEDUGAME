import React, { useRef, useState } from 'react';
import Modal, { CloseButton } from './ui/Modal';
import { sounds } from '../utils/audio';

const START = [
  { id: 1, val: 'A', next: 2 },
  { id: 2, val: 'B', next: 3 },
  { id: 3, val: 'C', next: null }
];

// urutkan node mengikuti pointer next dari head
function chain(nodes) {
  if (!nodes.length) return [];
  const pointed = new Set(nodes.map((n) => n.next).filter(Boolean));
  let cur = nodes.find((n) => !pointed.has(n.id));
  const out = [];
  while (cur && out.length <= nodes.length) {
    out.push(cur);
    cur = nodes.find((n) => n.id === cur.next);
  }
  return out;
}

export default function LinkedListDemoModal({ isOpen, onClose }) {
  const [nodes, setNodes] = useState(START);
  const [active, setActive] = useState(null);
  const [changed, setChanged] = useState([]);
  const [value, setValue] = useState('X');
  const [code, setCode] = useState('// Pilih aksi: sisip setelah node, hapus node, atau telusuri.');
  const [busy, setBusy] = useState(false);
  const nextId = useRef(4);

  const list = chain(nodes);
  const label = (id) => nodes.find((n) => n.id === id)?.val ?? 'NULL';

  const insertAfter = (prev) => {
    const val = (value.trim() || 'X').slice(0, 3);
    const id = nextId.current++;
    const old = prev.next;
    sounds.playCorrect();
    setNodes((ns) => [...ns.map((n) => (n.id === prev.id ? { ...n, next: id } : n)), { id, val, next: old }]);
    setChanged([prev.id, id]);
    setCode(
      `Node* baru = new Node("${val}");\n` +
      `baru->next = ${prev.val}->next;   // ${val} menunjuk ${old ? label(old) : 'NULL'}\n` +
      `${prev.val}->next = baru;          // ${prev.val} menunjuk ${val}\n` +
      '// Hanya 2 kait yang berubah. Node lain tidak digeser: O(1).'
    );
  };

  const remove = (target) => {
    const prev = nodes.find((n) => n.next === target.id);
    sounds.playWrong();
    if (prev) {
      setNodes((ns) => ns.map((n) => (n.id === prev.id ? { ...n, next: target.next } : n)).filter((n) => n.id !== target.id));
      setChanged([prev.id]);
      setCode(`${prev.val}->next = ${target.val}->next;   // lompati ${target.val}\ndelete ${target.val};               // bebaskan memori`);
    } else {
      setNodes((ns) => ns.filter((n) => n.id !== target.id));
      setChanged([]);
      setCode(`Node* temp = head;   // ${target.val}\nhead = head->next;\ndelete temp;`);
    }
  };

  const traverse = async () => {
    if (busy) return;
    setBusy(true);
    setChanged([]);
    setCode('Node* curr = head;\nwhile (curr != NULL) {\n    cout << curr->data << " -> ";\n    curr = curr->next;\n}');
    for (const n of list) {
      setActive(n.id);
      sounds.playTick();
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 650));
    }
    setActive(null);
    setBusy(false);
  };

  const reset = () => {
    setNodes(START);
    setChanged([]);
    setActive(null);
    nextId.current = 4;
    setCode('// Kembali ke 3 node awal: A -> B -> C -> NULL');
  };

  return (
    <Modal open={isOpen} onClose={onClose} label="Materi 5 menit: ubah kait, bukan geser" size="xl" sheetOnMobile={false}>
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-ink-2">Materi 5 menit</p>
            <h2 className="text-2xl font-extrabold md:text-3xl">Ubah kait, <span className="text-[#6C4BD8]">bukan geser</span></h2>
            <p className="mt-1 max-w-2xl text-[15px] text-ink-2">
              Setiap node berisi data dan kait <code className="font-mono">next</code> ke node berikutnya, seperti simpul di tali panjat.
              Sisipkan node di tengah, lalu perhatikan: node lain tidak pindah tempat.
            </p>
          </div>
          <CloseButton onClick={onClose} />
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-[22px] bg-paper p-3">
          <label className="flex flex-col gap-1 text-sm font-bold">
            Isi node baru
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={3}
              className="h-11 w-24 rounded-xl bg-white px-3 font-mono text-lg font-bold outline-none ring-2 ring-transparent focus:ring-ink"
            />
          </label>
          <button type="button" onClick={traverse} disabled={busy || !list.length} className="btn btn-ink">
            {busy ? 'Menelusuri...' : 'Telusuri dari head'}
          </button>
          <button type="button" onClick={reset} className="btn btn-white ring-1 ring-[#D6D2EA]">Kembali ke awal</button>
        </div>

        <div className="overflow-x-auto rounded-[22px] bg-night p-5">
          {list.length === 0 ? (
            <p className="py-8 text-center font-semibold text-muted">List kosong: head = NULL. Tekan Kembali ke awal.</p>
          ) : (
            <ol className="flex min-w-max items-center gap-2" aria-label="Rangkaian node">
              <li className="flex items-center gap-2 text-white">
                <span className="rounded-full bg-cyan px-3 py-1.5 text-sm font-extrabold text-ink">head</span>
                <Hook />
              </li>
              {list.map((n) => {
                const isActive = active === n.id;
                const isChanged = changed.includes(n.id);
                return (
                  <li key={n.id} className="flex items-center gap-2">
                    <div className={`pop-in flex flex-col gap-2 rounded-[18px] bg-white p-2 text-ink transition-transform ${isActive ? 'climb-hop ring-4 ring-gold' : ''} ${isChanged ? 'ring-4 ring-mint' : ''}`}>
                      <div className="flex overflow-hidden rounded-xl font-mono text-base font-bold">
                        <span className="bg-[#ECE9FB] px-4 py-2">{n.val}</span>
                        <span className="bg-[#FFF3CC] px-3 py-2 text-sm">{n.next ? `-> ${label(n.next)}` : 'NULL'}</span>
                      </div>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => insertAfter(n)} className="btn btn-ink min-h-9 flex-1 px-3 text-xs">Sisip setelah</button>
                        <button type="button" onClick={() => remove(n)} aria-label={`Hapus node ${n.val}`} className="btn min-h-9 bg-coral px-3 text-xs text-ink">Hapus</button>
                      </div>
                    </div>
                    <Hook />
                  </li>
                );
              })}
              <li className="rounded-full border-2 border-dashed border-coral px-3 py-1.5 font-mono text-sm font-bold text-coral">NULL</li>
            </ol>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
          <div>
            <p className="mb-2 text-sm font-extrabold">Kode yang terjadi</p>
            <pre className="whitespace-pre-wrap rounded-[18px] bg-night p-4 font-mono text-[13px] leading-relaxed text-mint">{code}</pre>
          </div>
          <div className="rounded-[18px] bg-[#FFF3CC] p-4">
            <p className="mb-1 text-sm font-extrabold">Pertanyaan diskusi</p>
            <p className="text-[15px] leading-relaxed">
              Saat node baru disisipkan, apakah node di belakangnya ikut digeser di memori? Tidak.
              Hanya dua kait yang diarahkan ulang, jadi sisip setelah node yang sudah ditemukan bernilai O(1).
              Bandingkan dengan array yang harus menggeser semua elemen di belakangnya.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Hook() {
  return (
    <svg viewBox="0 0 40 16" width="40" height="16" aria-hidden="true" className="shrink-0">
      <path d="M2 8 H32" stroke="#D9A55B" strokeWidth="4" strokeLinecap="round" />
      <path d="M2 8 H32" stroke="#A8732F" strokeWidth="4" strokeDasharray="2 5" />
      <path d="M30 2 L38 8 L30 14 Z" fill="#D9A55B" />
    </svg>
  );
}
