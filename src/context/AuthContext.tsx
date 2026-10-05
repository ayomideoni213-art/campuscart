import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { StorageService, DEMO_USERS } from '../services/storage';

interface AuthContextType {
  currentUser: UserProfile | null;
  currentRole: UserRole;
  selectedCampus: string;
  setSelectedCampus: (campus: string) => void;
  switchUserRole: (role: UserRole) => void;
  loginAsDemoUser: (userId: string) => void;
  loginWithEmail: (email: string, password?: string) => { success: boolean; error?: string };
  registerUser: (data: { email: string; full_name: string; campus_name: string; student_id: string; role: UserRole; bio?: string }) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (updatedData: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    // Default to the first demo user (Customer: Maya Lin)
    return DEMO_USERS[0];
  });

  const [selectedCampus, setSelectedCampusState] = useState<string>(() => {
    return StorageService.getSelectedCampus();
  });

  const setSelectedCampus = (campus: string) => {
    setSelectedCampusState(campus);
    StorageService.setSelectedCampus(campus);
  };

  const switchUserRole = (role: UserRole) => {
    const matchingDemo = DEMO_USERS.find((u) => u.role === role);
    if (matchingDemo) {
      setCurrentUser(matchingDemo);
    } else if (currentUser) {
      setCurrentUser({ ...currentUser, role });
    }
  };

  const loginAsDemoUser = (userId: string) => {
    const found = DEMO_USERS.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const loginWithEmail = (email: string): { success: boolean; error?: string } => {
    const allUsers = StorageService.getUsers();
    const found = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      if (found.is_suspended) {
        return { success: false, error: 'This student account has been suspended by campus moderators.' };
      }
      setCurrentUser(found);
      return { success: true };
    }
    // Also check demo users
    const demo = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (demo) {
      setCurrentUser(demo);
      return { success: true };
    }
    return { success: false, error: 'No account found with this campus email. Please register below.' };
  };

  const registerUser = (data: {
    email: string;
    full_name: string;
    campus_name: string;
    student_id: string;
    role: UserRole;
    bio?: string;
  }): { success: boolean; error?: string } => {
    const allUsers = StorageService.getUsers();
    if (allUsers.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'A student account with this email already exists.' };
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email: data.email,
      full_name: data.full_name,
      role: data.role,
      avatar_url: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?auto=format&fit=crop&w=300&q=80`,
      campus_name: data.campus_name || selectedCampus,
      student_id: data.student_id,
      phone: '+1 (555) 000-1234',
      bio: data.bio || 'CampusMart verified student member.',
      created_at: new Date().toISOString()
    };

    const updated = [newUser, ...allUsers];
    StorageService.setUsers(updated);
    setCurrentUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
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
