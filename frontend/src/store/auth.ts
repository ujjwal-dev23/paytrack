import { computed, signal } from "@preact/signals";

interface User {
  id: string;
  email: string;
}

// Auth Store Global State
export const user = signal<User | null>(null);
export const isAuthLoading = signal(true);
export const isAuthenticated = computed(() => user.value !== null);

export const initAuth = async () => {
  try {
    isAuthLoading.value = true;
    // TODO: Check Session through API Call

    // Mocked session check in localstorage (to be removed later)
    const token = localStorage.getItem("auth_token");
    if (token) {
      user.value = { id: "1", email: "user@example.com" };
      isAuthLoading.value = false;
    }
  } catch (_error) {
    user.value = null;
  } finally {
    isAuthLoading.value = false;
  }
};

export const login = (userData: User, token: string) => {
  localStorage.setItem("auth_token", token);
  user.value = userData;
  // TODO: Fetch Token through backend api
};

export const logout = () => {
  localStorage.removeItem("auth_token");
  user.value = null;
  // TODO: call backend logout route
};

export const signup = () => {
  // TODO: call backend signup route
  // calling login function for testing right now
  login({ id: "213", email: "bear" }, "fake_token2");
};
