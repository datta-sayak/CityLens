import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export async function POST(req) {
  try {
    const { issueId, workerId, governmentUid } = await req.json();

    if (!issueId || !workerId || !governmentUid) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify government role
    const govDoc = await getDoc(doc(db, 'users', governmentUid));
    if (!govDoc.exists() || govDoc.data().role !== 'government') {
      return Response.json(
        { error: 'Unauthorized: Only government can assign issues' },
        { status: 403 }
      );
    }

    // Verify worker exists and has worker role
    const workerDoc = await getDoc(doc(db, 'users', workerId));
    if (!workerDoc.exists() || workerDoc.data().role !== 'worker') {
      return Response.json(
        { error: 'Invalid worker' },
        { status: 400 }
      );
    }

    // Update issue
    const issueRef = doc(db, 'issues', issueId);
    await updateDoc(issueRef, {
      assignedTo: workerId,
      assignedBy: governmentUid,
      status: 'assigned',
      assignedAt: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      message: 'Issue assigned successfully',
    });
  } catch (error) {
    console.error('Error assigning issue:', error);
    return Response.json(
      { error: 'Failed to assign issue' },
      { status: 500 }
    );
  }
}
