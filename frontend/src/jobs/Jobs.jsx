import React, { useState, useEffect } from 'react'
import Job from './job';
import { useSelector, useDispatch } from 'react-redux';
import { setSearchedQuery } from '../store/jobSlice';
import { motion } from 'framer-motion';
import JobFilterPanel from '../components/JobFilterPanel';
import JobSortControls from '../components/JobSortControls';
import JobPagination from '../components/JobPagination';
import useGetAllJobs from '../hooks/useGetAllJobs';
import { Skeleton } from '../ui/skeleton';
import { Search } from 'lucide-react';

const MotionDiv = motion.div;

const Jobs = () => {
    const { searchedQuery } = useSelector(store => store.job);
    const dispatch = useDispatch();
    const [filters, setFilters] = useState({
        skills: '',
        location: '',
        experience: '',
        minSalary: '',
        maxSalary: '',
        company: ''
    });
    const [sortBy, setSortBy] = useState('newest');
    const [page, setPage] = useState(1);
    const limit = 50;

    // Build query params
    const queryParams = {
        keyword: searchedQuery || '',
        ...filters,
        sortBy,
        page,
        limit
    };

    const { data, isLoading } = useGetAllJobs(queryParams);
    const jobs = data?.jobs || [];
    const pagination = data?.pagination || { currentPage: 1, totalPages: 1, totalJobs: 0, hasNextPage: false, hasPrevPage: false };

    useEffect(() => {
        return () => {
            dispatch(setSearchedQuery(""));
        }
    }, []);

    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
        setPage(1); // Reset to first page when filters change
    };

    const handleClearFilters = () => {
        setFilters({
            skills: '',
            location: '',
            experience: '',
            minSalary: '',
            maxSalary: '',
            company: ''
        });
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="page-container page-padding">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
                <div className="lg:sticky lg:top-20 lg:self-start">
                    <JobFilterPanel
                        onApplyFilters={handleApplyFilters}
                        onClearFilters={handleClearFilters}
                    />
                </div>

                <div className="min-w-0">
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            {(searchedQuery || filters.skills || filters.location || filters.experience || filters.company) ? (
                                <>
                                    <h2 className="section-title">
                                        {pagination.totalJobs} {pagination.totalJobs === 1 ? 'Job' : 'Jobs'} found
                                    </h2>
                                    <p className="muted mt-1 text-sm">Refine results using filters and sort.</p>
                                </>
                            ) : (
                                <>
                                    <h1 className="page-title">Find jobs</h1>
                                    <p className="muted mt-1 text-sm">Browse opportunities matched to your preferences.</p>
                                </>
                            )}
                        </div>
                        <JobSortControls sortBy={sortBy} onSortChange={setSortBy} />
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="rounded-2xl border border-border/70 bg-card p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-9 w-9 rounded-xl" />
                                    </div>
                                    <div className="mt-4 flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-xl" />
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <Skeleton className="h-4 w-40" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        <Skeleton className="h-5 w-5/6" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <Skeleton className="h-6 w-24 rounded-full" />
                                        <Skeleton className="h-6 w-20 rounded-full" />
                                        <Skeleton className="h-6 w-24 rounded-full" />
                                    </div>
                                    <div className="mt-5 flex gap-3">
                                        <Skeleton className="h-11 flex-1 rounded-xl" />
                                        <Skeleton className="h-11 flex-1 rounded-xl" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : jobs.length <= 0 ? (
                        <div className="rounded-2xl border border-border/70 bg-card p-10 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                                <Search className="h-6 w-6" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold tracking-tight">No jobs found</h3>
                            <p className="muted mt-1 text-sm">Try adjusting your filters or broaden your search.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {jobs.map((job) => (
                                    <MotionDiv
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        transition={{ duration: 0.2 }}
                                        key={job?._id}
                                    >
                                        <Job job={job} />
                                    </MotionDiv>
                                ))}
                            </div>

                            <div className="mt-8">
                                <JobPagination
                                    pagination={pagination}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Jobs
