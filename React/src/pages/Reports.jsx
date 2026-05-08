import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Filter } from 'lucide-react';

const CONVERSION_DATA = [
  { name: 'Qualified', value: 36, color: '#10B981' },
  { name: 'Contacted', value: 28, color: '#F59E0B' },
  { name: 'Lost', value: 20, color: '#EF4444' },
  { name: 'New', value: 16, color: '#6366F1' },
];

const PIPELINE_STAGE_DATA = [
  { name: 'Prospect', value: 45 },
  { name: 'Qual', value: 30 },
  { name: 'Proposal', value: 20 },
  { name: 'Negot', value: 10 },
];

const FORECAST_DATA = [
  { name: 'Jan', actual: 15, target: 12 },
  { name: 'Feb', actual: 22, target: 20 },
  { name: 'Mar', actual: 18, target: 25 },
  { name: 'Apr', actual: 28, target: 25 },
  { name: 'May', actual: 32, target: 30 },
  { name: 'Jun', actual: 0, target: 35 },
];

const ACTIVITY_PERF_DATA = [
  { name: 'Week 1', Tasks: 40, Calls: 24, Meetings: 10 },
  { name: 'Week 2', Tasks: 30, Calls: 13, Meetings: 15 },
  { name: 'Week 3', Tasks: 45, Calls: 28, Meetings: 12 },
  { name: 'Week 4', Tasks: 35, Calls: 20, Meetings: 18 },
];

const ReportCard = ({ title, subtitle, children }) => (
  <div className="bg-[#111827] border border-[#1F2937] rounded-xl shadow-[0_0_0_1px_#1F2937,0_4px_24px_rgba(0,0,0,0.4)] p-6 flex flex-col">
    <div className="flex justify-between items-start mb-6">
      <div>
        <h3 className="font-bold text-lg text-white">{title}</h3>
        <p className="text-xs text-[#9CA3AF] mt-1">{subtitle}</p>
      </div>
      <div className="relative group">
        <button className="flex items-center gap-2 p-2 border border-[#1F2937] rounded-lg text-[#9CA3AF] hover:text-white hover:bg-[#1F2937] transition-colors text-xs font-medium">
          <Download className="w-3.5 h-3.5"/> Export
        </button>
      </div>
    </div>
    <div className="flex-1 min-h-[250px]">
      {children}
    </div>
  </div>
);

export default function Reports() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Analytics & Reports</h1>
          <p className="text-[#9CA3AF] mt-1">Key metrics and performance indicators.</p>
        </div>
        <div className="flex gap-2 border border-[#1F2937] p-1 rounded-xl bg-[#111827]">
          {['This Month', 'This Quarter', 'This Year', 'Custom'].map((filter, i) => (
            <button 
              key={filter}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${i === 0 ? 'bg-[#6366F1]/10 text-[#6366F1] shadow-sm' : 'text-[#9CA3AF] hover:text-white hover:bg-[#1F2937]'}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        <ReportCard title="Lead Conversion Rate" subtitle="89 leads qualified this month (+12% MoM)">
          <div className="h-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={CONVERSION_DATA} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                  {CONVERSION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F9FAFB', borderRadius: '8px' }} 
                  itemStyle={{ color: '#F9FAFB' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">36%</p>
                <p className="text-[10px] text-[#9CA3AF] uppercase font-semibold tracking-wider">Qualified</p>
              </div>
            </div>
          </div>
        </ReportCard>

        <ReportCard title="Pipeline by Stage" subtitle="Current open deals value by pipeline stage">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={PIPELINE_STAGE_DATA} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={false} />
              <XAxis type="number" stroke="#9CA3AF" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" stroke="#9CA3AF" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#1F2937', opacity: 0.4}} contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F9FAFB', borderRadius: '8px' }} />
              <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </ReportCard>

        <ReportCard title="Revenue Forecast" subtitle="Target vs Actual lines, Jan–Jun 2025">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={FORECAST_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="name" stroke="#9CA3AF" axisLine={false} tickLine={false} />
              <YAxis stroke="#9CA3AF" axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F9FAFB', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="actual" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
              <Line type="monotone" dataKey="target" stroke="#F59E0B" strokeDasharray="5 5" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ReportCard>

        <ReportCard title="Activity Performance" subtitle="Tasks/Calls/Meetings per week (last 4 weeks)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ACTIVITY_PERF_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="name" stroke="#9CA3AF" axisLine={false} tickLine={false} />
              <YAxis stroke="#9CA3AF" axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#1F2937', opacity: 0.4}} contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F9FAFB', borderRadius: '8px' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
              <Bar dataKey="Tasks" fill="#6366F1" stackId="a" barSize={32} />
              <Bar dataKey="Calls" fill="#10B981" stackId="a" />
              <Bar dataKey="Meetings" fill="#F59E0B" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ReportCard>
      </div>
    </div>
  );
}
