// Ruang permainan di server Socket.IO.
// Aturan main tidak ditulis ulang di sini: memakai mesin yang sama dengan browser.
import { createInitialState, reduce, hasPendingExplosion } from '../src/game/engine.js';

export class GameRoom {
  constructor() {
    this.state = createInitialState();
  }

  snapshot() {
    return { ...this.state, sentAt: Date.now() };
  }

  apply(action, payload) {
    this.state = reduce(this.state, action, payload, Date.now());
    return this.snapshot();
  }

  hasPendingExplosion() {
    return hasPendingExplosion(this.state, Date.now());
  }

  isTimeUp() {
    const s = this.state;
    return s.isPlaying && s.gameEndsAt && Date.now() >= s.gameEndsAt;
  }
}
