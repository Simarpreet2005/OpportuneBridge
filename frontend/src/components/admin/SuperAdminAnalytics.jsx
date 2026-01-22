import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import axios from 'axios'
import { USER_API_END_POINT, SUPERADMIN_API_END_POINT } from '@/utils/constant'

const SuperAdminAnalytics = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${SUPERADMIN_API_END_POINT}/stats`, { withCredentials: true });
                if (res.data.success) {
                    setStats(res.data.stats);
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchStats();
    }, []);

    if (!stats) return <div className="p-10">Loading analytics...</div>;

    const userData = [
        { name: 'Students', value: stats.totalStudents },
        { name: 'Recruiters', value: stats.totalRecruiters },
        { name: 'Total Users', value: stats.totalUsers },
    ];

    const jobData = [
        { name: 'Total Jobs', value: stats.totalJobs },
        { name: 'Applications', value: stats.totalApplications },
    ];

    return (
        <div className='max-w-7xl mx-auto my-10 px-4'>
            <h1 className='text-3xl font-bold mb-8'>System Analytics</h1>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                <Card>
                    <CardHeader>
                        <CardTitle>User Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={userData}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Job & Application Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={jobData}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default SuperAdminAnalytics
