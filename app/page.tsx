"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Briefcase, GraduationCap, LineChart, 
  Waypoints, TrendingUp, Users, Building2 
} from 'lucide-react';

export default function Home() {
  const [jobCount, setJobCount] = useState(0);

  // --- FETCH REAL STATS ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('https://job-nexus-f3ub.onrender.com/api/jobs');
        // Animate the number (simple version)
        setJobCount(res.data.length);
      } catch (err) {
        console.error("Could not fetch stats");
        setJobCount(0);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white selection:bg-blue-500 selection:text-white font-sans overflow-x-hidden">
      
      {/* BACKGROUND GLOW */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-[#0f172a]/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* NEW CREATIVE LOGO */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-600 rounded-lg rotate-3 group-hover:rotate-12 transition-transform duration-300"></div>
              <div className="absolute inset-0 bg-purple-600 rounded-lg -rotate-3 group-hover:-rotate-12 transition-transform duration-300 opacity-70"></div>
              <Waypoints className="relative z-10 w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              JobNexus
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="/roadmap" className="hover:text-blue-400 transition flex items-center gap-1">
              Career Roadmap
            </Link>
            <Link href="/partners" className="hover:text-purple-400 transition flex items-center gap-1">
              Hiring Partners
            </Link>
            <Link href="/login" className="px-5 py-2 bg-white text-black rounded-full font-bold hover:bg-gray-100 transition shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* DYNAMIC LIVE COUNTER */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Now Live: <span className="font-bold text-white mx-1">{jobCount}</span> Openings Available
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
              Where Talent Meets <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400">
                Limitless Opportunity.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12">
              The smartest campus placement platform. Students get hired faster, Recruiters find top talent effortlessly.
            </p>
          </motion.div>

          {/* ROLE CARDS */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Student */}
            <Link href="/login" className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all overflow-hidden text-left">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <GraduationCap className="w-10 h-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2 text-white">Student</h3>
              <p className="text-gray-400 text-sm mb-4">Build profile & apply to jobs.</p>
              <span className="text-blue-400 text-sm font-bold flex items-center gap-1">Apply Now <ArrowRight className="w-4 h-4" /></span>
            </Link>

            {/* Recruiter */}
            <Link href="/login" className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all overflow-hidden text-left">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Briefcase className="w-10 h-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2 text-white">Recruiter</h3>
              <p className="text-gray-400 text-sm mb-4">Post jobs & hire talent.</p>
              <span className="text-purple-400 text-sm font-bold flex items-center gap-1">Hire Talent <ArrowRight className="w-4 h-4" /></span>
            </Link>

            {/* Faculty */}
            <Link href="/login" className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all overflow-hidden text-left">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <LineChart className="w-10 h-10 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2 text-white">Faculty</h3>
              <p className="text-gray-400 text-sm mb-4">Monitor placement stats.</p>
              <span className="text-emerald-400 text-sm font-bold flex items-center gap-1">View Stats <ArrowRight className="w-4 h-4" /></span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}