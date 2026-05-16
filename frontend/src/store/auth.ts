import { computed, signal } from "@preact/signals";
import { apiFetch } from "../services/api";

export interface User {
  id: number;
  username: string;
  email: string;
  reminder_template?: string | null;
}

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

// Auth Store Global State
export const user = signal<User | null>(null);
export const isAuthLoading = signal(true);
export const isAuthenticated = computed(() => user.value !== null);

/**
 * Initialize authentication state by checking the session
 */
export const initAuth = async () => {
  try {
    isAuthLoading.value = true;
    const response = await apiFetch<ApiResponse<{ user: User }>>("/auth/me");
    if (response.status === "success" && response.data.user) {
      user.value = response.data.user;
    } else {
      user.value = null;
    }
  } catch (_error) {
    user.value = null;
  } finally {
    isAuthLoading.value = false;
  }
};

/**
 * Login user
 */
export const login = async (credentials: Record<string, string>) => {
  try {
    isAuthLoading.value = true;
    const response = await apiFetch<ApiResponse<{ user: User }>>("/auth/login", {
      method: "POST",
      data: credentials,
    });
    if (response.status === "success" && response.data.user) {
      user.value = response.data.user;
    }
  } catch (error) {
    user.value = null;
    throw error;
  } finally {
    isAuthLoading.value = false;
  }
};

/**
 * Signup user
 */
export const signup = async (userData: Record<string, string>) => {
  try {
    isAuthLoading.value = true;
    const response = await apiFetch<ApiResponse<{ user: User }>>("/auth/signup", {
      method: "POST",
      data: userData,
    });
    if (response.status === "success" && response.data.user) {
      user.value = response.data.user;
    }
  } catch (error) {
    user.value = null;
    throw error;
  } finally {
    isAuthLoading.value = false;
  }
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    await apiFetch<ApiResponse<null>>("/auth/logout", { method: "POST" });
  } catch (error) {
    console.error("Logout failed", error);
  } finally {
    user.value = null;
  }
};
