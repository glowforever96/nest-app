import type { AuthUser } from "./lib/auth";

export type AuthContextValue = {
  isAuthenticated: boolean;
  isInitializing: boolean;
  user: AuthUser | null;
  login: (input: { email: string; password: string }) => Promise<void>;
  signup: (input: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

export type RouterContext = {
  auth: AuthContextValue;
};
