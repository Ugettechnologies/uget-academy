import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import NewsletterSignup from '@/components/home/NewsletterSignup';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Star, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  FileSpreadsheet, 
  Play 
} from 'lucide-react';

export default function Home() {
  const featuredCourses = [
    {
      id: 'crs-1',
      title: 'Cybersecurity & Threat Intelligence',
      category: 'Cybersecurity Track',
      duration: '12 Weeks',
      studentsCount: '420 Enrolled',
      tutor: 'Dr. Ada Lovelace',
      description: 'Master network defense, ethical hacking, threat intelligence, and vulnerability assessment.',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'crs-2',
      title: 'Data Analytics & Predictive Modeling',
      category: 'Data Science Track',
      duration: '10 Weeks',
      studentsCount: '380 Enrolled',
      tutor: 'Prof. Alan Turing',
      description: 'Learn SQL, Python, machine learning pipelines, and interactive business intelligence dashboards.',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'crs-3',
      title: 'Software Engineering & Architecture',
      category: 'Development Track',
      duration: '14 Weeks',
      studentsCount: '410 Enrolled',
      tutor: 'Grace Hopper',
      description: 'Build enterprise-grade full-stack web applications with Next.js, Node, PostgreSQL, and Docker.',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
      id: 'crs-4',
      title: 'UI/UX System Design & Wireframing',
      category: 'Design Track',
      duration: '8 Weeks',
      studentsCount: '330 Enrolled',
      tutor: 'Margaret Hamilton',
      description: 'Design intuitive digital products, component design systems, user journeys, and Figma prototypes.',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
  ];

  const testimonials = [
    {
      name: 'Aisha Bello',
      role: 'Cybersecurity Analyst at TechCorp',
      course: 'Cybersecurity & Threat Intelligence',
      rating: 5,
      comment: 'UGET Academy transformed my tech career. The live attendance verification, CBT tests, and instructor guidance helped me land my dream role.',
      avatarBg: 'bg-purple-600',
    },
    {
      name: 'James Carter',
      role: 'Junior Data Engineer',
      course: 'Data Analytics & Predictive Modeling',
      rating: 5,
      comment: 'The portal layout is clean, intuitive, and keeps me on track with deliverables, test scores, and direct messaging with tutors.',
      avatarBg: 'bg-blue-600',
    },
    {
      name: 'Lena Fischer',
      role: 'Software Developer',
      course: 'Software Engineering & Architecture',
      rating: 5,
      comment: 'As a student, having clear assignment deadlines, material downloads, and automatic grade syncing made learning smooth and rewarding.',
      avatarBg: 'bg-emerald-600',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-white font-sans overflow-x-hidden selection:bg-blue-600 selection:text-white">
      
      {/* Sticky Floating Navbar */}
      <header className="sticky top-4 w-[calc(100%-2rem)] max-w-6xl mx-auto px-6 h-16 flex items-center justify-between z-50 bg-[#0F172A]/90 backdrop-blur-md border border-white/10 rounded-full shadow-2xl mt-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-clean.png"
            alt="UGET Academy Logo"
            width={34}
            height={34}
            className="h-8.5 w-auto object-contain"
            priority
          />
          <span className="font-sans font-black tracking-tight text-white text-base">
            UGET <span className="text-blue-400 font-normal">Academy</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-gray-300">
          <a href="#courses" className="hover:text-white transition">Featured Courses</a>
          <a href="#stats" className="hover:text-white transition">Platform Stats</a>
          <a href="#testimonials" className="hover:text-white transition">Testimonials</a>
          <a href="#newsletter" className="hover:text-white transition">Newsletter</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-bold text-gray-300 hover:text-white transition px-3 py-2"
          >
            Log In
          </Link>
          <Link
            href="/register/student"
            className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs py-2 px-4 rounded-full shadow-md shadow-blue-500/25 transition flex items-center gap-1.5"
          >
            Start Learning Free &rarr;
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-20 pb-24 px-6 max-w-6xl mx-auto text-center relative">
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[90vw] h-[40vw] max-w-[900px] rounded-full bg-blue-500/10 blur-[130px] pointer-events-none -z-10" />

        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> World-Class Tech Academy
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tight">
            Take Exams.<br />
            Submit Assignments.<br />
            Get Your Grades.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-amber-300">
              Succeed.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-gray-300 text-sm sm:text-base leading-relaxed font-normal">
            Join a thriving network of innovators. Accelerate your tech career with hands-on learning, real-time feedback, and verified tutor guidance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link
              href="/register/student"
              className="bg-[#2563EB] hover:bg-blue-600 text-white font-black text-xs py-4 px-8 rounded-full shadow-xl shadow-blue-500/25 transition w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-4 h-4" /> Start Learning Free
            </Link>
            <Link
              href="/login"
              className="bg-white/5 hover:bg-white/10 text-white border border-white/15 font-bold text-xs py-4 px-8 rounded-full transition w-full sm:w-auto flex items-center justify-center gap-2"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* PLATFORM KEY STATS SECTION */}
      <section id="stats" className="py-12 border-y border-white/10 bg-[#0F172A]/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-black text-white">1,540+</h3>
            <p className="text-xs text-gray-400 font-medium">Students Enrolled</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-black text-blue-400">10+</h3>
            <p className="text-xs text-gray-400 font-medium">Published Tech Tracks</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-black text-purple-400">28+</h3>
            <p className="text-xs text-gray-400 font-medium">Verified Instructors</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-black text-amber-400">94%</h3>
            <p className="text-xs text-gray-400 font-medium">Career Success Rate</p>
          </div>
        </div>
      </section>

      {/* FEATURED COURSES / LEARNING PATHS SECTION */}
      <section id="courses" className="py-24 px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400">Industry-Aligned Learning Paths</span>
          <h2 className="text-3xl font-black text-white tracking-tight">Featured Academy Tracks</h2>
          <p className="text-xs text-gray-400">Master high-demand tech skills through structured curriculum and hands-on projects.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredCourses.map((crs) => (
            <div
              key={crs.id}
              className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl hover:border-blue-500/40 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border ${crs.badgeColor}`}>
                    {crs.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-400">{crs.duration}</span>
                </div>

                <h3 className="text-xl font-extrabold text-white">{crs.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{crs.description}</p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  <span>Tutor: <strong className="text-white">{crs.tutor}</strong></span>
                </div>

                <Link
                  href="/register/student"
                  className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs transition flex items-center gap-1.5"
                >
                  Enroll Track <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-20 px-6 bg-[#0F172A]/40 border-t border-white/10">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">Student & Alumni Proof</span>
            <h2 className="text-3xl font-black text-white tracking-tight">What Our Learners Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-300 italic leading-relaxed">"{t.comment}"</p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${t.avatarBg} text-white font-black text-xs flex items-center justify-center`}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block">{t.name}</span>
                    <span className="text-[10px] text-gray-400">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER SIGNUP SECTION */}
      <section id="newsletter" className="py-20 px-6">
        <NewsletterSignup />
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-[#0F172A] text-white py-16 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-xs">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-clean.png"
                alt="UGET Academy Logo"
                width={30}
                height={30}
                className="h-7 w-auto object-contain"
              />
              <span className="font-black text-white text-sm">UGET Academy</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Bringing Africans to a World-Class standard of Tech, One person at a time.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Platform Navigation</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/register/student" className="hover:text-white transition">Student Portal Enrollment</Link></li>
              <li><Link href="/login" className="hover:text-white transition">Instructor Login</Link></li>
              <li><Link href="/login" className="hover:text-white transition">Admin Platform Authority</Link></li>
              <li><Link href="/staff/onboarding" className="hover:text-white transition">Staff Onboarding Intake</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Featured Tracks</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Cybersecurity & Threat Intelligence</li>
              <li>Data Analytics & Predictive Modeling</li>
              <li>Software Engineering & Architecture</li>
              <li>UI/UX System Design</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Legal & Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
              <li>Contact Support</li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 mt-12 pt-6 border-t border-white/10 text-center md:text-left text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} UGET Academy. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
