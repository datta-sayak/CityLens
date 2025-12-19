import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans">
      <main className="flex-1 flex flex-col">
        
        {/* HERO SECTION WITH BACKGROUND */}
        <div className="relative w-full flex flex-col justify-center px-6 md:px-24 min-h-[70vh] overflow-hidden">
          {/* Background Image - Full Color */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/city-bg.webp" 
              alt="City Background"
              fill
              className="object-cover" 
              priority
            />
          </div>

          {/* Text Content Overlay */}
          <div className="relative z-20 max-w-4xl">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 md:p-12 rounded-3xl shadow-2xl inline-block">
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight mb-6 text-white drop-shadow-md">
                <span className="text-blue-400">CityLens.</span>
              </h1>
              <p className="text-2xl md:text-3xl text-white/90 max-w-2xl leading-relaxed mb-10">
                Transparency in simple terms.<br />
                Report incidents. Track progress.<br />
                See change happen.
              </p>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <Link
                href="/report"
                className="group flex items-center text-lg font-semibold bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors"
              >
                Report an Issue
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/issues"
                className="group flex items-center text-lg font-semibold bg-white/90 px-6 py-3 rounded-full text-gray-700 hover:text-blue-600 transition-colors shadow-sm"
              >
                View Public Board
              </Link>
              </div>
            </div>
          </div>
        </div>

        {/* STEPS SECTION IN BOXES */}
        <div className="bg-gray-50 px-6 md:px-24 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Box 01 */}
            <div className="bg-white p-8 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <span className="block text-xs font-mono text-blue-600 uppercase tracking-widest font-bold mb-4">01 / Report</span>
              <p className="text-lg text-gray-700 leading-snug">
                Snap a photo. We auto-tag the location. No forms, no fuss.
              </p>
            </div>

            {/* Box 02 */}
            <div className="bg-white p-8 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <span className="block text-xs font-mono text-blue-600 uppercase tracking-widest font-bold mb-4">02 / Track</span>
              <p className="text-lg text-gray-700 leading-snug">
                Follow real-time status updates from municipal workers.
              </p>
            </div>

            {/* Box 03 */}
            <div className="bg-white p-8 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <span className="block text-xs font-mono text-blue-600 uppercase tracking-widest font-bold mb-4">03 / Solve</span>
              <p className="text-lg text-gray-700 leading-snug">
                Closed loop transparency. Everyone sees when it's fixed.
              </p>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}