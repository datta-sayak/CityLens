import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Camera, MapPin, Users, CheckCircle, AlertCircle, TrendingUp, Smartphone, Eye, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1">
        
        {/* Hero Section with Background Image */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1587474260584-136574528ed5" 
              alt="City Background"
              fill
              className="object-cover" 
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 w-full px-4 md:px-8 lg:px-16">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Left: Text Content */}
              <div className="text-white">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                  CityLens<span className="text-emerald-400">.</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-200 mb-4">
                  Real transparency. Real change.
                </p>
                <p className="text-lg text-gray-300 mb-8 max-w-xl">
                  Citizens report infrastructure issues with one photo. AI categorizes instantly. Workers fix it. Everyone tracks progress in real-time. No bureaucracy, just results.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link
                    href="/report"
                    className="px-8 py-4 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all hover:scale-105 inline-flex items-center justify-center shadow-lg"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Report an Issue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    href="/issues"
                    className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg font-semibold hover:bg-white/20 transition-all inline-flex items-center justify-center"
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    View Public Board
                  </Link>
                </div>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-6 text-sm">
                  <div>
                    <div className="text-2xl font-bold text-emerald-400">24/7</div>
                    <div className="text-gray-300">Monitoring</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-400">100%</div>
                    <div className="text-gray-300">Transparent</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-400">AI</div>
                    <div className="text-gray-300">Powered</div>
                  </div>
                </div>
              </div>

              {/* Right: Feature Cards */}
              <div className="hidden lg:flex flex-col gap-4">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                  <Smartphone className="h-10 w-10 text-emerald-400 mb-3" />
                  <h3 className="text-white font-semibold text-lg mb-2">One-Tap Reporting</h3>
                  <p className="text-gray-300 text-sm">Snap a photo, auto-detect location, submit in 10 seconds. No lengthy forms or complicated processes.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                  <TrendingUp className="h-10 w-10 text-emerald-400 mb-3" />
                  <h3 className="text-white font-semibold text-lg mb-2">Live Progress Tracking</h3>
                  <p className="text-gray-300 text-sm">Watch your report move from "Pending" to "Assigned" to "In Progress" to "Resolved"—all visible to everyone.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                  <Shield className="h-10 w-10 text-emerald-400 mb-3" />
                  <h3 className="text-white font-semibold text-lg mb-2">Complete Accountability</h3>
                  <p className="text-gray-300 text-sm">Every report, every assignment, every status change is public. See exactly who's working on what and when.</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Problem Statement Section */}
        <section className="px-4 md:px-8 py-20 bg-gray-900 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">The Problem</span>
                <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">
                  Broken infrastructure stays broken for months
                </h2>
                <div className="space-y-4 text-gray-300">
                  <p className="flex items-start">
                    <span className="text-red-400 mr-3 mt-1">✗</span>
                    <span>Citizens report issues that disappear into bureaucratic black holes</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-red-400 mr-3 mt-1">✗</span>
                    <span>No way to track if anyone's actually working on the problem</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-red-400 mr-3 mt-1">✗</span>
                    <span>Zero accountability for government workers and contractors</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-red-400 mr-3 mt-1">✗</span>
                    <span>Complicated reporting systems that nobody uses</span>
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 md:p-10 rounded-2xl">
                <span className="text-white/90 font-semibold text-sm uppercase tracking-wider">Our Solution</span>
                <h3 className="text-3xl font-bold mt-4 mb-6 text-white">
                  Complete transparency from report to resolution
                </h3>
                <div className="space-y-4 text-white/90">
                  <p className="flex items-start">
                    <span className="text-white mr-3 mt-1">✓</span>
                    <span>Every report is instantly public and trackable by anyone</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-white mr-3 mt-1">✓</span>
                    <span>Real-time status updates as workers are assigned and start fixing</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-white mr-3 mt-1">✓</span>
                    <span>Workers' names and progress visible—full accountability</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-white mr-3 mt-1">✓</span>
                    <span>One photo, auto-location, AI categorization—done in 10 seconds</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - Step by Step */}
        <section className="px-4 md:px-8 py-20 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Simple Process</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">
                From Report to Resolution in Three Steps
              </h2>
            </div>
            
            <div className="space-y-12">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-full md:w-1/3 order-2 md:order-1">
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6">
                    <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">1</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Citizen Reports Issue</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start">
                        <Camera className="h-5 w-5 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Take a photo of pothole, broken streetlight, damaged road</span>
                      </li>
                      <li className="flex items-start">
                        <MapPin className="h-5 w-5 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Location automatically captured via GPS</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>AI analyzes image and auto-categorizes issue type & severity</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-2/3 order-1 md:order-2">
                  <div className="bg-gray-100 rounded-xl p-8 md:p-12">
                    <p className="text-xl text-gray-700 leading-relaxed">
                      <strong className="text-emerald-600">No lengthy forms.</strong> Just snap, submit, and it's public instantly. The AI fills in details like "Pothole - Severe - Main Street" automatically. Takes 10 seconds.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-full md:w-2/3">
                  <div className="bg-gray-100 rounded-xl p-8 md:p-12">
                    <p className="text-xl text-gray-700 leading-relaxed">
                      <strong className="text-emerald-600">Government assigns worker.</strong> The system notifies the right department. A worker gets assigned. Their name becomes public. You see who's responsible.
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-1/3">
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6">
                    <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">2</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Worker Gets Assigned</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start">
                        <Users className="h-5 w-5 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Government reviews and assigns to specific worker</span>
                      </li>
                      <li className="flex items-start">
                        <Eye className="h-5 w-5 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Worker's name becomes publicly visible</span>
                      </li>
                      <li className="flex items-start">
                        <TrendingUp className="h-5 w-5 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Status changes from "Pending" to "Assigned"</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-full md:w-1/3 order-2 md:order-1">
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6">
                    <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">3</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Public Tracking</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start">
                        <TrendingUp className="h-5 w-5 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Worker marks "In Progress" when they start</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Updates to "Resolved" when completed</span>
                      </li>
                      <li className="flex items-start">
                        <Eye className="h-5 w-5 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Everyone can see the entire timeline</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-2/3 order-1 md:order-2">
                  <div className="bg-gray-100 rounded-xl p-8 md:p-12">
                    <p className="text-xl text-gray-700 leading-relaxed">
                      <strong className="text-emerald-600">Complete transparency.</strong> Watch status updates in real-time. See who's fixing it, when they started, and when it's done. The public board shows everything.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features - Detailed */}
        <section className="px-4 md:px-8 py-20 bg-gradient-to-br from-gray-50 to-emerald-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Platform Features</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">
                Built for Citizens, Workers & Government
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Everyone gets the tools they need. No complicated training. Just clear interfaces that make sense.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">For Citizens</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• One-tap photo reporting</li>
                  <li>• Track your own reports</li>
                  <li>• See all issues in your area</li>
                  <li>• Get resolution notifications</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">For Workers</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• View assigned tasks</li>
                  <li>• Update status in real-time</li>
                  <li>• Add work notes & photos</li>
                  <li>• Map view of all tasks</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">For Government</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Assign issues to workers</li>
                  <li>• Monitor all activities</li>
                  <li>• Analytics & reporting</li>
                  <li>• Manage worker accounts</li>
                </ul>
              </div>
            </div>

            <div className="mt-12 bg-white border-2 border-emerald-200 rounded-xl p-8 md:p-10">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-emerald-600 rounded-xl flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">AI-Powered Intelligence</h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    Our computer vision AI analyzes every photo to automatically detect:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                    <div>
                      <strong className="text-emerald-600">Issue Type:</strong> Pothole, broken streetlight, damaged sidewalk, graffiti, flooding, etc.
                    </div>
                    <div>
                      <strong className="text-emerald-600">Severity Level:</strong> Critical (safety hazard), High, Medium, or Low priority
                    </div>
                    <div>
                      <strong className="text-emerald-600">Description:</strong> Auto-generated detailed description of the problem
                    </div>
                    <div>
                      <strong className="text-emerald-600">Department:</strong> Routes to the right city department automatically
                    </div>
                  </div>
                  <p className="text-gray-600 mt-4 text-sm">
                    This means citizens don't fill out forms—just snap and submit. The AI does the rest in seconds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 md:px-8 py-16 md:py-20 bg-emerald-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-lg md:text-xl text-emerald-100 mb-8 md:mb-10">
              Join thousands of citizens working together to improve our infrastructure, one report at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-4 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/issues"
                className="px-8 py-4 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 transition-colors inline-flex items-center justify-center"
              >
                See It In Action
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 px-4 md:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="text-white font-bold text-xl mb-4">CityLens</h3>
                <p className="text-gray-400 text-sm">
                  Empowering citizens to create positive change through transparent infrastructure reporting.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                <div className="space-y-2">
                  <Link href="/report" className="block text-gray-400 hover:text-white text-sm transition-colors">
                    Report Issue
                  </Link>
                  <Link href="/issues" className="block text-gray-400 hover:text-white text-sm transition-colors">
                    View Issues
                  </Link>
                  <Link href="/login" className="block text-gray-400 hover:text-white text-sm transition-colors">
                    Login
                  </Link>
                  <Link href="/register" className="block text-gray-400 hover:text-white text-sm transition-colors">
                    Register
                  </Link>
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">For Organizations</h4>
                <div className="space-y-2">
                  <Link href="/workers" className="block text-gray-400 hover:text-white text-sm transition-colors">
                    Worker Portal
                  </Link>
                  <Link href="/government" className="block text-gray-400 hover:text-white text-sm transition-colors">
                    Government Dashboard
                  </Link>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center">
              <p className="text-gray-400 text-sm">
                © 2025 CityLens. Building better cities together.
              </p>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}