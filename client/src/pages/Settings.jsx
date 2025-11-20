import React from 'react';
import { Save, Webhook, Key, Smartphone } from 'lucide-react';

export default function Settings() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-100 mb-8">Settings</h1>

      <div className="space-y-6">
        {/* Webhook Configuration */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Webhook className="text-blue-500" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Webhook Forwarding</h2>
              <p className="text-sm text-slate-400">Configure where to forward incoming messages (e.g., n8n).</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Forwarding URL</label>
              <input
                type="url"
                placeholder="https://your-n8n-instance.com/webhook/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="forward-enabled" className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="forward-enabled" className="text-sm text-slate-300">Enable forwarding</label>
            </div>
            <div className="pt-2">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                <Save size={18} />
                <span>Save Configuration</span>
              </button>
            </div>
          </div>
        </div>

        {/* WhatsApp API */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Smartphone className="text-green-500" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">WhatsApp Business API</h2>
              <p className="text-sm text-slate-400">Connect your WhatsApp Business account.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number ID</label>
              <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">WhatsApp Business Account ID</label>
              <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Access Token</label>
              <input type="password" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
        </div>

        {/* Instagram API */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <Key className="text-pink-500" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Instagram API</h2>
              <p className="text-sm text-slate-400">Connect your Instagram Professional account.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">App ID</label>
              <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">App Secret</label>
              <input type="password" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
