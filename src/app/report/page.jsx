"use client";

import { useState } from "react";
import { Upload, MapPin, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { db, storage } from "@/lib/firebase"; // We'll assume these work or mock them if env not set
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";

// UI Components (Inline for simplicity)

function Button({ className, variant = "default", size = "default", loading, children, ...props }) {
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700",
    ghost: "hover:bg-gray-100 text-gray-700",
    link: "text-blue-600 underline-offset-4 hover:underline",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export default function ReportPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [location, setLocation] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const router = useRouter();

  // Simple form handling without external library overhead for now to keep it "Basic"
  // actually I imported useForm but let's stick to simple controlled inputs if we want "basic".
  // Nah, controlled is fine.
  const [formData, setFormData] = useState({ title: "", description: "" });

  const handleLocationClick = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      }, (error) => {
        alert("Error getting location: " + error.message);
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = "";
      if (imageFile) {
        // Upload image
        const storageRef = ref(storage, `issues/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, "issues"), {
        title: formData.title,
        description: formData.description,
        location: location,
        imageUrl: imageUrl,
        status: "OPEN",
        createdAt: serverTimestamp(),
        // For now, anonymous or we can add auth later
        userId: "anonymous"
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/issues");
      }, 2000);
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. check console.");
    } finally {
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
    <div className="container max-w-lg mx-auto py-10 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Report an Issue</h1>
        <p className="text-muted-foreground mt-2">
          Help us fix the city by reporting infrastructure problems.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Issue Title
          </label>
          <Input
            required
            placeholder="e.g., Pothole on Main St"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">
            Description
          </label>
          <Textarea
            placeholder="Describe the issue in detail..."
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">
            Location
          </label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleLocationClick}
            >
              <MapPin className="mr-2 h-4 w-4" />
              {location ? "Location Captured" : "Get Current Location"}
            </Button>
          </div>
          {location && (
            <p className="text-xs text-muted-foreground">
              Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">
            Photo Evidence
          </label>
          <div className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent/50 transition ${previewUrl ? 'border-primary' : 'border-muted-foreground/25'}`}>
            <input
              type="file"
              accept="image/*"
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
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Click to upload image</span>
                </>
              )}
            </label>
          </div>
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

        <Button type="submit" className="w-full" size="lg" loading={loading} disabled={!location || !formData.title}>
          Submit Report
        </Button>
      </form>
    </div>
  );
}
