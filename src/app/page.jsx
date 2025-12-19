import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans">
      <main className="flex-1 flex flex-col justify-center px-6 md:px-24">

        {/* Minimal Hero */}
        <div className="max-w-4xl py-24 md:py-32">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight mb-8 text-blue-600">
            CityLens.
          </h1>
          <p className="text-2xl md:text-3xl text-gray-500 max-w-2xl leading-relaxed mb-12">
            Transparency in simple terms.<br />
            Report incidents. Track progress.<br />
            See change happen.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Link
              href="/report"
              className="group flex items-center text-lg font-semibold border-b-2 border-blue-600 pb-1 text-blue-600 hover:text-blue-800 hover:border-blue-800 transition-colors"
            >
              Report an Issue
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/issues"
              className="group flex items-center text-lg font-semibold text-gray-400 hover:text-blue-600 transition-colors"
            >
              View Public Board
            </Link>
          </div>
        </div>

        {/* Minimal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-gray-100 pt-12 pb-24">
          <div className="space-y-4">
            <span className="text-xs font-mono text-blue-600 uppercase tracking-widest font-semibold">01 / Report</span>
            <p className="text-lg text-gray-800">
              Snap a photo. We auto-tag the location. No forms, no fuss.
            </p>
          </div>
          <div className="space-y-4">
            <span className="text-xs font-mono text-blue-600 uppercase tracking-widest font-semibold">02 / Track</span>
            <p className="text-lg text-gray-800">
              Follow real-time status updates from municipal workers.
            </p>
          </div>
          <div className="space-y-4">
            <span className="text-xs font-mono text-blue-600 uppercase tracking-widest font-semibold">03 / Solve</span>
            <p className="text-lg text-gray-800">
              Closed loop transparency. Everyone sees when it's fixed.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
