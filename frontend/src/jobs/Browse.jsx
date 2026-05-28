import React, { useEffect } from 'react'
import Navbar from '../shared/Navbar'
import Job from './job';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '../store/jobSlice';
import useGetAllJobs from '../hooks/useGetAllJobs';


const Browse = () => {
    const { allJobs, searchedQuery } = useSelector(store => store.job);
    useGetAllJobs({ keyword: searchedQuery || '' });
    const dispatch = useDispatch();
    useEffect(() => {
        return () => {
            dispatch(setSearchedQuery(""));
        }
    }, [])
    
    const displayedJobs = allJobs;

    return (
        <div>
            <div className='max-w-7xl mx-auto my-10'>
                <h1 className='font-bold text-xl my-10'>Search Results ({allJobs.length})</h1>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {
                        displayedJobs.map((job) => {
                            return (
                                <Job key={job._id} job={job} />
                            )
                        })
                    }
                </div>

            </div>
        </div>
    )
}

export default Browse


