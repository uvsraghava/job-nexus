"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Users, FileText, Check, X, LogOut, 
  MapPin, Banknote, Calendar, ChevronDown, ChevronUp, Loader2, Plus, X as CloseIcon, BarChart3, Trash2,
  Settings as SettingsIcon, PartyPopper, Trophy, UserCheck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [joinedCandidates, setJoinedCandidates] = useState<any[]>([]); // NEW STATE
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);
  const [posting, setPosting] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', company: '', location: '', salary: '', description: '', type: 'Full-time' });
  const [chartData, setChartData] = useState<any[]>([]);

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
      const res = await axios.get('http://localhost:5001/api/jobs/my-jobs', {
        headers: { 'x-auth-token': token }
      });
      setJobs(res.data);
      
      // --- LOGIC: Separate Joined Candidates ---
      const joined: any[] = [];
      const chartStats: any[] = [];

      res.data.forEach((job: any) => {
        // 1. Chart Data
        chartStats.push({
          name: job.title.split(' ')[0],
          applicants: job.applicants.length
        });

        // 2. Find Joined Candidates
        job.applicants.forEach((app: any) => {
          if (app.status === 'Confirmed') {
            joined.push({
              studentName: app.name,
              email: app.email,
              role: job.title,
              salary: job.salary,
              joinedDate: app.appliedAt // Or a new date if we tracked it
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

  const handleStatusUpdate = async (jobId: string, studentId: string, status: string) => {
    setActionLoading(`${jobId}-${studentId}-${status}`);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5001/api/jobs/${jobId}/application/${studentId}`,
        { status },
        { headers: { 'x-auth-token': token } }
      );
      fetchMyJobs(token!);
    } catch (err: any) {
      alert(err.response?.data?.msg || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/jobs', newJob, {
        headers: { 'x-auth-token': token }
      });
      setNewJob({ title: '', company: '', location: '', salary: '', description: '', type: 'Full-time' });
      setShowPostModal(false);
      fetchMyJobs(token!);
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
      await axios.delete(`http://localhost:5001/api/jobs/${jobId}`, {
        headers: { 'x-auth-token': token }
      });
      fetchMyJobs(token!);
    } catch (err) {
      alert("Failed to delete job.");
    }
  };

  const handleLogout = () => { localStorage.clear(); router.push('/login'); };
  const toggleJob = (id: string) => { setExpandedJob(expandedJob === id ? null : id); };

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans relative">
      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center"><Briefcase className="text-white w-6 h-6" /></div>
            <div><h1 className="text-lg font-bold leading-tight">JobNexus</h1><p className="text-xs text-purple-400 font-medium">Recruiter Console</p></div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-300 bg-white/5 px-4 py-2 rounded-full border border-white/10"><Users className="w-4 h-4" /><span>{userName}</span></div>
            <button onClick={() => router.push('/settings')} className="p-2 rounded-lg bg-gray-500/10 text-gray-400 hover:bg-gray-500 hover:text-white transition" title="Settings"><SettingsIcon className="w-5 h-5" /></button>
            <button onClick={handleLogout} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        
        {/* --- TOP STATS ROW --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
           {/* Chart */}
           {chartData.length > 0 && (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><BarChart3 className="text-purple-400" /> Demand Overview</h3>
              <div className="h-32 w-full">
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

          {/* TOTAL JOINS STAT */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900/40 to-emerald-900/10 border border-emerald-500/20 flex flex-col justify-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Trophy className="w-24 h-24 text-emerald-400"/></div>
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><UserCheck className="w-6 h-6"/></div>
                <h3 className="text-lg font-bold text-emerald-400">Total Joins</h3>
             </div>
             <div className="text-4xl font-bold text-white">{joinedCandidates.length}</div>
             <p className="text-sm text-gray-400 mt-1">Candidates successfully placed</p>
          </div>
        </div>

        {/* --- JOINED CANDIDATES SECTION (NEW) --- */}
        {joinedCandidates.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
              <PartyPopper className="text-yellow-500" /> Successfully Joined
            </h2>
            <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
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
                      <td className="p-4">
                        <div className="font-bold text-white">{c.studentName}</div>
                        <div className="text-xs text-gray-400">{c.email}</div>
                      </td>
                      <td className="p-4 text-gray-300">{c.role}</td>
                      <td className="p-4 font-bold text-emerald-400">{c.salary} LPA</td>
                      <td className="p-4 text-right">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                          Joined <Check className="w-3 h-3" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold">Active Job Postings</h2>
          <button onClick={() => setShowPostModal(true)} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition shadow-lg shadow-purple-500/20 flex items-center gap-2"><Plus className="w-5 h-5" /> Post New Job</button>
        </div>

        {/* JOB LISTINGS */}
        <div className="space-y-6">
          {jobs.map((job) => (
            <motion.div key={job._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div onClick={() => toggleJob(job._id)} className="p-6 cursor-pointer hover:bg-white/5 transition flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                    <span className="flex items-center gap-1"><Banknote className="w-4 h-4" /> {job.salary} LPA</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <button onClick={(e) => handleDeleteJob(job._id, e)} className="p-2 text-gray-500 hover:text-red-400 transition" title="Delete Job"><Trash2 className="w-5 h-5" /></button>
                  <div className="text-right"><div className="text-2xl font-bold text-purple-400">{job.applicants.length}</div><div className="text-xs text-gray-500 uppercase tracking-wide">Applicants</div></div>
                  {expandedJob === job._id ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
                </div>
              </div>

              <AnimatePresence>
                {expandedJob === job._id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/10 bg-black/20">
                    <div className="p-6">
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Candidate List</h4>
                      {job.applicants.length === 0 ? <div className="text-center py-8 text-gray-500 italic">No applications yet.</div> : (
                        <div className="space-y-3">
                          {job.applicants.map((app: any, index: number) => (
                            <div key={index} className="flex flex-col md:flex-row items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 hover:border-purple-500/30 transition">
                              <div className="flex items-center gap-4 mb-4 md:mb-0 w-full md:w-auto">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-sm">{app.name ? app.name.charAt(0).toUpperCase() : '?'}</div>
                                <div><div className="font-bold">{app.name || 'Unknown'}</div><div className="text-sm text-gray-400">{app.email}</div></div>
                              </div>
                              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                <a href={`http://localhost:5001/${app.resume}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition"><FileText className="w-4 h-4" /> Resume</a>
                                
                                {app.status === 'Pending' && (
                                  <div className="flex items-center gap-2">
                                    <button onClick={() => handleStatusUpdate(job._id, app.studentId, 'Accepted')} disabled={!!actionLoading} className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition" title="Accept (Send Offer)">{actionLoading === `${job._id}-${app.studentId}-Accepted` ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4" />}</button>
                                    <button onClick={() => handleStatusUpdate(job._id, app.studentId, 'Rejected')} disabled={!!actionLoading} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition" title="Reject">{actionLoading === `${job._id}-${app.studentId}-Rejected` ? <Loader2 className="w-4 h-4 animate-spin"/> : <X className="w-4 h-4" />}</button>
                                  </div>
                                )}

                                {app.status === 'Accepted' && <span className="px-3 py-1 rounded-full text-xs font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1">Offer Sent <Check className="w-3 h-3"/></span>}
                                {app.status === 'Confirmed' && <span className="px-3 py-1 rounded-full text-xs font-bold border bg-amber-500/20 text-amber-400 border-amber-500/20 flex items-center gap-2 animate-pulse"><PartyPopper className="w-3 h-3"/> Joined!</span>}
                                {app.status.includes('Withdrawn') && <span className="px-3 py-1 rounded-full text-xs font-bold border bg-gray-500/10 text-gray-500 border-gray-500/20">Withdrawn</span>}
                                {app.status === 'Rejected' && <span className="px-3 py-1 rounded-full text-xs font-bold border bg-red-500/10 text-red-500 border-red-500/20">Rejected</span>}

                              </div>
                            </div>
                          ))}
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

      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPostModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-[#1e293b] border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-white">Create New Job</h3><button onClick={() => setShowPostModal(false)} className="text-gray-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button></div>
              <form onSubmit={handlePostJob} className="space-y-4">
                <div><label className="text-xs text-gray-400 uppercase font-bold">Job Title</label><input type="text" required placeholder="e.g. Senior React Developer" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"/></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-gray-400 uppercase font-bold">Company</label><input type="text" required placeholder="e.g. Tech Corp" value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"/></div>
                  <div><label className="text-xs text-gray-400 uppercase font-bold">Salary (LPA)</label><input type="text" required placeholder="e.g. 15" value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"/></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-gray-400 uppercase font-bold">Location</label><input type="text" required placeholder="e.g. Remote" value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"/></div>
                  <div><label className="text-xs text-gray-400 uppercase font-bold">Type</label><select value={newJob.type} onChange={e => setNewJob({...newJob, type: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"><option value="Full-time">Full-time</option><option value="Internship">Internship</option><option value="Part-time">Part-time</option></select></div>
                </div>
                <div><label className="text-xs text-gray-400 uppercase font-bold">Description</label><textarea rows={4} required placeholder="Job details..." value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"/></div>
                <button type="submit" disabled={posting} className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg flex items-center justify-center gap-2">{posting ? <Loader2 className="animate-spin" /> : 'Publish Job'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}