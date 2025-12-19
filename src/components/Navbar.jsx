"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import { User, LogOut, Landmark, CheckCircle, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const pathname = usePathname();
    const { user, userData, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="w-full py-3 px-4 md:px-6 lg:px-24 flex items-center justify-between bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-emerald-600 transition-colors">
                <span className="text-2xl md:text-3xl">CityLens<span className="text-emerald-600">.</span></span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">

                {/* Authenticated Links */}
                {user ? (
                    <>
                        {/* Government Links */}
                        {userData?.role === 'government' && (
                            <Link href="/government" className={cn("text-sm font-medium", pathname === "/government" ? "text-emerald-600 font-semibold" : "text-gray-600 hover:text-emerald-600")}>
                                Dashboard
                            </Link>
                        )}

                        {/* Worker Links */}
                        {userData?.role === 'worker' && (
                            <Link href="/workers" className={cn("text-sm font-medium", pathname === "/workers" ? "text-emerald-600 font-semibold" : "text-gray-600 hover:text-emerald-600")}>
                                Dashboard
                            </Link>
                        )}

                        {/* Citizen Links */}
                        {userData?.role === 'citizen' && (
                            <>
                                <Link href="/report" className={cn("text-sm font-medium", pathname === "/report" ? "text-emerald-600 font-semibold" : "text-gray-600 hover:text-emerald-600")}>
                                    Report
                                </Link>
                                <Link href="/citizen" className={cn("text-sm font-medium", pathname === "/citizen" ? "text-emerald-600 font-semibold" : "text-gray-600 hover:text-emerald-600")}>
                                    Dashboard
                                </Link>
                            </>
                        )}

                        <div className="h-6 w-px bg-gray-300 mx-2"></div>

                        <div className="flex items-center gap-3 bg-gray-50 rounded-full px-4 py-2">
                            {/* Role Icon and Text */}
                            {userData?.role === 'government' ? (
                                <>
                                    <Landmark className="h-5 w-5 text-purple-600" />
                                    <span className="text-sm font-medium text-gray-700">Government</span>
                                </>
                            ) : userData?.role === 'worker' ? (
                                <>
                                    <CheckCircle className="h-5 w-5 text-orange-600" />
                                    <span className="text-sm font-medium text-gray-700">Worker</span>
                                </>
                            ) : (
                                <>
                                    <User className="h-5 w-5 text-emerald-600" />
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

            {/* Mobile Menu Button */}
            <button
                className="md:hidden p-2 text-gray-600 hover:text-emerald-600"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
            >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 top-[57px] bg-white z-40 md:hidden">
                    <div className="flex flex-col p-6 space-y-4">
                        {user ? (
                            <>
                                {/* Role Badge */}
                                <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 mb-4">
                                    {userData?.role === 'government' ? (
                                        <>
                                            <Landmark className="h-5 w-5 text-purple-600" />
                                            <span className="text-sm font-medium text-gray-700">Government</span>
                                        </>
                                    ) : userData?.role === 'worker' ? (
                                        <>
                                            <CheckCircle className="h-5 w-5 text-orange-600" />
                                            <span className="text-sm font-medium text-gray-700">Worker</span>
                                        </>
                                    ) : (
                                        <>
                                            <User className="h-5 w-5 text-emerald-600" />
                                            <span className="text-sm font-medium text-gray-700">Citizen</span>
                                        </>
                                    )}
                                    <span className="text-sm font-medium text-gray-900 ml-auto">
                                        {userData?.name || user.displayName || "User"}
                                    </span>
                                </div>

                                {/* Mobile Navigation Links */}
                                {userData?.role === 'government' && (
                                    <Link
                                        href="/government"
                                        className={cn(
                                            "text-base font-medium py-2 px-4 rounded-lg transition-colors",
                                            pathname === "/government"
                                                ? "bg-emerald-50 text-emerald-600 font-semibold"
                                                : "text-gray-700 hover:bg-gray-50"
                                        )}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                )}

                                {userData?.role === 'worker' && (
                                    <Link
                                        href="/workers"
                                        className={cn(
                                            "text-base font-medium py-2 px-4 rounded-lg transition-colors",
                                            pathname === "/workers"
                                                ? "bg-emerald-50 text-emerald-600 font-semibold"
                                                : "text-gray-700 hover:bg-gray-50"
                                        )}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                )}

                                {userData?.role === 'citizen' && (
                                    <>
                                        <Link
                                            href="/report"
                                            className={cn(
                                                "text-base font-medium py-2 px-4 rounded-lg transition-colors",
                                                pathname === "/report"
                                                    ? "bg-emerald-50 text-emerald-600 font-semibold"
                                                    : "text-gray-700 hover:bg-gray-50"
                                            )}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Report Issue
                                        </Link>
                                        <Link
                                            href="/citizen"
                                            className={cn(
                                                "text-base font-medium py-2 px-4 rounded-lg transition-colors",
                                                pathname === "/citizen"
                                                    ? "bg-emerald-50 text-emerald-600 font-semibold"
                                                    : "text-gray-700 hover:bg-gray-50"
                                            )}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            My Reports
                                        </Link>
                                    </>
                                )}

                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <button
                                        onClick={() => {
                                            logout();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="w-full text-left text-base font-medium py-2 px-4 rounded-lg text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-base font-medium py-2 px-4 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/register"
                                    className="text-base font-semibold py-2 px-4 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors text-center"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
