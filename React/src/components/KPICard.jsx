import React from 'react';

export default function KPICard({ title, value, icon: Icon, trend }) {
  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl shadow-[0_0_0_1px_#1F2937,0_4px_24px_rgba(0,0,0,0.4)] p-6 hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[#9CA3AF] text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-[#F9FAFB]">{value}</h3>
        </div>
        <div className="p-3 bg-[#6366F1]/10 rounded-lg">
          <Icon className="w-6 h-6 text-[#6366F1]" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className={trend.startsWith('+') ? "text-[#10B981] font-medium" : "text-[#EF4444] font-medium"}>{trend}</span>
        <span className="text-[#9CA3AF] ml-2">vs last month</span>
      </div>
    </div>
  );
}
