import React from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#60A5FA]/20 flex flex-col font-sans overflow-x-hidden selection:bg-brand-primary selection:text-white">
      
      {/* Premium Floating Header */}
      <header className="sticky top-4 w-[calc(100%-2rem)] max-w-5xl mx-auto px-6 h-16 flex items-center justify-between z-50 bg-[#0F172A]/95 backdrop-blur-md border border-white/10 rounded-full shadow-lg shadow-black/25 mt-4">
        <Logo size="sm" />
        <Link
          href="/register/student"
          className="bg-white hover:bg-slate-50 text-slate-900 font-semibold text-[11px] py-2 px-5 rounded-full shadow-sm transition flex items-center gap-1.5"
        >
          Get Started &rarr;
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center pt-16 pb-20 px-6 max-w-7xl mx-auto w-full relative">
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[90vw] h-[40vw] max-w-[1000px] rounded-full bg-brand-primary/10 blur-[120px] pointer-events-none -z-10" />

        <div className="text-center max-w-4xl space-y-6">
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 leading-tight tracking-tight">
            Take Exams.<br />
            Submit Assignments.<br />
            Get Your Grades.<br />
            <span className="text-brand-primary">Succeed.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
            Join a thriving network of innovators. Accelerate your tech career. Master new skills, track your progress, and launch your dream career.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link
              href="/register/student"
              className="bg-white hover:bg-slate-50 text-slate-950 font-bold text-xs py-4 px-8 rounded-full shadow-md shadow-slate-200 transition border border-slate-100 w-full sm:w-auto"
            >
              Start Your Journey
            </Link>
            <Link
              href="/login"
              className="bg-transparent hover:bg-brand-primary/5 text-brand-primary border-2 border-brand-primary/40 font-bold text-xs py-3.5 px-8 rounded-full transition w-full sm:w-auto"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Feature Cards (Vision & Journey Map) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mt-24">
          
          {/* Vision Card */}
          <div className="bg-white/80 border border-white/50 backdrop-blur-md rounded-3xl p-8 shadow-sm flex flex-col justify-between">
            <h3 className="text-2xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-4">
              Vision
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h4 className="text-2xl font-black text-slate-900 pt-1">100k+</h4>
                <p className="text-xs text-slate-500">Admissions</p>
              </div>

              <div className="space-y-1">
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 11-4.243 4.242 3 3 0 014.243-4.242zm0-5.758a3 3 0 11-4.243-4.242 3 3 0 014.243 4.242z" />
                </svg>
                <h4 className="text-2xl font-black text-slate-900 pt-1">500+</h4>
                <p className="text-xs text-slate-500">Projects</p>
              </div>

              <div className="space-y-1">
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h4 className="text-2xl font-black text-slate-900 pt-1">150+</h4>
                <p className="text-xs text-slate-500">Verified Tutors</p>
              </div>

              <div className="space-y-1">
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h4 className="text-2xl font-black text-slate-900 pt-1">98%</h4>
                <p className="text-xs text-slate-500">Career Success</p>
              </div>
            </div>
          </div>

          {/* Journey Map Card */}
          <div className="bg-white/80 border border-white/50 backdrop-blur-md rounded-3xl p-8 shadow-sm flex flex-col justify-between">
            <h3 className="text-2xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">
              Journey Map
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">01</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Sign Up</h4>
                  <p className="text-[11px] text-slate-500">Become part of our tech community today.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">02</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Submit & Track</h4>
                  <p className="text-[11px] text-slate-500">Safely turn in work and monitor progress in real-time.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">03</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Progress & Succeed</h4>
                  <p className="text-[11px] text-slate-500">Receive feedback, analyze grades, and build portfolios.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom CTA Block */}
        <div className="w-full mt-24 text-center space-y-6 py-12 px-6 rounded-3xl bg-transparent">
          <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto">
            Join thousands of learners pushing the boundaries of tech. Sign up today and get started for free.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Link
              href="/register/student"
              className="inline-flex items-center gap-2 bg-[#0F172A] hover:bg-slate-900 text-white font-bold text-xs py-4 px-8 rounded-full shadow-lg transition"
            >
              Sign Up for Free
              <svg className="w-4 h-4 text-brand-accent fill-current" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </Link>
            <span className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-brand-primary font-bold hover:underline">
                Log In
              </Link>
            </span>
          </div>
        </div>

      </main>

      {/* Beautiful Footer */}
      <footer className="w-full bg-[#0F172A] text-white py-16 mt-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="space-y-4">
            <Logo size="sm" />
            <p className="text-slate-400 text-xs leading-relaxed">
              Bringing Africans to a World-Class standard of Tech, One person at a time.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#" className="hover:text-white transition">How it works</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Launchpad</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Company</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition">Careers</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Legal</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-800 text-center md:text-left text-xs text-slate-500">
          &copy; {new Date().getFullYear()} UGET Academy. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
