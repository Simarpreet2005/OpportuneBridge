import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Briefcase, Users, Plus, ArrowRight, Building } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useGetAllAdminJobs from '../../hooks/useGetAllAdminJobs'
import useGetAllCompanies from '../../hooks/useGetAllCompanies'
import axios from 'axios'
import { APPLICATION_API_END_POINT } from '../../utils/constant'

const AdminDashboard = () => {
    useGetAllAdminJobs();
    useGetAllCompanies();
    const { companies } = useSelector(store => store.company);
    const { allAdminJobs } = useSelector(store => store.job);
    const navigate = useNavigate();
    const [recentApplications, setRecentApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Calculate total applicants across all jobs
    const totalApplicants = allAdminJobs?.reduce((sum, job) => sum + (job.applications?.length || 0), 0) || 0;

    // Fetch recent applications
    React.useEffect(() => {
        const fetchRecentApplications = async () => {
            try {
                setLoading(true);
                // Get applications from the most recent jobs
                const recentJobs = allAdminJobs?.slice(0, 5) || [];
                const applicationPromises = recentJobs.map(job =>
                    axios.get(`${APPLICATION_API_END_POINT}/${job._id}/applicants`, { withCredentials: true })
                );
                const responses = await Promise.all(applicationPromises);
                const allApplications = responses.flatMap(res => res.data.job?.applications || []);
                setRecentApplications(allApplications.slice(0, 10));
            } catch (error) {
                console.error('Failed to fetch recent applications', error);
            } finally {
                setLoading(false);
            }
        };

        if (allAdminJobs?.length > 0) {
            fetchRecentApplications();
        } else {
            setLoading(false);
        }
    }, [allAdminJobs]);

    return (
        <div className="page-container page-padding">
                {/* Header */}
                <div className='flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4'>
                    <div>
                        <h1 className="page-title">Recruiter dashboard</h1>
                        <p className='text-muted-foreground mt-1'>Manage your job postings and applications</p>
                    </div>
                    <div className='flex gap-3'>
                        <Button onClick={() => navigate("/admin/companies/create")} variant="outline">
                            Register Company
                        </Button>
                        <Button onClick={() => navigate("/admin/jobs/create")}>
                            <Plus className='w-4 h-4 mr-2' /> Post New Job
                        </Button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Posted Jobs</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{allAdminJobs?.length || 0}</div>
                            <p className="text-xs text-muted-foreground">Active job postings</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalApplicants}</div>
                            <p className="text-xs text-muted-foreground">Across all jobs</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Companies</CardTitle>
                            <Building className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{companies?.length || 0}</div>
                            <p className="text-xs text-muted-foreground">Registered organizations</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Job Performance */}
                <Card className='mb-8'>
                    <CardHeader>
                        <div className='flex items-center justify-between'>
                            <CardTitle>Job Performance</CardTitle>
                            <Button variant="outline" size="sm" onClick={() => navigate("/admin/jobs")}>
                                View All <ArrowRight className='ml-2 w-4 h-4' />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {allAdminJobs?.length === 0 ? (
                            <div className='text-center py-8'>
                                <Briefcase className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                                <p className='text-muted-foreground'>No jobs posted yet</p>
                                <Button variant="outline" className='mt-4' onClick={() => navigate("/admin/jobs/create")}>
                                    Post Your First Job
                                </Button>
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                {allAdminJobs.slice(0, 5).map((job) => (
                                    <div key={job._id} className='flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors'>
                                        <div className='flex items-center gap-4'>
                                            <div className='h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center'>
                                                <Briefcase className='w-5 h-5 text-primary' />
                                            </div>
                                            <div>
                                                <p className='font-medium'>{job.title}</p>
                                                <p className='text-sm text-muted-foreground'>{job.company?.name}</p>
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-4'>
                                            <div className='text-right'>
                                                <p className='text-sm font-medium'>{job.applications?.length || 0}</p>
                                                <p className='text-xs text-muted-foreground'>Applicants</p>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)}>
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Applications */}
                <Card>
                    <CardHeader>
                        <div className='flex items-center justify-between'>
                            <CardTitle>Recent Applications</CardTitle>
                            <Button variant="outline" size="sm" onClick={() => navigate("/admin/jobs")}>
                                View All <ArrowRight className='ml-2 w-4 h-4' />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className='text-center py-8'>
                                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
                            </div>
                        ) : recentApplications.length === 0 ? (
                            <div className='text-center py-8'>
                                <Users className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                                <p className='text-muted-foreground'>No applications yet</p>
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                {recentApplications.map((application) => (
                                    <div key={application._id} className='flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors'>
                                        <div className='flex items-center gap-4'>
                                            <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold'>
                                                {application.applicant?.fullname?.[0] || 'A'}
                                            </div>
                                            <div>
                                                <p className='font-medium'>{application.applicant?.fullname}</p>
                                                <p className='text-sm text-muted-foreground'>Applied for {application.job?.title}</p>
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-4'>
                                            <Badge variant="outline">{application.status}</Badge>
                                            <span className='text-xs text-muted-foreground'>
                                                {new Date(application.createdAt).toLocaleDateString()}
                                            </span>
                                            <Button variant="outline" size="sm" onClick={() => navigate(`/admin/jobs/${application.job?._id}/applicants`)}>
                                                Review
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
        </div>
    )
}

export default AdminDashboard
