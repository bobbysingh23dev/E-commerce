import { createContext, useContext, useState, type ReactNode } from "react";
import type { PublicUser } from "../types";
import * as authApi from "../api/auth";
import { setToken, clearToken, getToken } from "../api/client";

// The shape of everything the rest of the app can read/do about auth.
interface AuthContextValue {
  user: PublicUser | null; // null = logged out
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// createContext makes the "channel". null is the default when there's no
// Provider above — useAuth() below turns that into a clear error.
const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = "user";

// On a page refresh, React state is wiped. We persisted the user in
// localStorage at login, so we can restore it here — but only if the token
// is still there too (token + user must agree).
function loadStoredUser(): PublicUser | null {
  if (!getToken()) return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PublicUser;
  } catch {
    return null; // corrupt JSON -> treat as logged out
  }
}

// The Provider holds the actual state and hands it to everything inside it.
export function AuthProvider({ children }: { children: ReactNode }) {
  // Passing a FUNCTION to useState is a "lazy initializer": it runs only on
  // the first render, so we read localStorage once, not on every render.
  const [user, setUser] = useState<PublicUser | null>(loadStoredUser);

  async function login(email: string, password: string) {
    const { jwtToken, user: loggedInUser } = await authApi.login(
      email,
      password,
    );
    setToken(jwtToken); // client.ts will now attach this to every request
    localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser); // re-renders every component using useAuth()
  }

  async function register(name: string, email: string, password: string) {
    await authApi.register(name, email, password);
    // Register doesn't return a token, so log in immediately afterwards
    // to make "sign up" land you straight into a logged-in session.
    await login(email, password);
  }

  function logout() {
    clearToken();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook: components call useAuth() instead of useContext(AuthContext).
// The null check means you get a helpful error if you ever forget the Provider.
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
