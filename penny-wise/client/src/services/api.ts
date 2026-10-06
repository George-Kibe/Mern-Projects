import axios, { AxiosError } from "axios";

const TOKEN_KEY = "pennywise_token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "Application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);

      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/signup")
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

// Server-provided message, or a fallback when no response arrived (server down, CORS, offline)
export const getErrorMessage = (error: unknown): string => {
  const err = error as AxiosError<{ error?: string }>;

  if (err.response?.data?.error) {
    return err.response.data.error;
  }

  if (!err.response) {
    return "Cannot reach the server. Please check your connection and try again.";
  }

  return "Something went wrong. Please try again.";
};

export default api;
export { TOKEN_KEY };
