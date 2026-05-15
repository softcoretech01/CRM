import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Filter } from 'lucide-react';

const ReportCard = ({ title, subtitle, onExport, children }) => (
  <div className="bg-[#111827] border border-[#1F2937] rounded-xl shadow-[0_0_0_1px_#1F2937,0_4px_24px_rgba(0,0,0,0.4)] p-6 flex flex-col">
    <div className="flex justify-between items-start mb-6">
      <div>
        <h3 className="font-bold text-lg text-white">{title}</h3>
        <p className="text-xs text-[#9CA3AF] mt-1">{subtitle}</p>
      </div>
      <div className="relative group">
        <button onClick={onExport} className="flex items-center gap-2 p-2 border border-[#1F2937] rounded-lg text-[#9CA3AF] hover:text-white hover:bg-[#1F2937] transition-colors text-xs font-medium">
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
  const [timeFilter, setTimeFilter] = useState('This Month');
  const [rawData, setRawData] = useState({ leads: [], opps: {}, activities: [] });
  
  const [conversionData, setConversionData] = useState([]);
  const [pipelineData, setPipelineData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [qualifiedCount, setQualifiedCount] = useState(0);
  const [qualifiedPct, setQualifiedPct] = useState(0);

  const fetchReportsData = useCallback(async () => {
    try {
      const [leadsRes, oppsRes, activitiesRes] = await Promise.all([
        fetch('http://localhost:8000/api/leads'),
        fetch('http://localhost:8000/api/opportunities/by-stage'),
        fetch('http://localhost:8000/api/activities')
      ]);

      const leads = leadsRes.ok ? await leadsRes.json() : [];
      const opps = oppsRes.ok ? await oppsRes.json() : {};
      const activities = activitiesRes.ok ? await activitiesRes.json() : [];

      setRawData({ leads, opps, activities });
    } catch (err) {
      console.error('Failed to fetch reports data', err);
    }
  }, []);

  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    const cleanData = data.map(row => {
      const { color, ...rest } = row;
      return rest;
    });
    const headers = Object.keys(cleanData[0]).join(',');
    const rows = cleanData.map(obj => Object.values(obj).map(v => `"${v}"`).join(',')).join('\n');
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData]);

  useEffect(() => {
    const isDateInFilter = (dateStr) => {
      if (!dateStr) return true; // Include if no date
      const d = new Date(dateStr);
      if (isNaN(d)) return true;
      
      const now = new Date();
      if (timeFilter === 'This Month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (timeFilter === 'This Quarter') {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const dQuarter = Math.floor(d.getMonth() / 3);
        return currentQuarter === dQuarter && d.getFullYear() === now.getFullYear();
      }
      if (timeFilter === 'This Year') {
        return d.getFullYear() === now.getFullYear();
      }
      return true; // Custom
    };

    const { leads, opps, activities } = rawData;

    // Leads Conversion
    const filteredLeads = leads.filter(l => isDateInFilter(l.created_at || l.date));
    const counts = { 'Qualified': 0, 'Contacted': 0, 'Lost': 0, 'New': 0 };
    filteredLeads.forEach(l => { if (counts[l.status] !== undefined) counts[l.status]++; });
    
    setQualifiedCount(counts['Qualified']);
    setQualifiedPct(filteredLeads.length > 0 ? Math.round((counts['Qualified'] / filteredLeads.length) * 100) : 0);
    
    const cData = [
      { name: 'Qualified', value: counts['Qualified'], color: '#10B981' },
      { name: 'Contacted', value: counts['Contacted'], color: '#F59E0B' },
      { name: 'Lost', value: counts['Lost'], color: '#EF4444' },
      { name: 'New', value: counts['New'], color: '#6366F1' },
    ];
    setConversionData(filteredLeads.length === 0 ? [{ name: 'No Data', value: 1, color: '#374151' }] : cData.filter(d => d.value > 0));

    // Pipeline by Stage
    const pipelineStages = [
      { key: 'Prospect', label: 'Prospect' },
      { key: 'Qualification', label: 'Qual' },
      { key: 'Proposal', label: 'Proposal' },
      { key: 'Negotiation', label: 'Negot' }
    ];
    
    const newPipelineData = pipelineStages.map(s => {
      const items = (opps[s.key] || []).filter(item => isDateInFilter(item.closeDate || item.close_date));
      const val = items.reduce((sum, item) => sum + parseFloat(item.value || 0), 0);
      return { name: s.label, value: parseFloat(val.toFixed(1)) };
    });
    setPipelineData(newPipelineData);

    // Forecast
    const targets = [12, 20, 25, 25, 30, 35, 40, 45, 50, 55, 60, 65];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let newForecast = months.map((m, i) => ({ name: m, actual: 0, target: targets[i] }));
    
    if (opps['Won']) {
      opps['Won'].filter(item => isDateInFilter(item.closeDate || item.close_date)).forEach(deal => {
        const dateStr = deal.closeDate || deal.close_date;
        if (dateStr) {
          const monthIndex = new Date(dateStr).getMonth();
          if (!isNaN(monthIndex)) {
            newForecast[monthIndex].actual += parseFloat(deal.value || 0);
          }
        }
      });
    }
    setForecastData(newForecast.map(f => ({ ...f, actual: parseFloat(f.actual.toFixed(1)) })));

    // Activities
    let weeks = [
      { name: 'Week 1', Tasks: 0, Calls: 0, Meetings: 0 },
      { name: 'Week 2', Tasks: 0, Calls: 0, Meetings: 0 },
      { name: 'Week 3', Tasks: 0, Calls: 0, Meetings: 0 },
      { name: 'Week 4', Tasks: 0, Calls: 0, Meetings: 0 },
    ];
    
    activities.filter(a => isDateInFilter(a.due_date)).forEach(a => {
      if (a.due_date) {
        const day = parseInt(a.due_date.split('-')[2], 10);
        let weekIdx = 0;
        if (day > 7 && day <= 14) weekIdx = 1;
        else if (day > 14 && day <= 21) weekIdx = 2;
        else if (day > 21) weekIdx = 3;
        
        if (a.type === 'Task') weeks[weekIdx].Tasks++;
        if (a.type === 'Call') weeks[weekIdx].Calls++;
        if (a.type === 'Meeting') weeks[weekIdx].Meetings++;
      }
    });
    setActivityData(weeks);

  }, [rawData, timeFilter]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Analytics & Reports</h1>
          <p className="text-[#9CA3AF] mt-1">Key metrics and performance indicators.</p>
        </div>
        <div className="flex gap-2 border border-[#1F2937] p-1 rounded-xl bg-[#111827]">
          {['This Month', 'This Quarter', 'This Year', 'Custom'].map((filter) => (
            <button 
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeFilter === filter ? 'bg-[#6366F1]/10 text-[#6366F1] shadow-sm' : 'text-[#9CA3AF] hover:text-white hover:bg-[#1F2937]'}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        <ReportCard title="Lead Conversion Rate" subtitle={`${qualifiedCount} leads qualified this month`} onExport={() => downloadCSV(conversionData, 'lead_conversion_rate')}>
          <div className="h-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={conversionData} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                  {conversionData.map((entry, index) => (
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
                <p className="text-3xl font-bold text-white">{qualifiedPct}%</p>
                <p className="text-[10px] text-[#9CA3AF] uppercase font-semibold tracking-wider">Qualified</p>
              </div>
            </div>
          </div>
        </ReportCard>

        <ReportCard title="Pipeline by Stage" subtitle="Current open deals value by pipeline stage (₹ Lakhs)" onExport={() => downloadCSV(pipelineData, 'pipeline_by_stage')}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pipelineData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={false} />
              <XAxis type="number" stroke="#9CA3AF" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" stroke="#9CA3AF" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#1F2937', opacity: 0.4}} contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F9FAFB', borderRadius: '8px' }} />
              <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </ReportCard>

        <ReportCard title="Revenue Forecast" subtitle="Target vs Actual won deal value (₹ Lakhs)" onExport={() => downloadCSV(forecastData, 'revenue_forecast')}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

        <ReportCard title="Activity Performance" subtitle="Tasks/Calls/Meetings due per week this month" onExport={() => downloadCSV(activityData, 'activity_performance')}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
