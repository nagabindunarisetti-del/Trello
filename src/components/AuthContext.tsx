import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { Navigate, useLocation } from "react-router-dom";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  type User,
} from "../utils/auth";

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());

  // Keep multiple browser tabs in sync (login/logout in one tab updates others)
  useEffect(() => {
    const sync = () => setUser(getCurrentUser());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setUser(await loginUser(email, password));
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setUser(await registerUser(name, email, password));
    },
    []
  );

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, login, register, logout }),
    [user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/** Wrap pages that need a logged-in user. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
