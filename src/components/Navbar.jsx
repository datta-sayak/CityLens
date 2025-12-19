"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { href: "/issues", label: "Board" },
        { href: "/report", label: "Report" },
        { href: "/workers", label: "Workers" },
        { href: "/my-reports", label: "Me" },
    ];

    return (
        <nav className="w-full py-6 px-6 md:px-24 flex items-center justify-between bg-white border-b border-gray-100">
            <Link href="/" className="text-2xl font-bold tracking-tight text-blue-600 flex items-center gap-2">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                CityLens
            </Link>

            <div className="flex items-center gap-8">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-blue-600",
                            pathname === item.href ? "text-blue-600 font-semibold" : "text-gray-500"
                        )}
                    >
                        {item.label}
                    </Link>
                ))}
            </div>
        </nav>
    );
}
