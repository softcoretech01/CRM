import React, { useState } from 'react';
import { Calendar, PhoneCall, Presentation, CheckSquare, Plus, Filter } from 'lucide-react';
import Modal from '../components/Modal';

export default function Activities() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(6);

  return (
    <div className="flex h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="w-[35%] bg-[#111827] border border-[#1F2937] rounded-xl shadow-[0_0_0_1px_#1F2937,0_4px_24px_rgba(0,0,0,0.4)] p-6 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white"><Calendar className="w-6 h-6 text-[#6366F1]"/> May 2025</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-[#1F2937] rounded-lg hover:bg-[#1F2937] text-[#9CA3AF] hover:text-white transition-colors font-medium text-sm">Today</button>
            <div className="flex rounded-lg overflow-hidden border border-[#1F2937]">
              <button className="p-1.5 hover:bg-[#1F2937] text-[#9CA3AF] hover:text-white transition-colors bg-[#0A0D14] px-2">&lt;</button>
              <button className="p-1.5 hover:bg-[#1F2937] text-[#9CA3AF] hover:text-white transition-colors bg-[#0A0D14] px-2 border-l border-[#1F2937]">&gt;</button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px bg-[#1F2937] border border-[#1F2937] rounded-xl overflow-hidden flex-1 shadow-inner h-full">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="bg-[#111827] text-center py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider h-10">{d}</div>
          ))}
          {Array.from({ length: 35 }).map((_, i) => {
            const day = i - 2; 
            const isCurrentMonth = day > 0 && day <= 31;
            const isToday = day === 6; 
            const isSelected = day === selectedDate;
            const hasActivity = [6, 10, 15, 22].includes(day);

            return (
              <div 
                key={i} 
                onClick={() => isCurrentMonth && setSelectedDate(day)}
                className={`bg-[#0A0D14] p-2 transition-colors hover:bg-[#111827]/80 cursor-pointer flex flex-col items-center justify-start pt-3 ${isSelected ? 'ring-2 ring-inset ring-[#6366F1] bg-[#6366F1]/5' : ''}`}
              >
                <span className={`text-sm font-medium w-8 h-8 rounded-full flex items-center justify-center ${!isCurrentMonth ? 'text-[#374151]' : isToday ? 'bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/40' : 'text-[#F9FAFB]'}`}>
                  {isCurrentMonth ? day : day <= 0 ? 30 + day : day - 31}
                </span>
                {hasActivity && isCurrentMonth && (
                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-[#6366F1]"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-[65%] bg-[#111827] border border-[#1F2937] rounded-xl shadow-[0_0_0_1px_#1F2937,0_4px_24px_rgba(0,0,0,0.4)] p-6 flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-xl text-white">Schedule for May {selectedDate}</h3>
            <div className="flex gap-4 mt-2 border-b border-[#1F2937] pb-2">
              <button className="text-[#6366F1] font-semibold text-sm border-b-2 border-[#6366F1] pb-2 px-1">All</button>
              <button className="text-[#9CA3AF] hover:text-white font-medium text-sm pb-2 px-1 transition-colors">Calls</button>
              <button className="text-[#9CA3AF] hover:text-white font-medium text-sm pb-2 px-1 transition-colors">Tasks</button>
              <button className="text-[#9CA3AF] hover:text-white font-medium text-sm pb-2 px-1 transition-colors">Meetings</button>
              <button className="text-[#EF4444] hover:text-[#EF4444] font-medium text-sm pb-2 px-1 transition-colors ml-auto">Overdue</button>
            </div>
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-0.5">
            <Plus className="w-4 h-4"/> Add Activity
          </button>
        </div>
        
        <div className="flex-1 overflow-auto space-y-6">
          {selectedDate === 6 ? (
            <>
              <div>
                <h4 className="text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-4 px-2">Meetings</h4>
                <div className="flex gap-4 relative">
                   <div className="absolute left-[19px] top-10 bottom-[-32px] w-px bg-[#1F2937]"></div>
                   <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center z-10 border-[3px] border-[#111827]">
                     <Presentation className="w-4 h-4 text-[#10B981]" />
                   </div>
                   <div className="bg-[#0A0D14] border border-[#1F2937] p-4 rounded-xl flex-1 hover:border-[#374151] transition-colors group cursor-pointer">
                     <div className="flex justify-between mb-1">
                       <h4 className="font-semibold text-sm text-white group-hover:text-[#6366F1] transition-colors">Product Demo</h4>
                       <span className="text-xs text-[#9CA3AF] bg-[#1F2937] px-2 py-0.5 rounded flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-[#EF4444]" title="High Priority"></span>
                         2:00 PM
                       </span>
                     </div>
                     <p className="text-sm text-[#6366F1] font-medium">Zoho Corp (Contact: Priya Sharma)</p>
                     <p className="text-xs text-[#9CA3AF] mt-2">Showcase new API integrations and discuss Q3 pricing.</p>
                     <div className="mt-3 flex items-center gap-2">
                       <input type="checkbox" className="w-4 h-4 rounded border-[#1F2937] bg-[#111827] text-[#6366F1] focus:ring-[#6366F1] cursor-pointer" />
                       <span className="text-xs text-[#9CA3AF]">Mark as Complete</span>
                     </div>
                   </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-4 px-2">Calls</h4>
                <div className="flex gap-4 relative">
                   <div className="absolute left-[19px] top-10 bottom-[-32px] w-px bg-[#1F2937]"></div>
                   <div className="w-10 h-10 rounded-full bg-[#F59E0B]/10 flex items-center justify-center z-10 border-[3px] border-[#111827]">
                     <PhoneCall className="w-4 h-4 text-[#F59E0B]" />
                   </div>
                   <div className="bg-[#0A0D14] border border-[#1F2937] p-4 rounded-xl flex-1 hover:border-[#374151] transition-colors group cursor-pointer">
                     <div className="flex justify-between mb-1">
                       <h4 className="font-semibold text-sm text-white group-hover:text-[#6366F1] transition-colors">Follow-up Call</h4>
                       <span className="text-xs text-[#9CA3AF] bg-[#1F2937] px-2 py-0.5 rounded flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-[#F59E0B]" title="Medium Priority"></span>
                         4:30 PM
                       </span>
                     </div>
                     <p className="text-sm text-[#6366F1] font-medium">Freshworks</p>
                     <p className="text-xs text-[#9CA3AF] mt-2">Discuss pricing structure and enterprise terms.</p>
                     <div className="mt-3 flex items-center gap-2">
                       <input type="checkbox" className="w-4 h-4 rounded border-[#1F2937] bg-[#111827] text-[#6366F1] focus:ring-[#6366F1] cursor-pointer" />
                       <span className="text-xs text-[#9CA3AF]">Mark as Complete</span>
                     </div>
                   </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-4 px-2">Tasks</h4>
                <div className="flex gap-4 relative">
                   <div className="w-10 h-10 rounded-full bg-[#6366F1]/10 flex items-center justify-center z-10 border-[3px] border-[#111827]">
                     <CheckSquare className="w-4 h-4 text-[#6366F1]" />
                   </div>
                   <div className="bg-[#0A0D14] border border-[#1F2937] p-4 rounded-xl flex-1 opacity-60">
                     <div className="flex justify-between mb-1">
                       <h4 className="font-semibold text-sm text-[#9CA3AF] line-through">Send Contract</h4>
                       <span className="text-xs text-[#9CA3AF] bg-[#1F2937] px-2 py-0.5 rounded flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-[#10B981]" title="Low Priority"></span>
                         10:00 AM
                       </span>
                     </div>
                     <p className="text-sm text-[#6366F1] font-medium line-through">Meesho</p>
                     <div className="mt-3 flex items-center gap-2">
                       <input type="checkbox" checked readOnly className="w-4 h-4 rounded border-[#1F2937] bg-[#111827] text-[#6366F1] focus:ring-[#6366F1]" />
                       <span className="text-xs text-[#9CA3AF] line-through">Completed</span>
                     </div>
                   </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[#4B5563]">
              <Calendar className="w-16 h-16 mb-4 opacity-20" />
              <p>No activities scheduled for this date.</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="New Activity">
        <form className="space-y-4">
          <div>
            <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Subject</label>
            <input type="text" className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none transition-colors" placeholder="e.g. Follow up email" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Type</label>
              <select className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none transition-colors appearance-none">
                <option>Call</option>
                <option>Meeting</option>
                <option>Task</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Priority</label>
              <select className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none transition-colors appearance-none">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Due Date</label>
              <input type="date" className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Time</label>
              <input type="time" className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Related To (Lead / Account)</label>
            <select className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none transition-colors appearance-none">
              <option>Zoho - Cloud Migration</option>
              <option>Infosys - CRM Update</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Notes</label>
            <textarea className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none transition-colors h-24 resize-none" placeholder="Add any details here..."></textarea>
          </div>
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-[#1F2937]">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-[#1F2937] rounded-lg hover:bg-[#1F2937] text-sm text-[#9CA3AF] hover:text-white transition-colors">Cancel</button>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] text-sm font-medium transition-colors shadow-lg shadow-[#6366F1]/20 hover:-translate-y-0.5">Save Activity</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
