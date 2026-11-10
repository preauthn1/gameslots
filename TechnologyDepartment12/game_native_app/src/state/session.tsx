import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type AuthMode = 'login' | 'register';

type SessionValue = {
  isLoggedIn: boolean;
  authMode: AuthMode | null;
  openLogin: () => void;
  openRegister: () => void;
  closeAuth: () => void;
  switchAuth: (mode: AuthMode) => void;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);

  const value = useMemo<SessionValue>(
    () => ({
      isLoggedIn: false,
      authMode,
      openLogin: () => setAuthMode('login'),
      openRegister: () => setAuthMode('register'),
      closeAuth: () => setAuthMode(null),
      switchAuth: (mode) => setAuthMode(mode),
    }),
    [authMode],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return value;
}
