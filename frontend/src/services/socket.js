import { io } from 'socket.io-client';

// Connect to same origin — Vite proxy forwards /socket.io → backend:5000
// This works in both dev (via proxy) and production (same server)
const SOCKET_URL = import.meta.env.VITE_API_URL || '';

const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
  path: '/socket.io',
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

socket.on('connect', () => {
  console.log('[Socket] Connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('[Socket] Disconnected:', reason);
});

socket.on('connect_error', (err) => {
  console.error('[Socket] Connection error:', err.message);
});

export default socket;
