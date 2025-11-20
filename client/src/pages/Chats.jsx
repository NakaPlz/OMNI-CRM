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
    <Paperclip size={20} />
                            </button >
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
                        </div >
                    </div >
                </div >
            ) : (
    <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-500">
        <p>Select a chat to start messaging</p>
    </div>
)}
        </div >
    );
}
