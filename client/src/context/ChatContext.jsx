import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { formatMessageTime, formatChatTime } from '../utils/dateUtils';
import { useAuth } from './UserAuthContext';

const ChatContext = createContext();

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const { user, session } = useAuth();
    const [chats, setChats] = useState([]);
    const [messagesByChat, setMessagesByChat] = useState({});
    const [loading, setLoading] = useState(true);

    // Load chats and messages from API on mount
    useEffect(() => {
        if (!user || !session) return;

        const loadChatHistory = async () => {
            try {
                const token = session.access_token;
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                // Fetch all chats
                const chatsResponse = await fetch('/api/chats', { headers });
                const chatsData = await chatsResponse.json();

                if (chatsData.success && chatsData.chats.length > 0) {
                    // Transform database format to frontend format
                    const transformedChats = chatsData.chats.map(chat => ({
                        id: chat.chat_id,
                        name: chat.name,
                        lastMessage: chat.last_message,
                        lastMessageTimestamp: chat.last_message_timestamp,
                        time: formatChatTime(chat.last_message_timestamp),
                        source: chat.source,
                        unread: 0,
                        avatar: chat.avatar,
                        tags: chat.chat_tags ? chat.chat_tags.map(ct => ct.tags) : []
                    }));

                    setChats(transformedChats);

                    // Fetch messages for each chat
                    const messagesPromises = chatsData.chats.map(async (chat) => {
                        const messagesResponse = await fetch(`/api/chats/${chat.chat_id}/messages`, { headers });
                        const messagesData = await messagesResponse.json();

                        if (messagesData.success) {
                            const transformedMessages = messagesData.messages.map(msg => ({
                                id: msg.message_id || msg.id,
                                text: msg.text,
                                sender: msg.sender,
                                timestamp: msg.timestamp,
                                time: formatMessageTime(msg.timestamp),
                                type: msg.type,
                                media_url: msg.media_url
                            }));

                            return { chatId: chat.chat_id, messages: transformedMessages };
                        }
                        return { chatId: chat.chat_id, messages: [] };
                    });

                    const messagesResults = await Promise.all(messagesPromises);
                    const messagesObj = {};
                    messagesResults.forEach(result => {
                        messagesObj[result.chatId] = result.messages;
                    });

                    setMessagesByChat(messagesObj);
                }
            } catch (error) {
                console.error('Error loading chat history:', error);
            } finally {
                setLoading(false);
            }
        };

        loadChatHistory();
    }, [user, session]);

    // Socket.io for real-time updates
    useEffect(() => {
        const socket = io({
            transports: ['websocket'],
            upgrade: false
        });

        socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        socket.on('new_message', (data) => {
            console.log('New message received:', data);

            // Create a new message object
            const newMessage = {
                id: data.messageId || Date.now(),
                text: data.text,
                sender: data.sender || 'user',
                timestamp: data.timestamp,
                time: formatMessageTime(data.timestamp),
                type: data.type,
                media_url: data.media_url
            };

            setChats(prevChats => {
                const existingChatIndex = prevChats.findIndex(c => c.id === data.senderId);

                if (existingChatIndex !== -1) {
                    // Update existing chat
                    const updatedChats = [...prevChats];
                    updatedChats.splice(existingChatIndex, 1);
                    const chat = prevChats[existingChatIndex];

                    const updatedChat = {
                        ...chat,
                        lastMessage: data.text,
                        lastMessageTimestamp: data.timestamp,
                        time: formatChatTime(data.timestamp),
                        unread: data.sender === 'me' ? chat.unread : chat.unread + 1
                    };
                    return [updatedChat, ...updatedChats];
                } else {
                    // Create new chat
                    const newChat = {
                        id: data.senderId,
                        name: data.senderName || `User ${data.senderId.slice(-4)}`,
                        lastMessage: data.text,
                        lastMessageTimestamp: data.timestamp,
                        time: formatChatTime(data.timestamp),
                        source: data.platform,
                        unread: data.sender === 'me' ? 0 : 1,
                        avatar: `https://ui-avatars.com/api/?name=${data.platform}&background=random`
                    };
                    return [newChat, ...prevChats];
                }
            });

            // Update messages for this specific chat
            setMessagesByChat(prev => {
                const existingMessages = prev[data.senderId] || [];

                const isDuplicate = existingMessages.slice(-3).some(msg =>
                    msg.text === data.text &&
                    msg.sender === (data.sender || 'user') &&
                    Math.abs(msg.id - (data.messageId || Date.now())) < 5000
                );

                if (isDuplicate) {
                    console.log('Duplicate message detected, skipping:', data.text);
                    return prev;
                }

                return {
                    ...prev,
                    [data.senderId]: [...existingMessages, newMessage]
                };
            });
        });

        return () => socket.disconnect();
    }, []);

    // Function to update chat name when contact is saved
    const updateChatName = (chatId, newName) => {
        setChats(prevChats => {
            return prevChats.map(chat =>
                chat.id === chatId
                    ? { ...chat, name: newName }
                    : chat
            );
        });
    };

    // Function to mark chat as read (clear unread count)
    const markChatAsRead = (chatId) => {
        setChats(prevChats => {
            return prevChats.map(chat =>
                chat.id === chatId
                    ? { ...chat, unread: 0 }
                    : chat
            );
        });
    };

    // Function to delete a chat
    const deleteChat = async (chatId) => {
        if (!session) return false;
        try {
            const response = await fetch(`/api/chats/${chatId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
                setMessagesByChat(prev => {
                    const newMessages = { ...prev };
                    delete newMessages[chatId];
                    return newMessages;
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting chat:', error);
            return false;
        }
    };

    // Function to update chat tags locally
    const updateChatTags = (chatId, newTags) => {
        setChats(prevChats => {
            return prevChats.map(chat =>
                chat.id === chatId
                    ? { ...chat, tags: newTags }
                    : chat
            );
        });
    };

    const value = {
        chats,
        setChats,
        messagesByChat,
        setMessagesByChat,
        updateChatName,
        markChatAsRead,
        deleteChat,
        updateChatTags,
        loading
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
