import React, { useState } from 'react';
import { User, KeyRound, Mail, X, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthModal({ onClose }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    let res;
    if (isRegister) {
      res = await register(username, password, email);
    } else {
      res = await login(username, password);
    }

    setSubmitting(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.message || 'Authentication failed');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="glass-panel p-6 max-w-sm w-full border border-white/20 shadow-2xl flex flex-col gap-4 text-white font-sans">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <User className="text-red-500" size={22} />
            <h2 className="font-retro text-xs text-white">
              {isRegister ? 'CREATE ACCOUNT' : 'PLAYER LOGIN'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-red-950/60 border border-red-500/50 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-[11px] text-zinc-400 font-medium mb-1 block">Username</label>
            <div className="flex items-center gap-2 bg-black/60 border border-white/15 rounded-xl px-3 py-2">
              <User size={16} className="text-zinc-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username (min 3 chars)"
                className="bg-transparent border-none text-sm text-white placeholder-zinc-500 focus:outline-none w-full"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="text-[11px] text-zinc-400 font-medium mb-1 block">Email (Optional)</label>
              <div className="flex items-center gap-2 bg-black/60 border border-white/15 rounded-xl px-3 py-2">
                <Mail size={16} className="text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="player@retro.com"
                  className="bg-transparent border-none text-sm text-white placeholder-zinc-500 focus:outline-none w-full"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] text-zinc-400 font-medium mb-1 block">Password</label>
            <div className="flex items-center gap-2 bg-black/60 border border-white/15 rounded-xl px-3 py-2">
              <KeyRound size={16} className="text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent border-none text-sm text-white placeholder-zinc-500 focus:outline-none w-full"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-arcade btn-primary mt-2 py-3 disabled:opacity-50"
          >
            {isRegister ? (
              <span className="flex items-center gap-2"><UserPlus size={16} /> REGISTER</span>
            ) : (
              <span className="flex items-center gap-2"><LogIn size={16} /> LOGIN</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-white/10">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            {isRegister ? 'Already have an account? Log in' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
