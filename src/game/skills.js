// Katalog skill. Data murni, dipakai oleh klien (React) dan server (Node).
//
// target:
//   'enemy' -> harus memilih pendaki lain
//   'self'  -> langsung aktif ke diri sendiri
//   'none'  -> acak, tanpa target
// weight: peluang muncul di Kotak Skill (makin besar makin sering)
// duration: detik, untuk gangguan yang menempel sementara

export const SKILLS = {
  // --- serang posisi ---
  bomb: {
    id: 'bomb', name: 'Bom Kerikil', target: 'enemy', group: 'serang', weight: 9,
    desc: 'Lempar bom ke pendaki lain. Target turun 1 node.'
  },
  snip: {
    id: 'snip', name: 'Gunting Tali', target: 'enemy', group: 'serang', weight: 3,
    desc: 'Potong tali lawan. Target merosot 2 node sekaligus.'
  },
  timebomb: {
    id: 'timebomb', name: 'Bom Waktu', target: 'enemy', group: 'serang', weight: 5, duration: 25,
    desc: 'Pasang bom berdetak di HP target. Kalau dalam 25 detik dia tidak menjawab benar, bom meledak dan dia turun 1 node.'
  },

  // --- posisi ---
  magnet: {
    id: 'magnet', name: 'Magnet Tali', target: 'enemy', group: 'posisi', weight: 6,
    desc: 'Tarik 1 node dari target: dia turun 1, kamu naik 1.'
  },
  swap: {
    id: 'swap', name: 'Tukar Tempat', target: 'enemy', group: 'posisi', weight: 6,
    desc: 'Tukar posisi node kamu dengan pendaki pilihanmu.'
  },
  chaos: {
    id: 'chaos', name: 'Dadu Kacau', target: 'none', group: 'posisi', weight: 4,
    desc: 'Dua pendaki acak bertukar posisi. Bisa kena kamu sendiri!'
  },
  spring: {
    id: 'spring', name: 'Sepatu Pegas', target: 'self', group: 'posisi', weight: 8,
    desc: 'Loncat naik 1 node sekarang juga.'
  },
  teleport: {
    id: 'teleport', name: 'Pintu Ajaib', target: 'self', group: 'posisi', weight: 5,
    desc: 'Masuk pintu, keluar di node acak antara 0 dan satu node di atas pemimpin. Untung-untungan!'
  },

  // --- rusak layar HP target ---
  ink: {
    id: 'ink', name: 'Tinta Gurita', target: 'enemy', group: 'layar', weight: 9, duration: 12,
    desc: 'Layar HP target penuh cipratan tinta besar. Tiap noda harus dilap dua kali.'
  },
  fog: {
    id: 'fog', name: 'Kabut Tebal', target: 'enemy', group: 'layar', weight: 8, duration: 10,
    desc: 'Layar target tertutup kabut putih. Harus digosok pakai jari supaya kelihatan.'
  },
  flip: {
    id: 'flip', name: 'Layar Jungkir', target: 'enemy', group: 'layar', weight: 7, duration: 9,
    desc: 'Layar target terbalik atas-bawah selama 9 detik.'
  },
  spin: {
    id: 'spin', name: 'Gasing Pusing', target: 'enemy', group: 'layar', weight: 7, duration: 9,
    desc: 'Layar target berputar-putar terus seperti gasing selama 9 detik.'
  },
  quake: {
    id: 'quake', name: 'Gempa Bumi', target: 'enemy', group: 'layar', weight: 7, duration: 8,
    desc: 'Layar target bergetar hebat. Susah sekali menekan jawaban yang tepat.'
  },
  mini: {
    id: 'mini', name: 'Layar Semut', target: 'enemy', group: 'layar', weight: 6, duration: 9,
    desc: 'Layar target mengecil jadi seukuran semut selama 9 detik.'
  },
  mirrorworld: {
    id: 'mirrorworld', name: 'Dunia Cermin', target: 'enemy', group: 'layar', weight: 6, duration: 10,
    desc: 'Layar target terbalik kiri-kanan. Semua tulisan jadi terbaca mundur.'
  },
  blackout: {
    id: 'blackout', name: 'Mati Lampu', target: 'enemy', group: 'layar', weight: 6, duration: 10,
    desc: 'Layar target gelap gulita, cuma ada senter kecil mengikuti jarinya.'
  },
  ducks: {
    id: 'ducks', name: 'Parade Bebek', target: 'enemy', group: 'layar', weight: 8, duration: 11,
    desc: 'Rombongan bebek karet raksasa lewat menutupi jawaban. Tekan bebeknya supaya kabur.'
  },
  alien: {
    id: 'alien', name: 'Bahasa Alien', target: 'enemy', group: 'layar', weight: 6, duration: 10,
    desc: 'Semua tulisan soal di HP target berubah jadi huruf alien.'
  },

  // --- ganggu jawaban ---
  freeze: {
    id: 'freeze', name: 'Es Beku', target: 'enemy', group: 'kunci', weight: 8, duration: 8,
    desc: 'Tangan target membeku. Tidak bisa menjawab selama 8 detik.'
  },
  monster: {
    id: 'monster', name: 'Monster Bug', target: 'enemy', group: 'kunci', weight: 6, duration: 30,
    desc: 'Monster muncul dan menutupi seluruh HP target. Harus dipukul sampai kalah dulu baru bisa main.'
  },
  hack: {
    id: 'hack', name: 'Hack Jawaban', target: 'enemy', group: 'kunci', weight: 6, duration: 11,
    desc: 'HP target dibobol: tulisan rusak parah, layar glitch, pilihan jawaban terus diacak.'
  },
  banana: {
    id: 'banana', name: 'Kulit Pisang', target: 'enemy', group: 'kunci', weight: 7, duration: 11,
    desc: 'Jari target licin. Pilihannya hampir selalu meleset ke jawaban sebelahnya.'
  },
  runaway: {
    id: 'runaway', name: 'Tombol Kabur', target: 'enemy', group: 'kunci', weight: 6, duration: 11,
    desc: 'Tombol kirim jawaban di HP target lari menghindar tiap mau ditekan.'
  },
  snail: {
    id: 'snail', name: 'Siput Lemot', target: 'enemy', group: 'kunci', weight: 6, duration: 10,
    desc: 'HP target jadi lemot. Setiap ketukan baru bereaksi lebih dari 1 detik kemudian.'
  },

  // --- trik ---
  joker: {
    id: 'joker', name: 'Kartu Joker', target: 'enemy', group: 'trik', weight: 6,
    desc: 'Kocok kartu: keluar skill acak untuk target. Hati-hati, kadang senjata makan tuan!'
  },
  steal: {
    id: 'steal', name: 'Karung Maling', target: 'enemy', group: 'trik', weight: 5,
    desc: 'Ambil 1 skill acak dari tas target.'
  },
  bagswap: {
    id: 'bagswap', name: 'Tukar Tas', target: 'enemy', group: 'trik', weight: 4,
    desc: 'Tukar seluruh isi tas skillmu dengan tas target.'
  },

  // --- bertahan ---
  shield: {
    id: 'shield', name: 'Perisai NULL', target: 'self', group: 'tahan', weight: 8,
    desc: 'Menahan 1 serangan berikutnya. Perisaimu terlihat semua orang.'
  },
  mirror: {
    id: 'mirror', name: 'Cermin Pantul', target: 'self', group: 'tahan', weight: 6,
    desc: 'Rahasia! Serangan berikutnya dipantulkan balik ke penyerang.'
  },
  cleanse: {
    id: 'cleanse', name: 'Sabun Bersih', target: 'self', group: 'tahan', weight: 6,
    desc: 'Hapus semua gangguan yang sedang menempel, termasuk monster dan bom waktu.'
  }
};

export const SKILL_IDS = Object.keys(SKILLS);

// Gangguan yang menempel sementara (punya durasi)
export const TIMED_EFFECTS = SKILL_IDS.filter((id) => SKILLS[id].duration);

export const GROUP_LABEL = {
  serang: 'Serang',
  posisi: 'Posisi',
  layar: 'Rusak layar',
  kunci: 'Ganggu jawaban',
  trik: 'Trik',
  tahan: 'Bertahan'
};

export function drawSkill(rng = Math.random) {
  const total = SKILL_IDS.reduce((sum, id) => sum + SKILLS[id].weight, 0);
  let roll = rng() * total;
  for (const id of SKILL_IDS) {
    roll -= SKILLS[id].weight;
    if (roll <= 0) return id;
  }
  return SKILL_IDS[0];
}
