const supabase = require('../config/supabase');

/**
 * Get all chats ordered by last message timestamp
 */
async function getAllChats() {
    try {
        const { data, error } = await supabase
            .from('chats')
            .select('*')
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
                    name,
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
        const { message_id, chat_id, text, sender, timestamp, source } = messageData;

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
                source
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

module.exports = {
    getAllChats,
    getChatById,
    createOrUpdateChat,
    getMessagesByChatId,
    createMessage
};
