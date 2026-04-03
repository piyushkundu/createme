'use client';

import { useState, useEffect } from 'react';
import { getAllUsers, deleteUser } from '../../lib/gameEngine';
import { useRouter } from 'next/navigation';
import { verifySuperAdmin } from '../actions/verifyAdmin';

export default function SuperAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  // Simple client-side protection just to prevent accidental deletions
  // Not highly secure but meets the "hidden link" criteria + a lock.
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await verifySuperAdmin(password);
    if (isValid) {
      setAuthenticated(true);
    } else {
      alert('Incorrect Password');
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    if (authenticated) {
      loadUsers();
    }
  }, [authenticated]);

  const handleDelete = async (username: string) => {
    if (confirm(`Are you absolutely sure you want to delete the user: ${username}?`)) {
      const success = await deleteUser(username);
      if (success) {
        alert('User deleted successfully.');
        loadUsers();
      } else {
        alert('Failed to delete user.');
      }
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-2xl shadow-2xl space-y-4 max-w-sm w-full border border-slate-700">
          <h1 className="text-2xl font-black text-white text-center">Super Admin Auth</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Super Secret Password"
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-indigo-500"
          />
          <button type="submit" className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors">
            Access System
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-3xl font-black text-slate-800">God Mode / Admin Panel</h1>
            <p className="text-sm text-slate-500 font-bold mt-1">Manage and remove users from the platform.</p>
          </div>
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg transition-colors">
            Exit to Game
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
            <h2 className="font-extrabold text-slate-700">Registered Users ({users.length})</h2>
            <button onClick={loadUsers} className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100">
              Refresh List
            </button>
          </div>

          <div className="p-0">
            {loading ? (
              <div className="p-8 text-center text-slate-400 font-bold animate-pulse">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-bold">No users found.</div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {users.map((u) => (
                  <li key={u.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{u.username}</h3>
                      <p className="text-xs text-slate-400 font-medium">Joined: {new Date(u.createdAt).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(u.username)}
                      className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white font-bold rounded-lg transition-colors text-sm"
                    >
                      Delete User
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
