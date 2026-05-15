import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Database } from 'lucide-react';

export default function ActivityTypesMaster() {
  const category = 'ActivityType';
  const displayName = 'Activity Types';
  
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, category: category, value: '', is_active: true });

  const fetchMasters = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8000/api/masters?category=${category}`);
      if (res.ok) {
        setMasters(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasters();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = formData.id ? `http://localhost:8000/api/masters/${formData.id}` : 'http://localhost:8000/api/masters';
      const method = formData.id ? 'PUT' : 'POST';
      
      const payload = { ...formData, category };
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setShowModal(false);
        fetchMasters();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this master value?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/masters/${id}?category=${category}`, { method: 'DELETE' });
      if (res.ok) {
        fetchMasters();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (master = null) => {
    if (master) {
      setFormData(master);
    } else {
      setFormData({ id: null, category, value: '', is_active: true });
    }
    setShowModal(true);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Database className="w-8 h-8 text-[#6366F1]" /> Manage {displayName}
          </h1>
          <p className="text-[#9CA3AF] mt-1">Manage standard values for {displayName.toLowerCase()} across the CRM.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#6366F1]/25"
        >
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-[0_0_0_1px_#1F2937,0_4px_24px_rgba(0,0,0,0.4)] flex-1 flex flex-col">
        <div className="flex-1 overflow-auto p-6">
          <table className="w-full">
            <thead className="sticky top-0 bg-[#111827] z-10">
              <tr className="text-left text-xs font-bold text-[#9CA3AF] uppercase tracking-wider border-b border-[#1F2937]">
                <th className="pb-4 pt-2">Value</th>
                <th className="pb-4 pt-2 w-32">Status</th>
                <th className="pb-4 pt-2 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-[#9CA3AF]">Loading...</td>
                </tr>
              ) : masters.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-12 text-center text-[#4B5563]">
                    <div className="flex flex-col items-center">
                      <Database className="w-12 h-12 mb-4 opacity-20" />
                      <p>No values found for {displayName}.</p>
                      <button onClick={() => openModal()} className="mt-4 text-[#6366F1] hover:underline text-sm font-semibold">Add the first one</button>
                    </div>
                  </td>
                </tr>
              ) : (
                masters.map(master => (
                  <tr key={master.id} className="border-b border-[#1F2937]/50 hover:bg-[#1F2937]/30 transition-colors group">
                    <td className="py-4 font-semibold text-[#F9FAFB]">{master.value}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${master.is_active ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' : 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20'}`}>
                        {master.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(master)} className="p-1.5 text-[#9CA3AF] hover:text-white hover:bg-[#1F2937] rounded-lg transition-colors border border-transparent hover:border-[#374151]">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(master.id)} className="p-1.5 text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors border border-transparent hover:border-[#EF4444]/20">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-[#0A0D14]/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">{formData.id ? 'Edit' : 'Add'} {displayName}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#9CA3AF] mb-2 uppercase tracking-wider">Value *</label>
                <input
                  type="text"
                  required
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full bg-[#0A0D14] border border-[#1F2937] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6366F1] transition-colors"
                  placeholder={`e.g. Example`}
                />
              </div>
              <div className="flex items-center gap-3 bg-[#0A0D14] p-3 rounded-xl border border-[#1F2937]">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 rounded border-[#1F2937] text-[#6366F1] focus:ring-[#6366F1] bg-[#111827] cursor-pointer"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-white cursor-pointer select-none flex-1">
                  Active Status
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-[#1F2937] text-[#9CA3AF] rounded-xl text-sm font-bold hover:bg-[#1F2937] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#6366F1]/25 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
