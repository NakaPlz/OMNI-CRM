const fs = require('fs').promises;
const path = require('path');

const CONTACTS_FILE = path.join(__dirname, '../data/contacts.json');

// Ensure data directory exists
const ensureDataDir = async () => {
    const dataDir = path.dirname(CONTACTS_FILE);
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
};

// Initialize contacts file if it doesn't exist
const initContactsFile = async () => {
    try {
        await fs.access(CONTACTS_FILE);
    } catch {
        await fs.writeFile(CONTACTS_FILE, JSON.stringify([], null, 2));
    }
};

// Read all contacts
const getAllContacts = async () => {
    await ensureDataDir();
    await initContactsFile();
    const data = await fs.readFile(CONTACTS_FILE, 'utf8');
    return JSON.parse(data);
};

// Get contact by ID
const getContactById = async (id) => {
    const contacts = await getAllContacts();
    return contacts.find(c => c.id === id);
};

// Get contact by chat ID
const getContactByChatId = async (chatId) => {
    const contacts = await getAllContacts();
    return contacts.find(c => c.chatId === chatId);
};

// Create new contact
const createContact = async (contactData) => {
    const contacts = await getAllContacts();

    const newContact = {
        id: Date.now().toString(),
        name: contactData.name,
        email: contactData.email || '',
        phone: contactData.phone || '',
        company: contactData.company || '',
        notes: contactData.notes || '',
        source: contactData.source, // 'instagram' or 'whatsapp'
        chatId: contactData.chatId, // The sender ID from the chat
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    contacts.push(newContact);
    await fs.writeFile(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
    return newContact;
};

// Update contact
const updateContact = async (id, updates) => {
    const contacts = await getAllContacts();
    const index = contacts.findIndex(c => c.id === id);

    if (index === -1) {
        throw new Error('Contact not found');
    }

    contacts[index] = {
        ...contacts[index],
        ...updates,
        id: contacts[index].id, // Preserve ID
        createdAt: contacts[index].createdAt, // Preserve creation date
        updatedAt: new Date().toISOString()
    };

    await fs.writeFile(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
    return contacts[index];
};

// Delete contact
const deleteContact = async (id) => {
    const contacts = await getAllContacts();
    const filteredContacts = contacts.filter(c => c.id !== id);

    if (contacts.length === filteredContacts.length) {
        throw new Error('Contact not found');
    }

    await fs.writeFile(CONTACTS_FILE, JSON.stringify(filteredContacts, null, 2));
    return true;
};

module.exports = {
    getAllContacts,
    getContactById,
    getContactByChatId,
    createContact,
    updateContact,
    deleteContact
};
