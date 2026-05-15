import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, ArrowRightLeft, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const API_BASE = 'http://localhost:8000/api/leads';

const EMPTY_FORM = {
  name: '', company: '', email: '', phone: '',
  source: 'LinkedIn', industry: '', location: '',
  status: 'New', assigned_to: 'Arjun Mehta',
};

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [convertType, setConvertType] = useState('Account');
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [owners, setOwners] = useState([]);
  const [sources, setSources] = useState([]);
  const [industries, setIndustries] = useState([]);

  // ─── Fetch leads from API ───
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      const res = await fetch(`${API_BASE}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchLeads();
    const fetchMasters = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/masters');
        if (res.ok) {
          const data = await res.json();
          setOwners(data.filter(m => m.category === 'Owner'));
          setSources(data.filter(m => m.category === 'LeadSource'));
          setIndustries(data.filter(m => m.category === 'Industry'));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMasters();
  }, [fetchLeads]);

  // ─── Form helpers ───
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({ ...EMPTY_FORM });
    setIsAddModalOpen(true);
  };

  const openEditModal = (lead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name || '',
      company: lead.company || '',
      email: lead.email || '',
      phone: lead.phone || '',
      source: lead.source || 'LinkedIn',
      industry: lead.industry || '',
      location: lead.location || '',
      status: lead.status || 'New',
      assigned_to: lead.assigned_to || 'Arjun Mehta',
    });
    setIsEditModalOpen(true);
  };

  // ─── Create Lead ───
  const handleSaveLead = async () => {
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({ ...EMPTY_FORM });
        fetchLeads();
      } else {
        const err = await res.json();
        alert(err.detail || 'Failed to create lead');
      }
    } catch (err) {
      console.error('Create lead error:', err);
      alert('Failed to create lead');
    }
  };

  // ─── Update Lead ───
  const handleUpdateLead = async () => {
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/${selectedLead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        setSelectedLead(null);
        setFormData({ ...EMPTY_FORM });
        fetchLeads();
      } else {
        const err = await res.json();
        alert(err.detail || 'Failed to update lead');
      }
    } catch (err) {
      console.error('Update lead error:', err);
      alert('Failed to update lead');
    }
  };

  // ─── Delete Lead ───
  const handleDeleteLead = async (lead) => {
    if (!window.confirm(`Delete lead "${lead.name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/${lead.id}`, { method: 'DELETE' });
      if (res.ok) fetchLeads();
    } catch (err) {
      console.error('Delete lead error:', err);
    }
  };

  // ─── Convert Lead ───
  const handleConvertClick = (lead) => {
    setSelectedLead(lead);
    setIsConvertModalOpen(true);
  };

  const handleConvertConfirm = async () => {
    try {
      const res = await fetch(`${API_BASE}/${selectedLead.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ convert_to: convertType }),
      });
      if (res.ok) {
        setIsConvertModalOpen(false);
        fetchLeads();
      } else {
        const err = await res.json();
        alert(err.detail || 'Failed to convert lead');
      }
    } catch (err) {
      console.error('Convert lead error:', err);
    }
  };

  // ─── Shared form fields component ───
  const renderFormFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Name *</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange}
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none" />
        </div>
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Company</label>
          <input type="text" name="company" value={formData.company} onChange={handleInputChange}
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none" />
        </div>
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange}
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none" />
        </div>
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Phone</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none" />
        </div>
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Source</label>
          <select name="source" value={formData.source} onChange={handleInputChange}
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none appearance-none">
            <option value="">Select Source...</option>
            {sources.map(s => <option key={s.id} value={s.value}>{s.value}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Industry</label>
          <select name="industry" value={formData.industry} onChange={handleInputChange}
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none appearance-none">
            <option value="">Select Industry...</option>
            {industries.map(i => <option key={i.id} value={i.value}>{i.value}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Location</label>
          <input type="text" name="location" value={formData.location} onChange={handleInputChange}
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none" />
        </div>
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Status</label>
          <select name="status" value={formData.status} onChange={handleInputChange}
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none appearance-none">
            <option>New</option><option>Contacted</option><option>Qualified</option><option>Lost</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Assigned To</label>
        <select name="assigned_to" value={formData.assigned_to} onChange={handleInputChange}
          className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none appearance-none">
          <option value="">Select Owner...</option>
          {owners.map(o => <option key={o.id} value={o.value}>{o.value}</option>)}
        </select>
      </div>
    </>
  );

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Leads Management</h1>
          <p className="text-[#9CA3AF] mt-1">Manage and track your prospective customers.</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] group-focus-within:text-[#6366F1] transition-colors" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#111827] border border-[#1F2937] rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[#6366F1] text-[#F9FAFB] w-64 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex items-center gap-2 bg-[#111827] border border-[#1F2937] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1F2937] transition-colors text-[#9CA3AF] appearance-none cursor-pointer outline-none focus:border-[#6366F1]"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-xl shadow-[0_0_0_1px_#1F2937,0_4px_24px_rgba(0,0,0,0.4)] flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="sticky top-0 bg-[#0A0D14] z-10">
              <tr className="border-b border-[#1F2937] text-[#9CA3AF] text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Company</th>
                <th className="p-4 font-semibold">Source</th>
                <th className="p-4 font-semibold">Phone</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Assigned To</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="p-8 text-center text-[#9CA3AF]">Loading...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-[#9CA3AF]">No leads found.</td></tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-[#1F2937] hover:bg-[#1F2937]/50 transition-colors group">
                    <td className="p-4 font-medium text-[#F9FAFB]">{lead.name}</td>
                    <td className="p-4 flex items-center gap-2 text-[#F9FAFB]">
                      <Building2 className="w-4 h-4 text-[#9CA3AF]" />{lead.company}
                    </td>
                    <td className="p-4 text-[#9CA3AF] text-sm">{lead.source}</td>
                    <td className="p-4 text-[#9CA3AF] text-sm">{lead.phone}</td>
                    <td className="p-4"><StatusBadge status={lead.status} /></td>
                    <td className="p-4 flex items-center gap-2 text-sm text-[#F9FAFB]">
                      {lead.assigned_to && (
                        <>
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#1F2937] to-[#374151] border border-[#4B5563] flex items-center justify-center text-[10px] text-white font-bold">
                            {lead.assigned_to.split(' ').map(n=>n[0]).join('')}
                          </div>
                          {lead.assigned_to}
                        </>
                      )}
                    </td>
                    <td className="p-4 text-[#9CA3AF] text-sm">{lead.created_date}</td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => handleConvertClick(lead)}
                        title="Convert Lead"
                        className="p-1.5 text-[#10B981] hover:text-white transition-colors rounded-md hover:bg-[#10B981] inline-flex items-center justify-center border border-transparent hover:border-[#10B981] opacity-0 group-hover:opacity-100"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openEditModal(lead)}
                        title="Edit" 
                        className="p-1.5 text-[#9CA3AF] hover:text-[#6366F1] transition-colors rounded-md hover:bg-[#6366F1]/10 inline-flex items-center justify-center"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteLead(lead)}
                        title="Delete" 
                        className="p-1.5 text-[#9CA3AF] hover:text-[#EF4444] transition-colors rounded-md hover:bg-[#EF4444]/10 inline-flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-[#1F2937] flex justify-between items-center bg-[#0A0D14]">
          <span className="text-sm text-[#9CA3AF]">Showing {leads.length} entries</span>
          <div className="flex gap-2">
            <button className="p-2 border border-[#1F2937] rounded-lg hover:bg-[#1F2937] text-[#9CA3AF] hover:text-white transition-colors disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 border border-[#1F2937] rounded-lg hover:bg-[#1F2937] text-[#9CA3AF] hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Add Lead Modal ─── */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Lead">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {renderFormFields()}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#1F2937]">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-[#1F2937] rounded-lg hover:bg-[#1F2937] text-sm text-[#9CA3AF] hover:text-white transition-colors">Cancel</button>
            <button type="button" onClick={handleSaveLead} className="px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] text-sm font-medium transition-colors">Save Lead</button>
          </div>
        </form>
      </Modal>

      {/* ─── Edit Lead Modal ─── */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Lead">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {renderFormFields()}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#1F2937]">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border border-[#1F2937] rounded-lg hover:bg-[#1F2937] text-sm text-[#9CA3AF] hover:text-white transition-colors">Cancel</button>
            <button type="button" onClick={handleUpdateLead} className="px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] text-sm font-medium transition-colors">Update Lead</button>
          </div>
        </form>
      </Modal>

      {/* ─── Convert Lead Modal ─── */}
      <Modal isOpen={isConvertModalOpen} onClose={() => setIsConvertModalOpen(false)} title="Convert Lead">
        <p className="mb-4 text-[#9CA3AF] text-sm">Convert <span className="text-white font-semibold">{selectedLead?.name}</span> to:</p>
        <div className="space-y-3 mb-6">
          {['Account', 'Contact', 'Opportunity'].map((opt) => (
            <label key={opt} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${convertType === opt ? 'border-[#6366F1] bg-[#6366F1]/10' : 'border-[#1F2937] hover:bg-[#1F2937]/50'}`}>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${convertType === opt ? 'border-[#6366F1]' : 'border-[#9CA3AF]'}`}>
                {convertType === opt && <div className="w-2 h-2 rounded-full bg-[#6366F1]" />}
              </div>
              <input type="radio" name="convertType" value={opt} checked={convertType === opt} onChange={() => setConvertType(opt)} className="hidden" />
              <span className={convertType === opt ? 'text-white font-medium' : 'text-[#9CA3AF]'}>{opt}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={() => setIsConvertModalOpen(false)} className="px-4 py-2 border border-[#1F2937] rounded-lg hover:bg-[#1F2937] text-sm text-[#9CA3AF] hover:text-white transition-colors">Cancel</button>
          <button onClick={handleConvertConfirm} className="px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg text-sm font-medium transition-colors shadow-[0_4px_14px_0_rgba(99,102,241,0.39)]">Confirm</button>
        </div>
      </Modal>
    </div>
  );
}
