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


// Initialize App
const app = express();

// Middleware
app.use(cors());
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
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Store online users
let onlineUsers = {};

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join', ({ userId }) => {
        onlineUsers[userId] = socket.id;
        console.log(`User ${userId} connected`);
    });

    socket.on('sendMessage', (data) => {
        const adminSocket = Object.keys(onlineUsers).find(
        key => key !== data.senderId // assumes only one admin
        );
        const targetSocketId = onlineUsers[data.receiverId] || onlineUsers[adminSocket];

        if (targetSocketId) {
        io.to(targetSocketId).emit('receiveMessage', data);
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
