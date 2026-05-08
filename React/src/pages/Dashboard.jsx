import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, CheckCircle2, Briefcase, BarChart3, Calendar, AlertCircle } from 'lucide-react';
import KPICard from '../components/KPICard';

const FUNNEL_DATA = [
  { name: 'Prospect', value: 120 },
  { name: 'Qualification', value: 80 },
  { name: 'Proposal', value: 45 },
  { name: 'Negotiation', value: 22 },
  { name: 'Won', value: 14 },
];

const REVENUE_DATA = [
  { name: 'Jan', value: 4.2 },
  { name: 'Feb', value: 5.8 },
  { name: 'Mar', value: 7.5 },
  { name: 'Apr', value: 6.2 },
  { name: 'May', value: 9.4 },
  { name: 'Jun', value: 12.1 },
];

export default function Dashboard() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Good Morning, Arjun 👋</h1>
        <p className="text-[#9CA3AF]">{today}</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard title="Total Leads" value="247" icon={Users} trend="+12%" />
          <KPICard title="Qualified" value="89" icon={CheckCircle2} trend="+5%" />
          <KPICard title="Open Opportunities" value="34" icon={Briefcase} trend="-2%" />
          <KPICard title="Won Deals Value" value="₹18.4L" icon={BarChart3} trend="+24%" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl shadow-[0_0_0_1px_#1F2937,0_4px_24px_rgba(0,0,0,0.4)] p-6 lg:col-span-2">
            <h3 className="text-lg font-bold mb-4 text-white">Monthly Revenue Trend (₹ Lakhs)</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={REVENUE_DATA}>
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
                <BarChart data={FUNNEL_DATA} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
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
            <div className="flex-1 bg-[#0A0D14] p-4 rounded-lg border border-[#1F2937] flex items-center justify-between hover:border-[#6366F1] transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="bg-[#EF4444]/10 p-2 rounded-full group-hover:bg-[#EF4444]/20 transition-colors"><AlertCircle className="w-5 h-5 text-[#EF4444]" /></div>
                <div>
                  <p className="font-semibold text-[#F9FAFB]">3 Tasks Due Today</p>
                  <p className="text-sm text-[#9CA3AF]">Follow up with Razorpay, Send proposal...</p>
                </div>
              </div>
              <span className="text-sm text-[#6366F1] font-medium opacity-0 group-hover:opacity-100 transition-opacity">View</span>
            </div>
            <div className="flex-1 bg-[#0A0D14] p-4 rounded-lg border border-[#1F2937] flex items-center justify-between hover:border-[#6366F1] transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="bg-[#10B981]/10 p-2 rounded-full group-hover:bg-[#10B981]/20 transition-colors"><Users className="w-5 h-5 text-[#10B981]" /></div>
                <div>
                  <p className="font-semibold text-[#F9FAFB]">2 Upcoming Meetings</p>
                  <p className="text-sm text-[#9CA3AF]">Product demo with Zoho @ 2:00 PM...</p>
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
