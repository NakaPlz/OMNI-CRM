import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreHorizontal, Phone, Instagram, MessageSquare, Trash2, Edit } from 'lucide-react';

export default function Contacts() {
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedContacts, setSelectedContacts] = useState(new Set());
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkMessage, setBulkMessage] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const response = await fetch('/api/contacts');
            const data = await response.json();
            if (data.success) {
                setContacts(data.contacts);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this contact?')) return;

        try {
            const response = await fetch(`/api/contacts/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                setContacts(contacts.filter(c => c.id !== id));
                setSelectedContacts(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(id);
                    return newSet;
                });
            }
        } catch (error) {
            console.error('Error deleting contact:', error);
        }
    };

    const toggleSelectAll = () => {
        if (selectedContacts.size === filteredContacts.length) {
            setSelectedContacts(new Set());
        } else {
            setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
        }
    };

    const toggleSelectContact = (id) => {
        setSelectedContacts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleBulkSend = async () => {
        if (!bulkMessage.trim()) return;
        setSending(true);

        const recipients = contacts
            .filter(c => selectedContacts.has(c.id) && c.chat_id)
            .map(c => ({
                id: c.chat_id, // Assuming chat_id is the platform ID (e.g. Instagram ID)
                platform: c.source
            }));

        try {
            const response = await fetch('/api/messages/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recipients,
                    text: bulkMessage
                })
            });
            const data = await response.json();
            if (data.success) {
                const failedCount = data.results.failed.length;
                const successCount = data.results.successful.length;

                let message = `Messages sent! Successful: ${successCount}`;
                if (failedCount > 0) {
                    message += `\nFailed: ${failedCount}`;
                    // Show first few errors
                    const errors = data.results.failed.map(f => f.error).slice(0, 3).join(', ');
                    message += `\nReasons: ${errors}${data.results.failed.length > 3 ? '...' : ''}`;
                }

                alert(message);
                setShowBulkModal(false);
                setBulkMessage('');
                setSelectedContacts(new Set());
            } else {
                alert('Failed to send messages: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error sending bulk messages:', error);
            alert('Error sending messages');
        } finally {
            setSending(false);
        }
    };

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.phone && contact.phone.includes(searchTerm)) ||
        (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getSourceIcon = (source) => {
        if (source === 'whatsapp') return <Phone size={16} className="text-green-500" />;
        if (source === 'instagram') return <Instagram size={16} className="text-pink-500" />;
        return null;
    };

    return (
        <div className="p-6 relative">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-100">Contacts</h1>
                    {selectedContacts.size > 0 && (
                        <button
                            onClick={() => setShowBulkModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <MessageSquare size={16} />
                            Send to {selectedContacts.size}
                        </button>
                    )}
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-slate-900 text-slate-200 pl-10 pr-4 py-2 rounded-lg border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center text-slate-400 py-12">
                    <p>Loading contacts...</p>
                </div>
            ) : filteredContacts.length === 0 ? (
                <div className="text-center text-slate-400 py-12">
                    <p>No contacts found.</p>
                    <p className="text-sm mt-2">Save contacts from your chats to see them here.</p>
                </div>
            ) : (
                <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800/50 text-slate-400 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4 w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedContacts.size === filteredContacts.length && filteredContacts.length > 0}
                                        onChange={toggleSelectAll}
                                        className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-6 py-4 font-medium">Name</th>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium">Phone</th>
                                <th className="px-6 py-4 font-medium">Company</th>
                                <th className="px-6 py-4 font-medium">Source</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredContacts.map((contact) => (
                                <tr key={contact.id} className={`hover:bg-slate-800/50 transition-colors ${selectedContacts.has(contact.id) ? 'bg-blue-500/5' : ''}`}>
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedContacts.has(contact.id)}
                                            onChange={() => toggleSelectContact(contact.id)}
                                            className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                                                {contact.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-slate-200">{contact.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">{contact.email || '-'}</td>
                                    <td className="px-6 py-4 text-slate-400">{contact.phone || '-'}</td>
                                    <td className="px-6 py-4 text-slate-400">{contact.company || '-'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getSourceIcon(contact.source)}
                                            <span className="capitalize text-slate-300">{contact.source}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleDelete(contact.id)}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                title="Delete contact"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            {contact.chat_id && (
                                                <button
                                                    onClick={() => navigate('/', { state: { chatId: contact.chat_id } })}
                                                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                                    title="Go to chat"
                                                >
                                                    <MessageSquare size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Bulk Message Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 rounded-xl border border-slate-800 w-full max-w-lg p-6 shadow-xl">
                        <h2 className="text-xl font-bold text-slate-100 mb-4">Send Bulk Message</h2>
                        <p className="text-slate-400 mb-4">
                            Sending to {selectedContacts.size} contacts.
                        </p>
                        <textarea
                            value={bulkMessage}
                            onChange={(e) => setBulkMessage(e.target.value)}
                            placeholder="Type your message here..."
                            className="w-full h-32 bg-slate-950 text-slate-200 p-4 rounded-lg border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-6"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowBulkModal(false)}
                                className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
                                disabled={sending}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkSend}
                                disabled={sending || !bulkMessage.trim()}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {sending ? 'Sending...' : 'Send Message'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
