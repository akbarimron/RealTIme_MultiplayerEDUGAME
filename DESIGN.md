# DESIGN.md: Panjat Tebing Strukdat

> Reading this as: game kelas real-time (proyektor guru + HP siswa) untuk siswa kelas XI, dengan bahasa visual platformer malam ala ilustrasi GDevelop (referensi dari pemilik proyek), dial **ENERGY 3 / RHYTHM 2 / MOTION 3**.

Dial: ENERGY 3 / RHYTHM 2 / MOTION 3

---

## 1. Identitas & metafora

- **Tema**: lima kelompok memanjat tali menuju gerbang kuno di puncak tebing.
- **Metafora linked list** (motif identitas, dipakai berulang):
  - **Simpul di tali = node.** Tali di antara simpul = pointer `next`.
  - Jawaban benar: naik 1 node. Jawaban salah: tetap di node yang sama (tidak turun tali).
  - Puncak = node 10. Pendek supaya muat dalam 15 menit bermain.
- **Karakter**: manusia mungil berhelm (warna kelompok), lampu kepala, pipi merah, memanjat tali tangan-ganti-tangan. Bukan bola.
- **Nuansa**: ceria, jahil, kompetitif. Skill dibuat untuk saling mengganggu.

## 2. Palet

Dari referensi: langit malam pekat, rumput mint, batu kerikil cokelat, bulan pucat, awan putih, aksen sian portal.

| Peran | Warna | Alasan |
|---|---|---|
| Langit / latar | `#0A0B1A`, `#12132D`, ungu `#1C1740` | Panggung malam dari referensi; panel ungu memisahkan UI dari langit. |
| Rumput mint | `#3CE0A0` (sorot `#8AF7C9`, garis `#0B3B2B`) | Tutup pulau melayang dan tepi rumput menetes di HUD. Juga warna "benar". |
| Batu | `#3D2A1D` + kerikil `#6B4A3A` `#7A5442` | Badan pulau dan penggaris node. |
| Aksen utama | sian `#1FE4CE` | Satu aksen: tombol aksi utama (Mulai panjat, Kaitkan tali) dan portal tujuan. |
| Konten terang | `#F4F3FA`, putih | Area soal di HP dan chip event, seperti section putih di referensi. |
| Teks | `#0E0F24` di terang, putih / `#B9BDD6` di gelap | Semua pasangan lolos WCAG AA (dicek). |
| Status | koral `#FF5A5A` (salah/kena), emas `#FFB800` (hadiah, perisai) | Fungsional, bukan dekorasi. |

Warna kelompok adalah data, bukan dekorasi: K1 Merah `#FF5A5A`, K2 Emas `#FFB800`, K3 Biru `#4C8DFF`, K4 Hijau `#9BE15D`, K5 Ungu `#A66BFF`. Muncul di helm, jaket, bendera tali, dan meteran tali.

## 3. Tipografi

- **Plus Jakarta Sans** 500 sampai 800 untuk semua teks. Alasan: geometris tebal seperti judul di referensi, dan dibuat oleh studio Indonesia untuk identitas kota Jakarta, cocok untuk kelas di Indonesia.
- **JetBrains Mono** hanya untuk baris kode C++. Ligatur dimatikan supaya `->` tetap terlihat `->`, karena siswa harus mengetiknya persis.

## 4. Komponen

- Tombol utama: pil sian atau putih (seperti "Try it online" / "Download" di referensi). Tombol ikon: kotak membulat bergaris tipis.
- **Chip event putih bernomor** (seperti baris event di editor game): dipakai untuk Siaran tebing, pilihan jawaban, dan baris kode yang disusun.
- **Meteran tali**: progres sebagai tali bersimpul dengan wajah pendaki, bukan progress bar biasa.
- Ikon skill digambar sendiri dalam SVG, gaya stiker (isi warna rata + garis tepi gelap), 18 ikon + kotak skill.

## 5. Gerak

Kepribadian: **Playful**. Kurva khas `cubic-bezier(0.34, 1.56, 0.64, 1)` untuk muncul, `cubic-bezier(0.2, 0, 0, 1)` untuk geser.

- Primer: pendaki memanjat (tangan ganti tangan), meluncur turun saat salah, berputar saat kena bom, membeku dalam es, terbalik saat Layar Jungkir.
- Sekunder: lemparan skill melengkung dari pelempar ke target, ledakan partikel, chip pengumuman meluncur dari atas, klasemen bergeser saat ada yang menyalip.
- Ambien: bintang berkedip, permata melayang, portal bernapas, air terjun. Semuanya bagian dari panggung malam.
- `prefers-reduced-motion` dihormati: animasi dipendekkan, kamera dan pendaki langsung ke posisi.
