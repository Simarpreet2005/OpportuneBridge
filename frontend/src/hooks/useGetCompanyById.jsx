import { setSingleCompany } from '../store/companySlice'
import { getCompanyById } from '../services/companyService'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const useGetCompanyById = (companyId) => {
    const dispatch = useDispatch();
    const query = useQuery({
        queryKey: ['company', companyId],
        queryFn: () => getCompanyById(companyId),
        enabled: Boolean(companyId)
    });

    useEffect(() => {
        if (query.data) {
            dispatch(setSingleCompany(query.data));
        }
    }, [dispatch, query.data]);

    return query;
}

export default useGetCompanyById
