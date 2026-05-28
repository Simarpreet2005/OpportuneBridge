import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getRecruiterAnalytics } from '../services/analyticsService';

const useAnalytics = (timeRange = 'all') => {
    const query = useQuery({
        queryKey: ['recruiterAnalytics', timeRange],
        queryFn: () => getRecruiterAnalytics(timeRange),
        staleTime: 2 * 60 * 1000
    });

    useEffect(() => {
        if (query.error) {
            toast.error(query.error.message || 'Failed to fetch analytics');
        }
    }, [query.error]);

    return {
        analytics: query.data || null,
        loading: query.isLoading,
        error: query.error?.message || null,
        refetch: query.refetch
    };
};

export default useAnalytics;
