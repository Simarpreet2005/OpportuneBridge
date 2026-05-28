import { setAllJobs } from '../store/jobSlice'
import { getJobs } from '../services/jobService'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const useGetAllJobs = (params = {}) => {
    const dispatch = useDispatch();
    const queryParams = { limit: 50, ...params };
    const query = useQuery({
        queryKey: ['jobs', queryParams],
        queryFn: () => getJobs(queryParams)
    });

    useEffect(() => {
        if (query.data) {
            dispatch(setAllJobs(query.data.jobs || []));
        }
    }, [dispatch, query.data]);

    return query;
}

export default useGetAllJobs
