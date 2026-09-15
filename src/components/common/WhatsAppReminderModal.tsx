import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Phone,
  Copy,
  Check,
  Send,
  Calendar,
  AlertCircle,
  Armchair,
  Clock,
  RotateCcw,
  ExternalLink,
  IndianRupee,
} from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import {
  ReminderContext,
  ReminderType,
  generateExpiryReminderMessage,
  generateDueReminderMessage,
  generateCombinedReminderMessage,
  buildWhatsAppUrl,
  formatDisplayDate,
  getDaysLeft,
} from '../../utils/whatsapp';

interface WhatsAppReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: ReminderContext | null;
  initialType?: ReminderType;
  onSuccessToast?: (msg: string) => void;
}

export const WhatsAppReminderModal: React.FC<WhatsAppReminderModalProps> = ({
  isOpen,
  onClose,
  context,
  initialType = 'expiry',
  onSuccessToast,
}) => {
  if (!context) return null;

  const hasDue = (context.outstandingDue || 0) > 0;
  const daysLeft = context.daysLeft ?? (context.endDate ? getDaysLeft(context.endDate) : 0);

  const [activeType, setActiveType] = useState<ReminderType>(initialType);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialType) {
      setActiveType(initialType);
    }
  }, [initialType]);

  // Sync template text when activeType or context changes
  useEffect(() => {
    if (!context) return;
    let template = '';
    if (activeType === 'expiry') {
      template = generateExpiryReminderMessage(context);
    } else if (activeType === 'due') {
      template = generateDueReminderMessage(context);
    } else if (activeType === 'both') {
      template = generateCombinedReminderMessage(context);
    }
    setCustomMessage(template);
    setCopied(false);
  }, [activeType, context]);

  const handleResetTemplate = () => {
    if (!context) return;
    let template = '';
    if (activeType === 'expiry') {
      template = generateExpiryReminderMessage(context);
    } else if (activeType === 'due') {
      template = generateDueReminderMessage(context);
    } else if (activeType === 'both') {
      template = generateCombinedReminderMessage(context);
    }
    setCustomMessage(template);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(customMessage);
      setCopied(true);
      if (onSuccessToast) {
        onSuccessToast('Reminder message copied to clipboard');
      }
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleSendWhatsApp = () => {
    if (!context.studentPhone) return;
    const url = buildWhatsAppUrl(context.studentPhone, customMessage);
    window.open(url, '_blank', 'noopener,noreferrer');
    if (onSuccessToast) {
      onSuccessToast(`Opening WhatsApp for ${context.studentName}...`);
    }
    onClose();
  };

  // Status Badge for expiry
  const renderExpiryBadge = () => {
    if (context.endDate === undefined) return null;
    if (daysLeft === 0) {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse">
          Expires Today
        </span>
      );
    }
    if (daysLeft === 1) {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          Expires Tomorrow
        </span>
      );
    }
    if (daysLeft < 0) {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200">
          Expired ({Math.abs(daysLeft)}d ago)
        </span>
      );
    }
    if (daysLeft <= 3) {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          {daysLeft} days left
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
        {daysLeft} days left
      </span>
    );
  };

  return (
    <BottomSheet
      id="whatsapp-reminder-sheet"
      isOpen={isOpen}
      onClose={onClose}
      title="Send WhatsApp Reminder"
      subtitle={`Connect directly with ${context.studentName}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Recipient Profile Summary Card */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 dark:bg-emerald-700 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              <MessageCircle className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {context.studentName}
                </h4>
                {renderExpiryBadge()}
                {hasDue && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800">
                    ₹{context.outstandingDue?.toLocaleString('en-IN')} Due
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                <span className="font-mono">{context.studentPhone}</span>
                {context.seatNumber && (
                  <>
                    <span>•</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Seat {context.seatNumber}
                    </span>
                  </>
                )}
                {context.shiftName && (
                  <>
                    <span>•</span>
                    <span>{context.shiftName}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <a
            href={`tel:${context.studentPhone}`}
            className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Call student directly via mobile"
          >
            <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Call</span>
          </a>
        </div>

        {/* Template Selector Pills */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Select Reminder Template
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              id="whatsapp-template-expiry"
              onClick={() => setActiveType('expiry')}
              className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                activeType === 'expiry'
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 font-bold ring-1 ring-blue-400/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-blue-600 dark:text-blue-400">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[11px] uppercase font-bold">Expiry</span>
              </div>
              <div className="font-semibold text-xs truncate">
                Upcoming Expiry
              </div>
            </button>

            <button
              type="button"
              id="whatsapp-template-due"
              onClick={() => setActiveType('due')}
              className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                activeType === 'due'
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-200 font-bold ring-1 ring-amber-400/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-amber-600 dark:text-amber-400">
                <IndianRupee className="w-3.5 h-3.5" />
                <span className="text-[11px] uppercase font-bold">Due Fee</span>
              </div>
              <div className="font-semibold text-xs truncate">
                Pending Balance
              </div>
            </button>

            <button
              type="button"
              id="whatsapp-template-both"
              onClick={() => setActiveType('both')}
              className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                activeType === 'both'
                  ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-900 dark:text-purple-200 font-bold ring-1 ring-purple-400/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-purple-600 dark:text-purple-400">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="text-[11px] uppercase font-bold">Both</span>
              </div>
              <div className="font-semibold text-xs truncate">
                Expiry + Dues
              </div>
            </button>

            <button
              type="button"
              id="whatsapp-template-custom"
              onClick={() => setActiveType('custom')}
              className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                activeType === 'custom'
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-400 text-slate-900 dark:text-white font-bold ring-1 ring-slate-400/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-slate-600 dark:text-slate-400">
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="text-[11px] uppercase font-bold">Edit</span>
              </div>
              <div className="font-semibold text-xs truncate">
                Custom Text
              </div>
            </button>
          </div>
        </div>

        {/* Message Editor / Preview Card */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="whatsapp-message-input"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
            >
              <span>Message Preview & Editor</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                (You can customize before sending)
              </span>
            </label>
            <button
              type="button"
              onClick={handleResetTemplate}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Template</span>
            </button>
          </div>

          <div className="relative rounded-xl border border-slate-200/90 dark:border-slate-800 bg-emerald-50/20 dark:bg-slate-900/60 p-3 shadow-inner">
            <textarea
              id="whatsapp-message-input"
              rows={8}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none resize-none font-sans leading-relaxed"
              placeholder="Type your WhatsApp reminder message..."
            />

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              <span>{customMessage.length} characters • {customMessage.trim() ? customMessage.trim().split(/\s+/).length : 0} words</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">WhatsApp Web / App Ready</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-300">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Copy Message</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              id="send-whatsapp-btn"
              onClick={handleSendWhatsApp}
              className="flex-1 sm:flex-none py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-white/30" />
              <span>Send via WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};
