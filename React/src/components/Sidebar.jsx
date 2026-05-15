import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, TrendingUp, Calendar, BarChart2, Zap, Settings, Contact, Database, ChevronDown, ChevronUp, Factory, Flag, ListTodo, UserCheck, Megaphone } from 'lucide-react';

export default function Sidebar() {
  const [mastersOpen, setMastersOpen] = useState(false);
  const location = useLocation();

  const isMastersActive = location.pathname.startsWith('/masters');

  const navItems = [
    { id: 'Dashboard', path: '/', icon: LayoutDashboard },
    { id: 'Leads', path: '/leads', icon: Users },
    { id: 'Contacts', path: '/contacts', icon: Contact },
    { id: 'Accounts', path: '/accounts', icon: Building2 },
    { id: 'Opportunities', path: '/opportunities', icon: TrendingUp },
    { id: 'Activities', path: '/activities', icon: Calendar },
    { id: 'Reports', path: '/reports', icon: BarChart2 },
  ];

  const masterSubItems = [
    { id: 'Lead Sources', path: '/masters/lead_sources', icon: Megaphone },
    { id: 'Industries', path: '/masters/industries', icon: Factory },
    { id: 'Opportunity Stages', path: '/masters/opportunity_stages', icon: Flag },
    { id: 'Activity Types', path: '/masters/activity_types', icon: ListTodo },
    { id: 'Owners', path: '/masters/owners', icon: UserCheck }
  ];

  return (
    <aside className="w-[240px] h-screen bg-[#111827] border-r border-[#1F2937] flex flex-col z-20 flex-shrink-0">
      <div className="h-20 flex items-center px-6 border-b border-[#1F2937]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center shadow-lg shadow-[#6366F1]/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white">CRM<span className="text-[#6366F1]">Pro</span></span>
        </div>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto hide-scrollbar">
        <p className="px-2 text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-4">Main Menu</p>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-semibold
                ${isActive 
                  ? 'bg-[#6366F1]/10 text-[#6366F1] shadow-[inset_4px_0_0_0_#6366F1]' 
                  : 'text-[#9CA3AF] hover:bg-[#1F2937]/80 hover:text-[#F9FAFB]'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#6366F1]' : 'text-[#9CA3AF]'}`} />
                  {item.id}
                </>
              )}
            </NavLink>
          );
        })}

        {/* Masters Accordion */}
        <div className="pt-2">
          <button 
            onClick={() => setMastersOpen(!mastersOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 text-sm font-semibold ${
              isMastersActive 
                ? 'bg-[#6366F1]/10 text-[#6366F1] shadow-[inset_4px_0_0_0_#6366F1]' 
                : 'text-[#9CA3AF] hover:bg-[#1F2937]/80 hover:text-[#F9FAFB]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Database className={`w-5 h-5 transition-colors ${isMastersActive ? 'text-[#6366F1]' : 'text-[#9CA3AF]'}`} />
              Masters
            </div>
            {mastersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {mastersOpen && (
            <div className="mt-2 ml-6 space-y-1">
              {masterSubItems.map((subItem) => {
                const SubIcon = subItem.icon;
                return (
                  <NavLink
                    key={subItem.id}
                    to={subItem.path}
                    className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 text-[13px] font-semibold
                      ${isActive 
                        ? 'bg-[#6366F1]/10 text-[#6366F1]' 
                        : 'text-[#9CA3AF] hover:bg-[#1F2937]/50 hover:text-[#F9FAFB]'
                      }
                    `}
                  >
                    <SubIcon className={`w-4 h-4 transition-colors ${location.pathname === subItem.path ? 'text-[#6366F1]' : 'text-[#9CA3AF]'}`} />
                    {subItem.id}
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-[#1F2937] bg-[#111827]">
        <div className="bg-[#0A0D14] p-3 rounded-xl border border-[#1F2937] flex items-center gap-3 hover:border-[#374151] transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#10B981] flex items-center justify-center font-bold text-white shadow-inner">
            AM
          </div>
          <div className="text-left flex-1 overflow-hidden">
            <p className="text-sm font-bold text-white truncate">Arjun Mehta</p>
            <p className="text-xs text-[#9CA3AF] truncate font-medium">Settings</p>
          </div>
          <Settings className="w-4 h-4 text-[#9CA3AF] group-hover:text-white transition-colors" />
        </div>
      </div>
    </aside>
  );
}
