import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 20000,
});

export const authHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// Normalise errors so every screen can show one readable message.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const res = error.response;
    if (res?.status === 429) {
      const retryAfter =
        Number(res.headers?.["retry-after"]) || res.data?.retryAfter || 60;
      error.isRateLimited = true;
      error.retryAfter = retryAfter;
      error.userMessage = `${res.data?.message || "Too many requests."} Try again in ${retryAfter}s.`;
    } else if (!res) {
      error.userMessage = "Can't reach the server. Check your connection and try again.";
    } else {
      const data = res.data;
      error.userMessage =
        (typeof data === "string" && data) ||
        data?.message ||
        "Something went wrong. Please try again.";
    }
    return Promise.reject(error);
  }
);

export const errorMessage = (error) =>
  error?.userMessage || error?.message || "Something went wrong.";

// Rate-limited and client errors won't succeed on a blind retry.
export const shouldRetry = (failureCount, error) => {
  const status = error?.response?.status;
  if (status && status < 500) return false;
  return failureCount < 2;
};
