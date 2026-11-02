import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { sounds } from '../utils/audio';

const TOTAL_SLIDES = 6;

const START_NODES = [
  { id: 1, val: 'A', next: 2 },
  { id: 2, val: 'B', next: 3 },
  { id: 3, val: 'C', next: null }
];

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

export default function TeachingSlides({ onGoToGame, onLogout, isHost = true }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  
  // State untuk Simulator Interaktif (Slide 4)
  const [nodes, setNodes] = useState(START_NODES);
  const [activeNode, setActiveNode] = useState(null);
  const [changedNodes, setChangedNodes] = useState([]);
  const [nodeValInput, setNodeValInput] = useState('X');
  const [codeSnippet, setCodeSnippet] = useState('// Pilih tombol: Sisipkan Node, Hapus Node, atau Telusuri.');
  const [isTraversing, setIsTraversing] = useState(false);
  const nextId = useRef(4);

  // State untuk perbandingan Array vs Linked List (Slide 2)
  const [arrayItems, setArrayItems] = useState(['A', 'B', 'C', 'D']);
  const [arrayShifting, setArrayShifting] = useState(false);
  const [arrayHighlight, setArrayHighlight] = useState([]);

  // Generate QR code untuk siswa bergabung
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://multiplayeredugame.vercel.app';
    const studentUrl = `${origin}/?role=student`;
    QRCode.toDataURL(studentUrl, { width: 280, margin: 1, color: { dark: '#0E0F24', light: '#FFFFFF' } })
      .then(setQrUrl)
      .catch(console.error);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const nextSlide = () => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      sounds.playTick();
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      sounds.playTick();
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const goToSlide = (idx) => {
    sounds.playTick();
    setCurrentSlide(idx);
  };

  // Logika Simulator Node (Slide 4)
  const list = chain(nodes);
  const label = (id) => nodes.find((n) => n.id === id)?.val ?? 'NULL';

  const handleInsertAfter = (prev) => {
    const val = (nodeValInput.trim() || 'X').slice(0, 3);
    const id = nextId.current++;
    const oldNext = prev.next;
    sounds.playCorrect();
    setNodes((ns) => [
      ...ns.map((n) => (n.id === prev.id ? { ...n, next: id } : n)),
      { id, val, next: oldNext }
    ]);
    setChangedNodes([prev.id, id]);
    setCodeSnippet(
      `// Langkah 1: Buat node baru di memori\n` +
      `Node* baru = new Node("${val}");\n\n` +
      `// Langkah 2: Kaitkan baru ke gerbong lama (${oldNext ? label(oldNext) : 'NULL'})\n` +
      `baru->next = ${prev.val}->next;\n\n` +
      `// Langkah 3: Alihkan kait ${prev.val} ke baru\n` +
      `${prev.val}->next = baru;\n\n` +
      `// ✅ SELESAI: Kompleksitas O(1)! Node lain tidak digeser!`
    );
  };

  const handleRemove = (target) => {
    const prev = nodes.find((n) => n.next === target.id);
    sounds.playWrong();
    if (prev) {
      setNodes((ns) =>
        ns.map((n) => (n.id === prev.id ? { ...n, next: target.next } : n)).filter((n) => n.id !== target.id)
      );
      setChangedNodes([prev.id]);
      setCodeSnippet(
        `// Langkah 1: Lompatkan kait dari ${prev.val} langsung ke ${target.next ? label(target.next) : 'NULL'}\n` +
        `${prev.val}->next = ${target.val}->next;\n\n` +
        `// Langkah 2: Hapus node ${target.val} dari memori\n` +
        `delete ${target.val};\n\n` +
        `// ✅ O(1) Selesai! Elemen lain tetap di tempatnya.`
      );
    } else {
      setNodes((ns) => ns.filter((n) => n.id !== target.id));
      setChangedNodes([]);
      setCodeSnippet(`Node* temp = head; // ${target.val}\nhead = head->next;\ndelete temp;`);
    }
  };

  const handleTraverse = async () => {
    if (isTraversing) return;
    setIsTraversing(true);
    setChangedNodes([]);
    setCodeSnippet(
      `// Penelusuran (Traverse) berurutan dari Head ke Ekor\n` +
      `Node* curr = head;\n` +
      `while (curr != NULL) {\n` +
      `    cout << curr->data << " -> ";\n` +
      `    curr = curr->next; // Pindah ke simpul berikutnya\n` +
      `}`
    );
    for (const n of list) {
      setActiveNode(n.id);
      sounds.playTick();
      await new Promise((r) => setTimeout(r, 600));
    }
    setActiveNode(null);
    setIsTraversing(false);
  };

  const handleResetNodes = () => {
    setNodes(START_NODES);
    setChangedNodes([]);
    setActiveNode(null);
    nextId.current = 4;
    setCodeSnippet('// Kembali ke 3 node awal: A -> B -> C -> NULL');
  };

  // Demonstrasi Sisip Array (Slide 2)
  const triggerArrayInsertDemo = async () => {
    if (arrayShifting) return;
    setArrayShifting(true);
    setArrayItems(['A', 'B', 'C', 'D']);
    setArrayHighlight([]);
    await new Promise((r) => setTimeout(r, 600));

    // Sisip 'X' di indeks 2: elemen D dan C harus digeser ke kanan
    setArrayHighlight([3]); // D bergeser
    sounds.playTick();
    await new Promise((r) => setTimeout(r, 700));

    setArrayHighlight([2]); // C bergeser
    sounds.playTick();
    await new Promise((r) => setTimeout(r, 700));

    // Sisipkan X
    setArrayItems(['A', 'B', 'X', 'C', 'D']);
    setArrayHighlight([2]);
    sounds.playCorrect();
    await new Promise((r) => setTimeout(r, 900));

    setArrayHighlight([]);
    setArrayShifting(false);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#05060F] text-white select-none">
      {/* Top Bar / Navigation Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4 md:px-8 bg-night/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan/20 text-cyan text-lg">
            📖
          </div>
          <div>
            <h1 className="text-sm font-extrabold leading-tight md:text-base">
              Slide Materi: <span className="text-cyan">Linked List</span>
            </h1>
            <p className="text-[11px] font-semibold text-muted">
              Informatika Fase F (Kelas XI) · Model Discovery Learning
            </p>
          </div>
        </div>

        {/* Center Pill: Estimasi Waktu Microteaching */}
        <div className="hidden lg:flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-xs">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/80 font-medium">Sesi Microteaching: ~30 Menit (Pembuka 5' · Inti 20' · Penutup 5')</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="hidden sm:flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/10 transition-colors"
            title="Layar Penuh (F)"
          >
            <span>{isFullscreen ? '⤢' : '⤡'}</span>
            <span>{isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen'}</span>
          </button>

          {onGoToGame && (
            <button
              type="button"
              onClick={onGoToGame}
              className="btn btn-cyan text-xs font-extrabold px-3.5 py-2 shadow-[0_0_20px_rgba(31,228,206,0.3)] hover:scale-102"
              title="Kembali ke Dashboard Game Proyektor"
            >
              🎮 Layar Game Proyektor →
            </button>
          )}

          {isHost && onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-muted hover:text-white hover:bg-white/10 text-xs"
              title="Kunci / Keluar Admin"
            >
              🔒
            </button>
          )}
        </div>
      </header>

      {/* Main Slide Presentation Stage */}
      <main className="relative flex flex-1 items-center justify-center overflow-y-auto px-4 py-6 md:px-12 md:py-8">
        <div className="w-full max-w-5xl">
          {/* SLIDE 1: Pembuka & Pertanyaan Pemantik */}
          {currentSlide === 0 && (
            <div className="fade-in flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-3 py-1 text-xs font-extrabold text-purple-300">
                  Sintaks 1: Stimulation & Problem Statement
                </span>
                <span className="rounded-full bg-cyan/20 border border-cyan/30 px-3 py-1 text-xs font-extrabold text-cyan">
                  SMA Fase F · Berpikir Komputasional
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black md:text-5xl tracking-tight leading-tight">
                  Misteri Kereta Sambung: <br />
                  <span className="bg-gradient-to-r from-cyan to-[#A66BFF] bg-clip-text text-transparent">
                    Menemukan Rahasia Linked List
                  </span>
                </h2>
                <p className="text-sm font-semibold text-muted md:text-base">
                  Pengajar: <strong className="text-white">Muhamad Akbar Imron</strong> (2404565)
                </p>
              </div>

              {/* Box Pemantik */}
              <div className="grid gap-4 md:grid-cols-2 pt-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-lg backdrop-blur-sm flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🚶‍♂️</span>
                    <h3 className="text-base font-extrabold text-gold">Pertanyaan Pemantik 1: Antrean Kantin</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-on-dark/90">
                    "Jika kalian sedang berbaris rapi mengantre makanan di kantin, lalu seorang teman menyisip masuk di tengah barisan...
                    <span className="font-bold text-white block mt-1">
                      Apakah SEMUA orang di belakangnya wajib mundur melangkah satu per satu?
                    </span>"
                  </p>
                  <span className="mt-auto text-xs font-bold text-cyan">→ Inilah prinsip struktur data Array!</span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-lg backdrop-blur-sm flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🎧</span>
                    <h3 className="text-base font-extrabold text-cyan">Pertanyaan Pemantik 2: Playlist Musik</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-on-dark/90">
                    "Saat kalian memutar lagu di Spotify atau YouTube Music dan memilih fitur <em>'Putar Berikutnya'</em>...
                    <span className="font-bold text-white block mt-1">
                      Bagaimana komputer langsung tahu lagu berikutnya tanpa menata ulang nomor urut seluruh 1.000 lagu lainnya?
                    </span>"
                  </p>
                  <span className="mt-auto text-xs font-bold text-purple-300">→ Inilah keajaiban Linked List!</span>
                </div>
              </div>

              {/* Goal Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-purple-900/40 via-cyan/20 to-purple-900/40 border border-white/15 p-4 text-center">
                <p className="text-xs md:text-sm font-extrabold text-white tracking-wide">
                  🎯 TUJUAN HARI INI: Menemukan bagaimana komputer menyisipkan & menghapus data secara kilat TANPA menggeser data lain!
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 2: Array vs Linked List */}
          {currentSlide === 1 && (
            <div className="fade-in flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="rounded-full bg-cyan/20 border border-cyan/30 px-3 py-1 text-xs font-extrabold text-cyan">
                    Sintaks 2: Data Collection
                  </span>
                  <h2 className="mt-2 text-2xl font-black md:text-4xl">
                    Array vs Linked List: <span className="text-cyan">Di Mana Bedanya?</span>
                  </h2>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Kolom Array */}
                <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-red-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📦</span>
                      <h3 className="text-lg font-black text-red-400">Array (Kotak Berjejer)</h3>
                    </div>
                    <span className="rounded bg-red-500/20 px-2 py-0.5 text-[11px] font-bold text-red-300">Memori Kontigu</span>
                  </div>

                  <p className="text-xs text-white/80 leading-relaxed">
                    Setiap elemen wajib berdampingan di memori secara berurutan. Akses nomor indeks instan <code className="font-mono text-red-300 font-bold">arr[2]</code>.
                  </p>

                  <div className="rounded-xl bg-black/40 p-4 border border-white/5 flex flex-col gap-3">
                    <p className="text-xs font-bold text-white/70">Visual Memori Array:</p>
                    <div className="flex items-center justify-center gap-1">
                      {arrayItems.map((val, idx) => (
                        <div
                          key={idx}
                          className={`flex h-12 w-12 flex-col items-center justify-center rounded-xl border font-mono font-black text-base transition-all ${
                            arrayHighlight.includes(idx)
                              ? 'border-yellow-400 bg-yellow-500/30 text-yellow-300 scale-110 shadow-lg'
                              : val === 'X'
                              ? 'border-cyan bg-cyan/30 text-cyan animate-bounce'
                              : 'border-white/20 bg-white/5 text-white'
                          }`}
                        >
                          <span>{val}</span>
                          <span className="text-[9px] text-muted font-normal">[{idx}]</span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={arrayShifting}
                      onClick={triggerArrayInsertDemo}
                      className="mt-2 btn btn-white text-xs font-extrabold py-2 text-ink hover:bg-white"
                    >
                      {arrayShifting ? 'Memindahkan memori...' : '⚡ Simulasikan Sisip X di Tengah'}
                    </button>
                  </div>

                  <div className="rounded-xl bg-red-500/10 p-3 border border-red-500/20 text-xs text-red-300">
                    <strong>⚠️ Kelemahan:</strong> Untuk menyisipkan <code className="font-bold">X</code> di tengah, elemen <code className="font-bold">C</code> dan <code className="font-bold">D</code> harus digeser mundur satu per satu! Biaya: <strong>O(N)</strong> (sangat boros jika datanya jutaan).
                  </div>
                </div>

                {/* Kolom Linked List */}
                <div className="rounded-2xl border border-cyan/30 bg-cyan/5 p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-cyan/20 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🔗</span>
                      <h3 className="text-lg font-black text-cyan">Linked List (Rantai Bebas)</h3>
                    </div>
                    <span className="rounded bg-cyan/20 px-2 py-0.5 text-[11px] font-bold text-cyan">Memori Dinamis</span>
                  </div>

                  <p className="text-xs text-white/80 leading-relaxed">
                    Setiap elemen (Node) bisa berada di mana saja di dalam memori! Yang menghubungkan mereka adalah <strong>pointer (tali penunjuk)</strong>.
                  </p>

                  <div className="rounded-xl bg-black/40 p-4 border border-white/5 flex flex-col gap-3">
                    <p className="text-xs font-bold text-cyan">Visual Rantai Gerbong:</p>
                    <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
                      <div className="flex items-center rounded-xl border border-cyan/50 bg-cyan/15 px-3 py-2 font-mono font-bold text-sm">
                        <span>A</span>
                        <span className="ml-2 text-cyan font-normal">→</span>
                      </div>
                      <div className="flex items-center rounded-xl border border-cyan/50 bg-cyan/15 px-3 py-2 font-mono font-bold text-sm">
                        <span>B</span>
                        <span className="ml-2 text-cyan font-normal">→</span>
                      </div>
                      <div className="flex items-center rounded-xl border border-gold/50 bg-gold/20 px-3 py-2 font-mono font-bold text-sm text-gold">
                        <span>X</span>
                        <span className="ml-2 text-gold font-normal">→</span>
                      </div>
                      <div className="flex items-center rounded-xl border border-cyan/50 bg-cyan/15 px-3 py-2 font-mono font-bold text-sm">
                        <span>C</span>
                        <span className="ml-2 text-muted font-normal">→ Ø</span>
                      </div>
                    </div>
                    <p className="text-center text-[11px] text-muted">Node A, B, C tidak pernah bergeser dari alamat memorinya!</p>
                  </div>

                  <div className="rounded-xl bg-emerald-500/10 p-3 border border-emerald-500/20 text-xs text-emerald-300">
                    <strong>✨ Keunggulan:</strong> Cukup putus 1 kait, lalu pasang 2 sambungan baru ke <code className="font-bold">X</code>. Selesai seketika: <strong>O(1)</strong>!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: Anatomi Node */}
          {currentSlide === 2 && (
            <div className="fade-in flex flex-col gap-6">
              <div>
                <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-3 py-1 text-xs font-extrabold text-purple-300">
                  Sintaks 2: Data Collection
                </span>
                <h2 className="mt-2 text-2xl font-black md:text-4xl">
                  Anatomi Node: <span className="text-cyan">Tulang Punggung Linked List</span>
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Setiap simpul gerbong pada Linked List disebut sebagai <strong className="text-white">NODE</strong>.
                </p>
              </div>

              {/* Diagram Node */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
                <div className="grid gap-6 md:grid-cols-3 items-center">
                  {/* Left: Diagram */}
                  <div className="md:col-span-2 flex flex-col items-center justify-center gap-4 py-4">
                    <div className="relative flex items-center rounded-2xl border-2 border-cyan/60 bg-[#0E0F24] p-3 shadow-[0_0_30px_rgba(31,228,206,0.2)]">
                      {/* Badge Head */}
                      <div className="absolute -top-3.5 left-4 rounded-full bg-gold px-2.5 py-0.5 text-[10px] font-black text-ink uppercase tracking-wider">
                        HEAD (Awal)
                      </div>

                      {/* Bagian Data */}
                      <div className="flex flex-col items-center justify-center border-r border-white/20 px-6 py-4">
                        <span className="text-2xl font-black text-white">42 / "Lagu A"</span>
                        <span className="mt-1 text-[11px] font-extrabold text-cyan uppercase tracking-wider">DATA / MUATAN</span>
                        <span className="text-[10px] text-muted">Nilai yang disimpan</span>
                      </div>

                      {/* Bagian Pointer */}
                      <div className="flex flex-col items-center justify-center px-6 py-4">
                        <span className="text-2xl font-black text-purple-400 font-mono">0x7FFE</span>
                        <span className="mt-1 text-[11px] font-extrabold text-purple-300 uppercase tracking-wider">POINTER NEXT</span>
                        <span className="text-[10px] text-muted">Alamat memori node berikutnya</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-cyan">
                      <span>[ Head ]</span>
                      <span>── kait ──►</span>
                      <span>[ Node B ]</span>
                      <span>── kait ──►</span>
                      <span>[ Node C ]</span>
                      <span>── kait ──►</span>
                      <span className="text-red-400 font-bold">[ NULL / Ø ]</span>
                    </div>
                  </div>

                  {/* Right: Kamus Istilah */}
                  <div className="flex flex-col gap-3 rounded-2xl bg-black/40 p-4 border border-white/5 text-xs">
                    <h3 className="font-extrabold text-sm text-gold border-b border-white/10 pb-1.5">
                      🔑 4 Istilah Wajib Diingat:
                    </h3>
                    <div className="flex flex-col gap-2">
                      <div>
                        <strong className="text-cyan">1. HEAD:</strong>
                        <p className="text-muted leading-tight">Pintu masuk utama! Penunjuk ke gerbong paling pertama.</p>
                      </div>
                      <div>
                        <strong className="text-purple-300">2. POINTER (NEXT):</strong>
                        <p className="text-muted leading-tight">Tali pengait yang menyimpan alamat gerbong selanjutnya.</p>
                      </div>
                      <div>
                        <strong className="text-gold">3. TAIL:</strong>
                        <p className="text-muted leading-tight">Gerbong paling ujung dalam rangkaian.</p>
                      </div>
                      <div>
                        <strong className="text-red-400">4. NULL (Ø):</strong>
                        <p className="text-muted leading-tight">Ujung akhir tali. Tanda bahwa tidak ada gerbong lagi di depan.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sifat Akses */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <p className="text-xs md:text-sm text-white/90">
                  <strong>Sifat Akses Berurutan (Sequential Access):</strong> Kita <em>tidak bisa</em> melompat langsung ke gerbong ke-5. Kita wajib menelusuri mulai dari <strong>HEAD</strong> satu demi satu mengikuti rantai pointer (TRAVERSE).
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 4: Interactive Playground & Simulator */}
          {currentSlide === 3 && (
            <div className="fade-in flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-extrabold text-emerald-300">
                    Sintaks 3 & 4: Data Processing & Verification
                  </span>
                  <h2 className="mt-1 text-2xl font-black md:text-3xl">
                    Prinsip Emas: <span className="text-cyan">"UBAH KAIT, BUKAN GESER"</span>
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleResetNodes}
                  className="btn btn-white text-xs font-bold py-1.5 px-3"
                >
                  🔄 Reset ke A → B → C
                </button>
              </div>

              {/* Live Simulator Area */}
              <div className="grid gap-4 lg:grid-cols-12">
                {/* Visualizer (Left) */}
                <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-extrabold text-cyan uppercase tracking-wider">
                        Simulator Linked List Aktif
                      </span>
                      <span className="text-xs text-muted">Panjang: {list.length} node</span>
                    </div>

                    {/* Nodes Chain Visual */}
                    <div className="flex flex-wrap items-center gap-2 py-4">
                      {list.map((n, i) => {
                        const isActive = activeNode === n.id;
                        const isChanged = changedNodes.includes(n.id);
                        return (
                          <div key={n.id} className="flex items-center gap-1.5">
                            <div
                              className={`relative flex flex-col rounded-2xl border-2 px-3 py-2 transition-all ${
                                isActive
                                  ? 'border-yellow-400 bg-yellow-400/20 scale-110 shadow-[0_0_20px_rgba(255,215,0,0.4)]'
                                  : isChanged
                                  ? 'border-emerald-400 bg-emerald-500/20'
                                  : 'border-cyan/50 bg-[#0E0F24]'
                              }`}
                            >
                              {i === 0 && (
                                <span className="absolute -top-3 left-2 rounded-full bg-gold px-1.5 py-0.2 text-[8px] font-black text-ink">
                                  HEAD
                                </span>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-base font-black text-white">{n.val}</span>
                                <span className="text-[10px] text-purple-300 font-mono">→ {label(n.next)}</span>
                              </div>

                              <div className="mt-1 flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleInsertAfter(n)}
                                  className="rounded bg-cyan/20 px-1 py-0.5 text-[9px] font-bold text-cyan hover:bg-cyan/40"
                                  title={`Sisip node setelah ${n.val}`}
                                >
                                  + Sisip
                                </button>
                                {list.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemove(n)}
                                    className="rounded bg-red-500/20 px-1 py-0.5 text-[9px] font-bold text-red-300 hover:bg-red-500/40"
                                    title={`Hapus node ${n.val}`}
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            </div>

                            <span className="text-cyan font-bold">→</span>
                          </div>
                        );
                      })}

                      <div className="rounded-xl border border-white/20 bg-white/5 px-2.5 py-2 font-mono text-xs font-bold text-red-400">
                        NULL
                      </div>
                    </div>
                  </div>

                  {/* Simulator Controls */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-white/80">
                      Label:
                      <input
                        type="text"
                        value={nodeValInput}
                        maxLength={3}
                        onChange={(e) => setNodeValInput(e.target.value.toUpperCase())}
                        className="h-8 w-14 rounded-lg bg-white/10 px-2 font-mono text-center font-bold text-white outline-none focus:ring-1 focus:ring-cyan"
                      />
                    </label>

                    <button
                      type="button"
                      disabled={isTraversing}
                      onClick={handleTraverse}
                      className="btn btn-cyan text-xs font-extrabold py-1.5 px-3"
                    >
                      {isTraversing ? 'Menelusuri...' : '🔍 Telusuri dari Head (TRAVERSE)'}
                    </button>
                  </div>
                </div>

                {/* Code Snippet Box (Right) */}
                <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#090A1A] p-4 flex flex-col justify-between font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-[11px] font-bold text-muted">Pseudocode C++ (Operasi Pointer)</span>
                    <span className="rounded bg-cyan/20 px-2 py-0.5 text-[10px] font-bold text-cyan">O(1)</span>
                  </div>
                  <pre className="mt-2 text-white/90 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {codeSnippet}
                  </pre>
                  <p className="mt-3 text-[11px] text-emerald-400 font-semibold border-t border-white/10 pt-2">
                    💡 Perhatikan: Gerbong lain tidak dipindah memorinya. Cukup sambungkan kembali talinya!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 5: Penerapan Dunia Nyata */}
          {currentSlide === 4 && (
            <div className="fade-in flex flex-col gap-6">
              <div>
                <span className="rounded-full bg-gold/20 border border-gold/30 px-3 py-1 text-xs font-extrabold text-gold">
                  Sintaks 5: Generalization & Kontekstual
                </span>
                <h2 className="mt-2 text-2xl font-black md:text-4xl">
                  Linked List di Dunia Nyata: <span className="text-cyan">Di Mana Dipakai?</span>
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Bukan cuma teori di kelas, struktur data ini ada di aplikasi yang kalian pakai setiap hari!
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* 1. Spotify */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-2 hover:border-emerald-400/40 transition-colors">
                  <span className="text-3xl">🎵</span>
                  <h3 className="font-extrabold text-sm text-white">Playlist Lagu</h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Fitur <em>"Play Next"</em> menyisipkan lagu baru tepat di depan lagu saat ini dengan mengubah pointer <code className="text-emerald-400">next</code>.
                  </p>
                </div>

                {/* 2. Browser History */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-2 hover:border-cyan/40 transition-colors">
                  <span className="text-3xl">🌐</span>
                  <h3 className="font-extrabold text-sm text-white">Tombol Back / Forward</h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Peramban web menyimpan riwayat tab dalam <strong>Doubly Linked List</strong> yang punya pointer <code className="text-cyan">prev</code> dan <code className="text-cyan">next</code>.
                  </p>
                </div>

                {/* 3. Undo Redo */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-2 hover:border-purple-400/40 transition-colors">
                  <span className="text-3xl">↩️</span>
                  <h3 className="font-extrabold text-sm text-white">Fitur Undo (Ctrl + Z)</h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Setiap perubahan teks atau gambar di editor (Word, Figma, VS Code) disambung secara berantai agar bisa dibatalkan berurutan.
                  </p>
                </div>

                {/* 4. Panjat Tebing Strukdat */}
                <div className="rounded-2xl border border-gold/40 bg-gold/5 p-4 flex flex-col gap-2 hover:border-gold transition-colors">
                  <span className="text-3xl">🧗</span>
                  <h3 className="font-extrabold text-sm text-gold">Panjat Tebing Kelas</h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Setiap regu mengikatkan tali ke node tebing berikutnya. Menjawab benar menaikkan posisi tim ke simpul selanjutnya!
                  </p>
                </div>
              </div>

              {/* Kesimpulan Utama */}
              <div className="rounded-2xl border border-cyan/40 bg-gradient-to-r from-cyan/10 via-purple-500/10 to-cyan/10 p-5 text-center flex flex-col gap-2">
                <span className="text-xs font-bold text-cyan uppercase tracking-widest">Aturan Kunci Microteaching</span>
                <p className="text-xl md:text-2xl font-black text-white">
                  "UBAH KAIT, BUKAN GESER!"
                </p>
                <p className="text-xs text-ink-on-dark/80 max-w-xl mx-auto">
                  Menyisip atau menghapus data di tengah rangkaian Linked List hanya mengubah pointer, tanpa pernah memindahkan data lain dari alamat memorinya.
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 6: Misi Kelas - Game Panjat Tebing */}
          {currentSlide === 5 && (
            <div className="fade-in flex flex-col gap-6">
              <div className="text-center">
                <span className="rounded-full bg-cyan/20 border border-cyan/30 px-3 py-1 text-xs font-extrabold text-cyan">
                  Sintaks 4 & 5: Pembuktian Lewat Gamifikasi
                </span>
                <h2 className="mt-2 text-3xl font-black md:text-5xl">
                  Saatnya Membuktikan di <br />
                  <span className="text-cyan">Game Panjat Tebing Strukdat!</span>
                </h2>
                <p className="mt-1 text-sm text-muted">
                  5 Kelompok (K1 - K5) · 1 Perangkat HP per Kelompok · Taklukkan 10 Node Tebing!
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-12 items-center">
                {/* QR Code Scan (Left) */}
                <div className="md:col-span-5 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center">
                  <p className="text-xs font-black text-cyan uppercase tracking-wider mb-2">
                    📱 Scan QR Ini dari HP Kelompok
                  </p>
                  {qrUrl ? (
                    <img
                      src={qrUrl}
                      alt="QR Siswa"
                      className="h-44 w-44 rounded-xl bg-white p-2 shadow-lg"
                    />
                  ) : (
                    <div className="h-44 w-44 flex items-center justify-center rounded-xl bg-white/10 text-xs">
                      Membuat QR...
                    </div>
                  )}
                  <p className="mt-2 text-[11px] text-muted font-mono">
                    https://multiplayeredugame.vercel.app/?role=student
                  </p>
                </div>

                {/* Aturan Main (Right) */}
                <div className="md:col-span-7 flex flex-col gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-2.5 text-xs">
                    <h3 className="font-extrabold text-sm text-gold">🎮 Aturan Main di Kelas:</h3>
                    <ul className="flex flex-col gap-2 text-white/90">
                      <li className="flex items-start gap-2">
                        <span className="text-cyan font-bold">1.</span>
                        <span>Satu HP mewakili satu kelompok (K1 - K5). Pilih slot tim yang masih kosong.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan font-bold">2.</span>
                        <span>Jawab soal Linked List bersama kelompokmu di HP. Jawaban benar menaikkan pendaki 1 node.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan font-bold">3.</span>
                        <span>Tiap 3 jawaban benar akan mendapatkan <strong>2 Kartu Skill Strategi</strong> (Perisai, Bom, Swap, dsb.).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan font-bold">4.</span>
                        <span>Kelompok pertama yang mencapai <strong>Node 10 (Puncak)</strong> atau tertinggi saat waktu habis adalah pemenangnya!</span>
                      </li>
                    </ul>
                  </div>

                  {onGoToGame && (
                    <button
                      type="button"
                      onClick={onGoToGame}
                      className="btn btn-cyan min-h-[52px] text-base font-black shadow-[0_0_30px_rgba(31,228,206,0.4)] hover:scale-102 transition-transform"
                    >
                      🚀 Buka Layar Kontrol Guru & Proyektor Sekarang →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Bar Controls & Slide Indicator */}
      <footer className="flex h-16 shrink-0 items-center justify-between border-t border-white/10 px-4 md:px-8 bg-night/90 backdrop-blur-md z-30">
        <button
          type="button"
          data-testid="btn-prev-slide"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="btn btn-white text-xs font-bold px-3 py-1.5 disabled:opacity-30 disabled:pointer-events-none"
        >
          ← Sebelumnya
        </button>

        {/* Slide Dots / Indicators */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {Array.from({ length: TOTAL_SLIDES }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              data-testid={`btn-slide-dot-${idx}`}
              onClick={() => goToSlide(idx)}
              className={`flex items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                currentSlide === idx
                  ? 'h-7 w-7 bg-cyan text-ink shadow-[0_0_12px_rgba(31,228,206,0.6)]'
                  : 'h-6 w-6 bg-white/10 text-white/70 hover:bg-white/20'
              }`}
              title={`Slide ${idx + 1}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        <button
          type="button"
          data-testid="btn-next-slide"
          onClick={nextSlide}
          disabled={currentSlide === TOTAL_SLIDES - 1}
          className="btn btn-cyan text-xs font-bold px-3 py-1.5 disabled:opacity-30 disabled:pointer-events-none"
        >
          Selanjutnya →
        </button>
      </footer>
    </div>
  );
}
