import React from 'react';
import { Search, MoreHorizontal, Phone, Instagram, MessageSquare } from 'lucide-react';

const MOCK_CONTACTS = [
    { id: 1, name: 'Juan Perez', handle: '+54 9 11 1234 5678', source: 'whatsapp', lastContact: '2023-10-25' },
    { id: 2, name: 'Maria Garcia', handle: '@mariagarcia', source: 'instagram', lastContact: '2023-10-24' },
    { id: 3, name: 'Carlos Lopez', handle: '+54 9 11 8765 4321', source: 'whatsapp', lastContact: '2023-10-20' },
    { id: 4, name: 'Ana Martinez', handle: '@ana.mtz', source: 'instagram', lastContact: '2023-10-15' },
];

export default function Contacts() {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-100">Contacts</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        className="bg-slate-900 text-slate-200 pl-10 pr-4 py-2 rounded-lg border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                    />
                </div>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-800/50 text-slate-400 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Contact Info</th>
                            <th className="px-6 py-4 font-medium">Source</th>
                            <th className="px-6 py-4 font-medium">Last Contact</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {MOCK_CONTACTS.map((contact) => (
                            <tr key={contact.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                                            {contact.name.charAt(0)}
                                        </div>
                                        <span className="font-medium text-slate-200">{contact.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-400">{contact.handle}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {contact.source === 'whatsapp' ? (
                                            <Phone size={16} className="text-green-500" />
                                        ) : (
                                            <Instagram size={16} className="text-pink-500" />
                                        )}
                                        <span className="capitalize text-slate-300">{contact.source}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-400">{contact.lastContact}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                                        <MessageSquare size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
