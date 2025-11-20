import React, { useState } from 'react';
import { Search, Send, Phone, Instagram, MoreVertical, Paperclip } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';

export default function Chats() {
    const { chats, messagesByChat, setMessagesByChat } = useChatContext();
    const [selectedChat, setSelectedChat] = useState(null);
    const [message, setMessage] = useState('');

    const getSourceIcon = (source) => {
        if (source === 'whatsapp') return <Phone size={16} className="text-green-500" />;
        if (source === 'instagram') return <Instagram size={16} className="text-pink-500" />;
        return null;
    };

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedChat) return;

        const tempMessage = {
            id: Date.now(),
            text: message,
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Optimistic update for the selected chat
        setMessagesByChat(prev => ({
            ...prev,
            [selectedChat.id]: [...(prev[selectedChat.id] || []), tempMessage]
        }));
        setMessage('');

        try {
            const response = await fetch('/api/messages/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientId: selectedChat.id,
                    text: tempMessage.text,
                    platform: selectedChat.source
                })
            });

            const data = await response.json();
            if (!data.success) {
                console.error('Failed to send message:', data.error);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Get messages for the selected chat, or empty array
    const currentMessages = selectedChat ? (messagesByChat[selectedChat.id] || []) : [];

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
                    {chats.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            <p>No chats yet.</p>
                            <p className="text-sm mt-2">Waiting for incoming messages...</p>
                        </div>
                    ) : (
                        chats.map((chat) => (
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
                        ))
                    )}
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
                        {currentMessages.length === 0 ? (
                            <div className="text-center text-slate-500 mt-10">
                                <p>No messages yet.</p>
                            </div>
                        ) : (
                            currentMessages.map((msg) => (
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
                            ))
                        )}
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
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type a message..."
                                className="flex-1 bg-slate-800 text-slate-200 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                            />
                            <button
                                onClick={handleSendMessage}
                                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                            >
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
