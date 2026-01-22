import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

// Color palette
const COLORS = {
    primary: '#6366f1',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    gray: '#6b7280'
};

const STATUS_COLORS = {
    pending: '#f59e0b',
    accepted: '#10b981',
    rejected: '#ef4444'
};

// Applications Over Time Line Chart
export const ApplicationsLineChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Applications Trend</CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center text-gray-400">
                    No data available
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">Applications Over Time</CardTitle>
                <p className="text-sm text-gray-500">Daily application count for the last 30 days</p>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return `${date.getMonth() + 1}/${date.getDate()}`;
                            }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                            labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <Line
                            type="monotone"
                            dataKey="applications"
                            stroke={COLORS.primary}
                            strokeWidth={3}
                            dot={{ fill: COLORS.primary, r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

// Application Status Donut Chart
export const StatusDonutChart = ({ data }) => {
    if (!data) {
        return null;
    }

    const chartData = [
        { name: 'Pending', value: data.pending, color: STATUS_COLORS.pending },
        { name: 'Accepted', value: data.accepted, color: STATUS_COLORS.accepted },
        { name: 'Rejected', value: data.rejected, color: STATUS_COLORS.rejected }
    ].filter(item => item.value > 0);

    if (chartData.length === 0) {
        return (
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Application Status</CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center text-gray-400">
                    No applications yet
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">Application Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value, entry) => `${value}: ${entry.payload.value}`}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

// Top Jobs Bar Chart
export const TopJobsBarChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Top Performing Jobs</CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center text-gray-400">
                    No jobs posted yet
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">Top 5 Jobs by Applications</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis
                            dataKey="title"
                            type="category"
                            width={150}
                            tick={{ fontSize: 11 }}
                            tickFormatter={(value) => value.length > 20 ? value.substring(0, 20) + '...' : value}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                            formatter={(value, name) => [value, name === 'applicants' ? 'Applications' : 'Accepted']}
                        />
                        <Legend />
                        <Bar dataKey="applicants" fill={COLORS.primary} radius={[0, 8, 8, 0]} />
                        <Bar dataKey="accepted" fill={COLORS.success} radius={[0, 8, 8, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

// Applicant Funnel Visualization
export const ApplicantFunnelChart = ({ data }) => {
    if (!data) {
        return null;
    }

    const funnelData = [
        { stage: 'Applied', count: data.applied, percentage: 100 },
        { stage: 'Reviewed', count: data.reviewed, percentage: data.applied > 0 ? (data.reviewed / data.applied * 100).toFixed(1) : 0 },
        { stage: 'Accepted', count: data.accepted, percentage: data.applied > 0 ? (data.accepted / data.applied * 100).toFixed(1) : 0 }
    ];

    return (
        <Card className="border-none shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">Applicant Funnel</CardTitle>
                <p className="text-sm text-gray-500">Conversion rates through hiring stages</p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {funnelData.map((stage, index) => (
                        <div key={stage.stage} className="relative">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-700">{stage.stage}</span>
                                <span className="text-sm font-bold text-gray-900">{stage.count} ({stage.percentage}%)</span>
                            </div>
                            <div className="h-12 bg-gray-100 rounded-lg overflow-hidden relative">
                                <div
                                    className={`h-full transition-all duration-500 flex items-center justify-center text-white font-bold text-sm ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-indigo-500' : 'bg-green-500'
                                        }`}
                                    style={{ width: `${stage.percentage}%` }}
                                >
                                    {stage.percentage > 15 && `${stage.percentage}%`}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
