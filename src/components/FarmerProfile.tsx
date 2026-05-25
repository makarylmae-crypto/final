import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function FarmerProfile() {
  const { state, updateUser } = useApp();
  const user = state.currentUser;
  const [form, setForm] = useState({
    name: user?.name || '',
    farmName: user?.farmName || '',
    farmDescription: user?.farmDescription || '',
    address: user?.address || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSaved(false);
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.farmName.trim()) { setError('Farm name is required'); return; }
    updateUser({
      name: form.name,
      farmName: form.farmName,
      farmDescription: form.farmDescription,
      address: form.address,
      phone: form.phone,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!user || user.role !== 'farmer') return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a1a] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-4">👨‍🌾</span>
          <h1 className="text-3xl font-bold text-[#e8eaf6]">Farm Profile Configuration</h1>
          <p className="text-[#6b708d] mt-2">Manage your farm information displayed to customers</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1a1a2e] rounded-2xl border border-[#2a2a4a] p-6 shadow-lg space-y-5">
          {error && <div className="bg-[#ff5252]/10 border border-[#ff5252]/30 text-[#ff5252] px-4 py-3 rounded-lg text-sm">{error}</div>}
          {saved && <div className="bg-[#00c853]/10 border border-[#00c853]/30 text-[#00e676] px-4 py-3 rounded-lg text-sm">✅ Profile updated successfully!</div>}

          {/* Farm Avatar */}
          <div className="flex items-center gap-4 pb-4 border-b border-[#2a2a4a]">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00c853]/20 to-[#00e676]/10 flex items-center justify-center text-4xl border border-[#00c853]/30">
              🏠
            </div>
            <div>
              <h3 className="font-semibold text-[#e8eaf6]">{form.farmName || 'Your Farm'}</h3>
              <p className="text-sm text-[#6b708d]">📍 {form.address || 'Hinunangan, Southern Leyte'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Your Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853] focus:ring-1 focus:ring-[#00c853]/30 placeholder:text-[#6b708d]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Farm Name *</label>
              <input type="text" value={form.farmName} onChange={(e) => setForm({ ...form, farmName: e.target.value })} className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853] focus:ring-1 focus:ring-[#00c853]/30 placeholder:text-[#6b708d]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Email</label>
              <input type="email" value={form.email} disabled className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#6b708d] cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Phone Number</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853] focus:ring-1 focus:ring-[#00c853]/30 placeholder:text-[#6b708d]" placeholder="+63 XXX XXX XXXX" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Farm Address</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853] focus:ring-1 focus:ring-[#00c853]/30 placeholder:text-[#6b708d]" placeholder="Hinunangan, Southern Leyte" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Farm Description / Bio</label>
              <textarea value={form.farmDescription} onChange={(e) => setForm({ ...form, farmDescription: e.target.value })} className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853] focus:ring-1 focus:ring-[#00c853]/30 placeholder:text-[#6b708d]" rows={3} placeholder="Tell customers about your farm, your farming practices, and what makes your produce special..." />
            </div>
          </div>

          <div className="border-t border-[#2a2a4a] pt-5 flex items-center justify-between">
            <p className="text-xs text-[#6b708d]">📋 Your profile is visible to residents browsing your products</p>
            <button type="submit" className="bg-[#00c853] hover:bg-[#00a844] text-[#0a0a1a] font-semibold px-8 py-2.5 rounded-xl transition-all shadow-lg shadow-[#00c853]/20">
              💾 Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
