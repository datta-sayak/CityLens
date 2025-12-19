import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export async function POST(req) {
  try {
    const { issueId, status, userId, notes } = await req.json();

    if (!issueId || !status || !userId) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Valid status transitions
    const validTransitions = {
      pending: ['assigned'],
      assigned: ['in_progress'],
      in_progress: ['resolved'],
      resolved: ['closed'],
    };

    // Get user role
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userRole = userDoc.data().role;

    // Get current issue
    const issueDoc = await getDoc(doc(db, 'issues', issueId));
    if (!issueDoc.exists()) {
      return Response.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }

    const issue = issueDoc.data();
    const currentStatus = issue.status || 'pending';

    // Validate status transition
    if (!validTransitions[currentStatus]?.includes(status)) {
      return Response.json(
        { error: `Cannot transition from ${currentStatus} to ${status}` },
        { status: 400 }
      );
    }

    // Role-based authorization
    if (status === 'assigned' && userRole !== 'government') {
      return Response.json(
        { error: 'Only government can assign issues' },
        { status: 403 }
      );
    }

    if ((status === 'in_progress' || status === 'resolved') && userRole !== 'worker') {
      return Response.json(
        { error: 'Only workers can update work status' },
        { status: 403 }
      );
    }

    if (userRole === 'worker' && issue.assignedTo !== userId) {
      return Response.json(
        { error: 'Worker can only update their assigned issues' },
        { status: 403 }
      );
    }

    if (status === 'closed' && userRole !== 'government') {
      return Response.json(
        { error: 'Only government can close issues' },
        { status: 403 }
      );
    }

    // Update issue
    const updateData = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (notes) {
      updateData.notes = notes;
    }

    if (status === 'in_progress') {
      updateData.startedAt = new Date().toISOString();
    }

    if (status === 'resolved') {
      updateData.resolvedAt = new Date().toISOString();
    }

    if (status === 'closed') {
      updateData.closedAt = new Date().toISOString();
      updateData.closedBy = userId;
    }

    const issueRef = doc(db, 'issues', issueId);
    await updateDoc(issueRef, updateData);

    return Response.json({
      success: true,
      message: 'Issue status updated successfully',
    });
  } catch (error) {
    console.error('Error updating issue status:', error);
    return Response.json(
      { error: 'Failed to update issue status' },
      { status: 500 }
    );
  }
}
