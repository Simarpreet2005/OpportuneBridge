import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import axios from 'axios'
import { USER_API_END_POINT } from '../../utils/constant'
import { Users, Briefcase, Building, AlertTriangle, ArrowRight, UserCheck, UserX, Clock } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table'
import { Badge } from '../../ui/badge'

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
    const [suspendedUsers, setSuspendedUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSystemStats = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${USER_API_END_POINT}/admin/stats`, { withCredentials: true });
                if (res.data.success) {
                    setStats(res.data.stats);
                    setRecentUsers(res.data.recentActivity.users || []);
                    setRecentJobs(res.data.recentActivity.jobs || []);
                    setSuspendedUsers(res.data.suspendedUsers || []);
                }
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            } finally {
                setLoading(false);
            }
        }
        fetchSystemStats();
    }, []);

    if (loading) {
        return (
            <div className='min-h-[calc(100vh-4rem)] flex items-center justify-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
            </div>
        );
    }

    return (
        <div className="page-container page-padding">
                <h1 className='text-3xl font-bold mb-8'>Admin Dashboard</h1>

                {/* Stats Grid */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
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
                            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalJobs}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.totalApplications} total applications
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
                                Registered organizations
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Reports Section */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
                    {/* Suspended Users */}
                    <Card>
                        <CardHeader>
                            <div className='flex items-center justify-between'>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-warning" />
                                    Suspended Users
                                </CardTitle>
                                <Button variant="outline" size="sm" onClick={() => window.location.href = '/superadmin/users'}>
                                    Manage Users
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {suspendedUsers.length === 0 ? (
                                <div className='text-center py-8'>
                                    <UserCheck className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                                    <p className='text-muted-foreground'>No suspended users</p>
                                </div>
                            ) : (
                                <div className='space-y-3'>
                                    {suspendedUsers.slice(0, 5).map((user) => (
                                        <div key={user._id} className='flex items-center justify-between p-3 border border-border rounded-xl bg-card'>
                                            <div className='flex items-center gap-3'>
                                                <div className='h-8 w-8 rounded-full bg-warning/25 flex items-center justify-center text-warning font-bold'>
                                                    {user.fullname?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className='font-medium text-sm'>{user.fullname}</p>
                                                    <p className='text-xs text-muted-foreground'>{user.email}</p>
                                                </div>
                                            </div>
                                            <Badge variant="destructive">Suspended</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <div className='flex items-center justify-between'>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary" />
                                    Recent Activity
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-4'>
                                <div>
                                    <p className='text-sm font-medium mb-2'>Recent Users</p>
                                    <div className='space-y-2'>
                                        {recentUsers.slice(0, 3).map((user) => (
                                            <div key={user._id} className='flex items-center justify-between p-2 bg-muted/40 rounded-xl'>
                                                <span className='text-sm'>{user.fullname}</span>
                                                <Badge variant="outline">{user.role}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className='text-sm font-medium mb-2'>Recent Jobs</p>
                                    <div className='space-y-2'>
                                        {recentJobs.slice(0, 3).map((job) => (
                                            <div key={job._id} className='flex items-center justify-between p-2 bg-muted/40 rounded-xl'>
                                                <span className='text-sm'>{job.title}</span>
                                                <span className='text-xs text-muted-foreground'>{job.company?.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* User Management Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                            <Button 
                                variant="outline" 
                                className="h-auto py-4 flex flex-col items-center gap-2 bg-card"
                                onClick={() => window.location.href = '/superadmin/users'}
                            >
                                <Users className="w-6 h-6" />
                                <span>View All Users</span>
                            </Button>
                            <Button 
                                variant="outline" 
                                className="h-auto py-4 flex flex-col items-center gap-2 bg-card"
                                onClick={() => window.location.href = '/superadmin/analytics'}
                            >
                                <Briefcase className="w-6 h-6" />
                                <span>View Analytics</span>
                            </Button>
                            <Button 
                                variant="outline" 
                                className="h-auto py-4 flex flex-col items-center gap-2 bg-card"
                                onClick={() => window.location.href = '/superadmin/users'}
                            >
                                <AlertTriangle className="w-6 h-6" />
                                <span>Manage Suspensions</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
        </div>
    )
}

export default SuperAdminDashboard
