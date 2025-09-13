
'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type User = {
  name: string;
  email: string;
  state: string;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  defaultUser: User;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultUser: User = {
  name: 'Guest',
  email: 'guest@example.com',
  state: 'Unknown',
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const item = window.sessionStorage.getItem('user');
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  });

  const setUser = useCallback((newUser: User | null) => {
    try {
      setUserState(newUser);
      if (newUser) {
        window.sessionStorage.setItem('user', JSON.stringify(newUser));
      } else {
        window.sessionStorage.removeItem('user');
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, defaultUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
