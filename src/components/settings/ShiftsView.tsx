import React, { useState } from 'react';
import { Clock, Plus, Edit2, AlertCircle } from 'lucide-react';
import { Shift } from '../../types';
import { BottomSheet } from '../common/BottomSheet';

interface ShiftsViewProps {
  shifts: Shift[];
  onAddShift: (shift: Omit<Shift, 'id'>) => void;
  onUpdateShift: (shift: Shift) => void;
  onToggleShiftActive: (shiftId: string) => void;
}

export const ShiftsView: React.FC<ShiftsViewProps> = ({
  shifts,
  onAddShift,
  onUpdateShift,
  onToggleShiftActive,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('06:00 AM');
  const [endTime, setEndTime] = useState('12:00 PM');
  const [error, setError] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingShift(null);
    setName('');
    setStartTime('06:00 AM');
    setEndTime('12:00 PM');
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (shift: Shift) => {
    setEditingShift(shift);
    setName(shift.name);
    setStartTime(shift.startTime);
    setEndTime(shift.endTime);
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Shift name is required.');
      return;
    }
    if (!startTime.trim() || !endTime.trim()) {
      setError('Start time and End time are required.');
      return;
    }

    if (editingShift) {
      onUpdateShift({
        ...editingShift,
        name: name.trim(),
        startTime: startTime.trim(),
        endTime: endTime.trim(),
      });
    } else {
      onAddShift({
        name: name.trim(),
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        active: true,
      });
    }

    setModalOpen(false);
  };

  return (
    <div id="shifts-view" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Shift Timings
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Set timings for morning, evening, or full day batches
          </p>
        </div>

        <button
          id="add-shift-btn"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Shift</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {shifts.map((shift) => (
          <div
            key={shift.id}
            id={`shift-card-${shift.id}`}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
              shift.active
                ? 'bg-white dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/80 shadow-2xs hover:shadow-xs'
                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  shift.active
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {shift.name}
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      shift.active
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {shift.active ? 'Active' : 'Off'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  {shift.startTime} – {shift.endTime}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                id={`edit-shift-${shift.id}`}
                onClick={() => handleOpenEdit(shift)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Edit shift"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                id={`toggle-shift-${shift.id}`}
                onClick={() => onToggleShiftActive(shift.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                  shift.active
                    ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800'
                    : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800'
                }`}
              >
                {shift.active ? 'Turn Off' : 'Turn On'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Shift Sheet */}
      <BottomSheet
        id="shift-form-sheet"
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingShift ? 'Edit Shift' : 'Add Shift'}
        subtitle="Set shift start and end timings"
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
              Shift Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="shift-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning, Evening, Night"
              className="w-full py-2.5 px-3 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Start Time <span className="text-rose-500">*</span>
              </label>
              <input
                id="shift-start-time-input"
                type="text"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="06:00 AM"
                className="w-full py-2.5 px-3 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                End Time <span className="text-rose-500">*</span>
              </label>
              <input
                id="shift-end-time-input"
                type="text"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="12:00 PM"
                className="w-full py-2.5 px-3 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium font-mono"
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
              id="save-shift-btn"
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
            >
              Save Shift
            </button>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
};
