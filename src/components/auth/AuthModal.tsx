import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_USERS, CAMPUS_OPTIONS } from '../../services/storage';
import { UserRole } from '../../types';
import { X, Sparkles, User, Store, ShieldCheck, PenTool, BookOpen, Lock, Mail } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultRole = 'customer' }) => {
  const { loginWithEmail, registerUser, loginAsDemoUser } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [campusName, setCampusName] = useState(CAMPUS_OPTIONS[0].name);
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [bio, setBio] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (mode === 'login') {
      const res = await loginWithEmail(email, password);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to sign in.');
      }
    } else {
      if (!fullName.trim() || !studentId.trim()) {
        setError('Please provide your name and student ID.');
        return;
      }
      const res = await registerUser({
        email,
        password,
        full_name: fullName.trim(),
        campus_name: campusName,
        student_id: studentId.trim(),
        role,
        bio: bio.trim()
      });
      if (res.success) {
        if (res.message) {
          setNotice(res.message);
          setMode('login');
          setPassword('');
        } else {
          onClose();
        }
      } else {
        setError(res.error || 'Failed to register.');
      }
    }
  };

  const roleIcons: Record<UserRole, React.ReactNode> = {
    customer: <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
    seller: <Store className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />,
    editor: <PenTool className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
    author: <BookOpen className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />,
    admin: <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-[#151921] rounded-2xl shadow-2xl border border-stone-200 dark:border-[#262e3d] overflow-hidden my-6 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-[#222936]">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-white">
              {mode === 'login' ? 'CampusMart Student Sign In' : 'Create Student Account'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {mode === 'login'
                ? 'Sign in with your verified campus email'
                : 'Join your campus marketplace today'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-[#1c222e] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Development Mode: Fast Role Switcher */}
        {import.meta.env.DEV && (
          <div className="bg-amber-50/70 dark:bg-amber-950/20 p-4 border-b border-amber-200/70 dark:border-amber-800/30 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Quick Test Account Switch (5 Campus Roles)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => {
                    loginAsDemoUser(demo.id);
                    onClose();
                  }}
                  className="px-2 py-1.5 bg-white dark:bg-[#181f2c] border border-amber-200 dark:border-amber-800/40 hover:border-amber-400 dark:hover:border-amber-500 rounded-lg text-left text-[11px] transition-colors"
                >
                  <div className="flex items-center gap-1 font-semibold text-stone-800 dark:text-stone-200">
                    {roleIcons[demo.role]}
                    <span className="capitalize">{demo.role}</span>
                  </div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">{demo.full_name.split(' ')[0]}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6">
          {/* Mode Switch Tabs */}
          <div className="flex bg-stone-100 dark:bg-[#11151c] p-1 rounded-xl mb-4 text-xs font-semibold">
            <button
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                mode === 'login'
                  ? 'bg-white dark:bg-[#202838] text-stone-900 dark:text-white shadow-2xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                mode === 'register'
                  ? 'bg-white dark:bg-[#202838] text-stone-900 dark:text-white shadow-2xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs rounded-lg">
              {error}
            </div>
          )}

          {notice && (
            <div className="mb-4 p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs rounded-lg">
              {notice}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Jordan Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full p-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Account Intent / Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('customer')}
                      className={`p-2 border rounded-lg text-center font-semibold transition-colors ${
                        role === 'customer'
                          ? 'border-stone-900 dark:border-amber-400 bg-stone-900 dark:bg-amber-400 text-white dark:text-stone-950'
                          : 'border-stone-200 dark:border-[#262e3d] bg-stone-50 dark:bg-[#181e2a] text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      Buyer / Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('seller')}
                      className={`p-2 border rounded-lg text-center font-semibold transition-colors ${
                        role === 'seller'
                          ? 'border-stone-900 dark:border-amber-400 bg-stone-900 dark:bg-amber-400 text-white dark:text-stone-950'
                          : 'border-stone-200 dark:border-[#262e3d] bg-stone-50 dark:bg-[#181e2a] text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      Seller / Store Owner
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Student ID #</label>
                    <input
                      type="text"
                      placeholder="MCU-2026-XXXX"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required
                      className="w-full p-2 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-lg text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Campus</label>
                    <select
                      value={campusName}
                      onChange={(e) => setCampusName(e.target.value)}
                      className="w-full p-2 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg text-xs focus:outline-none"
                    >
                      {CAMPUS_OPTIONS.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.short_code}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Campus Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  placeholder="student@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => alert('Password reset link simulated: Please check your campus email.')}
                    className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 bg-stone-900 dark:bg-amber-400 hover:bg-stone-800 dark:hover:bg-amber-300 text-white dark:text-stone-950 font-bold rounded-xl shadow-xs transition-colors"
            >
              {mode === 'login' ? 'Sign In to CampusMart' : 'Create Verified Student Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
