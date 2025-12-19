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
        case "OPEN": return <Badge variant="destructive">Open</Badge>;
        case "IN_PROGRESS": return <Badge variant="default">In Progress</Badge>;
        case "RESOLVED": return <Badge variant="secondary">Resolved</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
}

export default function MyReportsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login?redirect=/dashboard");
            return;
        }

        if (user) {
            const q = query(
                collection(db, "issues"),
                where("userId", "==", user.uid),
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

    const filteredReports = filter === "ALL"
        ? reports
        : reports.filter(r => r.status === filter);

    const stats = {
        all: reports.length,
        open: reports.filter(r => r.status === "OPEN").length,
        inProgress: reports.filter(r => r.status === "IN_PROGRESS").length,
        resolved: reports.filter(r => r.status === "RESOLVED").length,
    };

    if (authLoading || (!user && loading)) {
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-10 px-4 md:px-24">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg shadow-green-500/30 mb-6">
                        <FileQuestion className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">My Reports</h1>
                    <p className="text-gray-600 text-lg">Track the status of your submitted infrastructure issues.</p>
                </div>

                {/* Filter Tabs */}
                <Tabs value={filter} onValueChange={setFilter} className="mb-8">
                    <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg">
                        <TabsTrigger value="ALL">All ({stats.all})</TabsTrigger>
                        <TabsTrigger value="OPEN">Open ({stats.open})</TabsTrigger>
                        <TabsTrigger value="IN_PROGRESS">In Progress ({stats.inProgress})</TabsTrigger>
                        <TabsTrigger value="RESOLVED">Resolved ({stats.resolved})</TabsTrigger>
                    </TabsList>
                </Tabs>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="rounded-2xl border-2 border-gray-200 bg-white/80 backdrop-blur-xl flex flex-col overflow-hidden shadow-lg">
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
                            <div key={report.id} className="rounded-2xl border-2 border-gray-200 bg-white/80 backdrop-blur-xl flex flex-col overflow-hidden hover:shadow-2xl hover:scale-105 transition-all">
                                <div className="relative h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200">
                                {report.imageUrl ? (
                                    <img src={report.imageUrl} alt={report.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        <FileQuestion className="h-12 w-12" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <StatusBadge status={report.status} />
                                </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="font-bold text-xl mb-2 line-clamp-1 text-gray-900">{report.title}</h3>
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-5 flex-1">
                                    {report.description}
                                </p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
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
                                            className="flex items-center hover:text-primary transition-colors"
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
                    <div className="text-center py-20 bg-white/80 backdrop-blur-xl rounded-2xl border-2 border-gray-200 shadow-lg">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 mb-6">
                            <FileQuestion className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-gray-900">No {filter.toLowerCase().replace("_", " ")} reports</h3>
                        <p className="text-gray-600 mb-8 text-lg">
                        {filter === "ALL"
                            ? "You haven't submitted any reports yet."
                            : `You don't have any ${filter.toLowerCase().replace("_", " ")} reports.`}
                    </p>
                    <Button asChild>
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
