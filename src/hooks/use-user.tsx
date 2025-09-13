
'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type User = {
  name: string;
  email: string;
  state: string;
};

type UserContextType = {
  user: User;
  setUser: (user: User) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultUser: User = {
  name: 'Farmer',
  email: 'farmer@example.com',
  state: 'Maharashtra',
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User>(() => {
    if (typeof window === 'undefined') {
      return defaultUser;
    }
    try {
      const item = window.localStorage.getItem('user');
      return item ? JSON.parse(item) : defaultUser;
    } catch (error) {
      console.error(error);
      return defaultUser;
    }
  });

  const setUser = useCallback((newUser: User) => {
    try {
      setUserState(newUser);
      window.localStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
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
