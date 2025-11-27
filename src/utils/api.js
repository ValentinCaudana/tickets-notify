import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance with credentials
const api = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==================== AUTH ====================

export const authAPI = {
  createSession: (sessionId) =>
    api.post("/auth/session", {}, { headers: { "X-Session-ID": sessionId } }),

  getMe: () => api.get("/auth/me"),

  logout: () => api.post("/auth/logout"),
};

// ==================== TEAMS ====================

export const teamsAPI = {
  getAll: (country = null) =>
    api.get("/teams", { params: country ? { country } : {} }),

  getById: (id) => api.get(`/teams/${id}`),

  create: (data) => api.post("/teams", data),

  update: (id, data) => api.put(`/teams/${id}`, data),

  delete: (id) => api.delete(`/teams/${id}`),
};

// ==================== TOURNAMENTS ====================

export const tournamentsAPI = {
  getAll: () => api.get("/tournaments"),

  getById: (id) => api.get(`/tournaments/${id}`),

  create: (data) => api.post("/tournaments", data),
};

// ==================== MATCHES ====================

export const matchesAPI = {
  getAll: (params = {}) => api.get("/matches", { params }),

  getById: (id) => api.get(`/matches/${id}`),

  create: (data) => api.post("/matches", data),

  update: (id, data) => api.put(`/matches/${id}`, data),

  delete: (id) => api.delete(`/matches/${id}`),

  exportToCalendar: (id) =>
    api.get(`/matches/${id}/calendar`, { responseType: "blob" }),
};

// ==================== TICKET SOURCES ====================

export const ticketSourcesAPI = {
  getAll: () => api.get("/ticket-sources"),

  create: (data) => api.post("/ticket-sources", data),
};

// ==================== NOTIFICATIONS ====================

export const notificationsAPI = {
  getAll: (unreadOnly = false) =>
    api.get("/notifications", { params: { unread_only: unreadOnly } }),

  markAsRead: (id) => api.put(`/notifications/${id}/read`),

  markAllAsRead: () => api.put("/notifications/mark-all-read"),
};

// ==================== PREFERENCES ====================

export const preferencesAPI = {
  get: () => api.get("/preferences"),

  update: (data) => api.put("/preferences", data),
};

export default api;
