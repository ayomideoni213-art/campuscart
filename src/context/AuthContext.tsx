import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { StorageService, DEMO_USERS } from '../services/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { sanitizeCampus, EKITI_CAMPUSES } from '../data/campuses';

interface AuthContextType {
  currentUser: UserProfile | null;
  currentRole: UserRole;
  selectedCampus: string;
  setSelectedCampus: (campus: string) => void;
  switchUserRole: (role: UserRole) => void;
  loginAsDemoUser: (userId: string) => void;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (data: {
    email: string;
    password: string;
    full_name: string;
    campus_name: string;
    student_id: string;
    role: UserRole;
    phone?: string;
    bio?: string;
    campuses_served?: string[];
    signup_intent?: 'shop' | 'sell';
  }) => Promise<{ success: boolean; error?: string; message?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => void;
  updateProfile: (updatedData: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_AVATAR_URL =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

/** Fills gaps in database rows (nullable columns, legacy campus names) so the UI can rely on them. */
function normalizeProfile(profile: UserProfile): UserProfile {
  const campus = sanitizeCampus(profile.campus_name);
  const validNames = new Set(EKITI_CAMPUSES.map((c) => c.name));
  const served = (profile.campuses_served ?? []).filter((c) => validNames.has(c));
  return {
    ...profile,
    avatar_url: profile.avatar_url || DEFAULT_AVATAR_URL,
    campus_name: campus,
    student_id: profile.student_id ?? '',
    phone: profile.phone ?? '',
    signup_intent: profile.signup_intent ?? (profile.role === 'seller' ? 'sell' : 'shop'),
    campuses_served: served.length > 0 ? served : [campus],
  };
}

async function applyAdminAuthorization(profile: UserProfile): Promise<UserProfile> {
  const { data: isAdmin, error } = await supabase.rpc('is_admin');
  if (error) {
    console.error('Could not verify administrator access:', error);
    return profile.role === 'admin' ? { ...profile, role: 'customer' } : profile;
  }

  return {
    ...profile,
    role: isAdmin ? 'admin' : profile.role === 'admin' ? 'customer' : profile.role,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    let disposed = false;

    const loadProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (disposed) return;
      if (error) {
        console.error('Could not load the signed-in profile:', error);
        setCurrentUser(null);
        return;
      }

      const profile = data as UserProfile | null;
      const authorizedProfile = profile ? normalizeProfile(await applyAdminAuthorization(profile)) : null;
      if (profile?.is_suspended) {
        setCurrentUser(null);
        void supabase.auth.signOut();
        return;
      }

      setCurrentUser(authorizedProfile);
    };

    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Could not restore the Supabase session:', error);
        return;
      }
      if (data.session) void loadProfile(data.session.user.id);
      else if (!disposed) setCurrentUser(null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        if (!disposed) setCurrentUser(null);
        return;
      }

      // Defer the profile request until Supabase finishes its auth callback.
      window.setTimeout(() => {
        if (!disposed) void loadProfile(session.user.id);
      }, 0);
    });

    return () => {
      disposed = true;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const [selectedCampus, setSelectedCampusState] = useState<string>(() => {
    return StorageService.getSelectedCampus();
  });

  const setSelectedCampus = (campus: string) => {
    setSelectedCampusState(campus);
    StorageService.setSelectedCampus(campus);
  };

  const switchUserRole = (role: UserRole) => {
    // Role switching is a development-only testing aid; real accounts never swap identities.
    if (!import.meta.env.DEV) return;
    const matchingDemo = DEMO_USERS.find((u) => u.role === role);
    if (matchingDemo) {
      setCurrentUser(matchingDemo);
    } else if (currentUser) {
      setCurrentUser({ ...currentUser, role });
    }
  };

  const loginAsDemoUser = (userId: string) => {
    if (!import.meta.env.DEV) return;
    const found = DEMO_USERS.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const loginWithEmail = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: profileError?.message || 'Your account profile was not found. Please contact support.',
      };
    }

    const userProfile = normalizeProfile(await applyAdminAuthorization(profile as UserProfile));
    if (userProfile.is_suspended) {
      await supabase.auth.signOut();
      return { success: false, error: 'This student account has been suspended by campus moderators.' };
    }

    setCurrentUser(userProfile);
    return { success: true };
  };

  const registerUser = async (data: {
    email: string;
    password: string;
    full_name: string;
    campus_name: string;
    student_id: string;
    role: UserRole;
    phone?: string;
    bio?: string;
    campuses_served?: string[];
    signup_intent?: 'shop' | 'sell';
  }): Promise<{ success: boolean; error?: string; message?: string }> => {
    const intent = data.signup_intent || (data.role === 'seller' ? 'sell' : 'shop');
    const role: UserRole = intent === 'sell' ? 'seller' : 'customer';

    const { data: result, error } = await supabase.auth.signUp({
      email: data.email.trim(),
      password: data.password,
      options: {
        data: {
          full_name: data.full_name.trim(),
          campus_name: data.campus_name || selectedCampus,
          student_id: data.student_id.trim(),
          role,
          phone: data.phone?.trim() || '',
          bio: data.bio?.trim() || '',
          campuses_served: data.campuses_served || [data.campus_name || selectedCampus],
          signup_intent: intent
        },
      },
    });

    if (error) return { success: false, error: error.message };

    const newLocalUser: UserProfile = normalizeProfile({
      id: result.user?.id || `user-${Date.now()}`,
      email: data.email.trim(),
      full_name: data.full_name.trim(),
      role,
      avatar_url: DEFAULT_AVATAR_URL,
      campus_name: data.campus_name || selectedCampus,
      student_id: data.student_id.trim(),
      phone: data.phone?.trim() || '',
      bio: data.bio?.trim() || '',
      created_at: new Date().toISOString(),
      signup_intent: intent,
      campuses_served: data.campuses_served
    });

    // Keep the local demo list in sync (used by dashboards that read local users).
    const currentUsers = StorageService.getUsers();
    StorageService.setUsers([newLocalUser, ...currentUsers.filter((u) => u.id !== newLocalUser.id)]);

    // With email confirmation enabled Supabase returns a user but no session:
    // the visitor is NOT signed in yet and must confirm their email first.
    if (isSupabaseConfigured && result.user && !result.session) {
      return {
        success: true,
        message: 'Account created! Check your email to confirm your address, then sign in.',
      };
    }

    setCurrentUser(newLocalUser);
    return { success: true };
  };

  const resetPassword = async (
    email: string
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    if (!email.trim() || !email.includes('@')) {
      return { success: false, error: 'Enter your account email above first, then choose "Forgot password?".' };
    }
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Password reset is unavailable in offline demo mode.' };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    if (error) return { success: false, error: error.message };
    return {
      success: true,
      message: 'If an account exists for that email, a password reset link is on its way.',
    };
  };

  const logout = () => {
    setCurrentUser(null);
    void supabase.auth.signOut();
  };

  const updateProfile = (updatedData: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedData };
    setCurrentUser(updated);

    const allUsers = StorageService.getUsers().map((u) => (u.id === currentUser.id ? updated : u));
    StorageService.setUsers(allUsers);

    // Persist owner-editable fields for real Supabase accounts (RLS limits this to the user's own row;
    // the role guard only allows the customer -> seller upgrade).
    if (!isSupabaseConfigured) return;
    void (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user.id !== currentUser.id) return;

      const row: Record<string, unknown> = {};
      for (const key of ['full_name', 'bio', 'avatar_url', 'campus_name', 'campuses_served', 'phone', 'signup_intent'] as const) {
        if (key in updatedData) row[key] = updatedData[key];
      }
      if (currentUser.role === 'customer' && updatedData.role === 'seller') row.role = 'seller';
      if (Object.keys(row).length === 0) return;

      const { error } = await supabase.from('profiles').update(row).eq('id', currentUser.id);
      if (error) console.error('Could not save profile changes to Supabase:', error);
    })();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser?.role || 'customer',
        selectedCampus,
        setSelectedCampus,
        switchUserRole,
        loginAsDemoUser,
        loginWithEmail,
        registerUser,
        resetPassword,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
