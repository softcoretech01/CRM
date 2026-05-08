import React, { useState, useEffect, useCallback } from 'react';
import { MoreVertical, Calendar, Building2, Plus, AlertCircle, Trash2, Edit2 } from 'lucide-react';
import Modal from '../components/Modal';

const API_BASE = 'http://localhost:8000/api/opportunities';

const STAGES = ['Prospect', 'Qualification', 'Proposal', 'Negotiation', 'Won'];

const EMPTY_FORM = {
  name: '', account_name: 'Infosys', value: '', probability: '',
  close_date: '', owner: 'Arjun Mehta', stage: 'Prospect',
};

export default function Opportunities() {
  const [columns, setColumns] = useState(() => {
    const init = {};
    STAGES.forEach(s => { init[s] = []; });
    return init;
  });
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [lostDealsCount, setLostDealsCount] = useState(0);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);

  // ─── Fetch opportunities grouped by stage ───
  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/by-stage`);
      if (res.ok) {
        const data = await res.json();
        const normalised = {};
        STAGES.forEach(s => {
          normalised[s] = (data[s] || []).map(row => ({
            id: row.id,
            name: row.name,
            account: row.account_name || '',
            value: row.value != null ? String(row.value) : '0',
            probability: row.probability ?? 0,
            closeDate: row.close_date || '',
            owner: row.owner || '',
            stage: s,
          }));
        });
        setColumns(normalised);
      }
    } catch (err) {
      console.error('Failed to fetch opportunities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  // ─── Form helpers ───
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ─── Open Add Modal ───
  const openAddModal = () => {
    setFormData({ ...EMPTY_FORM });
    setIsAddModalOpen(true);
  };

  // ─── Open Edit Modal ───
  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      account_name: item.account || 'Infosys',
      value: item.value || '',
      probability: String(item.probability || ''),
      close_date: item.closeDate || '',
      owner: item.owner || 'Arjun Mehta',
      stage: item.stage || 'Prospect',
    });
    setIsEditModalOpen(true);
  };

  // ─── Drag & Drop ───
  const handleDragStart = (e, item, sourceCol) => {
    setDraggedItem({ item, sourceCol });
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      e.target.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e, colName) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colName) setDragOverCol(colName);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = async (e, targetCol) => {
    e.preventDefault();
    setDragOverCol(null);

    if (!draggedItem || draggedItem.sourceCol === targetCol) return;

    const { item, sourceCol } = draggedItem;

    // Optimistic UI update
    const newColumns = { ...columns };
    newColumns[sourceCol] = newColumns[sourceCol].filter(i => i.id !== item.id);
    const updatedItem = { ...item, stage: targetCol };
    if (targetCol === 'Won') updatedItem.probability = 100;
    newColumns[targetCol] = [...newColumns[targetCol], updatedItem];
    setColumns(newColumns);

    // Persist to DB
    try {
      const res = await fetch(`${API_BASE}/${item.id}/stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: targetCol }),
      });
      if (!res.ok) {
        console.error('Failed to update stage, reverting...');
        fetchOpportunities();
      }
    } catch (err) {
      console.error('Stage update error:', err);
      fetchOpportunities();
    }
  };

  // ─── Delete (Mark Lost) ───
  const handleMarkLost = async (item, colName) => {
    if (!window.confirm(`Mark "${item.name}" as lost?`)) return;
    try {
      const res = await fetch(`${API_BASE}/${item.id}`, { method: 'DELETE' });
      if (res.ok) {
        const newColumns = { ...columns };
        newColumns[colName] = newColumns[colName].filter(i => i.id !== item.id);
        setColumns(newColumns);
        setLostDealsCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Delete opportunity error:', err);
    }
  };

  // ─── Build payload (shared for create/update) ───
  const buildPayload = () => ({
    name: formData.name,
    account_name: formData.account_name,
    value: parseFloat(formData.value) || 0,
    probability: parseInt(formData.probability) || 0,
    close_date: formData.close_date || null,
    owner: formData.owner,
    stage: formData.stage,
  });

  // ─── Create Deal ───
  const handleSaveDeal = async () => {
    if (!formData.name.trim()) { alert('Deal name is required'); return; }
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({ ...EMPTY_FORM });
        fetchOpportunities();
      } else {
        const err = await res.json();
        alert(err.detail || 'Failed to create deal');
      }
    } catch (err) {
      console.error('Create opportunity error:', err);
      alert('Failed to create deal');
    }
  };

  // ─── Update Deal ───
  const handleUpdateDeal = async () => {
    if (!formData.name.trim()) { alert('Deal name is required'); return; }
    try {
      const res = await fetch(`${API_BASE}/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        setEditingItem(null);
        setFormData({ ...EMPTY_FORM });
        fetchOpportunities();
      } else {
        const err = await res.json();
        alert(err.detail || 'Failed to update deal');
      }
    } catch (err) {
      console.error('Update opportunity error:', err);
      alert('Failed to update deal');
    }
  };

  const getProbColor = (prob) => {
    if (prob >= 80) return 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30';
    if (prob >= 50) return 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30';
    return 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30';
  };

  // ─── Shared form fields ───
  const renderFormFields = () => (
    <>
      <div>
        <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Deal Name *</label>
        <input type="text" name="name" value={formData.name} onChange={handleInputChange}
          className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Account</label>
          <select name="account_name" value={formData.account_name} onChange={handleInputChange}
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none appearance-none">
            <option>Infosys</option><option>Zoho</option><option>Freshworks</option><option>Razorpay</option><option>Meesho</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Value (₹ Lakhs)</label>
          <input type="number" step="0.1" name="value" value={formData.value} onChange={handleInputChange}
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none" />
        </div>
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Stage</label>
          <select name="stage" value={formData.stage} onChange={handleInputChange}
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none appearance-none">
            {STAGES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Probability (%)</label>
          <input type="number" min="0" max="100" name="probability" value={formData.probability} onChange={handleInputChange}
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none" />
        </div>
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Close Date</label>
          <input type="date" name="close_date" value={formData.close_date} onChange={handleInputChange}
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none" />
        </div>
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1 font-semibold">Owner</label>
          <select name="owner" value={formData.owner} onChange={handleInputChange}
            className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-lg p-2.5 text-sm text-white focus:border-[#6366F1] outline-none appearance-none">
            <option>Arjun Mehta</option><option>Priya Sharma</option><option>Karan Nair</option><option>Divya Iyer</option>
          </select>
        </div>
      </div>
    </>
  );

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Pipeline Management</h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-sm text-[#9CA3AF]">Drag and drop deals to update stages.</p>
            {lostDealsCount > 0 && (
              <span className="bg-[#EF4444]/10 text-[#EF4444] text-xs px-2 py-1 rounded-full border border-[#EF4444]/30 font-semibold shadow-sm">
                {lostDealsCount} Deals Lost
              </span>
            )}
          </div>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Add Deal
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-[#9CA3AF]">Loading pipeline...</div>
      ) : (
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4 hide-scrollbar items-start">
          {STAGES.map((colName) => {
            const colItems = columns[colName] || [];
            const totalValue = colItems.reduce((acc, curr) => acc + parseFloat(curr.value || 0), 0);
            const isWon = colName === 'Won';
            const isDragTarget = dragOverCol === colName && draggedItem?.sourceCol !== colName;

            return (
              <div 
                key={colName}
                className={`flex-shrink-0 w-[320px] flex flex-col rounded-xl border transition-all duration-200 ${
                  isDragTarget
                    ? 'border-[#6366F1] bg-[#6366F1]/5 ring-2 ring-[#6366F1]/20'
                    : isWon
                      ? 'bg-[#10B981]/5 border-[#10B981]/20'
                      : 'bg-[#0A0D14] border-[#1F2937]'
                }`}
                onDragOver={(e) => handleDragOver(e, colName)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, colName)}
              >
                <div className={`p-4 border-b flex justify-between items-center rounded-t-xl ${isWon ? 'border-[#10B981]/20 bg-[#10B981]/10' : 'border-[#1F2937] bg-[#111827]'}`}>
                  <h3 className={`font-bold text-sm uppercase tracking-wider flex items-center gap-2 ${isWon ? 'text-[#10B981]' : 'text-[#F9FAFB]'}`}>
                    {colName} 
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isWon ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#1F2937] text-[#9CA3AF]'}`}>{colItems.length}</span>
                  </h3>
                  <span className={`text-sm font-bold ${isWon ? 'text-[#10B981]' : 'text-[#6366F1]'}`}>₹{totalValue.toFixed(1)}L</span>
                </div>
                
                <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[400px]">
                  {colItems.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item, colName)}
                      onDragEnd={handleDragEnd}
                      className={`p-4 rounded-xl shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)] group ${isWon ? 'bg-[#111827]/80 border border-[#10B981]/30 hover:border-[#10B981]' : 'bg-[#111827] border border-[#1F2937] hover:border-[#6366F1]'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-semibold text-sm leading-tight transition-colors ${isWon ? 'text-[#10B981]' : 'text-white group-hover:text-[#6366F1]'}`}>{item.name}</h4>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
                            title="Edit Deal"
                            className="text-[#9CA3AF] hover:text-[#6366F1] transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleMarkLost(item, colName); }}
                            title="Mark as Lost"
                            className="text-[#9CA3AF] hover:text-[#EF4444] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-[#9CA3AF] mb-4 flex items-center gap-1"><Building2 className="w-3 h-3"/> {item.account}</p>
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-lg text-white">₹{item.value}L</span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getProbColor(item.probability)}`}>
                          {item.probability}%
                        </span>
                      </div>
                      <div className={`pt-3 border-t text-[10px] text-[#9CA3AF] flex items-center justify-between ${isWon ? 'border-[#10B981]/20' : 'border-[#1F2937]'}`}>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.closeDate}</span>
                        {item.owner && (
                          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#10B981] flex items-center justify-center text-[8px] text-white font-bold" title={`Owner: ${item.owner}`}>
                            {item.owner.split(' ').map(n=>n[0]).join('')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {colItems.length === 0 && (
                    <div className={`h-24 flex items-center justify-center border-2 border-dashed rounded-xl text-sm ${
                      isDragTarget
                        ? 'border-[#6366F1] text-[#6366F1] bg-[#6366F1]/5'
                        : isWon
                          ? 'border-[#10B981]/30 text-[#10B981]/50'
                          : 'border-[#1F2937] text-[#4B5563]'
                    }`}>
                      Drop deals here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Add Deal Modal ─── */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Deal">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {renderFormFields()}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#1F2937]">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-[#1F2937] rounded-lg hover:bg-[#1F2937] text-sm text-[#9CA3AF] hover:text-white transition-colors">Cancel</button>
            <button type="button" onClick={handleSaveDeal} className="px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] text-sm font-medium transition-colors shadow-[0_4px_14px_0_rgba(99,102,241,0.39)]">Save Deal</button>
          </div>
        </form>
      </Modal>

      {/* ─── Edit Deal Modal ─── */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Deal">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {renderFormFields()}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#1F2937]">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border border-[#1F2937] rounded-lg hover:bg-[#1F2937] text-sm text-[#9CA3AF] hover:text-white transition-colors">Cancel</button>
            <button type="button" onClick={handleUpdateDeal} className="px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] text-sm font-medium transition-colors shadow-[0_4px_14px_0_rgba(99,102,241,0.39)]">Update Deal</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
