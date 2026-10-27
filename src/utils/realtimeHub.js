// Realtime Hub: Supabase Realtime, Socket.IO (Wi-Fi lokal), atau BroadcastChannel (antar tab).
//
// Aturan: hanya SATU pihak yang menjalankan mesin permainan.
//  - Mode Socket.IO: server Node yang menjalankan.
//  - Mode Supabase / BroadcastChannel: tab guru (host) yang menjalankan,
//    lalu menyiarkan state baru ke semua HP.

import { io } from 'socket.io-client';
import { getSupabase } from './supabaseClient';

const CHANNEL_NAME = 'panjat-tebing-room-v2';

class RealtimeHub {
  constructor() {
    this.supabaseChannel = null;
    this.broadcastChannel = null;
    this.socket = null;
    this.listeners = [];
    this.onActionHandler = null;
    this.onReadyCallback = null;
    this.isSubscribed = false;
    this.mode = 'local';
  }

  get transport() {
    if (this.supabaseChannel) {
      return this.isSubscribed ? 'supabase' : 'supabase-connecting';
    }
    if (this.socket && this.socket.connected) return 'socket';
    return 'local';
  }

  onReady(cb) {
    this.onReadyCallback = cb;
    if (this.isSubscribed) {
      try { cb(); } catch (e) { console.error(e); }
    }
  }

  init(onUpdateCallback) {
    if (onUpdateCallback) this.listeners.push(onUpdateCallback);

    const supabase = getSupabase();
    if (supabase) {
      this.mode = 'supabase';
      this.supabaseChannel = supabase.channel(CHANNEL_NAME, {
        // self: false, karena aksi milik sendiri sudah diproses langsung di emitAction
        config: { broadcast: { self: false } }
      });
      this.supabaseChannel
        .on('broadcast', { event: 'room:update' }, (msg) => this.notify(msg.payload))
        .on('broadcast', { event: 'action:event' }, (msg) => this.handleIncomingAction(msg.payload))
        .subscribe((status, err) => {
          console.log(`⚡ [Supabase Realtime] Channel status: ${status}`, err || '');
          if (status === 'SUBSCRIBED') {
            this.isSubscribed = true;
            if (this.onReadyCallback) {
              try { this.onReadyCallback(); } catch (e) { console.error(e); }
            }
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            this.isSubscribed = false;
          }
        });
      return;
    }

    this.mode = 'local';
    const host = window.location.hostname;
    const port = window.location.port === '5173' ? '3000' : (window.location.port || '3000');
    try {
      this.socket = io(`${window.location.protocol}//${host}:${port}`, {
        transports: ['websocket', 'polling'],
        // tidak pernah menyerah menyambung ulang, supaya lemparan skill tidak "nyangkut"
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 400,
        reconnectionDelayMax: 2000,
        timeout: 4000,
        autoConnect: false
      });
      this.socket.on('room:update', (state) => this.notify(state));
      this.socket.on('connect_error', () => {});
      // ditunda satu tick: React StrictMode memasang-lepas efek dua kali saat development
      const sock = this.socket;
      this.connectTimer = setTimeout(() => sock.connect(), 0);
    } catch {
      this.socket = null;
    }

    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      this.broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
      this.broadcastChannel.onmessage = (ev) => {
        const { type, data } = ev.data || {};
        if (type === 'room:update') this.notify(data);
        else if (type === 'action:event') this.handleIncomingAction(data);
      };
    }
  }

  notify(state) {
    if (!state) return;
    this.listeners.forEach((cb) => cb(state));
  }

  handleIncomingAction(actionObj) {
    if (this.onActionHandler) this.onActionHandler(actionObj);
  }

  setActionHandler(fn) {
    this.onActionHandler = fn;
  }

  broadcastState(state) {
    if (this.supabaseChannel) {
      this.supabaseChannel
        .send({ type: 'broadcast', event: 'room:update', payload: state })
        .then((res) => {
          if (res !== 'ok') console.warn('⚠️ [Supabase Realtime] broadcastState response:', res);
        })
        .catch((err) => console.error('❌ [Supabase Realtime] broadcastState error:', err));
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'room:update', data: state });
    }
    this.notify(state);
  }

  emitAction(action, payload = {}) {
    const actionObj = { action, payload, timestamp: Date.now() };

    if (this.supabaseChannel) {
      this.supabaseChannel
        .send({ type: 'broadcast', event: 'action:event', payload: actionObj })
        .then((res) => {
          if (res !== 'ok') console.warn('⚠️ [Supabase Realtime] emitAction response:', res);
        })
        .catch((err) => console.error('❌ [Supabase Realtime] emitAction error:', err));
      this.handleIncomingAction(actionObj);
      return;
    }

    if (this.socket && this.socket.connected) {
      this.socket.emit('game:action', actionObj);
      return;
    }

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'action:event', data: actionObj });
    }
    this.handleIncomingAction(actionObj);
  }

  destroy() {
    clearTimeout(this.connectTimer);
    if (this.supabaseChannel) this.supabaseChannel.unsubscribe();
    if (this.broadcastChannel) this.broadcastChannel.close();
    if (this.socket) this.socket.disconnect();
    this.supabaseChannel = null;
    this.broadcastChannel = null;
    this.socket = null;
    this.listeners = [];
  }
}

export const realtimeHub = new RealtimeHub();
