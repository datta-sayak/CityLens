"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { MapPin, Calendar, FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

function Badge({ variant = "default", children, className }) {
    const variants = {
        default: "border border-black text-black bg-white",
        success: "bg-gray-100 text-gray-400 decoration-gray-400 line-through",
        warning: "border border-black text-black",
        blue: "bg-black text-white border-transparent",
    };
    return (
        <div className={cn("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium", variants[variant], className)}>
            {children}
        </div>
    );
}

function StatusBadge({ status }) {
    switch (status) {
        case "OPEN": return <Badge variant="warning">Open</Badge>;
        case "IN_PROGRESS": return <Badge variant="blue">In Progress</Badge>;
        case "RESOLVED": return <Badge variant="success">Resolved</Badge>;
        default: return <Badge variant="default">{status}</Badge>;
    }
}

export default function MyReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");

    useEffect(() => {
        // In a real app, we'd filter by auth.currentUser.uid
        // For demo purposes, showing all reports (or could use localStorage userId)
        const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reportsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReports(reportsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredReports = filter === "ALL"
        ? reports
        : reports.filter(r => r.status === filter);

    const stats = {
        all: reports.length,
        open: reports.filter(r => r.status === "OPEN").length,
        inProgress: reports.filter(r => r.status === "IN_PROGRESS").length,
        resolved: reports.filter(r => r.status === "RESOLVED").length,
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">My Reports</h1>
                <p className="text-muted-foreground">Track the status of your submitted infrastructure issues.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 border-b overflow-x-auto">
                {[
                    { label: "All", value: "ALL", count: stats.all },
                    { label: "Open", value: "OPEN", count: stats.open },
                    { label: "In Progress", value: "IN_PROGRESS", count: stats.inProgress },
                    { label: "Resolved", value: "RESOLVED", count: stats.resolved },
                ].map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value)}
                        className={cn(
                            "px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors",
                            filter === tab.value
                                ? "border-black text-black"
                                : "border-transparent text-gray-500 hover:text-black"
                        )}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-[280px] rounded-lg border border-gray-100 bg-gray-50 p-6 animate-pulse">
                            <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                            <div className="h-32 bg-muted rounded mb-4"></div>
                            <div className="h-4 bg-muted rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : filteredReports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReports.map((report) => (
                        <div key={report.id} className="rounded-lg border border-gray-200 bg-white flex flex-col overflow-hidden hover:border-black transition-colors">
                            <div className="relative h-40 w-full bg-muted">
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
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{report.title}</h3>
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
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
                <div className="text-center py-16">
                    <FileQuestion className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No {filter.toLowerCase().replace("_", " ")} reports</h3>
                    <p className="text-muted-foreground mb-6">
                        {filter === "ALL"
                            ? "You haven't submitted any reports yet."
                            : `You don't have any ${filter.toLowerCase().replace("_", " ")} reports.`}
                    </p>
                    <Link
                        href="/report"
                        className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 text-sm font-medium transition-colors"
                    >
                        Report Your First Issue
                    </Link>
                </div>
            )}
        </div>
    );
}
