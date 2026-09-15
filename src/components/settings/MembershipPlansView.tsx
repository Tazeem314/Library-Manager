import React, { useState } from 'react';
import { Layers, Plus, Edit2, CheckCircle2, ShieldOff, AlertCircle } from 'lucide-react';
import { MembershipPlan } from '../../types';
import { BottomSheet } from '../common/BottomSheet';

interface MembershipPlansViewProps {
  plans: MembershipPlan[];
  onAddPlan: (plan: Omit<MembershipPlan, 'id'>) => void;
  onUpdatePlan: (plan: MembershipPlan) => void;
  onTogglePlanActive: (planId: string) => void;
}

export const MembershipPlansView: React.FC<MembershipPlansViewProps> = ({
  plans,
  onAddPlan,
  onUpdatePlan,
  onTogglePlanActive,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);

  const [name, setName] = useState('');
  const [durationDays, setDurationDays] = useState(30);
  const [price, setPrice] = useState(1000);
  const [error, setError] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingPlan(null);
    setName('');
    setDurationDays(30);
    setPrice(1000);
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setDurationDays(plan.durationDays);
    setPrice(plan.price);
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Plan name is required.');
      return;
    }
    if (durationDays <= 0) {
      setError('Duration must be greater than 0 days.');
      return;
    }
    if (price < 0) {
      setError('Price cannot be negative.');
      return;
    }

    if (editingPlan) {
      onUpdatePlan({
        ...editingPlan,
        name: name.trim(),
        durationDays: Number(durationDays),
        price: Number(price),
      });
    } else {
      onAddPlan({
        name: name.trim(),
        durationDays: Number(durationDays),
        price: Number(price),
        active: true,
      });
    }

    setModalOpen(false);
  };

  return (
    <div id="membership-plans-view" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Fee Plans
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Set fees and number of days for study seats
          </p>
        </div>

        <button
          id="add-plan-btn"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Plan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            id={`plan-card-${plan.id}`}
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
              plan.active
                ? 'bg-white dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/80 shadow-2xs hover:shadow-xs'
                : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{plan.name}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    plan.active
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {plan.active ? 'Active' : 'Off'}
                </span>
              </div>

              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                ₹{plan.price.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Duration: {plan.durationDays} days{' '}
                {plan.durationDays >= 30 && `(~${Math.round(plan.durationDays / 30)} mo)`}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/60">
              <button
                id={`edit-plan-${plan.id}`}
                onClick={() => handleOpenEdit(plan)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button
                id={`toggle-plan-${plan.id}`}
                onClick={() => onTogglePlanActive(plan.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  plan.active
                    ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                    : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                }`}
              >
                {plan.active ? 'Turn Off' : 'Turn On'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Plan Sheet */}
      <BottomSheet
        id="plan-form-sheet"
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPlan ? 'Edit Fee Plan' : 'Add Fee Plan'}
        subtitle="Set seat price and validity days"
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Plan Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="plan-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Monthly or 3 Months"
              className="w-full py-2.5 px-3 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Duration (Days) <span className="text-rose-500">*</span>
              </label>
              <input
                id="plan-duration-input"
                type="number"
                min="1"
                required
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value) || 0)}
                className="w-full py-2.5 px-3 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                id="plan-price-input"
                type="number"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
                className="w-full py-2.5 px-3 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold text-emerald-800 dark:text-emerald-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              id="save-plan-btn"
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
            >
              Save Plan
            </button>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
};
