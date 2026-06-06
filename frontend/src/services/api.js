import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 60000,
    withCredentials: true,
    headers: {
        // Let Axios automatically set Content-Type based on request body (JSON or FormData)
    }
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error?.response?.data?.message || error?.message || "Request failed";
        return Promise.reject(new Error(message));
    }
);

export default api;
