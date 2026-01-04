"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2 } from 'lucide-react';

export default function Partners() {
  const companies = ["Google", "Microsoft", "Amazon", "Tesla", "Netflix", "Adobe", "Meta", "Spotify"];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-12 font-sans">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-12 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
          Trusted by <span className="text-emerald-400">Industry Leaders</span>
        </h1>
        <p className="text-xl text-gray-400 mb-16 max-w-2xl mx-auto">
          Join thousands of companies hiring top talent through JobNexus.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {companies.map((name, i) => (
            <div key={i} className="h-32 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center hover:bg-white/10 hover:scale-105 transition-all cursor-pointer">
              <Building2 className="w-8 h-8 text-gray-500 mb-2" />
              <span className="font-bold text-lg text-gray-300">{name}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-20 p-8 rounded-2xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10">
          <h2 className="text-2xl font-bold mb-4">Are you a Recruiter?</h2>
          <Link href="/register" className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition">
            Start Hiring Now
          </Link>
        </div>
      </div>
    </div>
  );
}