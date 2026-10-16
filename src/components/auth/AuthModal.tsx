import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_USERS } from '../../services/storage';
import { EKITI_CAMPUSES, DEFAULT_CAMPUS } from '../../data/campuses';
import { UserRole } from '../../types';
import {
  X,
  Sparkles,
  User,
  Store,
  ShieldCheck,
  PenTool,
  BookOpen,
  Lock,
  Mail,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Phone,
  CheckCircle2,
  Building,
  GraduationCap
} from 'lucide-react';
import { normalizeNigerianPhone, isValidNigerianPhone } from '../../lib/formatters';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'customer',
  initialMode = 'login'
}) => {
  const { loginWithEmail, registerUser, loginAsDemoUser } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  // Registration step: 'intent' (the two cards) or 'form' (the specific form)
  const [registerStep, setRegisterStep] = useState<'intent' | 'form'>('intent');
  const [intent, setIntent] = useState<'shop' | 'sell'>('shop');

  // Shared form fields (preserved across back/forth navigation)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [campusName, setCampusName] = useState(DEFAULT_CAMPUS);

  // Entrepreneur specific fields
  const [campusesServed, setCampusesServed] = useState<string[]>([DEFAULT_CAMPUS]);

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectIntent = (selectedIntent: 'shop' | 'sell') => {
    setIntent(selectedIntent);
    // If entrepreneur, ensure their own campus is automatically included in selling destinations
    if (selectedIntent === 'sell' && !campusesServed.includes(campusName)) {
      setCampusesServed([campusName]);
    }
    setError(null);
    setRegisterStep('form');
  };

  const handleToggleServedCampus = (campus: string) => {
    setCampusesServed((prev) => {
      if (prev.includes(campus)) {
        // Keep at least one campus selected
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== campus);
      } else {
        return [...prev, campus];
      }
    });
  };

  const handleSelectAllCampuses = () => {
    setCampusesServed(EKITI_CAMPUSES.map((c) => c.name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (mode === 'login') {
      setIsSubmitting(true);
      const res = await loginWithEmail(email, password);
      setIsSubmitting(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to sign in. Please verify your credentials.');
      }
    } else {
      // Registration validation
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!studentId.trim()) {
        setError('Please provide your campus student ID or matric number.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please provide a valid email address.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter your password.');
        return;
      }
      if (phone.trim() && !isValidNigerianPhone(phone.trim())) {
        setError('Please provide a valid Nigerian phone number (e.g. 08012345678 or +234...).');
        return;
      }

      if (intent === 'sell' && campusesServed.length === 0) {
        setError('Please select at least one university campus you sell to.');
        return;
      }

      setIsSubmitting(true);
      const normalizedPhone = phone.trim() ? normalizeNigerianPhone(phone.trim()) : '';

      const res = await registerUser({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        campus_name: campusName,
        student_id: studentId.trim(),
        role: intent === 'sell' ? 'seller' : 'customer',
        phone: normalizedPhone,
        campuses_served: intent === 'sell' ? campusesServed : [campusName],
        signup_intent: intent
      });
      setIsSubmitting(false);

      if (res.success) {
        if (res.message) {
          setNotice(res.message);
          setMode('login');
          setPassword('');
          setConfirmPassword('');
        } else {
          onClose();
        }
      } else {
        setError(res.error || 'Failed to register account.');
      }
    }
  };

  const roleIcons: Record<UserRole, React.ReactNode> = {
    customer: <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
    seller: <Store className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
    editor: <PenTool className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
    author: <BookOpen className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />,
    admin: <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#151921] rounded-2xl shadow-2xl border border-stone-200 dark:border-[#262e3d] overflow-hidden my-6 transition-all duration-200">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-[#222936]">
          <div className="flex items-center gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  {mode === 'login'
                    ? 'CampusMart Student Sign In'
                    : registerStep === 'intent'
                    ? 'How do you want to use CampusMart?'
                    : intent === 'shop'
                    ? 'Student Shopper Registration'
                    : 'Campus Entrepreneur Registration'}
                </h3>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {mode === 'login'
                  ? 'Sign in to access your student marketplace'
                  : registerStep === 'intent'
                  ? 'Select how you want to experience CampusMart'
                  : 'Ekiti State Universities Network'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Selected Intent Badge in top corner during registration */}
            {mode === 'register' && registerStep === 'form' && (
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-xs border ${
                  intent === 'shop'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/40'
                }`}
              >
                {intent === 'shop' ? (
                  <>
                    <ShoppingBag className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>I want to shop</span>
                  </>
                ) : (
                  <>
                    <Store className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>I want to sell</span>
                  </>
                )}
              </span>
            )}

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-[#1c222e] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Development Mode: Fast Role Switcher */}
        {import.meta.env.DEV && (
          <div className="bg-amber-50/70 dark:bg-amber-950/20 p-3 px-6 border-b border-amber-200/70 dark:border-amber-800/30 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Dev Quick Test Switch (Ekiti Universities)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => {
                    loginAsDemoUser(demo.id);
                    onClose();
                  }}
                  className="px-2 py-1 bg-white dark:bg-[#181f2c] border border-amber-200 dark:border-amber-800/40 hover:border-amber-400 dark:hover:border-amber-500 rounded-lg text-left text-[10px] transition-colors"
                >
                  <div className="flex items-center gap-1 font-semibold text-stone-800 dark:text-stone-200 truncate">
                    {roleIcons[demo.role]}
                    <span className="capitalize">{demo.role}</span>
                  </div>
                  <div className="text-[9px] text-stone-500 dark:text-stone-400 truncate">{demo.full_name.split(' ')[0]}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Body */}
        <div className="p-6">
          {/* Main Mode Toggle: Sign In vs Create Account */}
          <div className="flex bg-stone-100 dark:bg-[#11151c] p-1 rounded-xl mb-5 text-xs font-semibold">
            <button
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-white dark:bg-[#202838] text-stone-900 dark:text-white shadow-xs font-bold'
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
              className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer ${
                mode === 'register'
                  ? 'bg-white dark:bg-[#202838] text-stone-900 dark:text-white shadow-xs font-bold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-start gap-2">
              <span className="font-bold">Error:</span>
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{notice}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 1: REGISTRATION INTENT SELECTION (TWO INTERACTIVE CARDS) */}
          {/* ======================================================== */}
          {mode === 'register' && registerStep === 'intent' && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="text-center mb-4">
                <h4 className="text-base font-extrabold text-stone-900 dark:text-white">
                  Join CampusMart in Ekiti State
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Choose how you want to get started. You can always start selling later from your dashboard!
                </p>
              </div>

              {/* The Two Interactive Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Card 1: I want to shop (student) */}
                <button
                  type="button"
                  onClick={() => handleSelectIntent('shop')}
                  className="group relative flex flex-col items-start p-5 bg-stone-50 hover:bg-emerald-50/50 dark:bg-[#181e28] dark:hover:bg-[#1a2624] border-2 border-stone-200 hover:border-emerald-500 dark:border-[#262e3d] dark:hover:border-emerald-500 rounded-2xl text-left transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-stone-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    I want to shop (student)
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-1.5 leading-relaxed">
                    Discover products, shop from student brands, and connect with sellers.
                  </p>
                  <div className="mt-4 pt-3 border-t border-stone-200 dark:border-[#262e3d] w-full flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                    <span>Continue to Shopper Setup</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Card 2: I want to sell (entrepreneur) */}
                <button
                  type="button"
                  onClick={() => handleSelectIntent('sell')}
                  className="group relative flex flex-col items-start p-5 bg-stone-50 hover:bg-amber-50/50 dark:bg-[#181e28] dark:hover:bg-[#282216] border-2 border-stone-200 hover:border-amber-500 dark:border-[#262e3d] dark:hover:border-amber-500 rounded-2xl text-left transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Store className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                    I want to sell (entrepreneur)
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-1.5 leading-relaxed">
                    Open your store, showcase your products, and build your brand.
                  </p>
                  <div className="mt-4 pt-3 border-t border-stone-200 dark:border-[#262e3d] w-full flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-400">
                    <span>Continue to Store Setup</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="font-bold text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: REGISTRATION FORM OR LOGIN FORM */}
          {/* ======================================================== */}
          {(mode === 'login' || (mode === 'register' && registerStep === 'form')) && (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* If in Registration Form, show a clean Back button */}
              {mode === 'register' && (
                <div className="flex items-center justify-between pb-2 mb-1 border-b border-stone-100 dark:border-[#222936]">
                  <button
                    type="button"
                    onClick={() => {
                      setRegisterStep('intent');
                      setError(null);
                    }}
                    className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white font-semibold transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Selection</span>
                  </button>
                  <span className="text-[11px] text-stone-400 dark:text-stone-500 font-medium">
                    {intent === 'shop' ? 'Shopper Account' : 'Entrepreneur Account'}
                  </span>
                </div>
              )}

              {/* REGISTER ONLY FIELDS */}
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Babatunde Adeleke"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full p-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        Student ID / Matric Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. EKSU/2024/..."
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        required
                        className="w-full p-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        Campus
                      </label>
                      <select
                        value={campusName}
                        onChange={(e) => {
                          setCampusName(e.target.value);
                          if (intent === 'sell' && !campusesServed.includes(e.target.value)) {
                            setCampusesServed((prev) => [...prev, e.target.value]);
                          }
                        }}
                        required
                        className="w-full p-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400 cursor-pointer"
                      >
                        {EKITI_CAMPUSES.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Phone Number Field */}
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Phone Number (Nigerian Format)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="tel"
                        placeholder="e.g. 08012345678 or +234..."
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  {/* ENTREPRENEUR-ONLY: Campuses I sell to (Multi-select) */}
                  {intent === 'sell' && (
                    <div className="p-3.5 bg-amber-50/50 dark:bg-[#181e28] rounded-xl border border-amber-200/80 dark:border-amber-800/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-stone-900 dark:text-white text-xs">
                          Campuses I sell to
                        </label>
                        <div className="flex items-center gap-2 text-[11px]">
                          <button
                            type="button"
                            onClick={handleSelectAllCampuses}
                            className="text-amber-700 dark:text-amber-400 hover:underline font-semibold"
                          >
                            Select All (5)
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        Choose the Ekiti universities where you can deliver or meet buyers.
                      </p>

                      <div className="space-y-1.5 pt-1">
                        {EKITI_CAMPUSES.map((c) => {
                          const isSelected = campusesServed.includes(c.name);
                          return (
                            <label
                              key={c.id}
                              className={`flex items-start gap-2.5 p-2 rounded-lg border transition-colors cursor-pointer text-xs ${
                                isSelected
                                  ? 'bg-white dark:bg-[#202838] border-amber-400 dark:border-amber-500 text-stone-900 dark:text-white font-medium shadow-2xs'
                                  : 'bg-stone-50/80 dark:bg-[#131720] border-stone-200 dark:border-[#262e3d] text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleServedCampus(c.name)}
                                className="mt-0.5 rounded accent-amber-500"
                              />
                              <div className="min-w-0 flex-1">
                                <span className="font-semibold">{c.name}</span>
                                <span className="block text-[10px] text-stone-500 dark:text-stone-400">{c.location}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 pt-1 flex justify-between">
                        <span>Selected campuses:</span>
                        <span className="font-bold text-stone-800 dark:text-stone-200 font-mono">
                          {campusesServed.length} of {EKITI_CAMPUSES.length}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* EMAIL & PASSWORD (SHARED FOR BOTH LOGIN & REGISTER) */}
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {mode === 'login' ? 'Email Address' : 'Campus / Contact Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="student@university.edu.ng or your email"
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
                      onClick={() => alert('Password reset link sent: Please check your registered email inbox.')}
                      className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
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

              {mode === 'register' && (
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 py-3 bg-stone-900 dark:bg-amber-400 hover:bg-stone-800 dark:hover:bg-amber-300 text-white dark:text-stone-950 font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>
                  {isSubmitting
                    ? 'Processing...'
                    : mode === 'login'
                    ? 'Sign In to CampusMart'
                    : intent === 'shop'
                    ? 'Create Student Shopper Account'
                    : 'Create Entrepreneur Account'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
