// A single place that knows how to talk to the backend.
// Every API call in the app goes through apiFetch(), so cross-cutting concerns
// (base URL, auth header, JSON parsing, error handling) live in ONE spot.

// In production (Vercel) we set VITE_API_BASE_URL to the deployed backend URL.
// Locally, when it's unset, we fall back to the dev backend on :4000.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

const TOKEN_KEY = "jwtToken";

// --- Token storage (localStorage survives page refreshes) ---
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// A typed error so UI code can react to status codes (e.g. 401 -> log in again)
// and show the backend's validation messages.
export class ApiError extends Error {
  status: number;
  details?: string[];
  constructor(status: number, message: string, details?: string[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

// The generic <T> lets each caller say what shape it expects back,
// e.g. apiFetch<Product[]>("/products").
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  // Only set JSON content-type when we're actually sending a body.
  if (options.body) headers.set("Content-Type", "application/json");

  // Attach the bearer token if we have one — this is what makes
  // protected routes (orders, admin) work automatically.
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  // Some responses have no body; guard JSON.parse against an empty string.
  const raw = await res.text();
  const data = raw ? JSON.parse(raw) : null;

  if (!res.ok) {
    // Your backend returns { error: "..." } and sometimes { details: [...] }.
    const message = data?.error ?? `Request failed (${res.status})`;

    // Session expired / token invalid → force a clean logout + send to /login.
    // When a request we sent WITH a token comes back 401, the backend rejected
    // that token (expired or invalid — see backend authenticate.ts). Rather than
    // leave the user stuck on a page whose calls keep failing, we log them out
    // and redirect. Guards:
    //   • `token`  — only when WE actually sent one (a stale logged-in session),
    //     not a 401 while already logged out.
    //   • skip /auth/* — a wrong email/password on the login form is also a 401,
    //     and that must show its own error, not bounce to /login.
    // We clear the token (AuthContext treats "no token" as logged out) and do a
    // full-page redirect, which works even though this runs outside React/Router.
    if (res.status === 401 && token && !path.startsWith("/auth/")) {
      clearToken();
      localStorage.removeItem("user"); // mirror AuthContext's logout (USER_KEY)
      if (window.location.pathname !== "/login") {
        window.location.assign("/login?expired=1");
      }
    }

    throw new ApiError(res.status, message, data?.details);
  }

  return data as T;
}
