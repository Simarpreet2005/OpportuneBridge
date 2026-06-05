import axios from 'axios';
import { toast } from 'sonner';

// Create custom axios instance
const axiosInstance = axios.create({
    timeout: 60000, // 60 seconds timeout to survive Render cold starts
});

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Handle Render cold start 502/503 or Network Error
        if ((error.message === 'Network Error' || error.code === 'ECONNABORTED' || (error.response && (error.response.status === 502 || error.response.status === 503))) && !originalRequest._retry) {
            originalRequest._retry = true;
            originalRequest._retryCount = originalRequest._retryCount || 0;
            
            if (originalRequest._retryCount < 2) {
                originalRequest._retryCount += 1;
                toast.info("Server is waking up. This may take up to 50 seconds. Retrying...", { id: "cold-start-toast" });
                
                // Wait for 5 seconds before retrying
                await new Promise(resolve => setTimeout(resolve, 5000));
                return axiosInstance(originalRequest);
            }
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;
