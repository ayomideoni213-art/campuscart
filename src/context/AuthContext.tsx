import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { StorageService, DEMO_USERS } from '../services/storage';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  currentUser: UserProfile | null;
  currentRole: UserRole;
  selectedCampus: string;
  setSelectedCampus: (campus: string) => void;
  switchUserRole: (role: UserRole) => void;
  loginAsDemoUser: (userId: string) => void;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (data: { email: string; password: string; full_name: string; campus_name: string; student_id: string; role: UserRole; bio?: string }) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => void;
  updateProfile: (updatedData: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      const authorizedProfile = profile ? await applyAdminAuthorization(profile) : null;
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
    if (!import.meta.env.DEV && (role === 'admin' || role === 'editor' || role === 'author')) return;
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

    const userProfile = await applyAdminAuthorization(profile as UserProfile);
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
    bio?: string;
  }): Promise<{ success: boolean; error?: string; message?: string }> => {
    const { data: result, error } = await supabase.auth.signUp({
      email: data.email.trim(),
      password: data.password,
      options: {
        data: {
          full_name: data.full_name.trim(),
          campus_name: data.campus_name || selectedCampus,
          student_id: data.student_id.trim(),
          role: data.role === 'seller' ? 'seller' : 'customer',
          bio: data.bio?.trim() || '',
        },
      },
    });

    if (error) return { success: false, error: error.message };

    if (!result.session) {
      return {
        success: true,
        message: 'Account created. Check your email to confirm it, then sign in.',
      };
    }

    return { success: true };
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
