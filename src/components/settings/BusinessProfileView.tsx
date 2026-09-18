import React, { useState } from 'react';
import { Building2, User, Phone, Mail, MapPin, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import { Business } from '../../types';

interface BusinessProfileViewProps {
  business: Business;
  onUpdateBusiness: (business: Business) => void;
}

export const BusinessProfileView: React.FC<BusinessProfileViewProps> = ({
  business,
  onUpdateBusiness,
}) => {
  const [formData, setFormData] = useState<Business>({
    ...business,
    ownerEmail: business.ownerEmail || business.email || 'tazeemsiddiqui0786@gmail.com',
    requireAdminAuth: business.requireAdminAuth !== false,
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBusiness(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div id="business-profile-view" className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
          Library Details & Admin Access Security
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Study hall information, contact details, and single-owner login email authorization
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 max-w-2xl"
      >
        {saved && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Library details and owner access rules saved successfully!</span>
          </div>
        )}

        {/* Owner Security Restriction Box */}
        <div className="p-4 rounded-2xl bg-neutral-100/90 dark:bg-neutral-850/80 border border-neutral-200 dark:border-neutral-700 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-neutral-900 dark:text-white shrink-0" />
            <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Single-Owner Login Protection
            </span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Only the registered owner Gmail below can unlock and manage this library dashboard. Any other Gmail account will be rejected automatically.
          </p>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Authorized Owner Gmail <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="biz-owner-email-whitelist-input"
                type="email"
                required
                value={formData.ownerEmail || ''}
                onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                placeholder="e.g. yourname@gmail.com"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white font-mono font-medium"
              />
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              Only this email can access the dashboard. All other Gmails will be blocked.
            </span>
          </div>
        </div>

        {/* Study Hall Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Library / Study Hall Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="biz-name-input"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white font-semibold"
            />
          </div>
        </div>

        {/* Owner Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Owner Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="biz-owner-input"
                type="text"
                required
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="biz-phone-input"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Email & City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="biz-email-input"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              City & State <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="biz-city-input"
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Full Street Address
          </label>
          <textarea
            id="biz-address-input"
            rows={2}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full py-2 px-3 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white resize-none"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            id="save-biz-profile-btn"
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
