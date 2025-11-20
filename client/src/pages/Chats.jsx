import React, { useState, useEffect } from 'react';
import { Search, Send, Phone, Instagram, MoreVertical, Paperclip } from 'lucide-react';
import { io } from 'socket.io-client';

// Mock Data
const MOCK_CHATS = [
    {
        id: 1,
        name: 'Juan Perez',
        lastMessage: 'Hola, me interesa el producto...',
        time: '10:30 AM',
        source: 'whatsapp',
        unread: 2,
        avatar: 'https://ui-avatars.com/api/?name=Juan+Perez&background=25D366&color=fff'
    },
    {
        id: 2,
        name: 'Maria Garcia',
        lastMessage: '¿Tienen envíos a domicilio?',
        time: '09:15 AM',
        source: 'instagram',
        unread: 0,
        avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=E1306C&color=fff'
    },
    {
        id: 3,
        name: 'Carlos Lopez',
        lastMessage: 'Gracias por la información.',
        time: 'Yesterday',
        source: 'whatsapp',
        unread: 0,
        avatar: 'https://ui-avatars.com/api/?name=Carlos+Lopez&background=25D366&color=fff'
    }
];

const MOCK_MESSAGES = [
    { id: 1, text: 'Hola, buenos días', sender: 'user', time: '10:00 AM' },
    { id: 2, text: 'Hola! En qué puedo ayudarte?', sender: 'me', time: '10:05 AM' },
    { id: 3, text: 'Me interesa el producto que publicaron', sender: 'user', time: '10:15 AM' },
    { id: 4, text: 'Claro, te paso los detalles...', sender: 'me', time: '10:20 AM' },
];

export default function Chats() {
    const [chats, setChats] = useState(MOCK_CHATS);
    const [selectedChat, setSelectedChat] = useState(MOCK_CHATS[0]);
    const [messages, setMessages] = useState(MOCK_MESSAGES);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Connect to Socket.io
        // In production (Easypanel), it connects to the same domain automatically
        const socket = io();

        socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        socket.on('new_message', (data) => {
            console.log('New message received:', data);

            // For demo: Append a notification message
            const newMessage = {
                id: Date.now(),
                text: '🔔 New Webhook Event Received! (See console for payload)',
                sender: 'user',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, newMessage]);

            // Update the first chat to show activity
            setChats(prev => prev.map((chat, index) =>
                index === 0 ? { ...chat, lastMessage: '🔔 New Webhook Event...', time: 'Just now', unread: chat.unread + 1 } : chat
            ));
        });

        return () => socket.disconnect();
    }, []);

    const getSourceIcon = (source) => {
        if (source === 'whatsapp') return <Phone size={16} className="text-green-500" />;
        if (source === 'instagram') return <Instagram size={16} className="text-pink-500" />;
        return null;
    };

    return (
        <div className="flex h-full w-full bg-slate-950">
            {/* Chat List */}
            <div className="w-96 border-r border-slate-800 flex flex-col bg-slate-900/50">
                <div className="p-4 border-b border-slate-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full bg-slate-800 text-slate-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {chats.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
                            className={`p-4 border-b border-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors ${selectedChat?.id === chat.id ? 'bg-slate-800' : ''
                                }`}
                        >
                            <div className="flex gap-3">
                                <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-medium text-slate-200 truncate">{chat.name}</h3>
                                        <span className="text-xs text-slate-500 whitespace-nowrap">{chat.time}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-slate-400 truncate pr-2">{chat.lastMessage}</p>
                                        {chat.unread > 0 && (
                                            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                {chat.unread}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-1 flex items-center gap-1">
                                        {getSourceIcon(chat.source)}
                                        <span className="text-xs text-slate-500 capitalize">{chat.source}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            {selectedChat ? (
                <div className="flex-1 flex flex-col bg-slate-950">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                        <div className="flex items-center gap-3">
                            <img src={selectedChat.avatar} alt={selectedChat.name} className="w-10 h-10 rounded-full" />
                            <div>
                                <h2 className="font-bold text-slate-100">{selectedChat.name}</h2>
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                    {getSourceIcon(selectedChat.source)}
                                    <span className="capitalize">{selectedChat.source}</span>
                                </div>
                            </div>
                        </div>
                        <button className="text-slate-400 hover:text-slate-200">
                            <MoreVertical size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${msg.sender === 'me'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-slate-800 text-slate-200 rounded-tl-none'
                                        }`}
                                >
                                    <p>{msg.text}</p>
                                    <span className={`text-xs mt-1 block ${msg.sender === 'me' ? 'text-blue-200' : 'text-slate-500'
                                        }`}>
                                        {msg.time}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-400 hover:text-blue-400 transition-colors">
                                <Paperclip size={20} />
                            </button>
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-slate-800 text-slate-200 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                            />
                            <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-500">
                    <p>Select a chat to start messaging</p>
                </div>
            )}
        </div>
    );
}
