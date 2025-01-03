import { io } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';

const SOCKET_URL = 'wss://muhendislerticaret-backend.onrender.com';

class SocketManager {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
        this.isInitialized = false;
        this.connectionAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.connectionPromise = null;
    }

    initialize() {
        if (this.isInitialized && this.socket) {
            return this.socket;
        }

        const socketOptions = {
            autoConnect: false,
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: 1000,
            timeout: 10000,
            transports: ['websocket', 'polling'],
            upgrade: true,
            rememberUpgrade: true,
            secure: true,
            rejectUnauthorized: false
        };

        this.socket = io(SOCKET_URL, socketOptions);

        // Transport değişikliğini izle
        this.socket.on('connect_error', (error) => {
            console.error('[Socket] Bağlantı hatası:', {
                message: error.message,
                type: error.type,
                description: error.description
            });

            // Websocket hatası durumunda polling'e geç
            if (error.type === 'TransportError') {
                console.log('[Socket] Transport WebSocket\'ten polling\'e geçiyor');
                this.socket.io.opts.transports = ['polling', 'websocket'];
            }
        });

        this.setupDebugListeners();
        this.setupMainListeners();

        this.isInitialized = true;
        return this.socket;
    }

    setupDebugListeners() {
        console.log('[SocketManager] Debug dinleyicileri ayarlanıyor');

        // Bağlantı öncesi
        this.socket.on('connecting', () => {
            console.log('[Socket] Bağlanmaya çalışılıyor...');
        });

        // Bağlantı denemesi
        this.socket.on('reconnect_attempt', (attempt) => {
            this.connectionAttempts = attempt;
            console.log(`[Socket] Yeniden bağlanma denemesi #${attempt}`);
        });

        // Transport değişimi
        this.socket.on('transport', (transport) => {
            console.log('[Socket] Transport değişti:', transport.name);
        });

        // Ping/Pong
        this.socket.on('ping', () => {
            console.log('[Socket] Ping gönderildi');
        });

        this.socket.on('pong', (latency) => {
            console.log('[Socket] Pong alındı, gecikme:', latency, 'ms');
        });

        // Genel event dinleyici
        this.socket.onAny((event, ...args) => {
            console.log('[Socket] Event alındı:', event, 'Data:', args);
        });
    }

    setupMainListeners() {
        console.log('[SocketManager] Ana dinleyiciler ayarlanıyor');

        this.socket.on('connect', () => {
            console.log('[Socket] Bağlantı başarılı ');
            console.log('[Socket] Socket ID:', this.socket.id);
            console.log('[Socket] Bağlantı durumu:', {
                connected: this.socket.connected,
                disconnected: this.socket.disconnected,
                transport: this.socket.io.engine.transport.name
            });
            this.connectionAttempts = 0;
            this.reattachListeners();
        });

        this.socket.on('disconnect', (reason) => {
            console.log('[Socket] Bağlantı koptu ', {
                reason,
                attempts: this.connectionAttempts
            });
        });

        this.socket.on('connect_error', (error) => {
            console.error('[Socket] Bağlantı hatası:', {
                message: error.message,
                type: error.type,
                description: error.description,
                attempt: this.connectionAttempts,
                url: this.socket.io.uri
            });

            const authStore = useAuthStore();
            if (error.message === 'Unauthorized') {
                console.log('[Socket] Yetkisiz erişim, auth store güncelleniyor');
                authStore.isAuthenticated = false;
            }
        });

        this.socket.on('error', (error) => {
            console.error('[Socket] Genel hata:', error);
        });
    }

    async ensureConnection() {
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        if (this.socket?.connected) {
            return this.socket;
        }

        this.connectionPromise = new Promise((resolve, reject) => {
            const socket = this.initialize();

            const timeoutId = setTimeout(() => {
                reject(new Error('Socket connection timeout'));
                this.connectionPromise = null;
            }, 5000);

            socket.once('connect', () => {
                clearTimeout(timeoutId);
                this.connectionPromise = null;
                resolve(socket);
            });

            socket.once('connect_error', (error) => {
                clearTimeout(timeoutId);
                this.connectionPromise = null;
                reject(error);
            });

            socket.connect();
        });

        return this.connectionPromise;
    }

    emitSafely(event, data) {
        if (this.socket?.connected) {
            this.socket.emit(event, data);
            return true;
        }
        console.warn(`Socket not connected, couldn't emit ${event}`);
        return false;
    }

    addListener(event, callback) {
        console.log('[SocketManager] Dinleyici ekleniyor:', event);

        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }

        this.listeners.get(event).add(callback);

        if (this.socket) {
            console.log('[SocketManager] Event dinleyicisi socket\'e ekleniyor:', event);
            this.socket.on(event, callback);
        }
    }

    removeListener(event, callback) {
        console.log('[SocketManager] Dinleyici kaldırılıyor:', event);

        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);

            if (this.socket) {
                console.log('[SocketManager] Event dinleyicisi socket\'ten kaldırılıyor:', event);
                this.socket.off(event, callback);
            }
        }
    }

    removeSocketListeners() {
        console.log('[SocketManager] Tüm dinleyiciler kaldırılıyor');

        if (this.socket) {
            this.socket.removeAllListeners();
            this.listeners.clear();
        }
    }

    reattachListeners() {
        console.log('[SocketManager] Dinleyiciler yeniden ekleniyor');
        console.log('Mevcut dinleyiciler:', Array.from(this.listeners.keys()));

        this.listeners.forEach((callbacks, event) => {
            callbacks.forEach(callback => {
                console.log('[SocketManager] Dinleyici yeniden ekleniyor:', event);
                this.socket.on(event, callback);
            });
        });
    }

    connect() {
        console.log('[SocketManager] Bağlantı başlatılıyor');

        if (!this.socket) {
            this.initialize();
        }

        if (this.socket.connected) {
            console.log('[SocketManager] Mevcut bağlantı kapatılıyor');
            this.socket.disconnect();
        }

        console.log('[SocketManager] Yeni bağlantı başlatılıyor');
        this.socket.connect();
    }

    disconnect() {
        console.log('[SocketManager] Bağlantı kesiliyor');

        if (this.socket) {
            this.socket.disconnect();
        }
    }

    getConnectionStatus() {
        if (!this.socket) return 'UNINITIALIZED';
        if (this.socket.connected) return 'CONNECTED';
        if (this.socket.disconnected) return 'DISCONNECTED';
        return 'CONNECTING';
    }
}

export const socketManager = new SocketManager();

export default {
    install(app) {
        app.config.globalProperties.$socket = socketManager;
        app.provide('socket', socketManager);
    }
};