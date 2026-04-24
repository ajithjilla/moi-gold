import { type ReactNode, useCallback, useEffect, useState } from "react";
import { authApi, setToken, clearToken, getToken, onUnauthorized } from "../api/client";
import { AuthContext } from "./authContextValue";
import type { LoginPayload } from "../api/client";
import type { User } from "../types/domain";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((data) => setUser(data.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const unsubscribe = onUnauthorized(() => setUser(null));
    return () => {
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (credentials: LoginPayload) => {
    const data = await authApi.login(credentials);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    clearToken();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const data = await authApi.me();
    setUser(data.user);
    return data.user;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
