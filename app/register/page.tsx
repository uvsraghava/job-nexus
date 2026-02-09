"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  User, Mail, Lock, Briefcase, GraduationCap, LineChart, 
  ArrowRight, ArrowLeft, Loader2, AlertCircle 
} from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log("Attempting Local Registration on Port 5001...");
      
      // ⚠️ FIX: Changed to Localhost so it talks to your running backend
      const res = await axios.post('https://job-nexus-f3ub.onrender.com/api/auth/register', {
        name,
        email,
        password,
        role
      });
      
      console.log("Registration Success:", res.data);
      // Optional: Auto-login logic can go here, but redirecting to login is safer
      router.push('/login');
    } catch (err: any) {
      console.error(err);
      // Improved error message to help you debug
      const msg = err.response?.data?.msg || 'Connection Failed. Is Local Backend (Port 5001) running?';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute top-6 left-6 z-50">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Home</span>
        </Link>
      </div>

      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-400">Join the platform</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            
            {/* ROLE SELECTOR */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { id: 'student', label: 'Student', icon: GraduationCap },
                { id: 'recruiter', label: 'Recruiter', icon: Briefcase },
                { id: 'faculty', label: 'Faculty', icon: LineChart },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                    role === item.id 
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <item.icon className="w-6 h-6 mb-1" />
                  <span className="text-xs font-bold">{item.label}</span>
                </button>
              ))}
            </div>

            {/* FULL NAME */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Full Name</label>
              <div className="relative group">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* REGISTER BUTTON */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Creating Local Account...
                </>
              ) : (
                <>
                  Get Started <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition">
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}