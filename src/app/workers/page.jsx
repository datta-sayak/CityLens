"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "@/components/Navbar";
import { CheckCircle, Clock, AlertCircle, PlayCircle } from "lucide-react";

const STATUS_STYLES = {
  assigned: "border border-emerald-600 text-emerald-600",
  in_progress: "bg-emerald-600 text-white",
  work_submitted: "bg-purple-600 text-white",
  resolved: "bg-green-600 text-white",
};

function TaskCard({ task, onUpdateStatus, onSubmitProof, updating, submittingProof }) {
  const [notes, setNotes] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [proofNote, setProofNote] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProof = () => {
    if (!proofImage) {
      alert('Please upload a proof image');
      return;
    }
    onSubmitProof(task.id, previewUrl, proofNote);
  };

  return (
    <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 flex flex-col gap-4 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-100/50 transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-xl line-clamp-1 text-gray-900">{task.title}</h3>
          <div className="mt-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${STATUS_STYLES[task.status] || 'bg-gray-100 text-gray-600'}`}>
              {task.status?.replace("_", " ").toUpperCase() || 'ASSIGNED'}
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-500 whitespace-nowrap">
          {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}
        </div>
      </div>

      {task.imageUrl && (
        <div className="rounded-md overflow-hidden h-32 w-full bg-gray-100">
          <img src={task.imageUrl} alt="Evidence" className="h-full w-full object-cover" />
        </div>
      )}

      <p className="text-sm text-gray-600 line-clamp-3 flex-1">{task.description}</p>

      <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-gray-100">
        {task.status === "assigned" && (
          <button 
            onClick={() => onUpdateStatus(task.id, "in_progress")} 
            disabled={updating}
            className="w-full px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-medium disabled:opacity-50"
          >
            <PlayCircle className="h-4 w-4 inline mr-2" />
            Start Working
          </button>
        )}
        {task.status === "in_progress" && (
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-700">Submit Work Proof</div>
            
            {/* Image Upload */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Proof Image *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {previewUrl && (
                <div className="mt-2 rounded-md overflow-hidden border border-gray-200">
                  <img src={previewUrl} alt="Proof preview" className="w-full h-32 object-cover" />
                </div>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Work Notes (Optional)</label>
              <textarea
                value={proofNote}
                onChange={(e) => setProofNote(e.target.value)}
                placeholder="Describe the work completed..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                rows="2"
              />
            </div>

            <button 
              onClick={handleSubmitProof}
              disabled={submittingProof || !proofImage}
              className="w-full px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-medium disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4 inline mr-2" />
              Submit Work for Review
            </button>
          </div>
        )}
        {task.status === "work_submitted" && (
          <div className="text-center text-sm text-purple-700 font-medium py-2 bg-purple-50 rounded-md">
            ⏳ Awaiting Citizen Approval
          </div>
        )}
        {task.status === "resolved" && (
          <div className="text-center text-sm text-green-700 font-medium py-2 bg-green-50 rounded-md">
            ✓ Approved by Citizen
          </div>
        )}
      </div>
    </div>
  );
}

export default function WorkerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [submittingProof, setSubmittingProof] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Verify worker role
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === 'worker') {
          setUser(currentUser);
          fetchAssignedIssues(currentUser.uid);
        } else {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchAssignedIssues = async (workerUid) => {
    try {
      const issuesQuery = query(
        collection(db, 'issues'),
        where('assignedTo', '==', workerUid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(issuesQuery);
      const issuesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(issuesData);
    } catch (error) {
      console.error('Error fetching assigned issues:', error);
    }
  };

  const handleUpdateStatus = async (issueId, newStatus, notes = '') => {
    setUpdating(true);
    try {
      const response = await fetch('/api/issues/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueId,
          status: newStatus,
          userId: user.uid,
          notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Status updated successfully!');
        fetchAssignedIssues(user.uid);
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmitProof = async (issueId, imageBase64, note) => {
    setSubmittingProof(true);
    try {
      const response = await fetch('/api/worker/submit-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueId,
          imageBase64,
          note,
          userId: user.uid,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Work proof submitted successfully! Awaiting citizen approval.');
        fetchAssignedIssues(user.uid);
      } else {
        alert(data.error || 'Failed to submit work proof');
      }
    } catch (error) {
      console.error('Error submitting proof:', error);
      alert('Failed to submit work proof');
    } finally {
      setSubmittingProof(false);
    }
  };

  const stats = {
    assigned: tasks.filter(t => t.status === "assigned").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    workSubmitted: tasks.filter(t => t.status === "work_submitted").length,
    resolved: tasks.filter(t => t.status === "resolved").length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Worker Dashboard</h1>
          <p className="text-gray-600 text-sm md:text-base">Manage your assigned infrastructure issues</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-lg p-4 md:p-6 shadow border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Assigned</p>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{stats.assigned}</h2>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border-2 border-emerald-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">In Progress</p>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{stats.inProgress}</h2>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 md:p-6 shadow border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Pending Review</p>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{stats.workSubmitted}</h2>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 md:p-6 shadow border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Approved</p>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{stats.resolved}</h2>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        {tasks.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow border border-gray-200">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assigned Issues</h3>
            <p className="text-gray-600">You don't have any issues assigned to you yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onUpdateStatus={handleUpdateStatus}
                onSubmitProof={handleSubmitProof}
                updating={updating}
                submittingProof={submittingProof}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
