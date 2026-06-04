import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Briefcase, Bookmark, Clock, ArrowRight, FileText, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { toast } from 'sonner';
import ApplicationStatusBadge from '../../components/ApplicationStatusBadge';
import SkillGapInsights from '../../components/SkillGapInsights';
import { Skeleton } from '../../ui/skeleton';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [recentJobs, setRecentJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch applied jobs
                const appliedRes = await api.get("/application/get");
                if (appliedRes.data.success) {
                    setAppliedJobs(appliedRes.data.application || []);
                }
            } catch (error) {
                console.error('Failed to fetch applied jobs', error);
            }

            try {
                // Fetch saved jobs from user profile
                const userRes = await api.get("/user/me");
                if (userRes.data.success && userRes.data.user.profile?.savedJobs) {
                    // Fetch saved job details
                    const savedJobsPromises = userRes.data.user.profile.savedJobs.map(jobId =>
                        api.get(`/job/${jobId}`)
                    );
                    const savedJobsResponses = await Promise.all(savedJobsPromises);
                    setSavedJobs(savedJobsResponses.map(res => res.data.job).filter(Boolean));
                }
            } catch (error) {
                console.error('Failed to fetch saved jobs', error);
            }

            try {
                // Fetch recent jobs
                const jobsRes = await api.get("/job/get?limit=6");
                if (jobsRes.data.success) {
                    setRecentJobs(jobsRes.data.jobs || []);
                }
            } catch (error) {
                console.error('Failed to fetch recent jobs', error);
            }
            
            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="page-container page-padding space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-72" />
                    <Skeleton className="h-5 w-56" />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-2xl border border-border/70 bg-card p-6">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-8 w-8 rounded-xl" />
                            </div>
                            <div className="mt-4 space-y-2">
                                <Skeleton className="h-8 w-16" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="rounded-2xl border border-border/70 bg-card p-6">
                    <Skeleton className="h-6 w-48" />
                    <div className="mt-4 space-y-3">
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container page-padding">
            <div className="mb-8">
                <h1 className="page-title">Welcome back, {user?.fullname}</h1>
                <p className="muted mt-2 text-sm md:text-base">Track your job search progress</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Applied jobs</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold tracking-tight">{appliedJobs.length}</div>
                        <p className="text-xs text-muted-foreground">Total applications</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saved jobs</CardTitle>
                        <Bookmark className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold tracking-tight">{savedJobs.length}</div>
                        <p className="text-xs text-muted-foreground">Bookmarked positions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent opportunities</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold tracking-tight">{recentJobs.length}</div>
                        <p className="text-xs text-muted-foreground">New job postings</p>
                    </CardContent>
                </Card>
            </div>

                {/* Skill Gap Insights */}
            <div className="mb-8">
                <SkillGapInsights />
            </div>

                {/* Application Progress */}
            <Card className="mb-8">
                    <CardHeader>
                        <div className='flex items-center justify-between'>
                            <CardTitle>Application progress</CardTitle>
                            <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                                View All <ArrowRight className='ml-2 w-4 h-4' />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {appliedJobs.length === 0 ? (
                            <div className='text-center py-8'>
                                <FileText className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                                <p className='text-muted-foreground'>No applications yet</p>
                                <Button variant="outline" className='mt-4' onClick={() => navigate('/jobs')}>
                                    Browse Jobs
                                </Button>
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                {appliedJobs.slice(0, 5).map((application) => (
                                    <div key={application._id} className='flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors'>
                                        <div className='flex items-center gap-4'>
                                            <div className='h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center'>
                                                <Building className='w-5 h-5 text-primary' />
                                            </div>
                                            <div>
                                                <p className='font-medium'>{application.job?.title}</p>
                                                <p className='text-sm text-muted-foreground'>{application.job?.company?.name}</p>
                                            </div>
                                        </div>
                                        <ApplicationStatusBadge status={application.status} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Saved Jobs */}
            <Card className="mb-8">
                    <CardHeader>
                        <div className='flex items-center justify-between'>
                            <CardTitle>Saved Jobs</CardTitle>
                            <Button variant="outline" size="sm" onClick={() => navigate('/jobs')}>
                                Browse More <ArrowRight className='ml-2 w-4 h-4' />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {savedJobs.length === 0 ? (
                            <div className='text-center py-8'>
                                <Bookmark className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                                <p className='text-muted-foreground'>No saved jobs yet</p>
                                <Button variant="outline" className='mt-4' onClick={() => navigate('/jobs')}>
                                    Browse Jobs
                                </Button>
                            </div>
                        ) : (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {savedJobs.slice(0, 4).map((job) => (
                                    <div key={job._id} className='p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer' onClick={() => navigate(`/jobs/${job._id}`)}>
                                        <div className='flex items-start justify-between'>
                                            <div>
                                                <p className='font-medium'>{job.title}</p>
                                                <p className='text-sm text-muted-foreground'>{job.company?.name}</p>
                                                <p className='text-sm text-muted-foreground mt-1'>{job.location}</p>
                                            </div>
                                            <Badge variant="outline">${job.salary}L</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Opportunities */}
            <Card>
                    <CardHeader>
                        <div className='flex items-center justify-between'>
                            <CardTitle>Recent Opportunities</CardTitle>
                            <Button variant="outline" size="sm" onClick={() => navigate('/jobs')}>
                                View All <ArrowRight className='ml-2 w-4 h-4' />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {recentJobs.map((job) => (
                                <div key={job._id} className='p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer' onClick={() => navigate(`/jobs/${job._id}`)}>
                                    <div className='flex items-start justify-between'>
                                        <div>
                                            <p className='font-medium'>{job.title}</p>
                                            <p className='text-sm text-muted-foreground'>{job.company?.name}</p>
                                            <p className='text-sm text-muted-foreground mt-1'>{job.location}</p>
                                        </div>
                                        <Badge variant="outline">${job.salary}L</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
        </div>
    );
};

export default StudentDashboard;
