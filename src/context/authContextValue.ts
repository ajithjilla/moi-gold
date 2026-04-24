import { createContext } from "react";
import type { LoginPayload } from "../api/client";
import type { User } from "../types/domain";

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (_credentials: LoginPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
