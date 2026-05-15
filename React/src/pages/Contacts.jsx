import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, User, Mail, Phone, Building2, MapPin, Edit2, Plus, ChevronRight, ChevronLeft, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';

const API_BASE = 'http://localhost:8000/api/contacts';

const EMPTY_FORM = {
  name: '', account_id: '', account_name: '', email: '',
  phone: '', designation: '', preferred_comm: 'Email', location: '',
};

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [activeTab, setActiveTab] = useState('History');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [accountsList, setAccountsList] = useState([]);

  // ─── Fetch contacts ───
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      const res = await fetch(`${API_BASE}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
        
        // Select first contact if none selected
        if (data.length > 0 && (!selectedContact || !data.find(c => c.id === selectedContact.id))) {
          setSelectedContact(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedContact]);

  useEffect(() => {
    fetchContacts();
    const fetchAccounts = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/accounts');
        if (res.ok) {
          setAccountsList(await res.json());
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAccounts();
  }, [fetchContacts]);

  // ─── Grouping Logic ───
  const groupedContacts = useMemo(() => {
    return contacts.reduce((acc, contact) => {
      const company = contact.account_name || contact.account || 'No Company';
      if (!acc[company]) acc[company] = [];
      acc[company].push(contact);
      return acc;
    }, {});
  }, [contacts]);

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
    if (!selectedContact) return;
    setFormData({
      ...selectedContact,
      account_name: selectedContact.account_name || selectedContact.account || '',
    });
    setIsEditModalOpen(true);
  };

  // ─── Create Contact ───
  const handleSaveContact = async () => {
    if (!formData.name.trim()) { alert('Name is required'); return; }
    try {
      const payload = { ...formData };
      if (!payload.account_id) payload.account_id = null;
      
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({ ...EMPTY_FORM });
        fetchContacts();
      } else {
        const err = await res.json();
        alert(typeof err.detail === 'object' ? JSON.stringify(err.detail) : err.detail || 'Failed to create contact');
      }
    } catch (err) {
      console.error('Create contact error:', err);
      alert('Failed to create contact');
    }
  };

  // ─── Update Contact ───
  const handleUpdateContact = async () => {
    if (!formData.name.trim()) { alert('Name is required'); return; }
    try {
      const payload = { ...formData };
      if (!payload.account_id) payload.account_id = null;

      const res = await fetch(`${API_BASE}/${selectedContact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        setFormData({ ...EMPTY_FORM });
        fetchContacts();
      } else {
        const err = await res.json();
        alert(typeof err.detail === 'object' ? JSON.stringify(err.detail) : err.detail || 'Failed to update contact');
      }
    } catch (err) {
      console.error('Update contact error:', err);
      alert('Failed to update contact');
    }
  };

  // ─── Delete Contact ───
  const handleDeleteContact = async (contact) => {
    if (!window.confirm(`Delete contact "${contact.name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/${contact.id}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedContact?.id === contact.id) setSelectedContact(null);
        fetchContacts();
      }
    } catch (err) {
      console.error('Delete contact error:', err);
    }
  };

  const renderFormFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Name *</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange}
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none" />
        </div>
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Company / Account</label>
          <select name="account_name" value={formData.account_name} onChange={handleInputChange}
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none appearance-none">
            <option value="">Select Account...</option>
            {accountsList.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange}
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none" />
        </div>
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Phone</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleInputChange}
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none" />
        </div>
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Designation</label>
          <input type="text" name="designation" value={formData.designation} onChange={handleInputChange}
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none" />
        </div>
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Preferred Comm.</label>
          <select name="preferred_comm" value={formData.preferred_comm} onChange={handleInputChange}
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none appearance-none">
            <option>Email</option><option>Call</option><option>WhatsApp</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Location</label>
          <input type="text" name="location" value={formData.location} onChange={handleInputChange}
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none" />
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Left List - Grouped by Company */}
      <div className="w-[30%] bg-[#111827] border border-[#1F2937] rounded-xl shadow-[0_0_0_1px_#1F2937,0_4px_24px_rgba(0,0,0,0.4)] flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-[#1F2937] bg-[#111827] flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Contacts</h2>
            <button onClick={openAddModal} className="p-1.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors shadow-lg shadow-[#6366F1]/20">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input 
              type="text" 
              placeholder="Search contacts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[#6366F1] text-[#F9FAFB] transition-all" 
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {loading && contacts.length === 0 ? (
            <div className="p-8 text-center text-[#9CA3AF] text-sm">Loading...</div>
          ) : contacts.length === 0 ? (
            <div className="p-8 text-center text-[#9CA3AF] text-sm">No contacts found.</div>
          ) : (
            Object.entries(groupedContacts).map(([company, companyContacts]) => (
              <div key={company} className="border-b border-[#1F2937]">
                <div className="p-2 bg-[#1F2937]/50 text-xs font-bold text-[#6366F1] uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" /> {company}
                </div>
                {companyContacts.map(contact => (
                  <div 
                    key={contact.id} 
                    onClick={() => setSelectedContact(contact)}
                    className={`p-4 cursor-pointer transition-all ${selectedContact?.id === contact.id ? 'bg-[#6366F1]/10 border-l-4 border-l-[#6366F1]' : 'hover:bg-[#1F2937]/30 border-l-4 border-l-transparent'}`}
                  >
                    <h4 className={`font-semibold mb-1 ${selectedContact?.id === contact.id ? 'text-[#6366F1]' : 'text-[#F9FAFB]'}`}>{contact.name}</h4>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#9CA3AF] flex items-center gap-1"><Mail className="w-3 h-3" /> {contact.email}</p>
                      <span className="text-[10px] text-[#6366F1] bg-[#6366F1]/10 px-1.5 py-0.5 rounded-full font-medium">{contact.designation}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
        <div className="p-3 border-t border-[#1F2937] flex justify-between items-center bg-[#0A0D14]/50">
          <button className="p-1 text-[#9CA3AF] hover:text-white disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-[10px] text-[#4B5563] font-bold uppercase tracking-widest">Page 1 of 1</span>
          <button className="p-1 text-[#9CA3AF] hover:text-white disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Right Detail Panel */}
      {selectedContact ? (
        <div className="w-[70%] bg-[#111827] border border-[#1F2937] rounded-xl shadow-[0_0_0_1px_#1F2937,0_4px_24px_rgba(0,0,0,0.4)] flex flex-col h-full overflow-hidden">
          {/* Right Top - Selected Person */}
          <div className="p-8 border-b border-[#1F2937] bg-gradient-to-br from-[#111827] to-[#1F2937]/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#6366F1]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#10B981] flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-[#6366F1]/20">
                  {selectedContact.name ? selectedContact.name.split(' ').map(n => n[0]).join('') : ''}
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-1 text-white">{selectedContact.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-[#9CA3AF]">
                    <span className="flex items-center gap-1.5 font-medium text-[#6366F1] bg-[#6366F1]/10 px-2.5 py-0.5 rounded-lg border border-[#6366F1]/20">{selectedContact.designation}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {selectedContact.location}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={openEditModal} className="p-2 border border-[#1F2937] rounded-lg hover:bg-[#1F2937] text-[#9CA3AF] hover:text-white transition-colors bg-[#0A0D14]"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDeleteContact(selectedContact)} className="p-2 border border-[#1F2937] rounded-lg hover:bg-[#EF4444]/10 text-[#9CA3AF] hover:text-[#EF4444] transition-colors bg-[#0A0D14]"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6 bg-[#0A0D14] p-5 rounded-xl border border-[#1F2937] relative z-10 shadow-inner">
              <div>
                <p className="text-[10px] text-[#4B5563] mb-1 uppercase tracking-widest font-bold">Associated Account</p>
                <Link to="/accounts" className="font-semibold text-[#6366F1] hover:underline flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> {selectedContact.account_name || selectedContact.account || 'N/A'}
                </Link>
              </div>
              <div>
                <p className="text-[10px] text-[#4B5563] mb-1 uppercase tracking-widest font-bold">Email Address</p>
                <p className="font-medium text-white flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#9CA3AF]" /> {selectedContact.email}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#4B5563] mb-1 uppercase tracking-widest font-bold">Phone Number</p>
                <p className="font-medium text-white flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#9CA3AF]" /> {selectedContact.phone}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#4B5563] mb-1 uppercase tracking-widest font-bold">Preferred Communication</p>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#10B981]/10 text-[#10B981] text-xs font-semibold border border-[#10B981]/20">
                  {selectedContact.preferred_comm || selectedContact.preferredComm}
                </span>
              </div>
            </div>
          </div>

          <div className="flex border-b border-[#1F2937] px-6 bg-[#111827]">
            {['History', 'Communication Logs'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all relative ${activeTab === tab ? 'border-[#6366F1] text-[#6366F1]' : 'border-transparent text-[#4B5563] hover:text-[#9CA3AF]'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-8 bg-[#0A0D14]">
            {activeTab === 'History' && (
              <div className="space-y-6">
                <div className="flex gap-4 relative before:absolute before:left-5 before:top-10 before:bottom-[-20px] before:w-px before:bg-[#1F2937]">
                  <div className="mt-1 p-2 bg-[#6366F1]/10 border border-[#6366F1]/20 rounded-full z-10 bg-[#0A0D14] shadow-lg shadow-[#6366F1]/5">
                    <User className="w-4 h-4 text-[#6366F1]" />
                  </div>
                  <div className="bg-[#111827] p-5 rounded-2xl border border-[#1F2937] flex-1 hover:border-[#374151] transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm text-white group-hover:text-[#6366F1] transition-colors">Contact Created</h4>
                      <span className="text-[10px] text-[#4B5563] font-bold uppercase tracking-wider bg-[#0A0D14] px-2 py-1 rounded-lg">May 01, 2025</span>
                    </div>
                    <p className="text-sm text-[#9CA3AF] leading-relaxed">Contact record for <span className="text-white font-medium">{selectedContact.name}</span> was created.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Communication Logs' && (
              <div className="space-y-4">
                <div className="bg-[#111827] p-6 rounded-2xl border border-[#1F2937] hover:border-[#6366F1]/30 transition-all cursor-pointer group flex gap-5">
                  <div className="w-12 h-12 rounded-xl bg-[#6366F1]/10 flex items-center justify-center border border-[#6366F1]/20 group-hover:bg-[#6366F1] group-hover:text-white transition-all">
                    <Mail className="w-5 h-5 text-[#6366F1] group-hover:text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-white transition-colors">Introduction Email Sent</h4>
                      <span className="text-[10px] text-[#4B5563] font-bold uppercase tracking-widest">Yesterday, 10:45 AM</span>
                    </div>
                    <p className="text-sm text-[#9CA3AF] leading-relaxed">Sent the enterprise brochure and pricing tier details for Q3 review.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-[70%] bg-[#111827] border border-[#1F2937] rounded-xl flex items-center justify-center">
          <p className="text-[#4B5563] text-sm">Select a contact to view details</p>
        </div>
      )}

      {/* ─── Add Contact Modal ─── */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Contact">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {renderFormFields()}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#1F2937]">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-[#1F2937] rounded-lg hover:bg-[#1F2937] text-sm text-[#9CA3AF] hover:text-white transition-colors">Cancel</button>
            <button type="button" onClick={handleSaveContact} className="px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] text-sm font-medium transition-colors shadow-[0_4px_14px_0_rgba(99,102,241,0.39)]">Save Contact</button>
          </div>
        </form>
      </Modal>

      {/* ─── Edit Contact Modal ─── */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Contact">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {renderFormFields()}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#1F2937]">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border border-[#1F2937] rounded-lg hover:bg-[#1F2937] text-sm text-[#9CA3AF] hover:text-white transition-colors">Cancel</button>
            <button type="button" onClick={handleUpdateContact} className="px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] text-sm font-medium transition-colors shadow-[0_4px_14px_0_rgba(99,102,241,0.39)]">Update Contact</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
