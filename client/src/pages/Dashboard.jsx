import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, MessageCircle, BarChart3, Instagram, Facebook, Phone } from 'lucide-react';
import { useAuth } from '../context/UserAuthContext';

export default function Dashboard() {
    const { session } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/stats', {
                    headers: {
                        'Authorization': `Bearer ${session?.access_token}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setStats(data.stats);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchStats();
        }
    }, [session]);

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center h-full">
                <div className="text-slate-400">Loading dashboard...</div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="p-6 text-center text-slate-400">
                Failed to load statistics.
            </div>
        );
    }

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm dark:shadow-none transition-colors duration-300">
            <div className={`p-3 rounded-lg bg-opacity-10 ${color}`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
            <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</h3>
            </div>
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto h-full overflow-y-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Overview of your CRM activity</p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatCard
                    title="Total Contacts"
                    value={stats.totalContacts}
                    icon={Users}
                    color="bg-blue-500 text-blue-500"
                />
                <StatCard
                    title="Total Chats"
                    value={stats.totalChats}
                    icon={MessageSquare}
                    color="bg-indigo-500 text-indigo-500"
                />
                <StatCard
                    title="Active Chats (24h)"
                    value={stats.activeChats}
                    icon={MessageSquare}
                    color="bg-green-500 text-green-500"
                />
                <StatCard
                    title="Total Messages"
                    value={stats.totalMessages}
                    icon={MessageCircle}
                    color="bg-purple-500 text-purple-500"
                />
                <StatCard
                    title="Engagement Rate"
                    value={`${stats.totalContacts > 0 ? Math.round((stats.totalChats / stats.totalContacts) * 100) : 0}%`}
                    icon={BarChart3}
                    color="bg-orange-500 text-orange-500"
                />
            </div>

            {/* Platform Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors duration-300">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">Platform Distribution</h3>
                    <div className="space-y-4">
                        {/* WhatsApp */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/10 rounded-lg">
                                    <Phone size={20} className="text-green-500" />
                                </div>
                                <span className="font-medium text-slate-700 dark:text-slate-200">WhatsApp</span>
                            </div>
                            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                {stats.platformDistribution?.whatsapp || 0}
                            </span>
                        </div>

                        {/* Instagram */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-pink-500/10 rounded-lg">
                                    <Instagram size={20} className="text-pink-500" />
                                </div>
                                <span className="font-medium text-slate-700 dark:text-slate-200">Instagram</span>
                            </div>
                            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                {stats.platformDistribution?.instagram || 0}
                            </span>
                        </div>

                        {/* Facebook */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600/10 rounded-lg">
                                    <Facebook size={20} className="text-blue-600" />
                                </div>
                                <span className="font-medium text-slate-700 dark:text-slate-200">Facebook</span>
                            </div>
                            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                {stats.platformDistribution?.facebook || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
