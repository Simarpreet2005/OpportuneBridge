import { setCompanies } from '../store/companySlice'
import { getCompanies } from '../services/companyService'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const useGetAllCompanies = () => {
    const dispatch = useDispatch();
    const query = useQuery({
        queryKey: ['companies'],
        queryFn: getCompanies
    });

    useEffect(() => {
        if (query.data) {
            dispatch(setCompanies(query.data));
        }
    }, [dispatch, query.data]);

    return query;
}

export default useGetAllCompanies
