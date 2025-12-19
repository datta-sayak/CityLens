"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await login(email, password);
            toast.success("Logged in successfully!");

            // Fetch user's Firestore profile to determine role and redirect
            try {
                const userId = result.user?.uid;
                if (userId) {
                    const userDoc = await getDoc(doc(db, "users", userId));
                    const role = userDoc.exists() ? userDoc.data()?.role : null;
                    if (role === "worker") router.push("/workers");
                    else if (role === "government") router.push("/government");
                    else router.push("/citizen");
                } else {
                    router.push("/citizen");
                }
            } catch (e) {
                console.error("Failed to fetch user profile after login:", e);
                router.push("/citizen");
            }
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                toast.error("Invalid email or password.");
            } else {
                toast.error("Failed to login. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-lg border border-gray-200 shadow">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-600 mb-4">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to track your reports and contributions.
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-emerald-600 py-2 px-4 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                        ) : (
                            "Sign in"
                        )}
                    </button>
                </form>

                <div className="text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link href="/register" className="font-medium text-emerald-600 hover:text-emerald-700">
                        Register now
                    </Link>
                </div>
            </div>
        </div>
    );
}
