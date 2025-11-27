import React, { useState, useEffect } from 'react';
import { Save, Webhook, Key, Smartphone, Tag, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/UserAuthContext';

export default function Settings() {
  const { session } = useAuth();
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('bg-blue-500');
  const [loadingTags, setLoadingTags] = useState(true);

  const colors = [
    'bg-slate-500', 'bg-red-500', 'bg-orange-500', 'bg-amber-500',
    'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500',
    'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500',
    'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
  ];

  useEffect(() => {
    fetchTags();
  }, [session]);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTags(data.tags);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoadingTags(false);
    }
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ name: newTagName, color: newTagColor })
      });
      const data = await response.json();
      if (data.success) {
        setTags([...tags, data.tag]);
        setNewTagName('');
      }
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  const handleDeleteTag = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) return;

    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTags(tags.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-slate-100 mb-8">Settings</h1>

      <div className="space-y-6">
        {/* Tag Management */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Tag className="text-indigo-500" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Tag Management</h2>
              <p className="text-sm text-slate-400">Organize your chats with custom tags.</p>
            </div>
          </div>

          {/* Create Tag Form */}
          <form onSubmit={handleCreateTag} className="mb-8 bg-slate-950 p-4 rounded-lg border border-slate-800">
              >
            <Plus size={18} />
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* Tags List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {loadingTags ? (
          <p className="text-slate-500 text-sm">Loading tags...</p>
        ) : tags.length === 0 ? (
          <p className="text-slate-500 text-sm col-span-full">No tags created yet.</p>
        ) : (
          tags.map(tag => (
            <div key={tag.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 group">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${tag.color}`} />
                <span className="text-slate-200 font-medium">{tag.name}</span>
              </div>
              <button
                onClick={() => handleDeleteTag(tag.id)}
                className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>

        {/* Webhook Configuration */ }
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

  {/* WhatsApp API */ }
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

  {/* Instagram API */ }
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
      </div >
    </div >
  );
}
