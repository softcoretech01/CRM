import React, { useState, useEffect, useCallback } from 'react';
import { Search, Building2, Globe, MapPin, Edit2, Mail, Phone, Calendar, Briefcase, Download, Plus, Zap, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';

const API_BASE = 'http://localhost:8000/api/accounts';

const EMPTY_FORM = {
  name: '', industry: '', gst: '', owner: 'Arjun Mehta',
  location: '', address: '',
};

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [activeTab, setActiveTab] = useState('Contacts');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);

  // ─── Fetch accounts ───
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      const res = await fetch(`${API_BASE}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
        if (data.length > 0 && (!selectedAccount || !data.find(a => a.id === selectedAccount.id))) {
          setSelectedAccount(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // ─── Form helpers ───
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({ ...EMPTY_FORM });
    setIsAddModalOpen(true);
  };

  const openEditModal = () => {
    if (!selectedAccount) return;
    setFormData({
      name: selectedAccount.name || '',
      industry: selectedAccount.industry || '',
      gst: selectedAccount.gst || '',
      owner: selectedAccount.owner || 'Arjun Mehta',
      location: selectedAccount.location || '',
      address: selectedAccount.address || '',
    });
    setIsEditModalOpen(true);
  };

  // ─── Create Account ───
  const handleSaveAccount = async () => {
    if (!formData.name.trim()) { alert('Account name is required'); return; }
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({ ...EMPTY_FORM });
        fetchAccounts();
      } else {
        const err = await res.json();
        alert(err.detail || 'Failed to create account');
      }
    } catch (err) {
      console.error('Create account error:', err);
      alert('Failed to create account');
    }
  };

  // ─── Update Account ───
  const handleUpdateAccount = async () => {
    if (!formData.name.trim()) { alert('Account name is required'); return; }
    try {
      const res = await fetch(`${API_BASE}/${selectedAccount.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        setFormData({ ...EMPTY_FORM });
        fetchAccounts();
      } else {
        const err = await res.json();
        alert(err.detail || 'Failed to update account');
      }
    } catch (err) {
      console.error('Update account error:', err);
      alert('Failed to update account');
    }
  };

  // ─── Delete Account ───
  const handleDeleteAccount = async (acc) => {
    if (!window.confirm(`Delete account "${acc.name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/${acc.id}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedAccount?.id === acc.id) setSelectedAccount(null);
        fetchAccounts();
      }
    } catch (err) {
      console.error('Delete account error:', err);
    }
  };

  // ─── Shared form fields ───
  const renderFormFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Name *</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange}
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none" />
        </div>
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Industry</label>
          <input type="text" name="industry" value={formData.industry} onChange={handleInputChange}
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none" />
        </div>
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">GST / Tax ID</label>
          <input type="text" name="gst" value={formData.gst} onChange={handleInputChange}
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none" />
        </div>
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Owner</label>
          <input type="text" name="owner" value={formData.owner} onChange={handleInputChange} list="owners"
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none" />
          <datalist id="owners">
            <option value="Arjun Mehta" />
            <option value="Priya Sharma" />
            <option value="Karan Nair" />
            <option value="Divya Iyer" />
          </datalist>
        </div>
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Location</label>
          <input type="text" name="location" value={formData.location} onChange={handleInputChange}
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none" />
        </div>
      </div>
      <div>
        <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Address</label>
        <textarea name="address" value={formData.address} onChange={handleInputChange} rows={2}
          className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none resize-none" />
      </div>
    </>
  );

  return (
    <div className="flex h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Left List */}
      <div className="w-[30%] bg-[#111827] border border-[#1F2937] rounded-xl shadow-[0_0_0_1px_#1F2937,0_4px_24px_rgba(0,0,0,0.4)] flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-[#1F2937] bg-[#111827] flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Accounts</h2>
            <button onClick={openAddModal} className="p-1.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors shadow-lg shadow-[#6366F1]/20">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input type="text" placeholder="Search accounts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[#6366F1] text-[#F9FAFB] transition-all" />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {loading && accounts.length === 0 ? (
            <div className="p-8 text-center text-[#9CA3AF] text-sm">Loading...</div>
          ) : accounts.length === 0 ? (
            <div className="p-8 text-center text-[#9CA3AF] text-sm">No accounts found.</div>
          ) : (
            accounts.map(acc => (
              <div
                key={acc.id}
                onClick={() => setSelectedAccount(acc)}
                className={`p-4 border-b border-[#1F2937] cursor-pointer transition-all ${selectedAccount?.id === acc.id ? 'bg-[#6366F1]/10 border-l-4 border-l-[#6366F1]' : 'hover:bg-[#1F2937]/30 border-l-4 border-l-transparent'}`}
              >
                <h4 className={`font-semibold mb-1 ${selectedAccount?.id === acc.id ? 'text-[#6366F1]' : 'text-[#F9FAFB]'}`}>{acc.name}</h4>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-[#9CA3AF] flex items-center gap-1 bg-[#1F2937] px-2 py-0.5 rounded-full font-medium"><Building2 className="w-3 h-3" /> {acc.industry}</p>
                  {acc.owner && (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#10B981] flex items-center justify-center text-[8px] text-white font-bold shadow-inner" title={`Owner: ${acc.owner}`}>
                      {acc.owner.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Detail Panel */}
      {selectedAccount ? (
        <div className="w-[70%] bg-[#111827] border border-[#1F2937] rounded-xl shadow-[0_0_0_1px_#1F2937,0_4px_24px_rgba(0,0,0,0.4)] flex flex-col h-full overflow-hidden">
          <div className="p-8 border-b border-[#1F2937] bg-gradient-to-br from-[#111827] to-[#1F2937]/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#6366F1]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-[#0A0D14] border border-[#1F2937] flex items-center justify-center text-3xl shadow-xl">
                  <Building2 className="w-10 h-10 text-[#6366F1]" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-1 text-white">{selectedAccount.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-[#9CA3AF]">
                    <span className="flex items-center gap-1.5 font-medium hover:text-[#6366F1] cursor-pointer transition-colors"><Globe className="w-4 h-4" /> www.{selectedAccount.name.toLowerCase()}.com</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {selectedAccount.location}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={openEditModal} className="p-2 border border-[#1F2937] rounded-lg hover:bg-[#1F2937] text-[#9CA3AF] hover:text-white transition-colors bg-[#0A0D14]"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDeleteAccount(selectedAccount)} className="p-2 border border-[#1F2937] rounded-lg hover:bg-[#EF4444]/10 text-[#9CA3AF] hover:text-[#EF4444] transition-colors bg-[#0A0D14]"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8 relative z-10">
              <div className="bg-[#0A0D14] p-5 rounded-xl border border-[#1F2937] shadow-inner">
                <p className="text-[10px] text-[#4B5563] mb-3 uppercase tracking-widest font-bold">Account Overview</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-[#9CA3AF] mb-0.5 uppercase font-semibold">Industry</p>
                    <p className="font-medium text-white text-sm">{selectedAccount.industry}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#9CA3AF] mb-0.5 uppercase font-semibold">GST/Tax ID</p>
                    <p className="font-medium text-white text-sm">{selectedAccount.gst}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-[#9CA3AF] mb-0.5 uppercase font-semibold">Address</p>
                    <p className="font-medium text-white text-sm leading-relaxed">{selectedAccount.address}</p>
                  </div>
                </div>
              </div>
              <div className="bg-[#0A0D14] p-5 rounded-xl border border-[#1F2937] shadow-inner flex flex-col justify-center">
                <p className="text-[10px] text-[#4B5563] mb-3 uppercase tracking-widest font-bold">Account Owner</p>
                <div className="flex items-center gap-4">
                  {selectedAccount.owner && (
                    <>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#10B981] flex items-center justify-center text-sm text-white font-bold shadow-lg shadow-[#6366F1]/20">
                        {selectedAccount.owner.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">{selectedAccount.owner}</p>
                        <p className="text-xs text-[#9CA3AF]">Key Account Manager</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex border-b border-[#1F2937] px-6 bg-[#111827]">
            {['Contacts', 'Opportunities', 'Activities', 'Documents', 'Transactions'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-4 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all relative ${activeTab === tab ? 'border-[#6366F1] text-[#6366F1]' : 'border-transparent text-[#4B5563] hover:text-[#9CA3AF]'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-6 bg-[#0A0D14]">
            {activeTab === 'Contacts' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1F2937] text-[#4B5563] text-[10px] uppercase tracking-widest">
                      <th className="p-4 font-bold">Name</th>
                      <th className="p-4 font-bold">Designation</th>
                      <th className="p-4 font-bold">Email</th>
                      <th className="p-4 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td colSpan="4" className="p-6 text-center text-[#4B5563] text-sm">Contact data will appear here once linked.</td></tr>
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 'Opportunities' && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-[#4B5563] text-sm">Opportunity data will appear here once linked.</p>
              </div>
            )}
            {activeTab === 'Activities' && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-[#4B5563] text-sm">Activity data will appear here once linked.</p>
              </div>
            )}
            {activeTab === 'Transactions' && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-[#111827] flex items-center justify-center mb-6 border border-[#1F2937] shadow-inner">
                  <Zap className="w-10 h-10 text-[#4B5563] opacity-20" />
                </div>
                <h4 className="text-white font-bold mb-2 text-lg">ERP Integration Optional</h4>
                <p className="text-[#9CA3AF] text-sm max-w-xs">Connect your ERP system to view live transaction history and invoice status for this account.</p>
                <button className="mt-6 px-6 py-2 bg-[#111827] border border-[#1F2937] rounded-xl text-xs font-bold uppercase tracking-widest text-white hover:bg-[#1F2937] transition-all">Connect ERP</button>
              </div>
            )}
            {activeTab === 'Documents' && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-[#4B5563] text-sm">No documents uploaded yet.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-[70%] bg-[#111827] border border-[#1F2937] rounded-xl flex items-center justify-center">
          <p className="text-[#4B5563] text-sm">Select an account to view details</p>
        </div>
      )}

      {/* ─── Add Account Modal ─── */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Account">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {renderFormFields()}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#1F2937]">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-[#1F2937] rounded-lg hover:bg-[#1F2937] text-sm text-[#9CA3AF] hover:text-white transition-colors">Cancel</button>
            <button type="button" onClick={handleSaveAccount} className="px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] text-sm font-medium transition-colors shadow-[0_4px_14px_0_rgba(99,102,241,0.39)]">Save Account</button>
          </div>
        </form>
      </Modal>

      {/* ─── Edit Account Modal ─── */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Account">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {renderFormFields()}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#1F2937]">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border border-[#1F2937] rounded-lg hover:bg-[#1F2937] text-sm text-[#9CA3AF] hover:text-white transition-colors">Cancel</button>
            <button type="button" onClick={handleUpdateAccount} className="px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] text-sm font-medium transition-colors shadow-[0_4px_14px_0_rgba(99,102,241,0.39)]">Update Account</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
