# Panjat Tebing Strukdat

Game kelas real-time untuk microteaching **Struktur Data: Singly Linked List (Fase F / Kelas XI)**. Laptop guru menampilkan tebing di proyektor; siswa bermain dari HP. Dibuat dengan React, SVG, Socket.IO, dan Supabase Realtime.

## Alur sesi 35 menit

| Waktu | Tahap | Di aplikasi |
|---|---|---|
| 00:00 - 05:00 | Pembuka & apersepsi | Jam sesi di bawah navbar guru |
| 05:00 - 10:00 | Materi "ubah kait, bukan geser" | Tombol **Materi 5 menit**: simulator sisip/hapus/telusuri node |
| 10:00 - 25:00 | **Panjat (15 menit)** | Tombol **Mulai panjat**, siswa scan **QR untuk siswa** |
| 25:00 - 30:00 | Hadiah | Tombol **Hadiah jajan**: juara, klasemen, konfeti |
| 30:00 - 35:00 | Penutup & refleksi | |

## Aturan main

- Tebing punya **10 node** (simpul di tali). Benar naik 1 node, salah tetap di node yang sama (tidak turun). Yang bisa menurunkan posisi hanya skill lawan.
- Tiap **3 jawaban, benar atau salah**, kelompok membuka **kotak skill berisi 2 skill acak**. Tas muat 6 skill.
- Kelompok pertama yang sampai node 10 menang dan aman dari serangan. Kalau waktu 15 menit habis, peringkat tertinggi yang menang.

### 30 skill

| Kelompok | Skill |
|---|---|
| Serang | Bom Kerikil (target -1 node), Gunting Tali (target -2 node, langka), Bom Waktu (meledak -1 node kalau target tidak menjawab benar dalam 25 detik) |
| Posisi | Tukar Tempat, Magnet Tali (curi 1 node), Dadu Kacau (2 pendaki acak bertukar), Sepatu Pegas (+1 node), Pintu Ajaib (teleport ke node acak, untung-untungan) |
| Rusak layar HP target | Tinta Gurita (noda raksasa, dilap dua kali), Kabut Tebal (digosok pakai jari), Layar Jungkir (terbalik), Gasing Pusing (layar berputar terus), Gempa Bumi (layar bergetar hebat), Layar Semut (layar mengecil), Dunia Cermin (kiri-kanan terbalik), Mati Lampu (gelap, senter di jari), Parade Bebek (bebek raksasa, ditekan dua kali), Bahasa Alien (tulisan jadi huruf alien) |
| Ganggu jawaban | Es Beku, Monster Bug (monster menutupi HP, harus dipukul 12 kali), Hack Jawaban (tulisan rusak parah, layar glitch, pilihan teracak), Kulit Pisang (pilihan hampir selalu meleset), Tombol Kabur (tombol kirim lari menghindar), Siput Lemot (setiap ketukan telat 1,4 detik) |
| Trik | Kartu Joker (skill acak untuk target, 20% senjata makan tuan), Karung Maling (curi 1 skill), Tukar Tas (tukar seluruh isi tas) |
| Bertahan | Perisai NULL (tahan 1 serangan, terlihat semua), Cermin Pantul (rahasia, pantulkan serangan), Sabun Bersih (hapus semua gangguan, termasuk monster dan bom waktu) |

Setiap serangan langsung terasa di HP target: lembar skill atau kotak skill yang sedang terbuka langsung ditutup, layar bergetar, lalu gangguannya muncul.

## Mode uji coba

Di laptop guru ada bar **Mode uji coba** di paling atas:

- **Layar guru / HP siswa / Adu 2 HP**: pindah tampilan di tab yang sama. **Adu 2 HP** menampilkan dua HP berdampingan, jadi skill yang dilempar dari satu HP langsung terlihat efeknya di HP sebelah.
- **Main sebagai**: pilih pendaki K1 sampai K5 untuk tiap HP, langsung bermain tanpa mengisi form gabung.
- **Beri skill ini**: pilih skill tertentu dari daftar lalu masukkan ke tas. **Acak 2**: isi tas dengan 2 skill acak.

HP siswa asli tetap memakai form gabung (pilih kelompok, nama, peran) lewat `/?role=student`.

## Aturan teknis

Aturan permainan ada di satu tempat: `src/game/engine.js` (fungsi murni) dan `src/game/skills.js`. Server Socket.IO dan tab guru memakai mesin yang sama, jadi aturan tidak pernah berbeda.

- **Server Wi-Fi** (`npm run server` di port 3000): server yang menjalankan permainan.
- **Supabase** atau **antar tab** (tanpa server): tab guru yang menjalankan permainan lalu menyiarkan state ke semua HP.

## 🌐 Cara Hosting Online di Vercel + Supabase

Aplikasi ini menggunakan **Supabase Realtime Channel (WebSockets Serverless)** sehingga dapat di-hosting 100% di **Vercel** tanpa memerlukan server Node.js khusus!

### Langkah 1: Buat Proyek Supabase (Gratis)
1. Buka [database.new](https://database.new) dan buat project baru.
2. Buka menu **Project Settings > API**.
3. Salin:
   - **Project URL** (contoh: `https://xyzabc.supabase.co`)
   - **anon public API Key** (contoh: `eyJhbGciOi...`)

### Langkah 2: Deploy ke Vercel
1. Upload folder project ini ke **GitHub**.
2. Buka [Vercel](https://vercel.com) dan pilih **Import Project**.
3. Di bagian **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL` = `<Project URL Supabase Anda>`
   - `VITE_SUPABASE_ANON_KEY` = `<Anon Public Key Anda>`
4. Klik **Deploy**!
5. Buka link Vercel Anda:
   - **Laptop Guru (Proyektor):** `https://nama-project.vercel.app`
   - **HP Siswa:** `https://nama-project.vercel.app/?role=student` (atau minta siswa scan QR code dari proyektor).

*(Catatan: Anda juga bisa memasukkan URL dan Key Supabase langsung di antarmuka web melalui tombol **Supabase** di toolbar Dashboard Guru).*

---

## 💻 Cara Menjalankan Secara Lokal (Development)

1. Jalankan development server:
   ```bash
   npm run dev
   ```
2. Buka di browser:
   - Laptop Guru: `http://localhost:5173`
   - HP Siswa: `http://localhost:5173/?role=student`

---

## Desain

Arah visual dan alasannya ada di `DESIGN.md`: platformer malam bergaya ilustrasi, pulau rumput mint di atas batu kerikil, aksen sian, ikon skill digambar tangan. Pedagogi kunci tetap: **"Ubah kait, bukan geser"**. Menyisip pada linked list cukup mengubah pointer, O(1) setelah node ditemukan, sedangkan array harus menggeser elemen di belakangnya, O(N).
