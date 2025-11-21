import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { formatMessageTime, formatChatTime } from '../utils/dateUtils';

const ChatContext = createContext();

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const [chats, setChats] = useState([]);
    const [messagesByChat, setMessagesByChat] = useState({});
    const [loading, setLoading] = useState(true);

    // Load chats and messages from API on mount
    useEffect(() => {
        const loadChatHistory = async () => {
            try {
                // Fetch all chats
                const chatsResponse = await fetch('/api/chats');
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
                        avatar: chat.avatar
                    }));

                    setChats(transformedChats);

                    // Fetch messages for each chat
                    const messagesPromises = chatsData.chats.map(async (chat) => {
                        const messagesResponse = await fetch(`/api/chats/${chat.chat_id}/messages`);
                        const messagesData = await messagesResponse.json();

                        if (messagesData.success) {
                            const transformedMessages = messagesData.messages.map(msg => ({
                                id: msg.message_id || msg.id,
                                text: msg.text,
                                sender: msg.sender,
                                timestamp: msg.timestamp,
                                time: formatMessageTime(msg.timestamp)
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
    }, []);

    // Socket.io for real-time updates
    useEffect(() => {
        const socket = io();

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
                time: formatMessageTime(data.timestamp)
            };

            setChats(prevChats => {
                const existingChatIndex = prevChats.findIndex(c => c.id === data.senderId);

                if (existingChatIndex !== -1) {
                    // Update existing chat
                    const updatedChats = [...prevChats];
                    const chat = updatedChats[existingChatIndex];
                    updatedChats[existingChatIndex] = {
                        ...chat,
                        lastMessage: data.text,
                        lastMessageTimestamp: data.timestamp,
                        time: formatChatTime(data.timestamp),
                        unread: data.sender === 'me' ? chat.unread : chat.unread + 1
                    };
                    return updatedChats;
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
        try {
            const response = await fetch(`/api/chats/${chatId}`, {
                method: 'DELETE'
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

    const value = {
        chats,
        setChats,
        messagesByChat,
        setMessagesByChat,
        updateChatName,
        markChatAsRead,
        deleteChat,
        loading
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
