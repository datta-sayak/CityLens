"use client";

import { useState, useEffect } from "react";
import { Upload, MapPin, Loader2, CheckCircle } from "lucide-react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function ReportPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (user === null) {
      router.push("/login");
    }
  }, [user, router]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [location, setLocation] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalyzed, setAiAnalyzed] = useState(false);
  const [aiData, setAiData] = useState(null);

  // Show loading while checking authentication
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (user === null) {
    return null;
  }

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location: ", error);
        alert("Error getting location. Please enable location services.");
      }
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = async () => {
      setPreviewUrl(reader.result);
      
      // Auto-trigger AI analysis
      setAnalyzing(true);
      setAiAnalyzed(false);
      
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: reader.result }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.isDefect) {
            setAiData(data);
            setFormData({ title: data.title || "", description: data.description || "" });
            setAiAnalyzed(true);
          }
        }
      } catch (error) {
        console.error("Analysis error:", error);
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      alert("Please upload an image before submitting.");
      return;
    }

    if (!location) {
      alert("Please capture your location before submitting.");
      return;
    }

    console.log("Form submitted - starting...");
    setLoading(true);

    try {
      console.log("Uploading image to Cloudinary...", imageFile.name);

      // Upload to Cloudinary
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: previewUrl }),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { url: imageUrl } = await response.json();

      console.log("Image uploaded successfully:", imageUrl);

      console.log("Saving to Firestore...");
      const docRef = await addDoc(collection(db, "issues"), {
        title: formData.title,
        description: formData.description,
        location: location || null,
        imageUrl,
        category: aiData?.defectType || "Uncategorized",
        severity: aiData?.severity || "Unknown",
        reportedBy: user.uid,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      console.log("Report saved successfully:", docRef.id);
      setSuccess(true);
      setTimeout(() => router.push("/issues"), 2000);
    } catch (error) {
      console.error("Error submitting report:", error);
      console.error("Error details:", error.message, error.code);
      alert(`Failed to submit report: ${error.message}`);
      setLoading(false);
    }
  };


  if (success) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold">Report Submitted!</h1>
        <p className="text-muted-foreground">Thank you for helping improve our city.</p>
        <p className="text-sm text-muted-foreground mt-2">Redirecting to issues board...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        <div className="mb-8 md:mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-lg bg-emerald-600 mb-4 md:mb-6">
            <Upload className="h-7 w-7 md:h-8 md:w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900">Report an Issue</h1>
          <p className="text-gray-600 mt-2 md:mt-3 text-base md:text-lg px-4">
            Help us fix the city by reporting infrastructure problems.
          </p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-lg border border-gray-200 shadow">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">
                Photo Evidence <span className="text-red-500">*</span>
              </label>
              <div className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500 transition-colors ${previewUrl ? 'border-emerald-600 bg-emerald-50/50' : 'border-gray-300'}`}>
            <input
              type="file"
              accept="image/*"
              required
              className="hidden"
              id="image-upload"
              onChange={handleImageChange}
            />
            <label htmlFor="image-upload" className="w-full h-full flex flex-col items-center cursor-pointer">
              {previewUrl ? (
                <div className="relative w-full aspect-video">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-md" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition rounded-md">
                    <span className="text-white text-sm">Change Photo</span>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Click to upload image</span>
                  <span className="text-xs text-gray-400 mt-1">Upload a photo to get started</span>
                </>
              )}
            </label>
          </div>
        </div>

        {previewUrl && (
          <>
            {analyzing && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">AI is analyzing your image...</p>
                  <p className="text-xs text-blue-700">This will only take a moment</p>
                </div>
              </div>
            )}

            {aiAnalyzed && aiData && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">AI Analysis Complete!</p>
                    <p className="text-xs text-green-700 mt-1">
                      Detected: <span className="font-semibold">{aiData.defectType}</span> • 
                      Severity: <span className="font-semibold">{aiData.severity}</span>
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      Fields below have been auto-filled. You can edit them if needed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!analyzing && !aiAnalyzed && (
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full border-2 border-yellow-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-yellow-600">!</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-900">AI analysis in progress or no defect detected</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Please fill in the details manually or re-analyze the image.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-gray-900">
                Issue Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Pothole on Main St"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full h-10 rounded-md border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 ${aiAnalyzed ? "border-emerald-300" : "border-gray-300"}`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-gray-900">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Describe the issue in detail..."
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full min-h-[80px] rounded-md border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 ${aiAnalyzed ? "border-emerald-300" : "border-gray-300"}`}
              />
            </div>
          </>
        )}

        {previewUrl && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-gray-900">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="w-full h-10 px-4 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium inline-flex items-center justify-center"
                  onClick={handleLocationClick}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {location ? "Location Captured" : "Get Current Location"}
                </button>
              </div>
              {location && (
                <p className="text-xs text-muted-foreground">
                  Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                </p>
              )}
              {!location && (
                <p className="text-xs text-gray-500">
                  Location is required to help workers find and fix the issue faster.
                </p>
              )}
            </div>

            <div className="rounded-md border border-gray-200 p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="h-5 w-5 rounded-full border-2 border-black flex items-center justify-center">
                    <span className="text-xs font-bold">i</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Transparency Notice: Your report will be publicly visible to foster trust and accountability.
                </p>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !formData.title || !formData.description || !imageFile || !location}
              className="w-full h-11 px-8 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-medium inline-flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Report
            </button>
          </>
        )}
      </form>
        </div>
      </div>
    </div>
  );
}
