import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, CheckCircle2, Briefcase, BarChart3, Calendar, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import KPICard from '../components/KPICard';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [funnelData, setFunnelData] = useState([
    { name: 'Prospect', value: 0 },
    { name: 'Qualification', value: 0 },
    { name: 'Proposal', value: 0 },
    { name: 'Negotiation', value: 0 },
    { name: 'Won', value: 0 },
  ]);
  const [revenueData, setRevenueData] = useState([
    { name: 'Jan', value: 0 }, { name: 'Feb', value: 0 }, { name: 'Mar', value: 0 },
    { name: 'Apr', value: 0 }, { name: 'May', value: 0 }, { name: 'Jun', value: 0 },
    { name: 'Jul', value: 0 }, { name: 'Aug', value: 0 }, { name: 'Sep', value: 0 },
    { name: 'Oct', value: 0 }, { name: 'Nov', value: 0 }, { name: 'Dec', value: 0 },
  ]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    qualifiedLeads: 0,
    openOpps: 0,
    wonValue: 0
  });

  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/activities');
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const [leadsRes, oppsRes] = await Promise.all([
        fetch('http://localhost:8000/api/leads'),
        fetch('http://localhost:8000/api/opportunities/by-stage')
      ]);

      let totalLeads = 0, qualifiedLeads = 0, openOpps = 0, wonValue = 0;

      if (leadsRes.ok) {
        const leads = await leadsRes.json();
        totalLeads = leads.length;
        qualifiedLeads = leads.filter(l => l.status === 'Qualified').length;
      }

      if (oppsRes.ok) {
        const opps = await oppsRes.json();
        const stages = ['Prospect', 'Qualification', 'Proposal', 'Negotiation'];
        stages.forEach(stage => {
          if (opps[stage]) openOpps += opps[stage].length;
        });
        
        let newRevenueData = [
          { name: 'Jan', value: 0 }, { name: 'Feb', value: 0 }, { name: 'Mar', value: 0 },
          { name: 'Apr', value: 0 }, { name: 'May', value: 0 }, { name: 'Jun', value: 0 },
          { name: 'Jul', value: 0 }, { name: 'Aug', value: 0 }, { name: 'Sep', value: 0 },
          { name: 'Oct', value: 0 }, { name: 'Nov', value: 0 }, { name: 'Dec', value: 0 },
        ];

        if (opps['Won']) {
          wonValue = opps['Won'].reduce((acc, curr) => acc + parseFloat(curr.value || 0), 0);
          
          opps['Won'].forEach(deal => {
            if (deal.closeDate) {
              const monthIndex = new Date(deal.closeDate).getMonth();
              if (!isNaN(monthIndex)) {
                newRevenueData[monthIndex].value += parseFloat(deal.value || 0);
              }
            }
          });
        }
        newRevenueData = newRevenueData.map(item => ({ ...item, value: parseFloat(item.value.toFixed(1)) }));
        setRevenueData(newRevenueData);

        const allStages = ['Prospect', 'Qualification', 'Proposal', 'Negotiation', 'Won'];
        const newFunnelData = allStages.map(stage => ({
          name: stage,
          value: opps[stage] ? opps[stage].length : 0
        }));
        setFunnelData(newFunnelData);
      }

      setStats({ totalLeads, qualifiedLeads, openOpps, wonValue });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
    fetchStats();
  }, [fetchActivities, fetchStats]);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  
  const d = new Date();
  const localTodayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const dueTodayTasks = activities.filter(a => a.type === 'Task' && a.due_date === localTodayStr && !a.is_complete);
  const upcomingMeetings = activities.filter(a => a.type === 'Meeting' && a.due_date >= localTodayStr && !a.is_complete);

  const tasksDesc = dueTodayTasks.length > 0 
    ? dueTodayTasks.map(t => t.subject).join(', ').slice(0, 40) + (dueTodayTasks.map(t => t.subject).join(', ').length > 40 ? '...' : '')
    : 'No tasks due today';

  const meetingsDesc = upcomingMeetings.length > 0
    ? `${upcomingMeetings[0].subject} ${upcomingMeetings[0].due_time ? '@ ' + upcomingMeetings[0].due_time : ''}` + (upcomingMeetings.length > 1 ? '...' : '')
    : 'No upcoming meetings';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Good Morning, Arjun 👋</h1>
        <p className="text-[#9CA3AF]">{today}</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard title="Total Leads" value={stats.totalLeads.toString()} icon={Users} trend="+12%" />
          <KPICard title="Qualified" value={stats.qualifiedLeads.toString()} icon={CheckCircle2} trend="+5%" />
          <KPICard title="Open Opportunities" value={stats.openOpps.toString()} icon={Briefcase} trend="-2%" />
          <KPICard title="Won Deals Value" value={`₹${stats.wonValue.toFixed(1)}L`} icon={BarChart3} trend="+24%" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl shadow-[0_0_0_1px_#1F2937,0_4px_24px_rgba(0,0,0,0.4)] p-6 lg:col-span-2">
            <h3 className="text-lg font-bold mb-4 text-white">Monthly Revenue Trend (₹ Lakhs)</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#9CA3AF" tick={{fill: '#9CA3AF'}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#9CA3AF" tick={{fill: '#9CA3AF'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F9FAFB', borderRadius: '8px' }}
                    itemStyle={{ color: '#6366F1' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={3} dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1F2937] rounded-xl shadow-[0_0_0_1px_#1F2937,0_4px_24px_rgba(0,0,0,0.4)] p-6">
            <h3 className="text-lg font-bold mb-4 text-white">Sales Funnel</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={false} />
                  <XAxis type="number" stroke="#9CA3AF" axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#9CA3AF" axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#1F2937', opacity: 0.4 }} contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F9FAFB', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1F2937] rounded-xl shadow-[0_0_0_1px_#1F2937,0_4px_24px_rgba(0,0,0,0.4)] p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <Calendar className="w-5 h-5 text-[#6366F1]" /> Activity Summary
          </h3>
          <div className="flex gap-4">
            <div onClick={() => navigate('/activities')} className="flex-1 bg-[#0A0D14] p-4 rounded-lg border border-[#1F2937] flex items-center justify-between hover:border-[#6366F1] transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="bg-[#EF4444]/10 p-2 rounded-full group-hover:bg-[#EF4444]/20 transition-colors"><AlertCircle className="w-5 h-5 text-[#EF4444]" /></div>
                <div>
                  <p className="font-semibold text-[#F9FAFB]">{dueTodayTasks.length} {dueTodayTasks.length === 1 ? 'Task' : 'Tasks'} Due Today</p>
                  <p className="text-sm text-[#9CA3AF]">{tasksDesc}</p>
                </div>
              </div>
              <span className="text-sm text-[#6366F1] font-medium opacity-0 group-hover:opacity-100 transition-opacity">View</span>
            </div>
            <div onClick={() => navigate('/activities')} className="flex-1 bg-[#0A0D14] p-4 rounded-lg border border-[#1F2937] flex items-center justify-between hover:border-[#6366F1] transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="bg-[#10B981]/10 p-2 rounded-full group-hover:bg-[#10B981]/20 transition-colors"><Users className="w-5 h-5 text-[#10B981]" /></div>
                <div>
                  <p className="font-semibold text-[#F9FAFB]">{upcomingMeetings.length} Upcoming {upcomingMeetings.length === 1 ? 'Meeting' : 'Meetings'}</p>
                  <p className="text-sm text-[#9CA3AF]">{meetingsDesc}</p>
                </div>
              </div>
              <span className="text-sm text-[#6366F1] font-medium opacity-0 group-hover:opacity-100 transition-opacity">View</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
