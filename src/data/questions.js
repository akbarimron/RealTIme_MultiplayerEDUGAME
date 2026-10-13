// Bank Soal Struktur Data: Linked List ("Kereta Sambung Express")
// Disesuaikan untuk Pembelajaran Fase F / Kelas XI dan Sintaks Discovery Learning

export const QUESTIONS = [
  // --- KATEGORI 1: DRAG & DROP SINTAKS POINTER (SUSUN BARIS KODE) ---
  {
    id: 'q1',
    type: 'drag_order',
    category: 'Sintaks Sisip Tengah',
    title: 'Misi 1: Sisip Gerbong Baru di Antara Dua Node',
    question: 'Urutkan baris kode C++ berikut untuk menyisipkan node baru (newNode) SETELAH node (prevNode) tanpa memutus rantai!',
    codeSnippet: '// prevNode -> [newNode] -> nextNode',
    items: [
      { id: 'b1', text: 'newNode->next = prevNode->next;' },
      { id: 'b2', text: 'prevNode->next = newNode;' },
      { id: 'b3', text: 'Node* newNode = new Node(data);' }
    ],
    // Urutan benar: Buat node -> Sambung kait newNode ke gerbong lama -> Ubah kait prevNode ke newNode
    correctOrder: ['b3', 'b1', 'b2'],
    explanation: 'Pertama alokasikan newNode. PENTING: Sambungkan newNode->next terlebih dahulu ke sisa rangkaian agar gerbong di belakangnya tidak hilang (Memory Leak)! Baru kemudian arahkan prevNode->next ke newNode.',
    points: 100
  },
  {
    id: 'q2',
    type: 'drag_order',
    category: 'Sintaks Hapus Node',
    title: 'Misi 2: Lepas Gerbong Tengah (Delete Node)',
    question: 'Urutkan langkah membuang node (delNode) yang berada setelah (prevNode) dengan aman!',
    codeSnippet: '// prevNode -> delNode -> nextNode',
    items: [
      { id: 'd1', text: 'delete delNode;' },
      { id: 'd2', text: 'Node* delNode = prevNode->next;' },
      { id: 'd3', text: 'prevNode->next = delNode->next;' }
    ],
    correctOrder: ['d2', 'd3', 'd1'],
    explanation: 'Simpan referensi node yang akan dihapus ke delNode -> Sambungkan kait prevNode melompati delNode langsung ke delNode->next -> Terakhir bebaskan memori dengan delete delNode agar tidak terjadi memory leak!',
    points: 100
  },
  {
    id: 'q3',
    type: 'drag_order',
    category: 'Sintaks Sisip Depan (Head)',
    title: 'Misi 3: Pasang Lokomotif Baru (Insert at Head)',
    question: 'Susun sintaks untuk menambahkan gerbong baru di paling depan sebagai Head baru:',
    codeSnippet: '// [newNode] -> [Head Lama] -> ...',
    items: [
      { id: 'h1', text: 'head = newNode;' },
      { id: 'h2', text: 'newNode->next = head;' },
      { id: 'h3', text: 'Node* newNode = new Node(nilai);' }
    ],
    correctOrder: ['h3', 'h2', 'h1'],
    explanation: 'Buat newNode -> Kaitkan newNode->next ke head lama -> Jadikan newNode sebagai head yang baru. Jangan balik langkah 2 & 1, jika head diubah duluan, pointer ke rangkaian lama akan hilang!',
    points: 100
  },
  {
    id: 'q4',
    type: 'drag_order',
    category: 'Sintaks Traversal (Telusur)',
    title: 'Misi 4: Menelusuri Seluruh Gerbong Kereta',
    question: 'Susun kode loop untuk mencetak data dari lokomotif hingga gerbong terakhir:',
    codeSnippet: '// Dari Head sampai NULL',
    items: [
      { id: 't1', text: 'while (curr != NULL) {' },
      { id: 't2', text: '    cout << curr->data << " -> ";' },
      { id: 't3', text: '    curr = curr->next;' },
      { id: 't4', text: 'Node* curr = head;' },
      { id: 't5', text: '}' }
    ],
    correctOrder: ['t4', 't1', 't2', 't3', 't5'],
    explanation: 'Inisialisasi pointer penelusur `curr = head`. Loop selama `curr != NULL`, cetak datanya, lalu geser ke gerbong berikutnya `curr = curr->next`.',
    points: 110
  },
  {
    id: 'q5',
    type: 'drag_order',
    category: 'Sintaks Definisi Node',
    title: 'Misi 5: Deklarasi Struktur Satu Gerbong',
    question: 'Susun struktur data Node dalam bahasa C++ yang memiliki muatan (data) dan kait (pointer next):',
    items: [
      { id: 's1', text: 'struct Node {' },
      { id: 's2', text: '    int data;' },
      { id: 's3', text: '    Node* next;' },
      { id: 's4', text: '};' }
    ],
    correctOrder: ['s1', 's2', 's3', 's4'],
    explanation: 'Setiap node pada Linked List terdiri dari 2 bagian utama: Muatan (data) dan Pointer/Kait (`Node* next`) yang menunjuk ke alamat node berikutnya.',
    points: 90
  },

  // --- KATEGORI 2: PILIHAN GANDA LOGIKA & KONSEP KUNCI (DISCOVERY LEARNING) ---
  {
    id: 'q6',
    type: 'multiple_choice',
    category: 'Konsep Inti',
    title: 'Prinsip Emas: Ubah Kait vs Geser Gerbong',
    question: 'Apa keunggulan utama menyisipkan elemen di tengah Linked List dibandingkan Array?',
    options: [
      'Menyisip di Linked List cukup mengubah pointer kait (O(1) jika posisi diketahui), tidak perlu menggeser elemen lain.',
      'Linked List menggunakan memori lebih sedikit dibanding Array.',
      'Linked List bisa diakses secara acak langsung ke indeks ke-5 dengan O(1).',
      'Elemen Linked List otomatis terurut tanpa algoritma sorting.'
    ],
    correct: 0,
    explanation: 'Pada Array, menyisip di tengah mengharuskan semua elemen di belakangnya bergeser (O(N)). Pada Linked List, "UBAH KAIT, BUKAN GESER"!',
    points: 100
  },
  {
    id: 'q7',
    type: 'multiple_choice',
    category: 'Pointer Tracing',
    title: 'Melacak Jejak Pointer (Memory Trace)',
    question: 'Diberikan rangkaian: Head -> [10] -> [25] -> [40] -> NULL. Nilai dari `Head->next->next->data` adalah:',
    options: [
      '10',
      '25',
      '40',
      'NULL (Error)'
    ],
    correct: 2,
    explanation: 'Head menunjuk ke [10]. Head->next adalah [25]. Head->next->next adalah [40]. Datanya bernilai 40.',
    points: 100
  },
  {
    id: 'q8',
    type: 'multiple_choice',
    category: 'Edge Case & Bug',
    title: 'Bahaya Gerbong Hantu (Dangling Pointer / Leak)',
    question: 'Jika kamu mengeksekusi `prev->next = newNode` SEBELUM mengatur `newNode->next`, apa akibat fatalnya?',
    options: [
      'Gerbong di belakang prev akan terputus dan hilang dari rantai di memori (Memory Leak).',
      'Program akan otomatis menyambungkan ke Head.',
      'Semua node akan bergeser ke kiri satu langkah.',
      'Tidak ada masalah, compiler C++ otomatis memperbaikinya.'
    ],
    correct: 0,
    explanation: 'Jika prev->next diputus duluan tanpa menyimpan alamat gerbong berikutnya, seluruh sisa rantai gerbong akan kehilangan jejak (Memory Leak)!',
    points: 110
  },
  {
    id: 'q9',
    type: 'multiple_choice',
    category: 'Kompleksitas Waktu',
    title: 'Akses Acak vs Berurutan',
    question: 'Mengapa kita TIDAK BISA langsung loncat mengambil gerbong ke-50 pada Singly Linked List seperti pada Array `arr[50]`?',
    options: [
      'Karena setiap gerbong tersimpan acak di memori, satu-satunya cara mencapainya adalah menelusuri kait demi kait dari Head (Sequential Access O(N)).',
      'Karena compiler melarang angka indeks lebih dari 10.',
      'Karena pointer `next` hanya bisa melompat 2 langkah sekali jalan.',
      'Karena gerbong ke-50 selalu bernilai NULL.'
    ],
    correct: 0,
    explanation: 'Array menggunakan memori berurutan (kontigu) sehingga punya Random Access O(1). Linked List menggunakan alokasi non-kontigu, sehingga harus ditelusuri dari lokomotif Head satu per satu (O(N)).',
    points: 100
  },
  {
    id: 'q10',
    type: 'multiple_choice',
    category: 'Karakteristik Head & Tail',
    title: 'Mengenal Ujung Kereta',
    question: 'Pada Singly Linked List standar, apa ciri khas gerbong paling belakang (Tail)?',
    options: [
      'Pointer `next`-nya bernilai NULL (atau nullptr), menandakan akhir dari rangkaian.',
      'Pointer `next`-nya menunjuk kembali ke Head.',
      'Data muatannya harus selalu 0.',
      'Memiliki dua pointer `prev` dan `next`.'
    ],
    correct: 0,
    explanation: 'Ujung paling akhir (Tail) memiliki pointer `next = NULL`. Jika menunjuk kembali ke Head, itu disebut Circular Linked List.',
    points: 90
  },
  {
    id: 'q11',
    type: 'multiple_choice',
    category: 'Skenario Nyata',
    title: 'Aplikasi Nyata Linked List',
    question: 'Manakah dari fitur aplikasi berikut yang paling ideal diimplementasikan menggunakan konsep Doubly Linked List?',
    options: [
      'Tombol "Next Track" dan "Previous Track" pada Playlist Spotify.',
      'Mencari data siswa dengan NIM terurut menggunakan Binary Search.',
      'Menghitung nilai rata-rata nilai ujian 100 siswa sekaligus.',
      'Menyimpan matriks piksel gambar 4K.'
    ],
    correct: 0,
    explanation: 'Playlist musik membutuhkan navigasi bolak-balik (maju ke lagu berikutnya, mundur ke lagu sebelumnya) serta menambah/menghapus lagu di tengah tanpa jeda. Doubly Linked List sangat tepat!',
    points: 100
  },
  {
    id: 'q12',
    type: 'multiple_choice',
    category: 'Operasi Hapus Kepala',
    title: 'Melepas Lokomotif Depan (Delete Head)',
    question: 'Bagaimana cara menghapus node pertama (Head) pada Linked List?',
    options: [
      'Simpan temp = head -> Ubah head = head->next -> Hapus delete temp.',
      'Langsung panggil delete head tanpa mengubah penunjuk.',
      'Ubah head->next = NULL lalu hapus semua gerbong.',
      'Geser semua node di belakang head ke kiri satu blok.'
    ],
    correct: 0,
    explanation: 'Simpan alamat head lama ke variabel `temp`, majukan pointer `head` ke node kedua (`head = head->next`), lalu bebaskan memori `delete temp`. Rapi dan aman dari crash!',
    points: 100
  },
  {
    id: 'q13',
    type: 'drag_order',
    category: 'Algoritma Balik Arah',
    title: 'Tantangan Master: Membalikkan Arah Rangkaian (Reverse Linked List)',
    question: 'Urutkan 4 langkah di dalam perulangan loop untuk membalikkan arah semua pointer:',
    codeSnippet: '// A -> B -> C menjadi C -> B -> A',
    items: [
      { id: 'r1', text: 'next = curr->next;  // Simpan gerbong depan' },
      { id: 'r2', text: 'curr->next = prev;  // Putar balik kait' },
      { id: 'r3', text: 'prev = curr;        // Geser prev maju' },
      { id: 'r4', text: 'curr = next;        // Geser curr maju' }
    ],
    correctOrder: ['r1', 'r2', 'r3', 'r4'],
    explanation: 'Algoritma legendaris 3 pointer (prev, curr, next): 1) Amankan gerbong depan, 2) Putar balik pointer ke belakang, 3) Geser prev ke posisi saat ini, 4) Geser curr ke gerbong berikutnya!',
    points: 130
  },
  {
    id: 'q14',
    type: 'multiple_choice',
    category: 'Deteksi Siklus (Floyd)',
    title: 'Kereta Terjebak Putaran (Loop Detection)',
    question: 'Algoritma "Kura-kura dan Kelinci" (Floyd Cycle Detection) mendeteksi loop pada Linked List dengan cara:',
    options: [
      'Menggunakan dua pointer: satu melangkah 1 kali (slow), satu melangkah 2 kali (fast); jika bertemu, ada loop!',
      'Menghitung jumlah node sampai 1000 kali.',
      'Menghapus setiap node yang dilewati sampai habis.',
      'Memeriksa apakah data pada node kelipatan 2.'
    ],
    correct: 0,
    explanation: 'Jika ada lintasan lingkaran (cycle), pointer cepat yang melangkah 2 node pasti akan mengejar dan bertabrakan dengan pointer lambat yang melangkah 1 node!',
    points: 110
  },
  {
    id: 'q15',
    type: 'multiple_choice',
    category: 'Ukuran Memori',
    title: 'Perbandingan Memori Array vs Linked List',
    question: 'Mengapa setiap elemen pada Linked List membutuhkan memori tambahan dibanding elemen tipe sama pada Array?',
    options: [
      'Karena selain menyimpan data muatan, Linked List harus menyimpan alamat memori pointer (`next`).',
      'Karena Linked List selalu disimpan di Cloud.',
      'Karena Linked List otomatis menduplikasi nilainya.',
      'Karena tipe data Linked List selalu bertipe String 64-bit.'
    ],
    correct: 0,
    explanation: 'Tiap node memerlukan memori ekstra untuk pointer (biasanya 4 byte pada sistem 32-bit atau 8 byte pada sistem 64-bit) sebagai "kait" menuju node berikutnya.',
    points: 90
  }
];

// SPELLS & SABOTAGE ITEMS
export const SPELLS = [
  {
    id: 'bomb',
    name: 'Bom Dinamit Rel',
    icon: '💣',
    color: 'from-rose-500 to-red-600',
    description: 'Lempar bom ke kereta lawan! Target meledak & terpental mundur -150 meter!',
    effectType: 'damage',
    value: 150
  },
  {
    id: 'freeze',
    name: 'Mantra Es Pembeku',
    icon: '❄️',
    color: 'from-cyan-400 to-blue-500',
    description: 'Bekukan lokomotif lawan selama 10 detik! Layar HP mereka terkunci es.',
    effectType: 'freeze',
    durationSeconds: 10
  },
  {
    id: 'reverse_curse',
    name: 'Kutukan Pointer Terbalik',
    icon: '🔄',
    color: 'from-purple-500 to-indigo-600',
    description: 'Acak posisi opsi jawaban lawan selama 8 detik! Membuat mereka bingung.',
    effectType: 'reverse',
    durationSeconds: 8
  },
  {
    id: 'shield',
    name: 'Perisai Pelindung NULL',
    icon: '🛡️',
    color: 'from-amber-400 to-yellow-500',
    description: 'Aktifkan perisai darurat! Menangkis 1 serangan bom atau mantra es berikutnya.',
    effectType: 'shield',
    charges: 1
  },
  {
    id: 'nitro',
    name: 'Nitro Turbo Pointer',
    icon: '⚡',
    color: 'from-emerald-400 to-teal-500',
    description: 'Lompatan kilat O(1)! Kereta timmu melesat maju +200 meter!',
    effectType: 'boost',
    value: 200
  }
];
