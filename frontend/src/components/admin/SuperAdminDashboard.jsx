import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { Users, Briefcase, Building, FileText, Activity } from 'lucide-react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Badge } from '../ui/badge'

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalRecruiters: 0,
        totalJobs: 0,
        totalCompanies: 0,
        totalApplications: 0
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentJobs, setRecentJobs] = useState([]);

    useEffect(() => {
        const fetchSystemStats = async () => {
            try {
                const res = await axios.get(`${USER_API_END_POINT}/admin/stats`, { withCredentials: true });
                if (res.data.success) {
                    setStats(res.data.stats);
                    setRecentUsers(res.data.recentActivity.users);
                    setRecentJobs(res.data.recentActivity.jobs);
                }
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            }
        }
        fetchSystemStats();
    }, []);

    return (
        <div>

            <div className='max-w-7xl mx-auto my-10 px-4'>
                <h1 className='text-3xl font-bold mb-8'>Super Admin Dashboard</h1>

                {/* Stats Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10'>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalUsers}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.totalStudents} Students, {stats.totalRecruiters} Recruiters
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalJobs}</div>
                            <p className="text-xs text-muted-foreground">
                                Active Opportunities
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Companies</CardTitle>
                            <Building className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
                            <p className="text-xs text-muted-foreground">
                                Registered Organizations
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Applications</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalApplications}</div>
                            <p className="text-xs text-muted-foreground">
                                Processed so far
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity Section */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                    {/* Recent Users Table */}
                    <div className='bg-white rounded-xl shadow-md p-6'>
                        <div className='flex items-center gap-2 mb-4'>
                            <Activity className='w-5 h-5 text-blue-600' />
                            <h2 className='text-xl font-bold'>Recent Users</h2>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No.</TableHead>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentUsers?.map((user, index) => (
                                    <TableRow key={user._id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="font-medium">{user.fullname}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'recruiter' ? 'secondary' : 'outline'}>{user.role}</Badge>
                                        </TableCell>
                                        <TableCell>{user.createdAt?.split("T")[0]}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Recent Jobs Table */}
                    <div className='bg-white rounded-xl shadow-md p-6'>
                        <div className='flex items-center gap-2 mb-4'>
                            <Activity className='w-5 h-5 text-green-600' />
                            <h2 className='text-xl font-bold'>Recent Jobs</h2>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No.</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentJobs?.map((job, index) => (
                                    <TableRow key={job._id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="font-medium">{job.title}</TableCell>
                                        <TableCell>{job.company?.name}</TableCell>
                                        <TableCell>{job.createdAt?.split("T")[0]}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SuperAdminDashboard
