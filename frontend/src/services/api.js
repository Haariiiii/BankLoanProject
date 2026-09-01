// api.js — centralised API calls
import axios from "axios";

// In development: proxied to localhost:5000 via vite.config.js
const RENDER_BACKEND_URL = "https://bankloanproject-5jgj.onrender.com";

const rawEnvUrl = import.meta.env.VITE_API_URL;
const isValidUrl = rawEnvUrl && rawEnvUrl.startsWith("http") && !rawEnvUrl.includes("YOUR-RENDER-URL");

const BASE = isValidUrl
  ? `${rawEnvUrl}/api`
  : import.meta.env.MODE === "production"
  ? `${RENDER_BACKEND_URL}/api`
  : "/api";

const api = axios.create({ baseURL: BASE, timeout: 60000 });

export const getHealth            = ()      => api.get("/health");
export const getModelInfo         = ()      => api.get("/model-info");
export const predict              = (data)  => api.post("/predict", data);
export const getAnalytics         = ()      => api.get("/analytics");
export const getMetrics           = ()      => api.get("/metrics");
export const getFeatureImportance = (n)     => api.get(`/feature-importance?top_n=${n || 20}`);
export const getHistory           = (limit) => api.get(`/history?limit=${limit || 200}`);
export const clearHistory         = ()      => api.delete("/history");
