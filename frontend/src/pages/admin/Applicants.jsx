import React, { useEffect, useState } from 'react'
import ApplicantsTable from './ApplicantsTable'
import RankedApplicantsTable from './RankedApplicantsTable'
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '../../utils/constant';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAllApplicants } from '../../store/applicationSlice';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Search, Filter } from 'lucide-react';

const statusOptions = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];

const Applicants = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const { applicants } = useSelector(store => store.application);

    // Filter states
    const [status, setStatus] = useState('all');
    const [search, setSearch] = useState('');
    const [skills, setSkills] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const [viewMode, setViewMode] = useState('all'); // 'all' or 'ranked'
    const [rankedCandidates, setRankedCandidates] = useState([]);
    const [loadingRanked, setLoadingRanked] = useState(false);

    useEffect(() => {
        const fetchAllApplicants = async () => {
            try {
                // Build query params
                const queryParams = new URLSearchParams();
                if (status && status !== 'all') queryParams.append('status', status);
                if (search) queryParams.append('search', search);
                if (skills) queryParams.append('skills', skills);
                if (sortBy) queryParams.append('sortBy', sortBy);

                const res = await axios.get(`${APPLICATION_API_END_POINT}/${params.id}/applicants?${queryParams.toString()}`, { withCredentials: true });
                dispatch(setAllApplicants(res.data.job));
            } catch (error) {
                console.error(error);
            }
        }
        
        // Debounce fetch if search or skills change
        const timeoutId = setTimeout(() => {
            fetchAllApplicants();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [params.id, status, search, skills, sortBy, dispatch]);

    useEffect(() => {
        if (viewMode === 'ranked') {
            const fetchRankedCandidates = async () => {
                setLoadingRanked(true);
                try {
                    const res = await axios.get(`${JOB_API_END_POINT}/${params.id}/ranked-candidates`, { withCredentials: true });
                    if (res.data.success) {
                        setRankedCandidates(res.data.rankedCandidates);
                    }
                } catch (error) {
                    console.error("Failed to fetch ranked candidates:", error);
                } finally {
                    setLoadingRanked(false);
                }
            };
            fetchRankedCandidates();
        }
    }, [viewMode, params.id]);

    return (
        <div className="page-container page-padding">
                <div className='flex flex-col md:flex-row md:items-center justify-between mb-8'>
                    <h1 className='font-bold text-2xl'>Applicants ({applicants?.applications?.length || 0})</h1>
                </div>

                {/* Filters */}
                <div className="bg-card p-4 rounded-2xl shadow-card border border-border mb-6 space-y-4">
                    <div className="flex items-center gap-2 mb-2 text-foreground/80 font-semibold">
                        <Filter className="w-5 h-5" />
                        <h2>Filter Applicants</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search name or email"
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        
                        <div>
                            <Input
                                placeholder="Filter by skills (comma separated)"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                            />
                        </div>

                        <div>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    {statusOptions.map(opt => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b mb-6">
                    <button 
                        className={`px-4 py-2 font-semibold ${viewMode === 'all' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setViewMode('all')}
                    >
                        All Applicants
                    </button>
                    <button 
                        className={`px-4 py-2 font-semibold ${viewMode === 'ranked' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setViewMode('ranked')}
                    >
                        Ranked View
                    </button>
                </div>

                {viewMode === 'all' ? (
                    <ApplicantsTable />
                ) : (
                    loadingRanked ? (
                        <div className="flex justify-center p-8 text-muted-foreground">Loading ranked candidates...</div>
                    ) : (
                        <RankedApplicantsTable rankedCandidates={rankedCandidates} />
                    )
                )}
        </div>
    )
}

export default Applicants


