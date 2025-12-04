const supabase = require('../config/supabase');

/**
 * Get all chats ordered by last message timestamp
 */
async function getAllChats() {
    try {
        const { data, error } = await supabase
            .from('chats')
            .select(`
                *,
                chat_tags (
                    tag_id,
                    tags (
                        id,
                        name,
                        color
                    )
                )
            `)
            .order('last_message_timestamp', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error getting chats:', error);
        throw error;
    }
}

/**
 * Get chat by chat_id
 */
async function getChatById(chatId) {
    try {
        const { data, error } = await supabase
            .from('chats')
            .select('*')
            .eq('chat_id', chatId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        return data;
    } catch (error) {
        console.error('Error getting chat by ID:', error);
        throw error;
    }
}

/**
 * Create or update a chat
 */
async function createOrUpdateChat(chatData) {
    try {
        const { chat_id, name, source, last_message, last_message_timestamp, avatar } = chatData;

        const existing = await getChatById(chat_id);

        if (existing) {
            // Update existing chat
            const { data, error } = await supabase
                .from('chats')
                .update({
                    last_message,
                    last_message_timestamp,
                    updated_at: new Date().toISOString()
                })
                .eq('chat_id', chat_id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            // Create new chat
            const { data, error } = await supabase
                .from('chats')
                .insert([{
                    chat_id,
                    name,
                    source,
                    last_message,
                    last_message_timestamp,
                    avatar
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    } catch (error) {
        console.error('Error creating/updating chat:', error);
        throw error;
    }
}

/**
 * Get all messages for a chat
 */
async function getMessagesByChatId(chatId) {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('timestamp', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error getting messages:', error);
        throw error;
    }
}

/**
 * Create a new message
 */
async function createMessage(messageData) {
    try {
        const { message_id, chat_id, text, sender, timestamp, source, type, media_url } = messageData;

        // Check if message already exists (prevent duplicates)
        if (message_id) {
            const { data: existing } = await supabase
                .from('messages')
                .select('id')
                .eq('message_id', message_id)
                .single();

            if (existing) {
                console.log('Message already exists, skipping:', message_id);
                return existing;
            }
        }

        const { data, error } = await supabase
            .from('messages')
            .insert([{
                message_id,
                chat_id,
                text,
                sender,
                timestamp,
                source,
                type: messageData.type || 'text',
                media_url: messageData.media_url || null
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating message:', error);
        throw error;
    }
}

/**
 * Delete a chat and its messages
 */
async function deleteChat(chatId) {
    try {
        // Delete messages first (optional if cascade delete is set up, but good practice)
        const { error: messagesError } = await supabase
            .from('messages')
            .delete()
            .eq('chat_id', chatId);

        if (messagesError) throw messagesError;

        // Delete the chat
        const { error: chatError } = await supabase
            .from('chats')
            .delete()
            .eq('chat_id', chatId);

        if (chatError) throw chatError;

        return true;
    } catch (error) {
        console.error('Error deleting chat:', error);
        throw error;
    }
}

/**
 * Add a tag to a chat
 */
async function addTagToChat(chatId, tagId) {
    try {
        const { error } = await supabase
            .from('chat_tags')
            .insert([{ chat_id: chatId, tag_id: tagId }]);

        if (error) {
            // Ignore duplicate key error (tag already assigned)
            if (error.code === '23505') return true;
            throw error;
        }
        return true;
    } catch (error) {
        console.error('Error adding tag to chat:', error);
        throw error;
    }
}

/**
 * Remove a tag from a chat
 */
async function removeTagFromChat(chatId, tagId) {
    try {
        const { error } = await supabase
            .from('chat_tags')
            .delete()
            .match({ chat_id: chatId, tag_id: tagId });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error removing tag from chat:', error);
        throw error;
    }
}

module.exports = {
    getAllChats,
    getChatById,
    createOrUpdateChat,
    getMessagesByChatId,
    createMessage,
    deleteChat,
    addTagToChat,
    removeTagFromChat,

    // Notes
    async getNotes(chatId) {
        try {
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .eq('chat_id', chatId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error getting notes:', error);
            throw error;
        }
    },

    async addNote(chatId, content) {
        try {
            const { data, error } = await supabase
                .from('notes')
                .insert([{ chat_id: chatId, content }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding note:', error);
            throw error;
        }
    },

    async deleteNote(noteId) {
        try {
            const { error } = await supabase
                .from('notes')
                .delete()
                .eq('id', noteId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting note:', error);
            throw error;
        }
    }
};
