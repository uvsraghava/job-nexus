"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Users, FileText, Check, X, LogOut, 
  MapPin, Banknote, Calendar, ChevronDown, ChevronUp, Loader2, Plus, X as CloseIcon, BarChart3, Trash2,
  Settings as SettingsIcon, PartyPopper, Trophy, UserCheck, MessageSquare, Video
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [joinedCandidates, setJoinedCandidates] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  
  // --- MODALS STATE ---
  const [showPostModal, setShowPostModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false); 

  const [posting, setPosting] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', company: '', location: '', salary: '', description: '', type: 'Full-time' });
  const [chartData, setChartData] = useState<any[]>([]);

  // --- ACTION DATA ---
  const [rejectData, setRejectData] = useState({ jobId: '', studentId: '', feedback: '' });
  const [interviewData, setInterviewData] = useState({ jobId: '', studentId: '', date: '', link: '' }); 

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');

    if (!token || role !== 'recruiter') {
      router.push('/login');
    } else {
      setUserName(name || 'Recruiter');
      fetchMyJobs(token);
    }
  }, []);

  const fetchMyJobs = async (token: string) => {
    try {
      const res = await axios.get('https://job-nexus-f3ub.onrender.com/api/jobs/my-jobs', {
        headers: { 'x-auth-token': token }
      });
      setJobs(res.data);
      
      const joined: any[] = [];
      const chartStats: any[] = [];

      res.data.forEach((job: any) => {
        chartStats.push({
          name: job.title.split(' ')[0],
          applicants: job.applicants.length
        });

        job.applicants.forEach((app: any) => {
          if (app.status === 'Confirmed') {
            joined.push({
              studentName: app.name,
              email: app.email,
              role: job.title,
              salary: job.salary,
              joinedDate: app.appliedAt 
            });
          }
        });
      });

      setJoinedCandidates(joined);
      setChartData(chartStats);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    jobId: string, 
    studentId: string, 
    status: string, 
    feedback: string = "",
    interviewDate: string = "",
    interviewLink: string = ""
  ) => {
    
    // 1. REJECTION FLOW
    if (status === 'Rejected' && !feedback && !showRejectModal) {
      setRejectData({ jobId, studentId, feedback: '' });
      setShowRejectModal(true);
      return;
    }

    // 2. INTERVIEW FLOW
    if (status === 'Interview Scheduled' && !interviewLink && !showInterviewModal) {
      setInterviewData({ jobId, studentId, date: '', link: '' });
      setShowInterviewModal(true);
      return;
    }

    setActionLoading(`${jobId}-${studentId}-${status}`);
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://job-nexus-f3ub.onrender.com/api/jobs/${jobId}/application/${studentId}`,
        { status, feedback, interviewDate, interviewLink }, 
        { headers: { 'x-auth-token': token } }
      );
      
      setShowRejectModal(false);
      setShowInterviewModal(false);

      if(token) fetchMyJobs(token);
    } catch (err: any) {
      alert(err.response?.data?.msg || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const confirmRejection = () => {
    handleStatusUpdate(rejectData.jobId, rejectData.studentId, 'Rejected', rejectData.feedback);
  };

  const confirmInterview = () => {
    if(!interviewData.date || !interviewData.link) return alert("Please fill all fields");
    handleStatusUpdate(
      interviewData.jobId, 
      interviewData.studentId, 
      'Interview Scheduled', 
      '', 
      interviewData.date, 
      interviewData.link
    );
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://job-nexus-f3ub.onrender.com/api/jobs', newJob, {
        headers: { 'x-auth-token': token }
      });
      setNewJob({ title: '', company: '', location: '', salary: '', description: '', type: 'Full-time' });
      setShowPostModal(false);
      if(token) fetchMyJobs(token);
    } catch (err: any) {
      alert('Failed to post job');
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteJob = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(!confirm("Are you sure you want to delete this job? This cannot be undone.")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://job-nexus-f3ub.onrender.com/api/jobs/${jobId}`, {
        headers: { 'x-auth-token': token }
      });
      if(token) fetchMyJobs(token);
    } catch (err) {
      alert("Failed to delete job.");
    }
  };

  const handleLogout = () => { localStorage.clear(); router.push('/login'); };
  const toggleJob = (id: string) => { setExpandedJob(expandedJob === id ? null : id); };

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans relative pb-20 md:pb-0">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-purple-600 flex items-center justify-center">
                <Briefcase className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
                <h1 className="text-base md:text-lg font-bold leading-tight">JobNexus</h1>
                <p className="text-[10px] md:text-xs text-purple-400 font-medium">Recruiter Console</p>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-300 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <Users className="w-4 h-4" /><span>{userName}</span>
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

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-12">
        
        {/* --- TOP STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-10">
           {chartData.length > 0 && (
            <div className="p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><BarChart3 className="text-purple-400" /> Demand Overview</h3>
              <div className="h-40 md:h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <Tooltip cursor={{fill: '#ffffff10'}} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                    <Bar dataKey="applicants" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="p-4 md:p-6 rounded-2xl bg-gradient-to-br from-emerald-900/40 to-emerald-900/10 border border-emerald-500/20 flex flex-col justify-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Trophy className="w-20 h-20 md:w-24 md:h-24 text-emerald-400"/></div>
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><UserCheck className="w-5 h-5 md:w-6 md:h-6"/></div>
                <h3 className="text-base md:text-lg font-bold text-emerald-400">Total Joins</h3>
             </div>
             <div className="text-3xl md:text-4xl font-bold text-white">{joinedCandidates.length}</div>
             <p className="text-xs md:text-sm text-gray-400 mt-1">Candidates successfully placed</p>
          </div>
        </div>

        {/* --- JOINED SECTION --- */}
        {joinedCandidates.length > 0 && (
          <div className="mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2 text-white">
              <PartyPopper className="text-yellow-500 w-6 h-6" /> Successfully Joined
            </h2>
            <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-emerald-900/20 text-emerald-400 uppercase text-xs font-bold">
                    <tr>
                      <th className="p-4">Candidate</th>
                      <th className="p-4">Job Role</th>
                      <th className="p-4">Package</th>
                      <th className="p-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-500/10">
                    {joinedCandidates.map((c, i) => (
                      <tr key={i} className="hover:bg-emerald-500/5 transition">
                        <td className="p-4"><div className="font-bold text-white">{c.studentName}</div><div className="text-xs text-gray-400">{c.email}</div></td>
                        <td className="p-4 text-gray-300">{c.role}</td>
                        <td className="p-4 font-bold text-emerald-400">{c.salary} LPA</td>
                        <td className="p-4 text-right"><span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">Joined <Check className="w-3 h-3" /></span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-10 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold">Active Job Postings</h2>
          <button onClick={() => setShowPostModal(true)} className="w-full md:w-auto px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 active:scale-95">
            <Plus className="w-5 h-5" /> Post New Job
          </button>
        </div>

        {/* JOB LISTINGS */}
        <div className="space-y-4 md:space-y-6">
          {jobs.map((job) => (
            <motion.div key={job._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div onClick={() => toggleJob(job._id)} className="p-5 md:p-6 cursor-pointer hover:bg-white/5 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-2">{job.title}</h3>
                  <div className="flex items-center gap-4 text-xs md:text-sm text-gray-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 md:w-4 md:h-4" /> {job.location}</span>
                    <span className="flex items-center gap-1"><Banknote className="w-3 h-3 md:w-4 md:h-4" /> {job.salary} LPA</span>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-2 md:pt-0 border-t border-white/5 md:border-none">
                  <button onClick={(e) => handleDeleteJob(job._id, e)} className="p-2 text-gray-500 hover:text-red-400 transition" title="Delete Job"><Trash2 className="w-5 h-5" /></button>
                  <div className="text-right flex items-center md:block gap-2">
                    <div className="text-xl md:text-2xl font-bold text-purple-400">{job.applicants.length}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Applicants</div>
                  </div>
                  {expandedJob === job._id ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
                </div>
              </div>

              <AnimatePresence>
                {expandedJob === job._id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/10 bg-black/20">
                    <div className="p-4 md:p-6">
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Candidate List</h4>
                      {job.applicants.length === 0 ? <div className="text-center py-8 text-gray-500 italic">No applications yet.</div> : (
                        <div className="space-y-3">
                          {job.applicants.map((app: any, index: number) => {
                            
                            // --- NEW LOGIC: DETERMINE RESUME URL ---
                            const resumeUrl = app.resume?.startsWith('http') 
                              ? app.resume 
                              : `https://job-nexus-f3ub.onrender.com/${app.resume}`;

                            return (
                              <div key={index} className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 hover:border-purple-500/30 transition gap-4">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-sm flex-shrink-0">{app.name ? app.name.charAt(0).toUpperCase() : '?'}</div>
                                  <div className="min-w-0">
                                    <div className="font-bold truncate">{app.name || 'Unknown'}</div>
                                    <div className="text-xs md:text-sm text-gray-400 truncate">{app.email}</div>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full md:w-auto justify-between md:justify-end">
                                  
                                  {/* --- RESUME LINK (UPDATED) --- */}
                                  <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition"><FileText className="w-4 h-4" /> Resume</a>
                                  
                                  {app.status === 'Pending' && (
                                    <div className="flex items-center gap-2">
                                      <button onClick={() => handleStatusUpdate(job._id, app.studentId, 'Interview Scheduled')} disabled={!!actionLoading} className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition active:scale-95" title="Schedule Interview">
                                        {actionLoading === `${job._id}-${app.studentId}-Interview Scheduled` ? <Loader2 className="w-4 h-4 animate-spin"/> : <Video className="w-4 h-4" />}
                                      </button>
                                      <button onClick={() => handleStatusUpdate(job._id, app.studentId, 'Rejected')} disabled={!!actionLoading} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition active:scale-95" title="Reject">
                                        {actionLoading === `${job._id}-${app.studentId}-Rejected` ? <Loader2 className="w-4 h-4 animate-spin"/> : <X className="w-4 h-4" />}
                                      </button>
                                    </div>
                                  )}

                                  {app.status === 'Interview Scheduled' && (
                                     <div className="flex flex-wrap items-center gap-2">
                                       <span className="px-3 py-1 rounded-full text-xs font-bold border bg-indigo-500/10 text-indigo-400 border-indigo-500/20 flex items-center gap-1">Set <Video className="w-3 h-3"/></span>
                                       <button onClick={() => handleStatusUpdate(job._id, app.studentId, 'Accepted')} className="p-1.5 px-3 rounded-md bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition text-xs font-bold active:scale-95">Hire</button>
                                       {/* --- REJECT BUTTON FOR INTERVIEW STAGE --- */}
                                       <button onClick={() => handleStatusUpdate(job._id, app.studentId, 'Rejected')} className="p-1.5 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition text-xs font-bold active:scale-95" title="Reject Candidate"><X className="w-4 h-4" /></button>
                                     </div>
                                  )}

                                  {app.status === 'Accepted' && <span className="px-3 py-1 rounded-full text-xs font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1">Offer Sent <Check className="w-3 h-3"/></span>}
                                  {app.status === 'Confirmed' && <span className="px-3 py-1 rounded-full text-xs font-bold border bg-amber-500/20 text-amber-400 border-amber-500/20 flex items-center gap-2 animate-pulse"><PartyPopper className="w-3 h-3"/> Joined!</span>}
                                  {app.status.includes('Withdrawn') && <span className="px-3 py-1 rounded-full text-xs font-bold border bg-gray-500/10 text-gray-500 border-gray-500/20">Withdrawn</span>}
                                  {app.status === 'Rejected' && <span className="px-3 py-1 rounded-full text-xs font-bold border bg-red-500/10 text-red-500 border-red-500/20">Rejected</span>}

                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </main>

      {/* --- MODALS (POST, REJECT, INTERVIEW) --- */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPostModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-[#1e293b] border border-white/10 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-white">Create New Job</h3><button onClick={() => setShowPostModal(false)} className="text-gray-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button></div>
              <form onSubmit={handlePostJob} className="space-y-4">
                <div><label className="text-xs text-gray-400 uppercase font-bold">Job Title</label><input type="text" required placeholder="e.g. Senior React Developer" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"/></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-xs text-gray-400 uppercase font-bold">Company</label><input type="text" required placeholder="e.g. Tech Corp" value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"/></div>
                  <div><label className="text-xs text-gray-400 uppercase font-bold">Salary (LPA)</label><input type="text" required placeholder="e.g. 15" value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"/></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-xs text-gray-400 uppercase font-bold">Location</label><input type="text" required placeholder="e.g. Remote" value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"/></div>
                  <div><label className="text-xs text-gray-400 uppercase font-bold">Type</label><select value={newJob.type} onChange={e => setNewJob({...newJob, type: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"><option value="Full-time">Full-time</option><option value="Internship">Internship</option><option value="Part-time">Part-time</option></select></div>
                </div>
                <div><label className="text-xs text-gray-400 uppercase font-bold">Description</label><textarea rows={4} required placeholder="Job details..." value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"/></div>
                <button type="submit" disabled={posting} className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 active:scale-95">{posting ? <Loader2 className="animate-spin" /> : 'Publish Job'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRejectModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-[#1e293b] border border-red-500/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-red-500/10 rounded-full text-red-500"><MessageSquare className="w-6 h-6" /></div>
                <div><h3 className="text-lg font-bold text-white">Rejection Feedback</h3><p className="text-sm text-gray-400 mt-1">Help the candidate improve by providing a reason.</p></div>
              </div>
              <textarea rows={4} autoFocus placeholder="e.g. Strong skills, but need more experience..." value={rejectData.feedback} onChange={e => setRejectData({...rejectData, feedback: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 mb-6 placeholder-gray-600 resize-none"/>
              <div className="flex gap-3">
                <button onClick={() => setShowRejectModal(false)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-lg transition active:scale-95">Cancel</button>
                <button onClick={confirmRejection} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition active:scale-95">Confirm Rejection</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInterviewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowInterviewModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-[#1e293b] border border-indigo-500/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-indigo-500/10 rounded-full text-indigo-500"><Calendar className="w-6 h-6" /></div>
                <div><h3 className="text-lg font-bold text-white">Schedule Interview</h3><p className="text-sm text-gray-400 mt-1">Set a time and Google Meet/Zoom link.</p></div>
              </div>
              <div className="space-y-4 mb-6">
                <div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Date & Time</label><input type="datetime-local" value={interviewData.date} onChange={e => setInterviewData({...interviewData, date: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500"/></div>
                <div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Video Call Link</label><input type="text" placeholder="https://meet.google.com/..." value={interviewData.link} onChange={e => setInterviewData({...interviewData, link: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500"/></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowInterviewModal(false)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-lg transition active:scale-95">Cancel</button>
                <button onClick={confirmInterview} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition active:scale-95">Send Invitation</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}