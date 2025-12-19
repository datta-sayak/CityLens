import { NextResponse } from "next/server";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const { issueId, imageBase64, note, userId } = await req.json();

    // Validate required fields
    if (!issueId || !imageBase64 || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: issueId, imageBase64, and userId are required" },
        { status: 400 }
      );
    }

    // Get the issue to verify worker assignment
    const issueRef = doc(db, "issues", issueId);
    const issueSnap = await getDoc(issueRef);

    if (!issueSnap.exists()) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    const issueData = issueSnap.data();

    // Verify the worker is assigned to this issue
    if (issueData.assignedTo !== userId) {
      return NextResponse.json(
        { error: "You are not assigned to this issue" },
        { status: 403 }
      );
    }

    // Verify the issue is in_progress status
    if (issueData.status !== "in_progress") {
      return NextResponse.json(
        { error: "Issue must be in 'in_progress' status to submit proof" },
        { status: 400 }
      );
    }

    // Verify user role is worker
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists() || userSnap.data().role !== "worker") {
      return NextResponse.json(
        { error: "Only workers can submit proof of work" },
        { status: 403 }
      );
    }

    // Upload image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
      folder: "citylens/work-proof",
      resource_type: "image",
    });

    // Update issue with work proof and change status to work_submitted
    await updateDoc(issueRef, {
      workProof: {
        imageUrl: uploadResponse.secure_url,
        note: note || "",
        submittedAt: serverTimestamp(),
        submittedBy: userId,
      },
      status: "work_submitted",
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: "Work proof submitted successfully",
      imageUrl: uploadResponse.secure_url,
    });
  } catch (error) {
    console.error("Error submitting work proof:", error);
    return NextResponse.json(
      { error: "Failed to submit work proof", details: error.message },
      { status: 500 }
    );
  }
}
