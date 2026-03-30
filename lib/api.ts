import axios from "axios";

export const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// Unwrap API error messages so callers receive a plain Error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error ?? error.message;
      return Promise.reject(new Error(message));
    }
    return Promise.reject(error);
  },
);
