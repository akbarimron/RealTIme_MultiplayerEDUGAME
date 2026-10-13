// Firebase Cloud Realtime Adapter (Optional Sync Layer)
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

export class FirebaseRealtimeAdapter {
  constructor() {
    this.isConfigured = false;
    this.db = null;
    this.init();
  }

  init() {
    const config = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID
    };

    if (config.apiKey && config.projectId) {
      try {
        const app = initializeApp(config);
        this.db = getFirestore(app);
        this.isConfigured = true;
        console.log('🔥 [Firebase Cloud]: Berhasil terhubung ke Firestore project:', config.projectId);
      } catch (err) {
        console.warn('⚠️ [Firebase Cloud]: Gagal inisialisasi:', err.message);
      }
    } else {
      console.log('⚡ [Dual Mode]: Berjalan dalam mode Local Realtime Socket.IO Engine (Siap dipakai offline tanpa konfigurasi Firebase).');
    }
  }

  async syncState(gameState) {
    if (!this.isConfigured || !this.db) return;
    try {
      const roomRef = doc(this.db, 'microteaching_rooms', 'active_session');
      await setDoc(roomRef, {
        ...gameState,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error('Firebase sync error:', err.message);
    }
  }
}

export const firebaseAdapter = new FirebaseRealtimeAdapter();
