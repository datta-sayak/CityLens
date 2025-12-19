'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, query, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '@/components/Navbar';
import { CheckCircle, Clock, AlertCircle, XCircle, UserCheck } from 'lucide-react';

export default function GovernmentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [assigningIssue, setAssigningIssue] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Verify government role
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === 'government') {
          setUser(currentUser);
          fetchIssues();
          fetchWorkers();
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

  const fetchIssues = async () => {
    try {
      const issuesQuery = query(
        collection(db, 'issues'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(issuesQuery);
      const issuesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIssues(issuesData);
    } catch (error) {
      console.error('Error fetching issues:', error);
    }
  };

  const fetchWorkers = async () => {
    try {
      const usersQuery = query(collection(db, 'users'));
      const snapshot = await getDocs(usersQuery);
      const workersData = snapshot.docs
        .filter((doc) => doc.data().role === 'worker')
        .map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }));
      setWorkers(workersData);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const handleAssignWorker = async (issueId, workerId) => {
    setAssigningIssue(issueId);
    try {
      const response = await fetch('/api/issues/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueId,
          workerId,
          governmentUid: user.uid,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Issue assigned successfully!');
        setSelectedIssue(null);
        fetchIssues();
      } else {
        alert(data.error || 'Failed to assign issue');
      }
    } catch (error) {
      console.error('Error assigning worker:', error);
      alert('Failed to assign issue');
    } finally {
      setAssigningIssue(null);
    }
  };

  const handleCloseIssue = async (issueId) => {
    if (!confirm('Are you sure you want to close this issue?')) return;

    try {
      const response = await fetch('/api/issues/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueId,
          status: 'closed',
          userId: user.uid,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Issue closed successfully!');
        fetchIssues();
      } else {
        alert(data.error || 'Failed to close issue');
      }
    } catch (error) {
      console.error('Error closing issue:', error);
      alert('Failed to close issue');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'assigned':
        return <UserCheck className="w-5 h-5 text-blue-500" />;
      case 'in_progress':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'closed':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-xl text-emerald-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-2">
            Government Dashboard
          </h1>
          <p className="text-emerald-700">Manage and assign infrastructure issues</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {['pending', 'assigned', 'in_progress', 'resolved', 'closed'].map((status) => (
            <div
              key={status}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-emerald-100"
            >
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(status)}
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {status.replace('_', ' ')}
                </span>
              </div>
              <div className="text-2xl font-bold text-emerald-900">
                {issues.filter((i) => i.status === status).length}
              </div>
            </div>
          ))}
        </div>

        {/* Issues Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-emerald-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-900 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-900 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-900 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-900 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100">
                {issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-emerald-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {issue.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {issue.category || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          issue.status
                        )}`}
                      >
                        {getStatusIcon(issue.status)}
                        {issue.status?.replace('_', ' ') || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {issue.assignedTo
                        ? workers.find((w) => w.uid === issue.assignedTo)?.name ||
                          'Unknown'
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {issue.createdAt
                        ? new Date(issue.createdAt).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {issue.status === 'pending' && (
                        <button
                          onClick={() => setSelectedIssue(issue.id)}
                          className="text-emerald-600 hover:text-emerald-900 font-medium"
                        >
                          Assign Worker
                        </button>
                      )}
                      {issue.status === 'resolved' && (
                        <button
                          onClick={() => handleCloseIssue(issue.id)}
                          className="text-emerald-600 hover:text-emerald-900 font-medium"
                        >
                          Close Issue
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assignment Modal */}
        {selectedIssue && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Assign Worker
              </h3>
              <p className="text-gray-600 mb-4">
                Select a worker to assign to this issue:
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {workers.map((worker) => (
                  <button
                    key={worker.uid}
                    onClick={() => handleAssignWorker(selectedIssue, worker.uid)}
                    disabled={assigningIssue === selectedIssue}
                    className="w-full text-left px-4 py-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <div className="font-medium text-gray-900">{worker.name}</div>
                    <div className="text-sm text-gray-600">{worker.email}</div>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setSelectedIssue(null)}
                  disabled={assigningIssue === selectedIssue}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
