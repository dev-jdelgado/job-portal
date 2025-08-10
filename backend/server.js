const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const userRoutes = require('./routes/user');
const accountRoutes = require('./routes/account');
const messageRoutes = require('./routes/messages');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => res.send('API Running'));
app.use('/api/auth', authRoutes);
app.use('/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/messages', messageRoutes);

const server = http.createServer(app);

// Socket.IO with production-safe CORS
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
        transports: ['websocket', 'polling'] // ensure fallback works
    }
});

// Store online users
let onlineUsers = {};

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join', async ({ userId }) => {
        onlineUsers[userId] = socket.id;
        console.log(`User ${userId} connected`);

        // If this is the admin, fetch ALL seekers they've chatted with
        try {
            const [seekers] = await require('./db').query(
                `SELECT DISTINCT u.id, u.name
                 FROM users u
                 INNER JOIN messages m ON (
                    (m.sender_id = u.id AND m.receiver_id = ?)
                    OR
                    (m.receiver_id = u.id AND m.sender_id = ?)
                 )
                 WHERE u.role = 'seeker'`,
                [userId, userId]
            );
            io.to(socket.id).emit('updateSeekers', seekers);
        } catch (err) {
            console.error('Error fetching seekers on join:', err);
        }
    });

    socket.on('sendMessage', async (data) => {
        try {
            // Save to DB
            const [result] = await require('./db').query(
                'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
                [data.senderId, data.receiverId, data.content]
            );
    
            const [savedMessage] = await require('./db').query(
                'SELECT * FROM messages WHERE id = ?',
                [result.insertId]
            );
            const messageToSend = savedMessage[0]; // includes id & timestamp
    
            // Send to receiver if online
            const targetSocketId = onlineUsers[data.receiverId];
            if (targetSocketId) {
                io.to(targetSocketId).emit('receiveMessage', messageToSend);
            }
    
            // Also send back to sender so they see their own message immediately
            const senderSocketId = onlineUsers[data.senderId];
            if (senderSocketId) {
                io.to(senderSocketId).emit('receiveMessage', messageToSend);
            }
    
            // If admin is the receiver, send seeker info
            if (data.receiverId === 1) { // your admin ID
                const [rows] = await require('./db').query(
                    `SELECT id, name FROM users WHERE id = ? AND role = 'seeker'`,
                    [data.senderId]
                );
                if (rows.length > 0) {
                    io.to(targetSocketId).emit('updateSeekers', [rows[0]]);
                }
            }
        } catch (err) {
            console.error('Error handling sendMessage:', err);
        }
    });

    socket.on('disconnect', () => {
        for (let userId in onlineUsers) {
            if (onlineUsers[userId] === socket.id) {
                delete onlineUsers[userId];
                break;
            }
        }
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
