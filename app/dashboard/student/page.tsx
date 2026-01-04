"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Search, MapPin, Building2, Banknote, 
  Briefcase, LogOut, User, CheckCircle2, Loader2, Undo2,
  Settings as SettingsIcon, PartyPopper, AlertCircle 
} from 'lucide-react';

export default function StudentDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userName, setUserName] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedName = localStorage.getItem('name');
    const role = localStorage.getItem('role');

    if (!token || role !== 'student') {
      router.push('/login');
    } else {
      setUserName(storedName || 'Student');
      fetchJobs(token);
    }
  }, []);

  const fetchJobs = async (token: string) => {
    try {
      const res = await axios.get('http://localhost:5001/api/jobs', {
        headers: { 'x-auth-token': token }
      });
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(payload.user.id);
      
      setJobs(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    if (!file) { alert('Please select a resume (PDF) first!'); return; }
    setActionLoading(jobId);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5001/api/jobs/${jobId}/apply`, formData, {
        headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' }
      });
      alert('Application Successful!');
      fetchJobs(token!); 
    } catch (err: any) {
      alert(err.response?.data?.msg || 'Application failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleWithdraw = async (jobId: string) => {
    if(!confirm("Withdraw your application?")) return;
    setActionLoading(jobId);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5001/api/jobs/${jobId}/withdraw`, {}, {
        headers: { 'x-auth-token': token }
      });
      alert('Application Withdrawn.');
      fetchJobs(token!);
    } catch (err) {
      alert("Failed to withdraw.");
    } finally {
      setActionLoading(null);
    }
  };

  // --- NEW: ACCEPT OFFER FUNCTION ---
  const handleFinalizeOffer = async (jobId: string) => {
    if(!confirm("Are you sure? Accepting this offer will automatically WITHDRAW you from all other applications. This is final.")) return;
    
    setActionLoading(jobId);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5001/api/jobs/${jobId}/accept-offer`, {}, {
        headers: { 'x-auth-token': token }
      });
      alert('Congratulations! Offer Accepted.');
      fetchJobs(token!);
    } catch (err: any) {
      alert(err.response?.data?.msg || "Failed to accept offer.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => { localStorage.clear(); router.push('/login'); };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans">
      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center"><Briefcase className="text-white w-6 h-6" /></div>
            <div><h1 className="text-lg font-bold leading-tight">JobNexus</h1><p className="text-xs text-blue-400 font-medium">Student Portal</p></div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-300 bg-white/5 px-4 py-2 rounded-full border border-white/10"><User className="w-4 h-4" /><span>{userName}</span></div>
            <button onClick={() => router.push('/settings')} className="p-2 rounded-lg bg-gray-500/10 text-gray-400 hover:bg-gray-500 hover:text-white transition" title="Settings">
              <SettingsIcon className="w-5 h-5" />
            </button>
            <button onClick={handleLogout} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-bold mb-6">Find Your Next <span className="text-blue-500">Opportunity</span></motion.h2>
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-full px-6 py-4 backdrop-blur-sm focus-within:border-blue-500/50 transition-all">
              <Search className="w-6 h-6 text-gray-400 mr-4" />
              <input type="text" placeholder="Search by job title or company..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent w-full text-lg placeholder-gray-500 focus:outline-none text-white"/>
            </div>
          </div>
        </div>

        <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div><h3 className="text-xl font-bold text-blue-400 mb-1">Step 1: Upload Your Resume</h3><p className="text-gray-400 text-sm">Select your PDF once, then apply to multiple jobs easily.</p></div>
          <label className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer transition shadow-lg shadow-blue-500/20">
            <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
            {file ? <><CheckCircle2 className="w-5 h-5" />{file.name.slice(0, 15)}...</> : <><span className="text-xl">+</span> Select Resume PDF</>}
          </label>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => {
            const myApp = job.applicants.find((app: any) => app.studentId === currentUserId);
            const status = myApp ? myApp.status : null;
            const hasApplied = !!myApp;

            return (
              <motion.div key={job._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -5 }} className={`bg-white/5 border rounded-2xl p-6 transition-all group ${status === 'Confirmed' ? 'border-amber-500/50 bg-amber-500/10' : 'border-white/10 hover:border-blue-500/30'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center"><Building2 className="w-6 h-6 text-gray-300" /></div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">{job.type || 'Full-time'}</span>
                </div>
                <h3 className="text-xl font-bold mb-1 group-hover:text-blue-400 transition">{job.title}</h3>
                <p className="text-gray-400 mb-4">{job.company}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                  <div className="flex items-center gap-1"><MapPin className="w-4 h-4 text-gray-500" />{job.location}</div>
                  <div className="flex items-center gap-1"><Banknote className="w-4 h-4 text-gray-500" />{job.salary} LPA</div>
                </div>

                {/* --- DYNAMIC BUTTONS BASED ON STATUS --- */}
                
                {!hasApplied && (
                  <button onClick={() => handleApply(job._id)} disabled={actionLoading === job._id} className="w-full py-3 rounded-xl font-bold bg-white text-black hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {actionLoading === job._id ? <Loader2 className="animate-spin" /> : 'Apply Now'}
                  </button>
                )}

                {status === 'Pending' && (
                  <button onClick={() => handleWithdraw(job._id)} disabled={actionLoading === job._id} className="w-full py-3 rounded-xl font-bold bg-gray-500/20 text-gray-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2">
                    {actionLoading === job._id ? <Loader2 className="animate-spin" /> : <><Undo2 className="w-4 h-4"/> Withdraw</>}
                  </button>
                )}

                {status === 'Accepted' && (
                  <div className="space-y-2">
                    <div className="text-center text-xs text-emerald-400 font-bold uppercase tracking-wider">Offer Received!</div>
                    <button onClick={() => handleFinalizeOffer(job._id)} disabled={actionLoading === job._id} className="w-full py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 animate-pulse">
                      {actionLoading === job._id ? <Loader2 className="animate-spin" /> : <><PartyPopper className="w-4 h-4"/> Accept Offer</>}
                    </button>
                  </div>
                )}

                {status === 'Confirmed' && (
                  <div className="w-full py-3 rounded-xl font-bold bg-amber-500/20 text-amber-400 border border-amber-500/20 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5"/> Joined
                  </div>
                )}

                {status && status.includes('Withdrawn') && (
                  <div className="w-full py-3 rounded-xl font-bold bg-red-500/10 text-red-500/50 border border-red-500/10 flex items-center justify-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4"/> Withdrawn
                  </div>
                )}

                {status === 'Rejected' && (
                  <div className="w-full py-3 rounded-xl font-bold bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center gap-2">
                    Rejected
                  </div>
                )}

              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}