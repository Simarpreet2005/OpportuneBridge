import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Briefcase, Building, Users, Plus, ArrowRight, TrendingUp, Clock, Target, Loader2, Calendar, Award } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useGetAllAdminJobs from '@/Hooks/useGetAllAdminJobs'
import useGetAllCompanies from '@/Hooks/useGetAllCompanies'
import useAnalytics from '@/Hooks/useAnalytics'
import { ApplicationsLineChart, StatusDonutChart, TopJobsBarChart, ApplicantFunnelChart } from './AnalyticsCharts'

const AdminDashboard = () => {
    useGetAllAdminJobs();
    useGetAllCompanies();
    const { allAdminJobs } = useSelector(store => store.job);
    const { companies } = useSelector(store => store.company);
    const navigate = useNavigate();

    const [timeRange, setTimeRange] = useState('30');
    const { analytics, loading } = useAnalytics(timeRange);

    const timeRanges = [
        { label: '7 Days', value: '7' },
        { label: '30 Days', value: '30' },
        { label: '90 Days', value: '90' },
        { label: 'All Time', value: 'all' }
    ];

    if (loading) {
        return (
            <div className='min-h-screen bg-[#f8f9fc] flex items-center justify-center'>
                <Loader2 className='w-8 h-8 animate-spin text-primary' />
            </div>
        );
    }

    const overview = analytics?.overview || {};
    const statusBreakdown = analytics?.statusBreakdown || {};
    const timeSeries = analytics?.timeSeries || [];
    const topJobs = analytics?.topJobs || [];
    const recentActivity = analytics?.recentActivity || [];
    const funnel = analytics?.funnel || {};

    return (
        <div className='min-h-screen bg-[#f8f9fc]'>
            <div className='max-w-7xl mx-auto px-4 py-8 lg:py-12'>
                {/* Header */}
                <div className='flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4'>
                    <div>
                        <h1 className='text-4xl font-extrabold tracking-tight text-gray-900'>Analytics Dashboard</h1>
                        <p className='text-lg text-gray-500 mt-1'>Monitor your hiring pipeline and performance metrics</p>
                    </div>
                    <div className='flex gap-3'>
                        <Button onClick={() => navigate("/admin/companies/create")} variant="outline" className="rounded-xl border-2">
                            Register Company
                        </Button>
                        <Button onClick={() => navigate("/admin/jobs/create")} className="rounded-xl bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-transform h-12 px-6">
                            <Plus className='w-5 h-5 mr-2' /> Post New Job
                        </Button>
                    </div>
                </div>

                {/* Time Range Filter */}
                <div className='flex gap-2 mb-8 overflow-x-auto pb-2'>
                    {timeRanges.map((range) => (
                        <Button
                            key={range.value}
                            variant={timeRange === range.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTimeRange(range.value)}
                            className={`rounded-full ${timeRange === range.value ? 'shadow-lg' : ''}`}
                        >
                            <Calendar className='w-4 h-4 mr-2' />
                            {range.label}
                        </Button>
                    ))}
                </div>

                {/* Key Metrics Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10'>
                    {/* Total Applications */}
                    <Card className="border-none shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
                        <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16'></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-blue-100 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                <Users className='w-4 h-4' />
                                Total Applications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black">{overview.totalApplications || 0}</div>
                            <p className='text-blue-100 text-sm mt-2'>Across {overview.totalJobs || 0} jobs</p>
                        </CardContent>
                    </Card>

                    {/* Application Rate */}
                    <Card className="border-none shadow-sm bg-white">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-gray-400 text-sm font-bold uppercase tracking-wider">Application Rate</CardTitle>
                            <TrendingUp className="h-5 w-5 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-gray-900">{overview.applicationRate || 0}</div>
                            <p className="text-sm text-gray-500 mt-2">Applications per job</p>
                        </CardContent>
                    </Card>

                    {/* Acceptance Rate */}
                    <Card className="border-none shadow-sm bg-white">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-gray-400 text-sm font-bold uppercase tracking-wider">Acceptance Rate</CardTitle>
                            <Target className="h-5 w-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-gray-900">{overview.acceptanceRate || 0}%</div>
                            <p className="text-sm text-gray-500 mt-2">
                                {statusBreakdown.accepted || 0} accepted
                            </p>
                        </CardContent>
                    </Card>

                    {/* Avg Time to Hire */}
                    <Card className="border-none shadow-sm bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-purple-100 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                <Clock className='w-4 h-4' />
                                Avg Time to Hire
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black">{overview.avgTimeToHire || 0}</div>
                            <p className='text-purple-100 text-sm mt-2'>Days on average</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10'>
                    <ApplicationsLineChart data={timeSeries} />
                    <StatusDonutChart data={statusBreakdown} />
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10'>
                    <TopJobsBarChart data={topJobs} />
                    <ApplicantFunnelChart data={funnel} />
                </div>

                {/* Bottom Section */}
                <div className='grid gap-8 md:grid-cols-1 lg:grid-cols-3'>
                    {/* Recent Activity */}
                    <Card className="lg:col-span-2 border-none shadow-xl shadow-gray-200/50 rounded-[2rem] overflow-hidden">
                        <CardHeader className="border-b border-gray-50 bg-white/50 backdrop-blur-md p-8">
                            <div className='flex items-center justify-between'>
                                <CardTitle className="text-2xl font-bold">Recent Activity</CardTitle>
                                <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 rounded-xl" onClick={() => navigate("/admin/jobs")}>
                                    View All <ArrowRight className='ml-2 w-4 h-4' />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className='divide-y divide-gray-50'>
                                {recentActivity.length > 0 ? recentActivity.map((activity) => (
                                    <div key={activity.id} className='p-6 hover:bg-blue-50/30 transition-all flex items-center justify-between'>
                                        <div className='flex items-center gap-4'>
                                            <div className='h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-lg'>
                                                {activity.applicantName?.[0] || 'A'}
                                            </div>
                                            <div>
                                                <p className='font-bold text-gray-900'>{activity.applicantName}</p>
                                                <p className='text-sm text-gray-500'>Applied for {activity.jobTitle}</p>
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-4'>
                                            <Badge className={`${activity.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                activity.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {activity.status}
                                            </Badge>
                                            <span className='text-xs text-gray-400'>
                                                {new Date(activity.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className='p-20 text-center'>
                                        <Briefcase className='w-12 h-12 text-gray-200 mx-auto mb-4' />
                                        <p className='text-gray-400 font-medium'>No recent activity</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Companies Card */}
                    <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[2rem] bg-gray-900 text-white overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-bold">Your Companies</CardTitle>
                            <p className='text-gray-400 text-sm'>Managed organizations</p>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <div className='space-y-6 mt-6'>
                                {companies.slice(0, 4).map((company) => (
                                    <div key={company._id} className='flex items-center justify-between bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors'>
                                        <div className='flex items-center gap-4'>
                                            <div className='h-10 w-10 overflow-hidden rounded-xl bg-white/10 p-1'>
                                                <img src={company.logo} alt="" className='h-full w-full object-cover rounded-lg' />
                                            </div>
                                            <span className='font-bold text-gray-100'>{company.name}</span>
                                        </div>
                                        <Button variant="outline" size="sm" className="rounded-lg border-white/20 hover:bg-white hover:text-gray-900 text-xs px-4" onClick={() => navigate(`/admin/companies/${company._id}`)}>Edit</Button>
                                    </div>
                                ))}
                                <Button
                                    variant="ghost"
                                    className="w-full mt-4 h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 font-bold"
                                    onClick={() => navigate("/admin/companies")}
                                >
                                    View All Companies
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
