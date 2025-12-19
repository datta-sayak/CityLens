"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react";

const STATUS_STYLES = {
  OPEN: "border border-blue-600 text-blue-600",
  IN_PROGRESS: "bg-blue-600 text-white",
  RESOLVED: "bg-gray-100 text-gray-400",
};

function TaskCard({ task }) {
  const [updating, setUpdating] = useState(false);

  const updateStatus = async (newStatus) => {
    if (!confirm(`Are you sure you want to mark this task as ${newStatus}?`)) return;
    
    setUpdating(true);
    try {
      await updateDoc(doc(db, "issues", task.id), {
        status: newStatus,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 flex flex-col gap-4 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-100/50 transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-xl line-clamp-1 text-gray-900">{task.title}</h3>
          <div className="mt-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${STATUS_STYLES[task.status]}`}>
              {task.status.replace("_", " ")}
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-500 whitespace-nowrap">
          {task.createdAt?.seconds ? new Date(task.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
        </div>
      </div>

      {task.imageUrl && (
        <div className="rounded-md overflow-hidden h-32 w-full bg-gray-100">
          <img src={task.imageUrl} alt="Evidence" className="h-full w-full object-cover" />
        </div>
      )}

      <p className="text-sm text-gray-600 line-clamp-3 flex-1">{task.description}</p>

      <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-gray-100">
        {task.status === "OPEN" && (
          <button 
            onClick={() => updateStatus("IN_PROGRESS")} 
            disabled={updating}
            className="w-full h-10 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium inline-flex items-center justify-center disabled:opacity-50"
          >
            {updating && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            Start Working
          </button>
        )}
        {task.status === "IN_PROGRESS" && (
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => updateStatus("RESOLVED")} 
              disabled={updating}
              className="h-10 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium inline-flex items-center justify-center disabled:opacity-50"
            >
              {updating && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Mark Resolved
            </button>
            <button 
              onClick={() => updateStatus("OPEN")} 
              disabled={updating}
              className="h-10 px-4 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium inline-flex items-center justify-center disabled:opacity-50"
            >
              {updating && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Re-open
            </button>
          </div>
        )}
        {task.status === "RESOLVED" && (
          <button 
            onClick={() => updateStatus("IN_PROGRESS")} 
            disabled={updating}
            className="w-full h-10 px-4 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium inline-flex items-center justify-center disabled:opacity-50"
          >
            {updating && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            Re-open Case
          </button>
        )}
      </div>
    </div>
  );
}

export default function WorkerDashboard() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push("/login?redirect=/workers");
    } else if (userData?.role !== 'worker') {
      router.push("/");
    }
  }, [user, userData, authLoading, router]);

  useEffect(() => {
    const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const stats = {
    open: tasks.filter(t => t.status === "OPEN").length,
    inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
    resolved: tasks.filter(t => t.status === "RESOLVED").length
  };

  if (authLoading || !user || userData?.role !== 'worker') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-10 px-4 md:px-24">
      <div className="container mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg shadow-green-500/30 mb-6">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">Worker Dashboard</h1>
          <p className="text-gray-600 text-lg">Manage and update infrastructure issues reported by citizens.</p>
        </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-green-100/50 border-2 border-green-100 p-8 hover:scale-105 transition-transform">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Pending</p>
                            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">{stats.open}</h2>
                        </div>
                        <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <AlertCircle className="h-7 w-7 text-white" />
                        </div>
                    </div>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-emerald-100/50 border-2 border-emerald-100 p-8 hover:scale-105 transition-transform">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">In Progress</p>
                            <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">{stats.inProgress}</h2>
                        </div>
                        <div className="h-14 w-14 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <Clock className="h-7 w-7 text-white" />
                        </div>
                    </div>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-green-100/50 border-2 border-green-100 p-8 hover:scale-105 transition-transform">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Resolved</p>
                            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-800 bg-clip-text text-transparent">{stats.resolved}</h2>
                        </div>
                        <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <CheckCircle className="h-7 w-7 text-white" />
                        </div>
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
    </div>
  );
}
