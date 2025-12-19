"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { MapPin, Calendar, FileQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

function StatusBadge({ status }) {
    switch (status) {
        case "pending": return <Badge variant="destructive">Pending</Badge>;
        case "assigned": return <Badge variant="default">Assigned</Badge>;
        case "in_progress": return <Badge variant="default">In Progress</Badge>;
        case "work_submitted": return <Badge className="bg-purple-600 text-white hover:bg-purple-700">Awaiting Your Approval</Badge>;
        case "resolved": return <Badge variant="secondary">Resolved</Badge>;
        case "closed": return <Badge variant="outline">Closed</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
}

export default function MyReportsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [reviewingIssue, setReviewingIssue] = useState(null);
    const [reviewAction, setReviewAction] = useState(false);
    const [rejectionNote, setRejectionNote] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login?redirect=/citizen");
            return;
        }

        if (user) {
            const q = query(
                collection(db, "issues"),
                where("reportedBy", "==", user.uid),
                orderBy("createdAt", "desc")
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const reportsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setReports(reportsData);
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, [user, authLoading, router]);

    const handleReviewWork = async (issueId, action) => {
        if (action === 'reject' && !rejectionNote.trim()) {
            alert('Add a reason for rejecting');
            return;
        }

        setReviewAction(true);
        try {
            const response = await fetch('/api/citizen/review-work', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    issueId,
                    action,
                    userId: user.uid,
                    rejectionNote: action === 'reject' ? rejectionNote : undefined,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                setReviewingIssue(null);
                setRejectionNote('');
            } else {
                alert(data.error || 'Something went wrong');
            }
        } catch (error) {
            console.error('Error reviewing work:', error);
            alert('Something went wrong');
        } finally {
            setReviewAction(false);
        }
    };

    const filteredReports = filter === "ALL"
        ? reports
        : reports.filter(r => r.status === filter);

    const stats = {
        all: reports.length,
        pending: reports.filter(r => r.status === "pending").length,
        assigned: reports.filter(r => r.status === "assigned").length,
        inProgress: reports.filter(r => r.status === "in_progress").length,
        workSubmitted: reports.filter(r => r.status === "work_submitted").length,
        resolved: reports.filter(r => r.status === "resolved").length,
        closed: reports.filter(r => r.status === "closed").length,
    };

    if (authLoading || (!user && loading)) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full"></div></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6 md:py-10 px-4 md:px-6 lg:px-24">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 md:mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-lg bg-emerald-600 mb-4 md:mb-6">
                        <FileQuestion className="h-7 w-7 md:h-8 md:w-8 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-3">My Reports</h1>
                    <p className="text-gray-600 text-base md:text-lg">Track the status of your submitted infrastructure issues.</p>
                </div>

                {/* Filter Tabs */}
                <Tabs value={filter} onValueChange={setFilter} className="mb-6 md:mb-8">
                    <TabsList className="grid w-full max-w-full md:max-w-3xl grid-cols-2 sm:grid-cols-3 md:grid-cols-6 bg-white border border-gray-200 h-auto gap-1 p-1">
                        <TabsTrigger value="ALL" className="text-xs md:text-sm">All ({stats.all})</TabsTrigger>
                        <TabsTrigger value="pending" className="text-xs md:text-sm">Pending ({stats.pending})</TabsTrigger>
                        <TabsTrigger value="assigned" className="text-xs md:text-sm hidden sm:block">Assigned ({stats.assigned})</TabsTrigger>
                        <TabsTrigger value="in_progress" className="text-xs md:text-sm">Progress ({stats.inProgress})</TabsTrigger>
                        <TabsTrigger value="work_submitted" className="text-xs md:text-sm">Review ({stats.workSubmitted})</TabsTrigger>
                        <TabsTrigger value="resolved" className="text-xs md:text-sm">Resolved ({stats.resolved})</TabsTrigger>
                    </TabsList>
                </Tabs>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="rounded-lg border border-gray-200 bg-white flex flex-col overflow-hidden">
                                <Skeleton className="h-48 w-full" />
                            <div className="p-5">
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-full mb-1" />
                                <Skeleton className="h-4 w-2/3 mb-4" />
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                ) : filteredReports.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredReports.map((report) => (
                            <div key={report.id} className="rounded-lg border border-gray-200 bg-white flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                                <div className="relative h-48 w-full bg-gray-50">
                                {report.imageUrl ? (
                                    <img src={report.imageUrl} alt={report.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        <FileQuestion className="h-12 w-12" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <StatusBadge status={report.status} />
                                </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="font-bold text-xl mb-2 line-clamp-1 text-gray-900">{report.title}</h3>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {report.category && (
                                            <Badge variant="outline" className="text-xs">{report.category}</Badge>
                                        )}
                                        {report.severity && (
                                            <Badge 
                                                variant={report.severity === 'High' ? 'destructive' : report.severity === 'Medium' ? 'default' : 'secondary'}
                                                className="text-xs"
                                            >
                                                Severity: {report.severity}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-5 flex-1">
                                        {report.description}
                                    </p>

                                    {/* Work Submitted - Citizen Review Section */}
                                    {report.status === "work_submitted" && report.workProof && (
                                        <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                            <div className="text-sm font-semibold text-purple-900 mb-2">Work submitted</div>
                                            {report.workProof.imageUrl && (
                                                <div className="mb-3 rounded-md overflow-hidden border border-purple-200">
                                                    <img 
                                                        src={report.workProof.imageUrl} 
                                                        alt="Work proof" 
                                                        className="w-full h-32 object-cover cursor-pointer hover:opacity-90"
                                                        onClick={() => window.open(report.workProof.imageUrl, '_blank')}
                                                    />
                                                </div>
                                            )}
                                            {report.workProof.note && (
                                                <p className="text-xs text-gray-700 mb-3 italic">"{report.workProof.note}"</p>
                                            )}
                                            
                                            {reviewingIssue === report.id ? (
                                                <div className="space-y-2">
                                                    <textarea
                                                        value={rejectionNote}
                                                        onChange={(e) => setRejectionNote(e.target.value)}
                                                        placeholder="Why are you rejecting this?"
                                                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                        rows="2"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleReviewWork(report.id, 'approve')}
                                                            disabled={reviewAction}
                                                            className="flex-1 px-3 py-2 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-700 disabled:opacity-50"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReviewWork(report.id, 'reject')}
                                                            disabled={reviewAction}
                                                            className="flex-1 px-3 py-2 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setReviewingIssue(null);
                                                            setRejectionNote('');
                                                        }}
                                                        className="w-full px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setReviewingIssue(report.id)}
                                                    className="w-full px-3 py-2 bg-purple-600 text-white text-xs font-medium rounded-md hover:bg-purple-700"
                                                >
                                                    Review
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
                                    <div className="flex items-center">
                                        <Calendar className="mr-1 h-3 w-3" />
                                        {report.createdAt?.seconds
                                            ? new Date(report.createdAt.seconds * 1000).toLocaleDateString()
                                            : 'Just now'}
                                    </div>
                                    {report.location && (
                                        <a
                                            href={`https://www.google.com/maps?q=${report.location.lat},${report.location.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center hover:text-emerald-600 transition-colors"
                                        >
                                            <MapPin className="mr-1 h-3 w-3" />
                                            View Map
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-lg bg-gray-50 mb-6">
                            <FileQuestion className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-gray-900">No {filter.toLowerCase().replace("_", " ")} reports</h3>
                        <p className="text-gray-600 mb-8 text-lg">
                        {filter === "ALL"
                            ? "You haven't submitted any reports yet."
                            : `You don't have any ${filter.toLowerCase().replace("_", " ")} reports.`}
                    </p>
                    <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700">
                        <Link href="/report">
                            Report Your First Issue
                        </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
