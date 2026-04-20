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

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
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
  config: { retryOnUnauthorized?: boolean } = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const responseBody = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | { message?: string }
    | null;

  if (!response.ok) {
    if (response.status === 401 && config.retryOnUnauthorized) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        const retryHeaders = {
          ...(options.headers ?? {}),
          Authorization: `Bearer ${refreshed}`,
        };

        return request<T>(
          path,
          {
            ...options,
            headers: retryHeaders,
          },
          { retryOnUnauthorized: false },
        );
      }
    }

    const message =
      responseBody?.message && typeof responseBody.message === "string"
        ? responseBody.message
        : "요청 처리 중 오류가 발생했습니다.";
    throw new Error(message);
  }

  if (
    !responseBody ||
    !("data" in responseBody) ||
    typeof responseBody !== "object"
  ) {
    throw new Error("응답 형식이 올바르지 않습니다.");
  }

  return responseBody.data;
}

export function getStoredAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveTokens(tokens: { accessToken: string; refreshToken: string }) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function refreshAccessToken() {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const payload = await request<AuthPayload>(
      "/auth/refresh",
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ refreshToken }),
      },
      { retryOnUnauthorized: false },
    );
    saveTokens({
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
    });
    return payload.accessToken;
  } catch {
    clearTokens();
    return null;
  }
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
  return request<AuthUser>(
    "/auth/me",
    {
      method: "GET",
      headers: getHeaders(accessToken),
    },
    { retryOnUnauthorized: true },
  );
}

export async function logout(accessToken: string) {
  return request<{ success: boolean }>(
    "/auth/logout",
    {
      method: "POST",
      headers: getHeaders(accessToken),
    },
    { retryOnUnauthorized: true },
  );
}
