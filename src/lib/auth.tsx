"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

export type Role = "OWNER" | "PRODUCTION_MANAGER" | "WORKER";

export interface SessionUser {
  name: string;
  email: string;
  role: Role;
}

const AuthContext = createContext<{
  user: SessionUser | null;
  login: (u: SessionUser) => void;
  loginWithPassword: (email: string, password: string) => Promise<SessionUser>;
  logout: () => void;
  loading: boolean;
}>({
  user: null,
  login: () => {},
  loginWithPassword: async () => {
    throw new Error("Auth not ready");
  },
  logout: () => {},
  loading: true,
});

const KEY = "matesther_user";

/* In-memory fallback so sign-in NEVER fails, even when the browser
   blocks localStorage/cookies (e.g. sandboxed preview iframes). */
let memoryUser: SessionUser | null = null;

function readStoredUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const u = JSON.parse(raw);
      if (u && u.role) {
        memoryUser = u;
        return u;
      }
    }
  } catch {
    /* storage blocked — fall through to cookie / memory */
  }
  try {
    const m = document.cookie.match(/(?:^|; )matesther_user=([^;]*)/);
    if (m) {
      const u = JSON.parse(decodeURIComponent(m[1]));
      if (u && u.role) {
        memoryUser = u;
        return u;
      }
    }
  } catch {
    /* cookies blocked — fall through to memory */
  }
  return memoryUser;
}

function writeStoredUser(u: SessionUser | null) {
  memoryUser = u;
  try {
    if (u) localStorage.setItem(KEY, JSON.stringify(u));
    else localStorage.removeItem(KEY);
  } catch {
    /* storage blocked — memory fallback keeps session alive */
  }
  try {
    if (u)
      document.cookie = `matesther_user=${encodeURIComponent(
        JSON.stringify(u)
      )}; path=/; max-age=604800; SameSite=Lax`;
    else document.cookie = `matesther_user=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    /* cookies blocked — ignore */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setUser(readStoredUser());
    setLoading(false);
  }, []);

  const login = useCallback(
    (u: SessionUser) => {
      writeStoredUser(u); // never throws
      setUser(u);
      setLoading(false);
      router.push("/dashboard");
    },
    [router]
  );

  const logout = useCallback(() => {
    writeStoredUser(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  /** Real staff sign-in — verifies email + password against the database. */
  const loginWithPassword = useCallback(
    async (email: string, password: string): Promise<SessionUser> => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Sign-in failed.");
      const u: SessionUser = { name: d.name, email: d.email, role: d.role };
      writeStoredUser(u);
      setUser(u);
      setLoading(false);
      router.push("/dashboard");
      return u;
    },
    [router]
  );

  return (
    <AuthContext.Provider value={{ user, login, loginWithPassword, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function roleLabel(r: Role): string {
  if (r === "OWNER") return "Owner / Admin";
  if (r === "PRODUCTION_MANAGER") return "Project Manager";
  return "Worker";
}

/**
 * Permission hierarchy:
 *   OWNER              — everything (business + full production management)
 *   PROJECT MANAGER    — production supervision only (NO financials)
 *   WORKER             — personal jobs, journal, earnings, profile
 *
 * The Owner inherently holds every Project-Manager function.
 */
export function allowedPaths(role: Role): string[] {
  if (role === "OWNER") return ["*"];
  if (role === "PRODUCTION_MANAGER")
    return ["/dashboard", "/production", "/workers"];
  return ["/dashboard", "/worker"];
}

export function canAccess(role: Role, path: string): boolean {
  const allowed = allowedPaths(role);
  if (allowed.includes("*")) return true;
  return allowed.some((p) => path === p || path.startsWith(p + "/"));
}
