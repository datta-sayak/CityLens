"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import { User, LogOut, HardHat, UserCircle } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();
    const { user, userData, logout } = useAuth();

    // Default Public Links
    const navItems = [
        { href: "/issues", label: "Public Board" },
    ];

    return (
        <nav className="w-full py-3 px-6 md:px-24 flex items-center justify-between bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <Link href="/" className="text-xl font-bold tracking-tight text-blue-600 flex items-center gap-3 hover:opacity-90 transition-opacity">
                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <span className="text-2xl">CityLens</span>
            </Link>

            <div className="flex items-center gap-6">
                {/* Public Links */}
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-blue-600 hidden md:block",
                            pathname === item.href ? "text-blue-600 font-semibold underline underline-offset-4" : "text-gray-500"
                        )}
                    >
                        {item.label}
                    </Link>
                ))}

                {/* Authenticated Links */}
                {user ? (
                    <>
                        {/* Worker Links */}
                        {userData?.role === 'worker' && (
                            <Link href="/workers" className={cn("text-sm font-medium transition-colors hover:text-blue-600", pathname === "/workers" ? "text-blue-600 font-semibold underline underline-offset-4" : "text-gray-500")}>
                                Dashboard
                            </Link>
                        )}

                        {/* Citizen Links */}
                        {userData?.role !== 'worker' && (
                            <>
                                <Link href="/report" className={cn("text-sm font-medium transition-colors hover:text-blue-600", pathname === "/report" ? "text-blue-600 font-semibold underline underline-offset-4" : "text-gray-500")}>
                                    Report
                                </Link>
                                <Link href="/dashboard" className={cn("text-sm font-medium transition-colors hover:text-blue-600", pathname === "/dashboard" ? "text-blue-600 font-semibold underline underline-offset-4" : "text-gray-500")}>
                                    Dashboard
                                </Link>
                            </>
                        )}

                        <div className="h-6 w-px bg-gray-300 mx-2"></div>

                        <div className="flex items-center gap-3 bg-gray-50 rounded-full px-4 py-2">
                            {/* Role Icon and Text */}
                            {userData?.role === 'worker' ? (
                                <>
                                    <HardHat className="h-5 w-5 text-orange-600" />
                                    <span className="text-sm font-medium text-gray-700">Worker</span>
                                </>
                            ) : (
                                <>
                                    <UserCircle className="h-5 w-5 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-700">Citizen</span>
                                </>
                            )}
                            <span className="text-sm font-medium text-gray-900 hidden sm:block ml-2">
                                {userData?.name || user.displayName || "User"}
                            </span>
                            <button
                                onClick={logout}
                                className="text-gray-500 hover:text-red-600 transition-colors ml-2"
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </>
                ) : (
                    /* Guest Links */
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                            Log in
                        </Link>
                        <Link
                            href="/register"
                            className="bg-black text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors shadow-md"
                        >
                            Sign up
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
