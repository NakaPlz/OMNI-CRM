import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Search, UserPlus, Instagram, MessageCircle, MoreVertical, Paperclip, Phone, Trash2 } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';
import { formatMessageTime } from '../utils/dateUtils';
import ContactModal from '../components/ContactModal';
import Avatar from '../components/Avatar';

export default function Chats() {
    const { chats, messagesByChat, setMessagesByChat, updateChatName, markChatAsRead, deleteChat } = useChatContext();
    const [selectedChat, setSelectedChat] = useState(null);
    const [message, setMessage] = useState('');
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const location = useLocation();

    // Handle navigation from Contacts page
    useEffect(() => {
        if (location.state?.chatId && chats.length > 0) {
            const chatToSelect = chats.find(c => c.id === location.state.chatId);
            if (chatToSelect) {
                handleChatSelect(chatToSelect);
                // Clear state to prevent re-selection on re-renders (optional but good practice)
                window.history.replaceState({}, document.title);
            }
        }
    }, [location.state, chats]);

    const handleContactSaved = async (success, contactData) => {
        setIsContactModalOpen(false);
        if (success && contactData) {
            console.log('Contact saved successfully');
            // Update the chat name with the contact name
            updateChatName(selectedChat.id, contactData.name);
            // Also update the selected chat's name locally
            setSelectedChat(prev => ({ ...prev, name: contactData.name }));
        }
    };

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
        // Mark chat as read when selected
        markChatAsRead(chat.id);
    };

    const getSourceIcon = (source) => {
        if (source === 'whatsapp') return <Phone size={16} className="text-green-500" />;
        if (source === 'instagram') return <Instagram size={16} className="text-pink-500" />;
        return null;
    };

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedChat) return;

        const now = Math.floor(Date.now() / 1000);
        const tempMessage = {
            id: Date.now(),
            text: message,
            sender: 'me',
            timestamp: now,
            time: formatMessageTime(now)
        };

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
                                onClick={() => handleChatSelect(chat)}
                                className={`p-4 border-b border-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors ${selectedChat?.id === chat.id ? 'bg-slate-800' : ''}`}
                            >
                                <div className="flex gap-3">
                                    <Avatar name={chat.name} size="md" />
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
                            <Avatar name={selectedChat.name} size="md" />
                            <div>
                                <h2 className="font-bold text-slate-100">{selectedChat.name}</h2>
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                    {getSourceIcon(selectedChat.source)}
                                    <span className="capitalize">{selectedChat.source}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsContactModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                title="Save Contact"
                            >
                                <UserPlus size={18} />
                                <span>Save Contact</span>
                            </button>
                            <button
                                onClick={async () => {
                                    if (window.confirm('Are you sure you want to delete this chat?')) {
                                        const success = await deleteChat(selectedChat.id);
                                        if (success) {
                                            setSelectedChat(null);
                                        }
                                    }
                                }}
                                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                                title="Delete Chat"
                            >
                                <Trash2 size={20} />
                            </button>
                            <button className="text-slate-400 hover:text-slate-200">
                                <MoreVertical size={20} />
                            </button>
                        </div>
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
                                        <span className={`text-xs mt-1 block ${msg.sender === 'me' ? 'text-blue-200' : 'text-slate-500'}`}>
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
                <div className="flex-1 flex items-center justify-center bg-slate-950">
                    <div className="text-center text-slate-500">
                        <MessageCircle size={64} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">Select a chat to start messaging</p>
                        <p className="text-sm mt-2">Choose a conversation from the list</p>
                    </div>
                </div>
            )}

            {/* Contact Modal */}
            {isContactModalOpen && selectedChat && (
                <ContactModal
                    chatId={selectedChat.id}
                    onClose={handleContactSaved}
                />
            )}
        </div>
    );
}
