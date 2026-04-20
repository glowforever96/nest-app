export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
};

type AuthPayload = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

const ACCESS_TOKEN_KEY = "auth.accessToken";
const REFRESH_TOKEN_KEY = "auth.refreshToken";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

function getHeaders(accessToken?: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = (await response.json().catch(() => null)) as
    | { message?: string }
    | null;

  if (!response.ok) {
    const message =
      data?.message && typeof data.message === "string"
        ? data.message
        : "요청 처리 중 오류가 발생했습니다.";
    throw new Error(message);
  }

  return data as T;
}

export function getStoredAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function saveTokens(tokens: { accessToken: string; refreshToken: string }) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export async function signup(input: {
  name: string;
  email: string;
  password: string;
}) {
  return request<AuthPayload>("/auth/signup", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(input),
  });
}

export async function login(input: { email: string; password: string }) {
  return request<AuthPayload>("/auth/login", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(input),
  });
}

export async function me(accessToken: string) {
  return request<AuthUser>("/auth/me", {
    method: "GET",
    headers: getHeaders(accessToken),
  });
}

export async function logout(accessToken: string) {
  return request<{ success: boolean }>("/auth/logout", {
    method: "POST",
    headers: getHeaders(accessToken),
  });
}
