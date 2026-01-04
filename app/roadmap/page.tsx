"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Upload, Search, CheckCircle } from 'lucide-react';

export default function Roadmap() {
  const steps = [
    { icon: UserPlus, title: "Create Profile", desc: "Sign up as a student and complete your profile details." },
    { icon: Upload, title: "Upload Resume", desc: "Upload your latest PDF resume. Our system parses it for recruiters." },
    { icon: Search, title: "Apply to Jobs", desc: "Browse hundreds of live openings and apply with one click." },
    { icon: CheckCircle, title: "Get Hired", desc: "Track your application status and accept offers instantly." },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-12 font-sans">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-12 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Your Path to Success.
        </h1>
        <p className="text-xl text-gray-400 mb-16">Follow these 4 simple steps to land your dream job.</p>

        <div className="grid gap-8">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-6 group">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/50 flex items-center justify-center text-blue-400 font-bold group-hover:scale-110 transition-transform">
                  <step.icon className="w-6 h-6" />
                </div>
                {i !== steps.length - 1 && <div className="w-0.5 h-full bg-white/10 my-2 group-hover:bg-blue-500/30 transition-colors" />}
              </div>
              <div className="pb-12">
                <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}