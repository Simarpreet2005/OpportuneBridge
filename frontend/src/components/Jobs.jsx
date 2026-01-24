import React, { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import FilterCard from './FilterCard'
import Job from './job';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

import useGetAllJobs from '@/Hooks/useGetAllJobs';


const Jobs = () => {
    useGetAllJobs();
    const { allJobs, searchedQuery } = useSelector(store => store.job);
    const [filterJobs, setFilterJobs] = useState(allJobs);

    useEffect(() => {
        console.log("Jobs component - allJobs:", allJobs);
        console.log("Jobs component - searchedQuery:", searchedQuery);
    }, [allJobs, searchedQuery]);

    useEffect(() => {
        if (searchedQuery) {
            const filteredJobs = allJobs.filter((job) => {
                return job.title.toLowerCase().includes(searchedQuery.toLowerCase()) ||
                    job.description.toLowerCase().includes(searchedQuery.toLowerCase()) ||
                    job.location.toLowerCase().includes(searchedQuery.toLowerCase()) ||
                    (job.salary && job.salary.toString().toLowerCase().includes(searchedQuery.toLowerCase())) ||
                    (job.jobType && job.jobType.toLowerCase().includes(searchedQuery.toLowerCase()))
            })
            setFilterJobs(filteredJobs)
        } else {
            setFilterJobs(allJobs)
        }
    }, [allJobs, searchedQuery]);

    return (
        <div>
            <div className='max-w-7xl mx-auto mt-5'>
                <div className='flex gap-5'>
                    <div className='w-20%'>
                        <FilterCard />
                    </div>
                    {
                        filterJobs.length <= 0 ? (
                            <div className='flex-1 flex items-center justify-center flex-col h-[88vh]'>
                                <img src="https://cdni.iconscout.com/illustration/premium/thumb/no-data-found-illustration-download-in-svg-png-gif-file-formats--missing-error-business-user-interface-pack-illustrations-5016023.png" alt="No jobs result" className='w-48 h-48 mb-4 opacity-75 grayscale' />
                                <h3 className='text-lg font-bold text-gray-700'>No Jobs Found</h3>
                                <p className='text-gray-500'>Try adjusting your search filters or check back later.</p>
                            </div>
                        ) : (
                            <div className='flex-1 h-[88vh] overflow-y-auto pb-5'>
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                    {
                                        filterJobs.map((job) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: 100 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                transition={{ duration: 0.3 }}
                                                key={job?._id}>
                                                <Job job={job} />
                                            </motion.div>
                                        ))
                                    }
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>


        </div>
    )
}

export default Jobs