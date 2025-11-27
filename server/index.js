const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Routes
const webhookRoutes = require('./routes/webhooks');
const messageRoutes = require('./routes/messages');
const contactRoutes = require('./routes/contacts');
const chatRoutes = require('./routes/chats');

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Setup Socket.io
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

app.use(cors());
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

// Attach io to req to use in routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// API Routes
app.use('/api/webhooks', webhookRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/tags', require('./routes/tags'));
app.use('/api/stats', require('./routes/stats'));

// Serve static files from the React client
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle React routing, return all requests to React app
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
