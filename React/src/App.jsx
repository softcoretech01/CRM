import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Accounts from './pages/Accounts';
import Opportunities from './pages/Opportunities';
import Contacts from './pages/Contacts';
import Activities from './pages/Activities';
import Reports from './pages/Reports';
import { Bell, Search } from 'lucide-react';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen w-full bg-[#0A0D14] text-[#F9FAFB] font-['DM_Sans',sans-serif] overflow-hidden selection:bg-[#6366F1]/30">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Syne:wght@400;500;600;700;800&display=swap');
          h1, h2, h3, h4, h5, h6 { font-family: 'Syne', sans-serif; }
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        
        <Sidebar />
        
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          <header className="h-20 border-b border-[#1F2937] flex items-center justify-between px-8 bg-[#0A0D14]/80 backdrop-blur-xl z-10 sticky top-0 flex-shrink-0">
            <div className="flex-1"></div>
            <div className="flex items-center gap-5">
              <div className="relative group">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] group-focus-within:text-[#6366F1] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search global..." 
                  className="bg-[#111827] border border-[#1F2937] rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#6366F1] transition-all w-64 focus:w-80 text-[#F9FAFB] placeholder-[#6B7280] shadow-inner"
                />
              </div>
              <button className="relative p-2 rounded-full hover:bg-[#111827] transition-colors border border-transparent hover:border-[#1F2937]">
                <Bell className="w-5 h-5 text-[#9CA3AF] hover:text-white transition-colors" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#EF4444] rounded-full border-2 border-[#0A0D14]"></span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-[1600px] mx-auto h-full">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/opportunities" element={<Opportunities />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/reports" element={<Reports />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
