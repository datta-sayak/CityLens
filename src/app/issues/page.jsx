"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TrendingUp, BarChart3, Activity, Zap } from "lucide-react";

// Line Chart Component
function LineChart({ data, height = 200 }) {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((d.value / maxValue) * 80);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full" style={{ height: `${height}px` }}>
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map(y => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#e5e7eb" strokeWidth="0.2" />
                ))}
                
                {/* Area fill */}
                <polygon
                    points={`0,100 ${points} 100,100`}
                    fill="url(#lineGradient)"
                    opacity="0.2"
                />
                
                {/* Line */}
                <polyline
                    points={points}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="0.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                
                {/* Gradient definition */}
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}

export default function PublicBoardPage() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState({
        total: 0,
        byStatus: {},
        byCategory: {},
        bySeverity: {},
        avgResolutionTime: 0,
        completionRate: 0,
        topCategories: [],
        recentTrends: []
    });

    useEffect(() => {
        fetchIssues();
    }, []);

    const fetchIssues = async () => {
        try {
            const issuesRef = collection(db, "issues");
            const q = query(issuesRef, orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            
            const issuesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setIssues(issuesData);
            calculateAnalytics(issuesData);
        } catch (error) {
            console.error("Error fetching issues:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateAnalytics = (issuesData) => {
        const total = issuesData.length;
        
        // Status breakdown
        const byStatus = issuesData.reduce((acc, issue) => {
            const status = issue.status || 'pending';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        // Category breakdown
        const byCategory = issuesData.reduce((acc, issue) => {
            const category = issue.category || 'Other';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});

        // Severity breakdown
        const bySeverity = issuesData.reduce((acc, issue) => {
            const severity = issue.severity || 'Low';
            acc[severity] = (acc[severity] || 0) + 1;
            return acc;
        }, {});

        // Calculate avg resolution time for resolved issues
        const resolvedIssues = issuesData.filter(i => i.status === 'resolved' && i.createdAt && i.resolvedAt);
        let avgResolutionTime = 0;
        if (resolvedIssues.length > 0) {
            const totalTime = resolvedIssues.reduce((sum, issue) => {
                const created = issue.createdAt?.seconds ? issue.createdAt.seconds * 1000 : new Date(issue.createdAt).getTime();
                const resolved = issue.resolvedAt?.seconds ? issue.resolvedAt.seconds * 1000 : new Date(issue.resolvedAt).getTime();
                return sum + (resolved - created);
            }, 0);
            avgResolutionTime = Math.round(totalTime / resolvedIssues.length / (1000 * 60 * 60 * 24)); // Days
        }

        // Completion rate
        const resolved = byStatus.resolved || 0;
        const closed = byStatus.closed || 0;
        const completionRate = total > 0 ? Math.round(((resolved + closed) / total) * 100) : 0;

        // Top categories
        const topCategories = Object.entries(byCategory)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count, percentage: Math.round((count / total) * 100) }));

        // Generate trend data (last 30 days)
        const trendData = [];
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            
            const count = issuesData.filter(issue => {
                const createdAt = issue.createdAt?.seconds 
                    ? new Date(issue.createdAt.seconds * 1000)
                    : new Date(issue.createdAt);
                return createdAt >= date && createdAt < nextDate;
            }).length;
            
            trendData.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: count
            });
        }

        setAnalytics({
            total,
            byStatus,
            byCategory,
            bySeverity,
            avgResolutionTime,
            completionRate,
            topCategories,
            trendData
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
            assigned: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
            in_progress: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
            work_submitted: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
            resolved: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
            closed: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' }
        };
        return colors[status] || colors.pending;
    };

    const getSeverityColor = (severity) => {
        const colors = {
            High: 'bg-red-500',
            Medium: 'bg-orange-500',
            Low: 'bg-green-500'
        };
        return colors[severity] || colors.Low;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-8 md:py-12 px-4 md:px-6 lg:px-16">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 md:mb-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900">Analytics Dashboard</h1>
                </div>
                <p className="text-gray-600 text-base md:text-lg">Infrastructure issue tracking and insights</p>
            </div>

            {/* Key Metrics */}
            <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8 md:mb-10">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 hover:border-emerald-300 transition-colors">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Total Issues</p>
                    <p className="text-4xl font-bold text-gray-900 mb-1">{analytics.total.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">All time</p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 hover:border-emerald-300 transition-colors">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Completion Rate</p>
                    <p className="text-4xl font-bold text-gray-900 mb-1">{analytics.completionRate}%</p>
                    <p className="text-sm text-gray-600">Resolved</p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 hover:border-emerald-300 transition-colors">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Avg Resolution</p>
                    <p className="text-4xl font-bold text-gray-900 mb-1">{analytics.avgResolutionTime}</p>
                    <p className="text-sm text-gray-600">Days</p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 hover:border-emerald-300 transition-colors">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Active Issues</p>
                    <p className="text-4xl font-bold text-gray-900 mb-1">
                        {((analytics.byStatus.pending || 0) + (analytics.byStatus.assigned || 0) + (analytics.byStatus.in_progress || 0) + (analytics.byStatus.work_submitted || 0)).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Open now</p>
                </div>
            </div>

            {/* Trend Chart */}
            <div className="max-w-7xl mx-auto mb-8 md:mb-10">
                <div className="bg-white border border-emerald-200 rounded-lg p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Issue Trends</h2>
                    </div>
                    <p className="text-sm text-gray-600 mb-6">Daily issue reports over the last 30 days</p>
                    
                    {analytics.trendData && analytics.trendData.length > 0 ? (
                        <>
                            <LineChart data={analytics.trendData} height={240} />
                            <div className="flex justify-between mt-4 text-xs text-slate-500">
                                <span>{analytics.trendData[0]?.date}</span>
                                <span>{analytics.trendData[Math.floor(analytics.trendData.length / 2)]?.date}</span>
                                <span>{analytics.trendData[analytics.trendData.length - 1]?.date}</span>
                            </div>
                        </>
                    ) : (
                        <div className="h-60 flex items-center justify-center text-slate-400">
                            No trend data available
                        </div>
                    )}
                </div>
            </div>
{/* Two Column Layout */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8 md:mb-10">
                {/* Status Distribution */}
                <div className="bg-white border border-slate-200 rounded-lg p-6 md:p-7">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-6">Status Breakdown</h2>
                    <div className="space-y-3">
                        {Object.entries(analytics.byStatus).map(([status, count]) => {
                            const percentage = analytics.total > 0 ? Math.round((count / analytics.total) * 100) : 0;
                            return (
                                <div key={status} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                                            {status.replace('_', ' ')}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {count.toLocaleString()} ({percentage}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-emerald-100 rounded-full h-2">
                                        <div 
                                            className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Categories */}
                <div className="bg-white border border-emerald-200 rounded-lg p-6 md:p-7">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Top Categories</h2>
                    {analytics.topCategories.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">No data available</div>
                    ) : (
                        <div className="space-y-4">
                            {analytics.topCategories.map((category, index) => {
                                const maxCount = analytics.topCategories[0].count;
                                const barWidth = (category.count / maxCount) * 100;
                                return (
                                    <div key={category.name} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 bg-emerald-700 rounded text-white text-xs font-bold flex items-center justify-center">
                                                    {index + 1}
                                                </div>
                                                <span className="font-medium text-gray-900">{category.name}</span>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {category.count.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="w-full bg-emerald-100 rounded-full h-2">
                                            <div 
                                                className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${barWidth}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Priority Distribution */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-white border border-emerald-200 rounded-lg p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="h-5 w-5 text-emerald-600" />
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Priority Levels</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Object.entries(analytics.bySeverity).map(([severity, count]) => {
                            const percentage = analytics.total > 0 ? Math.round((count / analytics.total) * 100) : 0;
                            return (
                                <div key={severity} className="bg-emerald-50 border border-emerald-200 rounded-lg p-5">
                                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                                        {severity} Priority
                                    </p>
                                    <p className="text-4xl font-bold text-gray-900 mb-2">
                                        {count.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-4">{percentage}% of total</p>
                                    <div className="w-full bg-emerald-200 rounded-full h-2">
                                        <div 
                                            className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
