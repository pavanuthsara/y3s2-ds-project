import { create } from "zustand";

const API_BASE = "http://localhost:8081/api/auth";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  role: null,
  loading: false,
  error: null,

  register: async (username, email, password, userRole) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role: userRole,
        }),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      const data = await response.json();
      set({
        user: username,
        token: data.token,
        role: data.role,
        loading: false,
      });
      return data;
    } catch (err) {
      set({
        error: err.message,
        loading: false,
      });
      throw err;
    }
  },

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      set({
        user: username,
        token: data.token,
        role: data.role,
        loading: false,
      });
      return data;
    } catch (err) {
      set({
        error: err.message,
        loading: false,
      });
      throw err;
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      role: null,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
