import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Check, Shield, Palette, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/UserAuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { session, updatePassword } = useAuth();
  const { theme, toggleTheme, accentColor, setAccentColor } = useTheme();
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('bg-blue-500');
  const [loadingTags, setLoadingTags] = useState(true);

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const colors = [
    'bg-slate-500', 'bg-red-500', 'bg-orange-500', 'bg-amber-500',
    'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500',
    'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500',
    'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
  ];

  const accentColors = [
    { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
    { name: 'Violet', value: 'violet', class: 'bg-violet-500' },
    { name: 'Emerald', value: 'emerald', class: 'bg-emerald-500' },
    { name: 'Rose', value: 'rose', class: 'bg-rose-500' },
    { name: 'Amber', value: 'amber', class: 'bg-amber-500' },
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

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus({ type: '', message: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }

    setUpdatingPassword(true);
    try {
      await updatePassword(passwordForm.newPassword);
      setPasswordStatus({ type: 'success', message: 'Password updated successfully' });
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordStatus({ type: 'error', message: error.message });
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto pb-20 h-full overflow-y-auto">
      <h1 className="text-2xl font-bold text-slate-100 mb-8">Settings</h1>

      <div className="space-y-6">

        {/* Appearance Settings */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <Palette className="text-pink-500" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Appearance</h2>
              <p className="text-sm text-slate-400">Customize the look and feel.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <h3 className="text-slate-200 font-medium">Theme Mode</h3>
                <p className="text-sm text-slate-500">Switch between dark and light mode.</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-800'}`}
              >
                {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                <span className="capitalize">{theme} Mode</span>
              </button>
            </div>

            <div>
              <h3 className="text-slate-200 font-medium mb-3">Accent Color</h3>
              <div className="flex gap-3 flex-wrap">
                {accentColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setAccentColor(color.value)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg border transition-all
                      ${accentColor === color.value
                        ? 'bg-slate-800 border-slate-600 text-white ring-2 ring-offset-2 ring-offset-slate-900 ring-' + color.value + '-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}
                    `}
                  >
                    <div className={`w-3 h-3 rounded-full ${color.class}`} />
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Shield className="text-green-500" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Account Security</h2>
              <p className="text-sm text-slate-400">Manage your password and security settings.</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Confirm Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="••••••••"
              />
            </div>

            {passwordStatus.message && (
              <div className={`p-3 rounded-lg text-sm ${passwordStatus.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {passwordStatus.message}
              </div>
            )}

            <button
              type="submit"
              disabled={updatingPassword || !passwordForm.newPassword}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              {updatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

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
          <form onSubmit={handleCreateTag} className="mb-8 bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Tag Name</label>
              <input
                type="text"
                placeholder="e.g., VIP Customer"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-6 justify-between items-end">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-400">Tag Color</label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewTagColor(color)}
                      className={`w-10 h-10 rounded-full ${color} flex items-center justify-center transition-transform ${newTagColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'hover:scale-110'}`}
                    >
                      {newTagColor === color && <Check size={18} className="text-white drop-shadow-md" />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!newTagName.trim()}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium shadow-lg shadow-indigo-500/20"
              >
                <Plus size={20} />
                <span>Create Tag</span>
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
      </div>
    </div>
  );
}
