"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// Reusing Button component - in a real app this would be imported
function Button({ className, variant = "default", size = "default", loading, children, ...props }) {
    const variants = {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        success: "bg-green-600 text-white hover:bg-green-700",
    };
    const sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
    };
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
}

function TaskCard({ task }) {
    const [updating, setUpdating] = useState(false);

    const updateStatus = async (newStatus) => {
        if (!confirm(`Are you sure you want to mark this task as ${newStatus}?`)) return;
        setUpdating(true);
        try {
            const taskRef = doc(db, "issues", task.id);
            await updateDoc(taskRef, {
                status: newStatus,
                updatedAt: new Date() // Ideally serverTimestamp
            });
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    const StatusIndicator = ({ status }) => {
        const styles = {
            OPEN: "border border-blue-600 text-blue-600",
            IN_PROGRESS: "bg-blue-600 text-white",
            RESOLVED: "bg-gray-100 text-gray-400",
        };
        return (
            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${styles[status]}`}>
                {status.replace("_", " ")}
            </span>
        )
    };

    return (
        <div className="bg-card text-card-foreground rounded-lg border border-gray-200 p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-lg line-clamp-1">{task.title}</h3>
                    <div className="mt-1">
                        <StatusIndicator status={task.status} />
                    </div>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {task.createdAt?.seconds ? new Date(task.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                </div>
            </div>

            {task.imageUrl && (
                <div className="rounded-md overflow-hidden h-32 w-full bg-muted">
                    <img src={task.imageUrl} alt="Evidence" className="h-full w-full object-cover" />
                </div>
            )}

            <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{task.description}</p>

            <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-gray-100">
                {task.status === "OPEN" && (
                    <Button onClick={() => updateStatus("IN_PROGRESS")} loading={updating} className="w-full bg-blue-600 text-white hover:bg-blue-700">
                        Start Working
                    </Button>
                )}
                {task.status === "IN_PROGRESS" && (
                    <div className="grid grid-cols-2 gap-2">
                        <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => updateStatus("RESOLVED")} loading={updating}>
                            Mark Resolved
                        </Button>
                        <Button variant="outline" onClick={() => updateStatus("OPEN")} loading={updating}>
                            Re-open
                        </Button>
                    </div>
                )}
                {task.status === "RESOLVED" && (
                    <Button variant="outline" onClick={() => updateStatus("IN_PROGRESS")} loading={updating} className="w-full">
                        Re-open Case
                    </Button>
                )}
            </div>
        </div>
    );
}

export default function WorkerDashboard() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app we might filter by assigned worker, but here we show all for transparency/demo
        const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTasks(tasksData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const stats = {
        open: tasks.filter(t => t.status === "OPEN").length,
        inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
        resolved: tasks.filter(t => t.status === "RESOLVED").length
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-12 border-b border-gray-100 pb-8">
                <h1 className="text-5xl font-bold tracking-tight mb-4 text-blue-900">Worker Portal</h1>
                <p className="text-xl text-gray-500">Manage infrastructure issues and update citizens in real-time.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-white p-6 rounded-none border-l-4 border-blue-600">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-blue-600 uppercase tracking-widest mb-1">Pending</p>
                            <h2 className="text-4xl font-bold">{stats.open}</h2>
                        </div>
                        <AlertCircle className="h-6 w-6 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-none border-l-4 border-blue-400">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-blue-400 uppercase tracking-widest mb-1">In Progress</p>
                            <h2 className="text-4xl font-bold">{stats.inProgress}</h2>
                        </div>
                        <Clock className="h-6 w-6 text-blue-400" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-none border-l-4 border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-1">Resolved</p>
                            <h2 className="text-4xl font-bold text-gray-400">{stats.resolved}</h2>
                        </div>
                        <CheckCircle className="h-6 w-6 text-gray-400" />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {tasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </div>
            )}
        </div>
    );
}
