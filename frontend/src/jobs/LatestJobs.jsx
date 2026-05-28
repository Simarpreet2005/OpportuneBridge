import React from 'react'
import LatestJobCards from './LatestJobCards';
import { useSelector } from 'react-redux';
import { Briefcase, Search } from 'lucide-react';

const LatestJobs = () => {
    const { allJobs } = useSelector(store => store.job);

    // Sort by createdAt descending to show latest jobs first
    const sortedJobs = [...allJobs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const displayedJobs = sortedJobs;

    return (
        <div className='page-container my-20'>
            <h1 className='text-3xl md:text-4xl font-semibold tracking-tight'><span className='text-primary'>Latest & Top </span> Job Openings</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-5'>
                {
                    displayedJobs.length <= 0 ? (
                        <div className='col-span-full flex flex-col items-center justify-center py-16 text-center'>
                            <div className='bg-secondary rounded-full p-6 mb-4'>
                                <Briefcase className='w-12 h-12 text-muted-foreground' />
                            </div>
                            <h3 className='text-xl font-semibold text-foreground mb-2'>No jobs available</h3>
                            <p className='text-muted-foreground'>Check back later for new opportunities</p>
                        </div>
                    ) : displayedJobs.map((job) => <LatestJobCards key={job._id} job={job} />)
                }
            </div>
        </div>
    )
}

export default LatestJobs


