import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Users, Settings, LayoutDashboard } from 'lucide-react';

export default function Layout({ children }) {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: MessageSquare, label: 'Chats' },
        { path: '/contacts', icon: Users, label: 'Contacts' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <div className="logo-container">
                        <h1 className="text-2xl font-bold mb-1">
                            <span className="logo-text logo-risut">RiSut's</span>
                            <br />
                            <span className="logo-text logo-omni">Omni-CRM</span>
                        </h1>
                        <div className="logo-underline"></div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-2 text-slate-500 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>System Online</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 w-full overflow-auto bg-slate-950">
                {children}
            </main>
        </div>
    );
}
