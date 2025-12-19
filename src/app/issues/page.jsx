"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckCircle, Clock, AlertCircle, MapPin } from "lucide-react";

export default function PublicBoardPage() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, resolved: 0, inProgress: 0 });

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

            // Calculate stats
            const total = issuesData.length;
            const resolved = issuesData.filter(i => i.status === "resolved").length;
            const inProgress = issuesData.filter(i => i.status === "in-progress").length;
            setStats({ total, resolved, inProgress });
        } catch (error) {
            console.error("Error fetching issues:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "resolved":
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case "in-progress":
                return <Clock className="h-5 w-5 text-blue-600" />;
            default:
                return <AlertCircle className="h-5 w-5 text-orange-600" />;
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            resolved: "bg-green-100 text-green-700 border-green-200",
            "in-progress": "bg-blue-100 text-blue-700 border-blue-200",
            pending: "bg-orange-100 text-orange-700 border-orange-200"
        };
        return styles[status] || styles.pending;
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "Recently";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-16 px-6 md:px-24">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg shadow-green-500/30 mb-8">
                    <AlertCircle className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">Public Issue Board</h1>
                <p className="text-gray-600 text-xl">Transparency in action - track reported infrastructure issues in real-time</p>
            </div>

            {/* Stats Overview */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-green-100/50 border-2 border-green-100 p-8 hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Reports</p>
                            <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mt-2">{stats.total}</p>
                        </div>
                        <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <AlertCircle className="h-8 w-8 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-emerald-100/50 border-2 border-emerald-100 p-8 hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">In Progress</p>
                            <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mt-2">{stats.inProgress}</p>
                        </div>
                        <div className="h-16 w-16 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <Clock className="h-8 w-8 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-green-100/50 border-2 border-green-100 p-8 hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Resolved</p>
                            <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-800 bg-clip-text text-transparent mt-2">{stats.resolved}</p>
                        </div>
                        <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <CheckCircle className="h-8 w-8 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Issues List */}
            <div className="max-w-7xl mx-auto">
                {issues.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No issues reported yet</h3>
                        <p className="text-gray-600">Check back later for updates</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {issues.map((issue) => (
                            <div key={issue.id} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all">
                                {/* Image */}
                                {issue.imageUrl && (
                                    <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200">
                                        <img
                                            src={issue.imageUrl}
                                            alt={issue.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* Content */}
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{issue.title}</h3>
                                        {getStatusIcon(issue.status)}
                                    </div>

                                    <p className="text-sm text-gray-600 line-clamp-2 mb-5">{issue.description}</p>

                                    {/* Location */}
                                    {issue.location && (
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                            <MapPin className="h-4 w-4" />
                                            <span>{issue.location.lat.toFixed(4)}, {issue.location.lng.toFixed(4)}</span>
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusBadge(issue.status)}`}>
                                            {issue.status === "in-progress" ? "In Progress" : issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                                        </span>
                                        <span className="text-xs text-gray-500">{formatDate(issue.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Progress Message */}
            {stats.total > 0 && (
                <div className="max-w-7xl mx-auto mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                    <p className="text-blue-900 font-medium">
                        🎉 {stats.resolved > 0 ? `${stats.resolved} issue${stats.resolved !== 1 ? 's' : ''} resolved!` : 'Your government is actively working on reported issues.'} 
                        {stats.inProgress > 0 && ` ${stats.inProgress} currently in progress.`}
                    </p>
                </div>
            )}
        </div>
    );
}
