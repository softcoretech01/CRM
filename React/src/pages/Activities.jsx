import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, PhoneCall, Presentation, CheckSquare, Plus, Filter } from 'lucide-react';
import Modal from '../components/Modal';

export default function Activities() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(6);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activities, setActivities] = useState([]);
  const [activityTypes, setActivityTypes] = useState(['Call', 'Meeting', 'Task']);
  const [formData, setFormData] = useState({
    subject: '', type: 'Call', priority: 'Medium', due_date: '', due_time: '', related_to: 'Zoho - Cloud Migration', notes: ''
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

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    const fetchActivityTypes = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/masters?category=ActivityType');
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setActivityTypes(data.map(t => t.value));
          }
        }
      } catch (err) {
        console.error('Failed to fetch activity types:', err);
      }
    };
    fetchActivityTypes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveActivity = async () => {
    if (!formData.subject.trim()) {
      alert('Subject is required');
      return;
    }
    // format date/time if needed, but the form data should already be in YYYY-MM-DD and HH:MM
    const payload = {
      ...formData,
      due_date: formData.due_date || null,
      due_time: formData.due_time ? (formData.due_time.length === 5 ? formData.due_time + ":00" : formData.due_time) : null
    };
    try {
      const res = await fetch('http://localhost:8000/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        if (payload.due_date) {
          const parts = payload.due_date.split('-');
          if (parts.length === 3) {
            setSelectedDate(parseInt(parts[2], 10));
          }
        }
        setFormData({ subject: '', type: 'Call', priority: 'Medium', due_date: '', due_time: '', related_to: 'Zoho - Cloud Migration', notes: '' });
        fetchActivities();
      } else {
        const err = await res.json();
        alert(err.detail || 'Failed to create activity');
      }
    } catch (err) {
      console.error('Create activity error:', err);
      alert('Failed to create activity');
    }
  };

  const handleToggleComplete = async (activityId, currentStatus) => {
    try {
      const res = await fetch(`http://localhost:8000/api/activities/${activityId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_complete: !currentStatus })
      });
      if (res.ok) {
        fetchActivities();
      }
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    }
  };

  const filteredActivities = activities.filter(a => {
    if (activeFilter !== 'All' && activeFilter !== 'Overdue') {
      if (a.type !== (activeFilter === 'Calls' ? 'Call' : activeFilter === 'Tasks' ? 'Task' : 'Meeting')) {
        return false;
      }
    }
    
    if (!a.due_date) return false;
    const parts = a.due_date.split('-');
    if (parts.length === 3) {
      return parseInt(parts[2], 10) === selectedDate;
    }
    return false;
  });

  const meetings = filteredActivities.filter(a => a.type === 'Meeting');
  const calls = filteredActivities.filter(a => a.type === 'Call');
  const tasks = filteredActivities.filter(a => a.type === 'Task');


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
            const hasActivity = activities.some(a => {
              if (!a.due_date) return false;
              const parts = a.due_date.split('-');
              return parts.length === 3 && parseInt(parts[2], 10) === day;
            });

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
              <button onClick={() => setActiveFilter('All')} className={`${activeFilter === 'All' ? 'text-[#6366F1] border-b-2 border-[#6366F1]' : 'text-[#9CA3AF] hover:text-white'} font-semibold text-sm pb-2 px-1 transition-colors`}>All</button>
              <button onClick={() => setActiveFilter('Calls')} className={`${activeFilter === 'Calls' ? 'text-[#6366F1] border-b-2 border-[#6366F1]' : 'text-[#9CA3AF] hover:text-white'} font-semibold text-sm pb-2 px-1 transition-colors`}>Calls</button>
              <button onClick={() => setActiveFilter('Tasks')} className={`${activeFilter === 'Tasks' ? 'text-[#6366F1] border-b-2 border-[#6366F1]' : 'text-[#9CA3AF] hover:text-white'} font-semibold text-sm pb-2 px-1 transition-colors`}>Tasks</button>
              <button onClick={() => setActiveFilter('Meetings')} className={`${activeFilter === 'Meetings' ? 'text-[#6366F1] border-b-2 border-[#6366F1]' : 'text-[#9CA3AF] hover:text-white'} font-semibold text-sm pb-2 px-1 transition-colors`}>Meetings</button>
            </div>
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-0.5">
            <Plus className="w-4 h-4"/> Add Activity
          </button>
        </div>
        
        <div className="flex-1 overflow-auto space-y-6">
          {filteredActivities.length > 0 ? (
            <>
              {meetings.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-4 px-2">Meetings</h4>
                  {meetings.map((m) => (
                    <div key={m.id} className="flex gap-4 relative mb-4">
                       <div className="absolute left-[19px] top-10 bottom-[-32px] w-px bg-[#1F2937]"></div>
                       <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center z-10 border-[3px] border-[#111827] shrink-0">
                         <Presentation className="w-4 h-4 text-[#10B981]" />
                       </div>
                       <div className="bg-[#0A0D14] border border-[#1F2937] p-4 rounded-xl flex-1 hover:border-[#374151] transition-colors group cursor-pointer">
                         <div className="flex justify-between mb-1">
                           <h4 className="font-semibold text-sm text-white group-hover:text-[#6366F1] transition-colors">{m.subject}</h4>
                           {m.due_time && (
                             <span className="text-xs text-[#9CA3AF] bg-[#1F2937] px-2 py-0.5 rounded flex items-center gap-2">
                               <span className={`w-2 h-2 rounded-full ${m.priority === 'High' ? 'bg-[#EF4444]' : m.priority === 'Medium' ? 'bg-[#F59E0B]' : 'bg-[#10B981]'}`} title={`${m.priority} Priority`}></span>
                               {m.due_time}
                             </span>
                           )}
                         </div>
                         {m.related_to && <p className="text-sm text-[#6366F1] font-medium">{m.related_to}</p>}
                         {m.notes && <p className="text-xs text-[#9CA3AF] mt-2">{m.notes}</p>}
                         <div className="mt-3 flex items-center gap-2">
                           <input type="checkbox" checked={!!m.is_complete} onChange={() => handleToggleComplete(m.id, m.is_complete)} className="w-4 h-4 rounded border-[#1F2937] bg-[#111827] text-[#6366F1] focus:ring-[#6366F1] cursor-pointer" />
                           <span className="text-xs text-[#9CA3AF]">{m.is_complete ? 'Completed' : 'Mark as Complete'}</span>
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
              )}

              {calls.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-4 px-2">Calls</h4>
                  {calls.map((c) => (
                    <div key={c.id} className="flex gap-4 relative mb-4">
                       <div className="absolute left-[19px] top-10 bottom-[-32px] w-px bg-[#1F2937]"></div>
                       <div className="w-10 h-10 rounded-full bg-[#F59E0B]/10 flex items-center justify-center z-10 border-[3px] border-[#111827] shrink-0">
                         <PhoneCall className="w-4 h-4 text-[#F59E0B]" />
                       </div>
                       <div className="bg-[#0A0D14] border border-[#1F2937] p-4 rounded-xl flex-1 hover:border-[#374151] transition-colors group cursor-pointer">
                         <div className="flex justify-between mb-1">
                           <h4 className="font-semibold text-sm text-white group-hover:text-[#6366F1] transition-colors">{c.subject}</h4>
                           {c.due_time && (
                             <span className="text-xs text-[#9CA3AF] bg-[#1F2937] px-2 py-0.5 rounded flex items-center gap-2">
                               <span className={`w-2 h-2 rounded-full ${c.priority === 'High' ? 'bg-[#EF4444]' : c.priority === 'Medium' ? 'bg-[#F59E0B]' : 'bg-[#10B981]'}`} title={`${c.priority} Priority`}></span>
                               {c.due_time}
                             </span>
                           )}
                         </div>
                         {c.related_to && <p className="text-sm text-[#6366F1] font-medium">{c.related_to}</p>}
                         {c.notes && <p className="text-xs text-[#9CA3AF] mt-2">{c.notes}</p>}
                         <div className="mt-3 flex items-center gap-2">
                           <input type="checkbox" checked={!!c.is_complete} onChange={() => handleToggleComplete(c.id, c.is_complete)} className="w-4 h-4 rounded border-[#1F2937] bg-[#111827] text-[#6366F1] focus:ring-[#6366F1] cursor-pointer" />
                           <span className="text-xs text-[#9CA3AF]">{c.is_complete ? 'Completed' : 'Mark as Complete'}</span>
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
              )}

              {tasks.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-4 px-2">Tasks</h4>
                  {tasks.map((t) => (
                    <div key={t.id} className="flex gap-4 relative mb-4">
                       <div className="w-10 h-10 rounded-full bg-[#6366F1]/10 flex items-center justify-center z-10 border-[3px] border-[#111827] shrink-0">
                         <CheckSquare className="w-4 h-4 text-[#6366F1]" />
                       </div>
                       <div className={`bg-[#0A0D14] border border-[#1F2937] p-4 rounded-xl flex-1 ${t.is_complete ? 'opacity-60' : ''}`}>
                         <div className="flex justify-between mb-1">
                           <h4 className={`font-semibold text-sm ${t.is_complete ? 'text-[#9CA3AF] line-through' : 'text-white'}`}>{t.subject}</h4>
                           {t.due_time && (
                             <span className="text-xs text-[#9CA3AF] bg-[#1F2937] px-2 py-0.5 rounded flex items-center gap-2">
                               <span className={`w-2 h-2 rounded-full ${t.priority === 'High' ? 'bg-[#EF4444]' : t.priority === 'Medium' ? 'bg-[#F59E0B]' : 'bg-[#10B981]'}`} title={`${t.priority} Priority`}></span>
                               {t.due_time}
                             </span>
                           )}
                         </div>
                         {t.related_to && <p className={`text-sm font-medium ${t.is_complete ? 'text-[#6366F1] line-through' : 'text-[#6366F1]'}`}>{t.related_to}</p>}
                         {t.notes && <p className="text-xs text-[#9CA3AF] mt-2">{t.notes}</p>}
                         <div className="mt-3 flex items-center gap-2">
                           <input type="checkbox" checked={!!t.is_complete} onChange={() => handleToggleComplete(t.id, t.is_complete)} className="w-4 h-4 rounded border-[#1F2937] bg-[#111827] text-[#6366F1] focus:ring-[#6366F1] cursor-pointer" />
                           <span className={`text-xs ${t.is_complete ? 'text-[#9CA3AF] line-through' : 'text-[#9CA3AF]'}`}>{t.is_complete ? 'Completed' : 'Mark as Complete'}</span>
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
              )}
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
            <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none transition-colors" placeholder="e.g. Follow up email" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Type</label>
              <select name="type" value={formData.type} onChange={handleInputChange} className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none transition-colors appearance-none">
                {activityTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Priority</label>
              <select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none transition-colors appearance-none">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Due Date</label>
              <input type="date" name="due_date" value={formData.due_date} onChange={handleInputChange} className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none transition-colors" style={{ colorScheme: 'dark' }} />
            </div>
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Time</label>
              <input type="time" name="due_time" value={formData.due_time} onChange={handleInputChange} className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none transition-colors" style={{ colorScheme: 'dark' }} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Related To (Lead / Account)</label>
            <select name="related_to" value={formData.related_to} onChange={handleInputChange} className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none transition-colors appearance-none">
              <option>Zoho - Cloud Migration</option>
              <option>Infosys - CRM Update</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleInputChange} className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none transition-colors h-24 resize-none" placeholder="Add any details here..."></textarea>
          </div>
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-[#1F2937]">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-[#1F2937] rounded-lg hover:bg-[#1F2937] text-sm text-[#9CA3AF] hover:text-white transition-colors">Cancel</button>
            <button type="button" onClick={handleSaveActivity} className="px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] text-sm font-medium transition-colors shadow-lg shadow-[#6366F1]/20 hover:-translate-y-0.5">Save Activity</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
