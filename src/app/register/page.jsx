"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Mail, Lock, User, Briefcase, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("citizen"); // Default to citizen
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await register(name, email, password, role);
            toast.success("Account created successfully!");
            if (role === 'worker') {
                router.push("/workers");
            } else if (role === 'government') {
                router.push("/government");
            } else {
                router.push("/citizen");
            }
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                toast.error("Email is already registered.");
            } else if (err.code === 'auth/weak-password') {
                toast.error("Password should be at least 6 characters.");
            } else {
                toast.error("Failed to register. Please try again.");
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
                        <User className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Create Account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join CityLens to improve your community.
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
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
                                autoComplete="new-password"
                                required
                                className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <Briefcase className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <select
                                id="role"
                                name="role"
                                required
                                className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="citizen">Citizen - Report Issues</option>
                                <option value="worker">Worker - Fix Issues</option>
                                <option value="government">Government - Manage Workflow</option>
                            </select>
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
                            "Create Account"
                        )}
                    </button>
                </form>

                <div className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-700">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
