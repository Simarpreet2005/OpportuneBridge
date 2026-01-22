import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const useAnalytics = (timeRange = 'all') => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await axios.get(
                    `http://localhost:8000/api/v1/analytics/recruiter?timeRange=${timeRange}`,
                    { withCredentials: true }
                );

                if (res.data.success) {
                    setAnalytics(res.data.analytics);
                }
            } catch (err) {
                console.error('Analytics fetch error:', err);
                setError(err.response?.data?.message || 'Failed to fetch analytics');
                toast.error('Failed to load analytics');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [timeRange]);

    return { analytics, loading, error };
};

export default useAnalytics;
