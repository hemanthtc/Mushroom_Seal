import React, { useEffect, useState } from 'react';
import type { DeliveryAgent } from '../../types';
import { getRiders, createRider, deleteRider } from '../../services/api';
import { Bike, Plus, Trash2, Copy, Star, ShieldCheck, Phone, Loader2 } from 'lucide-react';

interface RiderManagerProps {
  addToast: (type: 'success' | 'error' | 'info' | 'warning', text: string) => void;
}

export const RiderManager: React.FC<RiderManagerProps> = ({ addToast }) => {
  const [riders, setRiders] = useState<DeliveryAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<{ agentId: string; password: string } | null>(null);

  const [form, setForm] = useState({ name: '', phone: '', vehicle: 'Delivery Bike', vehicleNumber: '', zone: 'Bengaluru', password: '' });

  const load = async () => {
    setLoading(true);
    try {
      setRiders(await getRiders());
    } catch (e: any) {
      addToast('warning', e.message || 'Could not load riders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.password) {
      addToast('warning', 'Rider name and a password are required.');
      return;
    }
    setSaving(true);
    try {
      const rider = await createRider(form);
      setCreated({ agentId: rider.agentId, password: form.password });
      setForm({ name: '', phone: '', vehicle: 'Delivery Bike', vehicleNumber: '', zone: 'Bengaluru', password: '' });
      setShowForm(false);
      await load();
      addToast('success', `Rider ${rider.agentId} created!`);
    } catch (e: any) {
      addToast('warning', e.message || 'Could not create rider.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      await deleteRider(id);
      await load();
      addToast('info', 'Rider removed.');
    } catch (e: any) {
      addToast('warning', e.message || 'Could not remove rider.');
    }
  };

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).then(() => addToast('info', 'Copied to clipboard.')).catch(() => {});
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Bike className="w-6 h-6 text-amber-400" /> Delivery Riders
          </h2>
          <p className="text-xs text-emerald-300 mt-0.5">Create and manage the delivery partners who fulfil your orders.</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setCreated(null); }}
          className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold px-4 py-2 rounded-xl text-xs shadow-md flex items-center gap-1.5"
          data-testid="add-rider-btn"
        >
          <Plus className="w-4 h-4" /> Add Rider
        </button>
      </div>

      {created && (
        <div className="bg-emerald-900/60 border border-amber-500/50 rounded-2xl p-4 space-y-2" data-testid="rider-credentials">
          <p className="text-amber-300 font-bold text-sm flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Rider credentials — share securely (shown once)</p>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 flex items-center gap-2">
              <span className="text-emerald-300">Rider ID:</span>
              <strong className="text-white font-mono">{created.agentId}</strong>
              <button onClick={() => copy(created.agentId)} className="text-amber-400 hover:text-amber-300"><Copy className="w-3.5 h-3.5" /></button>
            </div>
            <div className="bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 flex items-center gap-2">
              <span className="text-emerald-300">Password:</span>
              <strong className="text-white font-mono">{created.password}</strong>
              <button onClick={() => copy(created.password)} className="text-amber-400 hover:text-amber-300"><Copy className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-emerald-950/60 border border-emerald-800 rounded-3xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-emerald-300 font-bold mb-1">Rider Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white" data-testid="rider-name-input" />
          </div>
          <div>
            <label className="block text-emerald-300 font-bold mb-1">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-emerald-300 font-bold mb-1">Vehicle</label>
            <input value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-emerald-300 font-bold mb-1">Vehicle Number</label>
            <input value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-emerald-300 font-bold mb-1">Zone</label>
            <input value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-emerald-300 font-bold mb-1">Login Password *</label>
            <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white" data-testid="rider-password-input" />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 font-bold text-emerald-300 hover:text-white">Cancel</button>
            <button type="submit" disabled={saving} className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black px-5 py-2 rounded-xl flex items-center gap-1.5" data-testid="save-rider-btn">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Rider
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-16 text-emerald-400"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : riders.length === 0 ? (
        <div className="text-center py-16 bg-emerald-950/20 rounded-3xl border border-emerald-800/40 p-8">
          <Bike className="w-12 h-12 text-emerald-700 mx-auto mb-3" />
          <p className="text-emerald-300 text-sm">No riders yet. Add your first delivery partner to fulfil orders.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {riders.map((r) => (
            <div key={r.id} className="bg-emerald-950/60 border border-emerald-800 rounded-3xl p-4 space-y-2 shadow-lg" data-testid={`rider-card-${r.agentId}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-emerald-950 flex items-center justify-center"><Bike className="w-5 h-5" /></div>
                  <div>
                    <p className="text-white font-bold text-sm">{r.name}</p>
                    <p className="font-mono text-[11px] text-amber-300">{r.agentId}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-950/60" title="Remove rider">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="text-[11px] text-emerald-300 space-y-0.5">
                <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-amber-400" /> {r.phone || '—'}</p>
                <p>{r.vehicle} • {r.vehicleNumber || '—'}</p>
                <p className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" /> {r.rating} • {r.zone}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
