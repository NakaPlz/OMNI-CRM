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

    const value = {
        chats,
        setChats,
        messagesByChat,
        setMessagesByChat,
        updateChatName
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
