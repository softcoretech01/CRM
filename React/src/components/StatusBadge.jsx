import React from 'react';

export default function StatusBadge({ status }) {
  const colors = {
    'New': 'bg-[#6366F1]/20 text-[#6366F1] border-[#6366F1]/30',
    'Contacted': 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30',
    'Qualified': 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30',
    'Lost': 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30',
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${colors[status] || colors['New']}`}>
      {status}
    </span>
  );
}
