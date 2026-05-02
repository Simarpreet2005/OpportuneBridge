import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { BASE_URL } from '@/utils/constant';

const useAnalytics = (timeRange = 'all') => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(
                `${BASE_URL}/analytics/recruiter?timeRange=${timeRange}`,
                { withCredentials: true }
            );

            if (res.data.success) {
                setAnalytics(res.data.analytics);
            } else {
                setError('Failed to fetch analytics data.');
                toast.error('Failed to load analytics');
            }
        } catch (err) {
            console.error('Analytics fetch error:', err);
            const msg = err.response?.status === 401
                ? 'Authentication required. Please log in.'
                : err.response?.status === 403
                    ? 'Access denied.'
                    : err.response?.data?.message || 'Failed to fetch analytics';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [timeRange]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    return { analytics, loading, error, refetch: fetchAnalytics };
};

export default useAnalytics;
