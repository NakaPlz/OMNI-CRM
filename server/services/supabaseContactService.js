const supabase = require('../config/supabase');
const chatService = require('./chatService');

/**
 * Get all contacts from Supabase
 */
async function getAllContacts() {
    try {
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error getting contacts:', error);
        throw error;
    }
}

/**
 * Get contact by ID
 */
async function getContactById(id) {
    try {
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error getting contact by ID:', error);
        throw error;
    }
}

/**
 * Get contact by chat ID
 */
async function getContactByChatId(chatId) {
    try {
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('chat_id', chatId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = not found
            throw error;
        }
        return data;
    } catch (error) {
        console.error('Error getting contact by chat ID:', error);
        throw error;
    }
}

/**
 * Create or update a contact
 */
async function createContact(contactData) {
    try {
        const { chat_id, name, email, phone, company, notes, source } = contactData;

        // Check if contact already exists
        const existing = await getContactByChatId(chat_id);

        let result;
        if (existing) {
            // Update existing contact
            const { data, error } = await supabase
                .from('contacts')
                .update({
                    name,
                    email,
                    phone,
                    company,
                    notes,
                    updated_at: new Date().toISOString()
                })
                .eq('chat_id', chat_id)
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            // Create new contact
            const { data, error } = await supabase
                .from('contacts')
                .insert([{
                    chat_id,
                    name,
                    email,
                    phone,
                    company,
                    notes,
                    source
                }])
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        // Update chat name in chats table
        try {
            const chat = await chatService.getChatById(chat_id);
            if (chat) {
                await supabase
                    .from('chats')
                    .update({ name })
                    .eq('chat_id', chat_id);
                console.log(`Updated chat name to: ${name}`);
            }
        } catch (chatError) {
            console.error('Error updating chat name:', chatError);
            // Don't fail the contact save if chat update fails
        }

        return result;
    } catch (error) {
        console.error('Error creating/updating contact:', error);
        throw error;
    }
}

/**
 * Update a contact by ID
 */
async function updateContact(id, updates) {
    try {
        const { data, error } = await supabase
            .from('contacts')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating contact:', error);
        throw error;
    }
}

/**
 * Delete a contact by ID
 */
async function deleteContact(id) {
    try {
        const { error } = await supabase
            .from('contacts')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting contact:', error);
        throw error;
    }
}

module.exports = {
    getAllContacts,
    getContactById,
    getContactByChatId,
    createContact,
    updateContact,
    deleteContact
};
