import React, { useEffect, useState } from 'react'
import FilterCard from './FilterCard'
import Job from './job';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

import useGetAllJobs from '@/Hooks/useGetAllJobs';


const Jobs = () => {
    useGetAllJobs();
    const { allJobs, searchedQuery } = useSelector(store => store.job);
    const [filterJobs, setFilterJobs] = useState(allJobs);
    const [selectedFilters, setSelectedFilters] = useState({
        Location: [],
        Industry: [],
        "Opportunity Type": [],
        Salary: [],
    });

    useEffect(() => {
        const normalizedQuery = searchedQuery?.trim().toLowerCase() || "";

        const filteredJobs = allJobs.filter((job) => {
            const matchesSearch = !normalizedQuery || [
                job.title,
                job.description,
                job.location,
                job.jobType,
                job.salary?.toString(),
                job?.company?.name
            ]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(normalizedQuery));

            const matchesLocation = selectedFilters.Location.length === 0
                || selectedFilters.Location.some((location) => job.location?.toLowerCase().includes(location.toLowerCase()));

            const matchesIndustry = selectedFilters.Industry.length === 0
                || selectedFilters.Industry.some((industry) => job.title?.toLowerCase().includes(industry.toLowerCase()));

            const matchesOpportunityType = selectedFilters["Opportunity Type"].length === 0
                || selectedFilters["Opportunity Type"].some((type) => job.jobType?.toLowerCase() === type.toLowerCase());

            const matchesSalary = selectedFilters.Salary.length === 0 || selectedFilters.Salary.some((range) => {
                const salary = Number(job.salary);
                if (Number.isNaN(salary)) return false;
                if (range === "0-40k") return salary <= 40000;
                if (range === "42k-1lakh") return salary >= 42000 && salary <= 100000;
                if (range === "1lakh to 5lakh") return salary >= 100000 && salary <= 500000;
                return false;
            });

            return matchesSearch && matchesLocation && matchesIndustry && matchesOpportunityType && matchesSalary;
        });

        setFilterJobs(filteredJobs);
    }, [allJobs, searchedQuery, selectedFilters]);

    return (
        <div>
            <div className='max-w-7xl mx-auto mt-5'>
                <div className='flex gap-5'>
                    <div className='w-20%'>
                        <FilterCard selectedFilters={selectedFilters} onFilterChange={setSelectedFilters} />
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