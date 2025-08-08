import { io } from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const socket = io(API_URL, {
  transports: ['websocket'], // forces WebSocket in prod
  withCredentials: true
});

export default socket;
