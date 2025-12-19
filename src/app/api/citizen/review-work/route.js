import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req) {
  try {
    const { issueId, action, userId, rejectionNote } = await req.json();

    // Validate required fields
    if (!issueId || !action || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: issueId, action, and userId are required" },
        { status: 400 }
      );
    }

    // Validate action
    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    // Get the issue to verify reporter
    const issueRef = doc(db, "issues", issueId);
    const issueSnap = await getDoc(issueRef);

    if (!issueSnap.exists()) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    const issueData = issueSnap.data();

    // Verify the user is the original reporter
    if (issueData.reportedBy !== userId) {
      return NextResponse.json(
        { error: "Only the original reporter can approve or reject work" },
        { status: 403 }
      );
    }

    // Verify the issue is in work_submitted status
    if (issueData.status !== "work_submitted") {
      return NextResponse.json(
        { error: "Issue must be in 'work_submitted' status for citizen review" },
        { status: 400 }
      );
    }

    // Verify user role is citizen
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists() || userSnap.data().role !== "citizen") {
      return NextResponse.json(
        { error: "Only citizens can review work" },
        { status: 403 }
      );
    }

    // Verify work proof exists
    if (!issueData.workProof || !issueData.workProof.imageUrl) {
      return NextResponse.json(
        { error: "No work proof available to review" },
        { status: 400 }
      );
    }

    // Update issue based on action
    const updateData = {
      updatedAt: serverTimestamp(),
    };

    if (action === "approve") {
      // Citizen approves the work - mark as resolved
      updateData.status = "resolved";
      updateData.resolvedAt = serverTimestamp();
      updateData.resolvedBy = userId; // Track who approved it
    } else if (action === "reject") {
      // Citizen rejects the work - send back to in_progress
      updateData.status = "in_progress";
      updateData.citizenFeedback = {
        action: "rejected",
        note: rejectionNote || "Citizen requested rework",
        timestamp: serverTimestamp(),
      };
      // Keep the work proof for reference but mark as rejected
      updateData["workProof.rejected"] = true;
      updateData["workProof.rejectionNote"] = rejectionNote || "";
    }

    await updateDoc(issueRef, updateData);

    return NextResponse.json({
      success: true,
      message: action === "approve" 
        ? "Work approved successfully. Issue marked as resolved." 
        : "Work rejected. Issue sent back for rework.",
      newStatus: updateData.status,
    });
  } catch (error) {
    console.error("Error reviewing work:", error);
    return NextResponse.json(
      { error: "Failed to review work", details: error.message },
      { status: 500 }
    );
  }
}
