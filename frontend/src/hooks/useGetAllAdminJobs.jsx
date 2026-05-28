import { setAllAdminJobs } from '../store/jobSlice'
import { getAdminJobs } from '../services/jobService'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const useGetAllAdminJobs = () => {
    const dispatch = useDispatch();
    const query = useQuery({
        queryKey: ['adminJobs'],
        queryFn: getAdminJobs
    });

    useEffect(() => {
        if (query.data) {
            dispatch(setAllAdminJobs(query.data));
        }
    }, [dispatch, query.data]);

    return query;
}

export default useGetAllAdminJobs
