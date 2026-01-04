"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LineChart, Users, Briefcase, CheckCircle2, LogOut, 
  TrendingUp, Building2, PieChart as PieIcon, BarChart3,
  Calculator, Scale, ArrowUpRight, ArrowDownRight, UserPlus, Check, ShieldAlert,
  Settings as SettingsIcon, PartyPopper, Trophy, Clock
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';

export default function FacultyDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalJobs: 0, totalApps: 0, totalHired: 0 });
  const [packageStats, setPackageStats] = useState({ highest: 0, lowest: 0, average: 0, median: 0 });
  
  // --- SPLIT LISTS ---
  const [confirmedPlacements, setConfirmedPlacements] = useState<any[]>([]); // New List
  const [recentOffers, setRecentOffers] = useState<any[]>([]); // New List
  
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [salaryData, setSalaryData] = useState<any[]>([]);
  const [userName, setUserName] = useState('');
  const router = useRouter();

  const COLORS = ['#10b981', '#ef4444', '#3b82f6'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'faculty') router.push('/login');
    else {
      setUserName(localStorage.getItem('name') || 'Faculty');
      fetchData(token);
    }
  }, []);

  const fetchData = async (token: string) => {
    try {
      const res = await axios.get('http://localhost:5001/api/jobs');
      const allJobs = res.data;

      try {
        const pendingRes = await axios.get('http://localhost:5001/api/auth/pending-students', {
          headers: { 'x-auth-token': token }
        });
        setPendingStudents(pendingRes.data);
      } catch (e) {
        console.error("Could not fetch pending students", e);
      }

      let appCount = 0;
      let confirmedJoins = 0;
      let offerCount = 0;
      let rejectedCount = 0;
      let pendingCount = 0;
      
      let confirmedList: any[] = [];
      let offersList: any[] = [];
      let salaryStats: any[] = [];
      let offerSalaries: number[] = [];

      allJobs.forEach((job: any) => {
        appCount += job.applicants.length;
        
        job.applicants.forEach((app: any) => {
          // 1. CONFIRMED JOINS (The "Success" List)
          if (app.status === 'Confirmed') {
            confirmedJoins++;
            offerCount++; // Still counts as an offer made
            if (job.salary) offerSalaries.push(parseFloat(job.salary));

            confirmedList.push({
              studentName: app.name, 
              company: job.company, 
              role: job.title, 
              package: job.salary,
              email: app.email,
              status: app.status
            });
          } 
          // 2. ACTIVE OFFERS (The "Pending Decision" List)
          else if (app.status === 'Accepted') {
            offerCount++;
            if (job.salary) offerSalaries.push(parseFloat(job.salary));

            offersList.push({
              studentName: app.name, 
              company: job.company, 
              role: job.title, 
              package: job.salary,
              email: app.email,
              status: app.status
            });
          } 
          // 3. OTHER STATS
          else if (app.status === 'Rejected') {
            rejectedCount++;
          } else if (app.status === 'Pending') {
            pendingCount++;
          }
        });

        if(job.salary) salaryStats.push({ name: job.company, salary: parseInt(job.salary) });
      });

      // --- CALCULATIONS ---
      let pStats = { highest: 0, lowest: 0, average: 0, median: 0 };
      if (offerSalaries.length > 0) {
        offerSalaries.sort((a, b) => a - b);
        const sum = offerSalaries.reduce((a, b) => a + b, 0);
        pStats.highest = offerSalaries[offerSalaries.length - 1];
        pStats.lowest = offerSalaries[0];
        pStats.average = parseFloat((sum / offerSalaries.length).toFixed(1));
        const mid = Math.floor(offerSalaries.length / 2);
        pStats.median = offerSalaries.length % 2 !== 0 ? offerSalaries[mid] : (offerSalaries[mid - 1] + offerSalaries[mid]) / 2;
      }

      setStats({ 
        totalJobs: allJobs.length, 
        totalApps: appCount, 
        totalHired: confirmedJoins
      });
      
      setPackageStats(pStats);
      setConfirmedPlacements(confirmedList); // Set Separate List
      setRecentOffers(offersList); // Set Separate List
      
      setChartData([
        { name: 'Offers/Hired', value: offerCount }, 
        { name: 'Rejected', value: rejectedCount }, 
        { name: 'Pending', value: pendingCount }
      ]);
      
      setSalaryData(salaryStats.sort((a,b) => b.salary - a.salary).slice(0, 5));
      setLoading(false);

    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleApproveStudent = async (studentId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/api/auth/approve-student/${studentId}`, {}, {
        headers: { 'x-auth-token': token }
      });
      fetchData(token!);
      alert("Student Approved!");
    } catch (err) {
      alert("Approval Failed");
    }
  };

  const handleLogout = () => { localStorage.clear(); router.push('/login'); };

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">Loading Analytics...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans">
      
      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center"><LineChart className="text-white w-6 h-6" /></div>
            <div><h1 className="text-lg font-bold leading-tight">JobNexus</h1><p className="text-xs text-emerald-400 font-medium">Faculty Oversight</p></div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-300 bg-white/5 px-4 py-2 rounded-full border border-white/10"><Users className="w-4 h-4" /><span>{userName}</span></div>
            <button onClick={() => router.push('/settings')} className="p-2 rounded-lg bg-gray-500/10 text-gray-400 hover:bg-gray-500 hover:text-white transition" title="Settings"><SettingsIcon className="w-5 h-5" /></button>
            <button onClick={handleLogout} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {pendingStudents.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2"><ShieldAlert className="w-5 h-5" /> Pending Student Approvals</h2>
            <div className="bg-black/20 rounded-xl overflow-hidden">
              {pendingStudents.map((student) => (
                <div key={student._id} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold"><UserPlus className="w-5 h-5" /></div>
                    <div><div className="font-bold text-white">{student.name}</div><div className="text-sm text-gray-400">{student.email}</div></div>
                  </div>
                  <button onClick={() => handleApproveStudent(student._id)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition"><Check className="w-4 h-4" /> Approve</button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* --- STATS OVERVIEW --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg"><Briefcase /></div>
            <div><div className="text-3xl font-bold">{stats.totalJobs}</div><div className="text-sm text-gray-400">Active Listings</div></div>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-lg"><Users /></div>
            <div><div className="text-3xl font-bold">{stats.totalApps}</div><div className="text-sm text-gray-400">Total Applications</div></div>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900/40 to-emerald-900/10 border border-emerald-500/20 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-lg"><PartyPopper /></div>
            <div><div className="text-3xl font-bold text-emerald-400">{stats.totalHired}</div><div className="text-sm text-emerald-200/60">Confirmed Placements</div></div>
          </div>
        </div>

        {/* --- PACKAGE STATS --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-900/40 to-emerald-900/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold mb-1"><ArrowUpRight className="w-4 h-4" /> Highest Package</div>
            <div className="text-2xl font-bold text-white">{packageStats.highest} <span className="text-xs font-normal text-gray-400">LPA</span></div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-900/40 to-blue-900/10 border border-blue-500/20">
            <div className="flex items-center gap-2 text-blue-400 text-sm font-bold mb-1"><Calculator className="w-4 h-4" /> Average Package</div>
            <div className="text-2xl font-bold text-white">{packageStats.average} <span className="text-xs font-normal text-gray-400">LPA</span></div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-900/40 to-purple-900/10 border border-purple-500/20">
            <div className="flex items-center gap-2 text-purple-400 text-sm font-bold mb-1"><Scale className="w-4 h-4" /> Median Package</div>
            <div className="text-2xl font-bold text-white">{packageStats.median} <span className="text-xs font-normal text-gray-400">LPA</span></div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-gray-800/60 to-gray-800/30 border border-gray-500/20">
            <div className="flex items-center gap-2 text-gray-400 text-sm font-bold mb-1"><ArrowDownRight className="w-4 h-4" /> Lowest Package</div>
            <div className="text-2xl font-bold text-white">{packageStats.lowest} <span className="text-xs font-normal text-gray-400">LPA</span></div>
          </div>
        </div>

        {/* --- CHARTS --- */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><PieIcon className="text-blue-400 w-5 h-5" /> Placement Status</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><BarChart3 className="text-purple-400 w-5 h-5" /> Top Packages (LPA)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip cursor={{fill: '#ffffff10'}} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                  <Bar dataKey="salary" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* --- SECTION 1: CONFIRMED PLACEMENTS (NEW) --- */}
        {confirmedPlacements.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
              <Trophy className="text-yellow-500" /> Confirmed Placements (Joined)
            </h2>
            <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-emerald-900/20 text-emerald-400 uppercase text-xs font-bold">
                  <tr>
                    <th className="p-6">Student</th>
                    <th className="p-6">Role</th>
                    <th className="p-6">Company</th>
                    <th className="p-6">Package</th>
                    <th className="p-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/10">
                  {confirmedPlacements.map((p, i) => (
                    <tr key={i} className="hover:bg-emerald-500/5 transition">
                      <td className="p-6">
                        <div className="font-bold text-white">{p.studentName}</div>
                        <div className="text-xs text-emerald-400/70">{p.email}</div>
                      </td>
                      <td className="p-6 text-gray-300">{p.role}</td>
                      <td className="p-6 flex items-center gap-2"><Building2 className="w-4 h-4 text-emerald-500" /> {p.company}</td>
                      <td className="p-6 text-emerald-400 font-bold">{p.package} LPA</td>
                      <td className="p-6">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex w-fit items-center gap-1">
                          Joined <Check className="w-3 h-3"/>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- SECTION 2: ACTIVE OFFERS --- */}
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Clock className="text-blue-400" /> Active Offers & Placements
        </h2>
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {(recentOffers.length > 0 || confirmedPlacements.length === 0) ? (
            <table className="w-full text-left">
              <thead className="bg-black/20 text-gray-400 uppercase text-xs font-bold">
                <tr>
                    <th className="p-6">Student</th>
                    <th className="p-6">Role</th>
                    <th className="p-6">Company</th>
                    <th className="p-6">Package</th>
                    <th className="p-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOffers.map((p, i) => (
                  <tr key={i} className="hover:bg-white/5 transition">
                    <td className="p-6">
                      <div className="font-bold text-white">{p.studentName}</div>
                      <div className="text-xs text-gray-500">{p.email}</div>
                    </td>
                    <td className="p-6 text-blue-300">{p.role}</td>
                    <td className="p-6 flex items-center gap-2"><Building2 className="w-4 h-4 text-gray-500" /> {p.company}</td>
                    <td className="p-6 text-white font-bold">{p.package} LPA</td>
                    <td className="p-6">
                        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-bold">
                            Offer Received
                        </span>
                    </td>
                  </tr>
                ))}
                {recentOffers.length === 0 && confirmedPlacements.length === 0 && (
                   <tr><td colSpan={5} className="p-10 text-center text-gray-500">No placements confirmed yet.</td></tr>
                )}
              </tbody>
            </table>
          ) : (
            <div className="p-10 text-center text-gray-500">All placements are confirmed! See the list above.</div>
          )}
        </div>
      </main>
    </div>
  );
}