import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, Search, UserPlus, Instagram, MessageCircle, MoreVertical, Paperclip, Phone, Trash2, ArrowLeft, Tag, Plus, X, StickyNote } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';
import { useAuth } from '../context/UserAuthContext';
import { formatMessageTime } from '../utils/dateUtils';
import ContactModal from '../components/ContactModal';
import Avatar from '../components/Avatar';

export default function Chats() {
    const { chats, messagesByChat, setMessagesByChat, updateChatName, markChatAsRead, deleteChat, updateChatTags } = useChatContext();
    const { session } = useAuth();
    const [selectedChat, setSelectedChat] = useState(null);
    const [message, setMessage] = useState('');
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    // Tag state
    const [availableTags, setAvailableTags] = useState([]);
    const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

    // Notes state
    const [showNotes, setShowNotes] = useState(false);
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');

    const location = useLocation();
    const navigate = useNavigate();
    const handledNavigation = useRef(null);

    // Fetch available tags
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetch('/api/tags', {
                    headers: { 'Authorization': `Bearer ${session?.access_token}` }
                });
                const data = await response.json();
                if (data.success) {
                    setAvailableTags(data.tags);
                }
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };

        if (session) {
            fetchTags();
        }
    }, [session]);

    // Handle navigation from Contacts page
    useEffect(() => {
        const chatId = location.state?.chatId;

        // Reset handled navigation if we navigated away or state was cleared
        if (!chatId) {
            handledNavigation.current = null;
            return;
        }

        if (chats.length > 0 && handledNavigation.current !== chatId) {
            const chatToSelect = chats.find(c => c.id === chatId);
            if (chatToSelect) {
                handledNavigation.current = chatId; // Mark as handled immediately
                handleChatSelect(chatToSelect);
                // Clear state using navigate to prevent issues
                navigate(location.pathname, { replace: true, state: {} });
            }
        }
    }, [location.state, chats, navigate, location.pathname]);

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
        setIsTagDropdownOpen(false);
        setShowNotes(false); // Reset notes view
    };

    // Fetch notes when chat is selected and notes view is open
    useEffect(() => {
        const fetchNotes = async () => {
            if (!selectedChat || !showNotes) return;
            try {
                const response = await fetch(`/api/notes/${selectedChat.id}`, {
                    headers: { 'Authorization': `Bearer ${session?.access_token}` }
                });
                const data = await response.json();
                setNotes(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching notes:', error);
            }
        };
        fetchNotes();
    }, [selectedChat, showNotes, session]);

    const handleSaveNote = async () => {
        if (!newNote.trim() || !selectedChat) return;
        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ chatId: selectedChat.id, content: newNote })
            });
            const savedNote = await response.json();
            setNotes(prev => [savedNote, ...prev]);
            setNewNote('');
        } catch (error) {
            console.error('Error saving note:', error);
        }
    };

    const handleDeleteNote = async (noteId) => {
        try {
            await fetch(`/api/notes/${noteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            });
            setNotes(prev => prev.filter(n => n.id !== noteId));
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const handleAddTag = async (tag) => {
        if (!selectedChat) return;

        // Optimistic update
        const newTags = [...(selectedChat.tags || []), tag];
        updateChatTags(selectedChat.id, newTags);
        setSelectedChat(prev => ({ ...prev, tags: newTags }));
        setIsTagDropdownOpen(false);

        try {
            await fetch(`/api/chats/${selectedChat.id}/tags`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ tagId: tag.id })
            });
        } catch (error) {
            console.error('Error adding tag:', error);
            // Revert on error (optional, but good practice)
        }
    };

    const handleRemoveTag = async (tagId) => {
        if (!selectedChat) return;

        // Optimistic update
        const newTags = (selectedChat.tags || []).filter(t => t.id !== tagId);
        updateChatTags(selectedChat.id, newTags);
        setSelectedChat(prev => ({ ...prev, tags: newTags }));

        try {
            await fetch(`/api/chats/${selectedChat.id}/tags/${tagId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            });
        } catch (error) {
            console.error('Error removing tag:', error);
        }
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
        <div className="flex h-full w-full bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">
            {/* Chat List */}
            <div className={`
                flex-col bg-white dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 h-full
                w-full md:w-96
                ${selectedChat ? 'hidden md:flex' : 'flex'}
                transition-colors duration-300
            `}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder-slate-500 transition-colors"
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
                                className={`p-4 border-b border-slate-100 dark:border-slate-800/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${selectedChat?.id === chat.id ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                            >
                                <div className="flex gap-3">
                                    <Avatar name={chat.name} size="md" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-medium text-slate-900 dark:text-slate-200 truncate">{chat.name}</h3>
                                            <span className="text-xs text-slate-500 whitespace-nowrap">{chat.time}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate pr-2">{chat.lastMessage}</p>
                                            {chat.unread > 0 && (
                                                <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                    {chat.unread}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                {getSourceIcon(chat.source)}
                                                <span className="text-xs text-slate-500 capitalize">{chat.source}</span>
                                            </div>
                                            {/* Tags in List */}
                                            <div className="flex gap-1 overflow-hidden">
                                                {chat.tags && chat.tags.slice(0, 2).map(tag => (
                                                    <div key={tag.id} className={`w-2 h-2 rounded-full ${tag.color}`} title={tag.name} />
                                                ))}
                                                {chat.tags && chat.tags.length > 2 && (
                                                    <span className="text-[10px] text-slate-500">+{chat.tags.length - 2}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`
                flex-col bg-slate-50 dark:bg-slate-950 h-full
                w-full flex-1
                ${selectedChat ? 'flex' : 'hidden md:flex'}
                transition-colors duration-300
            `}>
                {selectedChat ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900/50 transition-colors">
                            <div className="flex items-center gap-3">
                                {/* Back Button for Mobile */}
                                <button
                                    onClick={() => setSelectedChat(null)}
                                    className="md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mr-1"
                                >
                                    <ArrowLeft size={24} />
                                </button>

                                <Avatar name={selectedChat.name} size="md" />
                                <div>
                                    <h2 className="font-bold text-slate-900 dark:text-slate-100">{selectedChat.name}</h2>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-1">
                                            {getSourceIcon(selectedChat.source)}
                                            <span className="capitalize">{selectedChat.source}</span>
                                        </div>
                                        {/* Tags in Header */}
                                        {selectedChat.tags && selectedChat.tags.length > 0 && (
                                            <div className="flex gap-1 ml-2">
                                                {selectedChat.tags.map(tag => (
                                                    <span key={tag.id} className={`px-1.5 py-0.5 rounded text-[10px] font-medium text-white ${tag.color} flex items-center gap-1`}>
                                                        {tag.name}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveTag(tag.id);
                                                            }}
                                                            className="hover:text-slate-200"
                                                        >
                                                            <X size={10} />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Notes Toggle */}
                                <button
                                    onClick={() => setShowNotes(!showNotes)}
                                    className={`p-2 transition-colors ${showNotes ? 'text-primary bg-primary/10 rounded-lg' : 'text-slate-400 hover:text-primary'}`}
                                    title="Internal Notes"
                                >
                                    <StickyNote size={20} />
                                </button>
                                {/* Add Tag Button */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                                        className="p-2 text-slate-400 hover:text-primary transition-colors"
                                        title="Add Tag"
                                    >
                                        <Tag size={20} />
                                    </button>

                                    {isTagDropdownOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-50 p-2">
                                            <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 px-2">Add Tag</h4>
                                            <div className="space-y-1 max-h-48 overflow-y-auto">
                                                {availableTags.length === 0 ? (
                                                    <p className="text-xs text-slate-500 px-2 py-1">No tags available. Create one in Settings.</p>
                                                ) : (
                                                    availableTags.map(tag => {
                                                        const isAssigned = selectedChat.tags?.some(t => t.id === tag.id);
                                                        if (isAssigned) return null;

                                                        return (
                                                            <button
                                                                key={tag.id}
                                                                onClick={() => handleAddTag(tag)}
                                                                className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
                                                            >
                                                                <div className={`w-2 h-2 rounded-full ${tag.color}`} />
                                                                {tag.name}
                                                            </button>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => setIsContactModalOpen(true)}
                                    className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
                                    title="Save Contact"
                                >
                                    <UserPlus size={18} />
                                    <span className="hidden sm:inline">Save Contact</span>
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
                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                    title="Delete Chat"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50 dark:bg-slate-950 transition-colors">
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
                                            className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${msg.sender === 'me'
                                                ? 'bg-primary text-white rounded-tr-none'
                                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700'
                                                }`}
                                        >
                                            {msg.type === 'audio' ? (
                                                <audio controls className="w-full min-w-[250px] h-10 mt-2 rounded-lg bg-slate-100/10">
                                                    <source src={msg.media_url} type="audio/mp4" />
                                                    <source src={msg.media_url} type="audio/mpeg" />
                                                    <source src={msg.media_url} type="audio/ogg" />
                                                    Your browser does not support the audio element.
                                                </audio>
                                            ) : (
                                                <p>{msg.text}</p>
                                            )}
                                            <span className={`text-xs mt-1 block ${msg.sender === 'me' ? 'text-white/70' : 'text-slate-400'}`}>
                                                {msg.time}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 transition-colors">
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-slate-400 hover:text-primary transition-colors hidden sm:block">
                                    <Paperclip size={20} />
                                </button>
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary placeholder-slate-500 transition-colors"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="p-2 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
                        <div className="text-center text-slate-400 dark:text-slate-500">
                            <MessageCircle size={64} className="mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium text-slate-600 dark:text-slate-400">Select a chat to start messaging</p>
                            <p className="text-sm mt-2">Choose a conversation from the list</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Notes Sidebar */}
            {selectedChat && showNotes && (
                <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full transition-colors duration-300">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <StickyNote size={18} />
                            Internal Notes
                        </h3>
                        <button onClick={() => setShowNotes(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Add a private note..."
                            className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 p-3 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24 text-sm transition-colors"
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                onClick={handleSaveNote}
                                disabled={!newNote.trim()}
                                className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Note
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {notes.length === 0 ? (
                            <div className="text-center text-slate-400 dark:text-slate-500 py-8 text-sm">
                                <p>No notes yet.</p>
                                <p className="mt-1">Notes are private to your team.</p>
                            </div>
                        ) : (
                            notes.map(note => (
                                <div key={note.id} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 group">
                                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{note.content}</p>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                                        <span className="text-[10px] text-slate-400">
                                            {new Date(note.created_at).toLocaleString()}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteNote(note.id)}
                                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Delete note"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>

            {/* Contact Modal */ }
    {
        isContactModalOpen && selectedChat && (
            <ContactModal
                chatId={selectedChat.id}
                onClose={handleContactSaved}
            />
        )
    }
        </div >
    );
}
