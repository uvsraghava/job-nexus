"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Building2, Banknote, 
  Briefcase, LogOut, User, CheckCircle2, Loader2, Undo2,
  Settings as SettingsIcon, PartyPopper, AlertCircle, MessageCircle, Video, Calendar, ShieldCheck, 
  Sparkles, UploadCloud, FileText
} from 'lucide-react';

export default function StudentDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // --- RESUME & AI STATE ---
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resumeStats, setResumeStats] = useState<{ score: number | null, feedback: string | null }>({ score: null, feedback: null });

  const [searchTerm, setSearchTerm] = useState('');
  const [userName, setUserName] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean, message: string }>({ isOpen: false, message: '' });

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
      const res = await axios.get('https://job-nexus-f3ub.onrender.com/api/jobs', {
        headers: { 'x-auth-token': token }
      });
      if(token.split('.').length > 1) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.user.id);
      }
      setJobs(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // --- [FIXED] GLOBAL UPLOAD & ANALYZE HANDLER ---
  const handleUploadAndAnalyze = async () => {
    if (!file) return alert("Please select a PDF file first.");
    
    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
        const token = localStorage.getItem('token');
        
        // [CRITICAL FIX] Removed manual 'Content-Type' header
        // Axios handles boundary automatically for FormData
        const res = await axios.post('https://job-nexus-f3ub.onrender.com/api/auth/upload-resume', formData, {
            headers: { 
                'x-auth-token': token 
            }
        });

        // Set the Global Score immediately
        setResumeStats({
            score: res.data.score,
            feedback: res.data.feedback
        });

        alert("Resume Uploaded & Scored Successfully!");
    } catch (err: any) {
        console.error("Upload Error:", err);
        alert(err.response?.data?.msg || "Upload failed. Please try again.");
    } finally {
        setUploading(false);
    }
  };

  const getJoinedJob = () => {
    return jobs.find(j => 
      j.applicants.some((app: any) => app.studentId === currentUserId && app.status === 'Confirmed')
    );
  };

  const handleApply = async (jobId: string, jobPolicy: string, companyName: string) => {
    // We still require a file to be selected for the specific application
    if (!file) { alert('Please confirm your resume selection above first!'); return; }
    
    const joinedJob = getJoinedJob();
    if (joinedJob && jobPolicy === 'Exclusive') {
       const confirmed = confirm(
         `⚠️ Important Notice\n\n` +
         `You have already joined '${joinedJob.company}'.\n` +
         `This new position at '${companyName}' is an EXCLUSIVE POLICY role.\n\n` +
         `If you get selected and accept this offer, your current position at '${joinedJob.company}' will be AUTOMATICALLY FORFEITED.\n\n` +
         `Do you wish to proceed?`
       );
       if (!confirmed) return;
    }

    setActionLoading(jobId);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const token = localStorage.getItem('token');
      // [FIXED] Removed manual Content-Type here too for consistency
      await axios.post(`https://job-nexus-f3ub.onrender.com/api/jobs/${jobId}/apply`, formData, {
        headers: { 'x-auth-token': token }
      });
      alert('Application Successful!');
      if(token) fetchJobs(token); 
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
      await axios.post(`https://job-nexus-f3ub.onrender.com/api/jobs/${jobId}/withdraw`, {}, {
        headers: { 'x-auth-token': token }
      });
      alert('Application Withdrawn.');
      if(token) fetchJobs(token);
    } catch (err) {
      alert("Failed to withdraw.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleFinalizeOffer = async (jobId: string) => {
    if(!confirm("Are you sure? Accepting this offer will automatically WITHDRAW you from all other applications (Smart Revert).")) return;
    setActionLoading(jobId);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`https://job-nexus-f3ub.onrender.com/api/jobs/${jobId}/accept-offer`, {}, {
        headers: { 'x-auth-token': token }
      });
      alert('Congratulations! Offer Accepted.');
      if(token) fetchJobs(token);
    } catch (err: any) {
      alert(err.response?.data?.msg || "Failed to accept offer.");
    } finally {
      setActionLoading(null);
    }
  };

  const openFeedback = (msg: string) => {
    setFeedbackModal({ isOpen: true, message: msg || "No specific feedback provided." });
  };

  const handleLogout = () => { localStorage.clear(); router.push('/login'); };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans relative pb-20 md:pb-0">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <Briefcase className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
                <h1 className="text-base md:text-lg font-bold leading-tight">JobNexus</h1>
                <p className="text-[10px] md:text-xs text-blue-400 font-medium">Student Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-300 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <User className="w-4 h-4" /><span>{userName}</span>
            </div>
            <button onClick={() => router.push('/settings')} className="p-2 rounded-lg bg-gray-500/10 text-gray-400 hover:bg-gray-500 hover:text-white transition" title="Settings">
              <SettingsIcon className="w-5 h-5" />
            </button>
            <button onClick={handleLogout} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition">
                <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        
        {/* --- HERO & SEARCH --- */}
        <div className="text-center mb-10 md:mb-10">
          <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
            Find Your Next <span className="text-blue-500">Opportunity</span>
          </motion.h2>
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-full px-4 md:px-6 py-3 md:py-4 backdrop-blur-sm focus-within:border-blue-500/50 transition-all">
              <Search className="w-5 h-5 md:w-6 md:h-6 text-gray-400 mr-3 md:mr-4 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Search job or company..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="bg-transparent w-full text-base md:text-lg placeholder-gray-500 focus:outline-none text-white"
              />
            </div>
          </div>
        </div>

        {/* --- RESUME UPLOAD & SCORE SECTION --- */}
        <div className="mb-12 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-3xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Sparkles className="w-40 h-40 text-white"/>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
                {/* Left: Upload Control */}
                <div className="flex-1 w-full md:w-auto">
                    <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <UploadCloud className="text-blue-400"/> Upload Resume
                    </h3>
                    <p className="text-gray-400 mb-6 text-sm">
                        Upload your latest PDF. Our AI will analyze your profile strength instantly.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <label className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 hover:border-blue-500/50 rounded-xl cursor-pointer transition group">
                            <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
                            <FileText className={`w-6 h-6 ${file ? 'text-emerald-400' : 'text-gray-400 group-hover:text-white'}`} />
                            <span className={`font-medium ${file ? 'text-emerald-400' : 'text-gray-300 group-hover:text-white'}`}>
                                {file ? file.name.slice(0, 20) + "..." : "Select PDF File"}
                            </span>
                        </label>

                        <button 
                            onClick={handleUploadAndAnalyze} 
                            disabled={uploading || !file}
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
                        >
                            {uploading ? <Loader2 className="animate-spin"/> : <Sparkles className="w-5 h-5"/>}
                            {uploading ? "Analyzing..." : "Upload & Score"}
                        </button>
                    </div>
                </div>

                {/* Right: AI Score Result (Conditional) */}
                <AnimatePresence>
                    {resumeStats.score !== null && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            className="flex-1 w-full md:w-auto bg-black/30 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Resume Strength</span>
                                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">AI Generated</span>
                            </div>
                            
                            <div className="flex items-end gap-3 mb-3">
                                <span className={`text-5xl font-black ${resumeStats.score > 75 ? 'text-emerald-400' : resumeStats.score > 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                    {resumeStats.score}%
                                </span>
                                <span className="text-sm text-gray-400 mb-1">/ 100</span>
                            </div>

                            <p className="text-sm text-gray-300 italic border-l-2 border-white/20 pl-3">
                                "{resumeStats.feedback}"
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>

        {/* --- JOB GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredJobs.map((job) => {
            const myApp = job.applicants.find((app: any) => app.studentId === currentUserId);
            const status = myApp ? myApp.status : null;
            const hasApplied = !!myApp;
            const feedback = myApp ? myApp.feedback : null;
            const interviewDate = myApp ? myApp.interviewDate : null;
            const interviewLink = myApp ? myApp.interviewLink : null;

            return (
              <motion.div key={job._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -5 }} className={`bg-white/5 border rounded-2xl p-5 md:p-6 transition-all group ${status === 'Confirmed' ? 'border-amber-500/50 bg-amber-500/10' : 'border-white/10 hover:border-blue-500/30'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center"><Building2 className="w-6 h-6 text-gray-300" /></div>
                  <div className="flex flex-col items-end gap-1">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 whitespace-nowrap">{job.type || 'Full-time'}</span>
                      {job.jobPolicy === 'Exclusive' && (
                          <span className="flex items-center gap-1 text-[10px] text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20"><ShieldCheck className="w-3 h-3"/> Strict</span>
                      )}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1 group-hover:text-blue-400 transition line-clamp-1">{job.title}</h3>
                <p className="text-gray-400 mb-4 line-clamp-1">{job.company}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
                  <div className="flex items-center gap-1"><MapPin className="w-4 h-4 text-gray-500" />{job.location}</div>
                  <div className="flex items-center gap-1"><Banknote className="w-4 h-4 text-gray-500" />{job.salary} LPA</div>
                </div>

                {!hasApplied && (
                  <button onClick={() => handleApply(job._id, job.jobPolicy, job.company)} disabled={actionLoading === job._id} className="w-full py-3 rounded-xl font-bold bg-white text-black hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]">
                    {actionLoading === job._id ? <Loader2 className="animate-spin" /> : 'Apply Now'}
                  </button>
                )}

                {status === 'Pending' && (
                  <button onClick={() => handleWithdraw(job._id)} disabled={actionLoading === job._id} className="w-full py-3 rounded-xl font-bold bg-gray-500/20 text-gray-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                    {actionLoading === job._id ? <Loader2 className="animate-spin" /> : <><Undo2 className="w-4 h-4"/> Withdraw</>}
                  </button>
                )}

                {status === 'Interview Scheduled' && (
                  <div className="w-full p-4 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex flex-col gap-3">
                     <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                       <Video className="w-4 h-4" /> Interview Scheduled
                     </div>
                     {interviewDate && (
                       <div className="flex items-center gap-2 text-xs text-gray-300">
                         <Calendar className="w-3 h-3 flex-shrink-0" /> 
                         <span>{new Date(interviewDate).toLocaleString()}</span>
                       </div>
                     )}
                     {interviewLink && (
                       <a href={interviewLink} target="_blank" rel="noopener noreferrer" className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 transition active:scale-[0.98]">
                         Join Video Call
                       </a>
                     )}
                  </div>
                )}

                {status === 'Accepted' && (
                  <div className="space-y-2">
                    <div className="text-center text-xs text-emerald-400 font-bold uppercase tracking-wider">Offer Received!</div>
                    <button onClick={() => handleFinalizeOffer(job._id)} disabled={actionLoading === job._id} className="w-full py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 animate-pulse active:scale-[0.98]">
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
                  <div className="space-y-2">
                    <div className="w-full py-3 rounded-xl font-bold bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center gap-2">
                      Rejected
                    </div>
                    {feedback && (
                      <button onClick={() => openFeedback(feedback)} className="w-full py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 flex items-center justify-center gap-1 transition active:scale-[0.98]">
                        <MessageCircle className="w-3 h-3" /> View Reason
                      </button>
                    )}
                  </div>
                )}

              </motion.div>
            );
          })}
        </div>
      </main>

      <AnimatePresence>
        {feedbackModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm bg-[#1e293b] border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-full text-red-500">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Application Feedback</h3>
              </div>
              
              <div className="bg-black/20 rounded-lg p-4 border border-white/5 text-gray-300 italic mb-6 text-sm max-h-60 overflow-y-auto">
                "{feedbackModal.message}"
              </div>

              <button 
                onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })} 
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition active:scale-[0.98]"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}