import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts"
import axios from 'axios'
import { SUPERADMIN_API_END_POINT } from '@/utils/constant'

const COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981']

const StatCard = ({ title, value, icon, color }) => (
    <Card className="relative overflow-hidden border-0 shadow-lg">
        <div className={`absolute inset-0 opacity-10 ${color}`} />
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value ?? '—'}</p>
                </div>
                <div className={`text-3xl p-3 rounded-full bg-white shadow-md`}>
                    {icon}
                </div>
            </div>
        </CardContent>
    </Card>
)

const SuperAdminAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await axios.get(`${SUPERADMIN_API_END_POINT}/stats`, { withCredentials: true });
                if (res.data.success) {
                    setStats(res.data.stats);
                } else {
                    setError('Failed to fetch analytics data.');
                }
            } catch (err) {
                console.error('Analytics fetch error:', err);
                if (err.response?.status === 401) {
                    setError('You are not authenticated. Please log in as Super Admin.');
                } else if (err.response?.status === 403) {
                    setError('Access denied. Only Super Admins can view analytics.');
                } else {
                    setError(err.response?.data?.message || 'Failed to load analytics. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-gray-500 text-lg font-medium">Loading analytics...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md mx-auto p-8">
                <div className="text-5xl">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-800">Analytics Unavailable</h2>
                <p className="text-gray-500">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                    Retry
                </button>
            </div>
        </div>
    );

    const userData = [
        { name: 'Students', value: stats.totalStudents },
        { name: 'Recruiters', value: stats.totalRecruiters },
    ];

    const jobAppData = [
        { name: 'Total Jobs', value: stats.totalJobs },
        { name: 'Total Applications', value: stats.totalApplications },
        { name: 'Total Companies', value: stats.totalCompanies },
    ];

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='max-w-7xl mx-auto my-10 px-4 space-y-8'>
                <div>
                    <h1 className='text-4xl font-bold text-gray-900 mb-1'>System Analytics</h1>
                    <p className='text-gray-500'>Platform-wide overview and statistics</p>
                </div>

                {/* Stat Cards */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                    <StatCard title="Total Users" value={stats.totalUsers} icon="👥" color="bg-indigo-500" />
                    <StatCard title="Students" value={stats.totalStudents} icon="🎓" color="bg-purple-500" />
                    <StatCard title="Recruiters" value={stats.totalRecruiters} icon="💼" color="bg-pink-500" />
                    <StatCard title="Total Jobs" value={stats.totalJobs} icon="📋" color="bg-amber-500" />
                    <StatCard title="Applications" value={stats.totalApplications} icon="📨" color="bg-emerald-500" />
                    <StatCard title="Companies" value={stats.totalCompanies} icon="🏢" color="bg-blue-500" />
                </div>

                {/* Charts */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                    <Card className="shadow-lg border-0">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold text-gray-800">User Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={userData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                    >
                                        {userData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold text-gray-800">Jobs & Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={jobAppData} barSize={48}>
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                        {jobAppData.map((entry, index) => (
                                            <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default SuperAdminAnalytics
