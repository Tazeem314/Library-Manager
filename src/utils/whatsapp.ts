/**
 * WhatsApp Reminder & Messaging Utilities for StudySpace
 */

export interface ReminderContext {
  studentName: string;
  studentPhone: string;
  businessName: string;
  ownerName: string;
  businessPhone?: string;
  seatNumber?: string;
  shiftName?: string;
  planName?: string;
  endDate?: string;
  daysLeft?: number;
  outstandingDue?: number;
}

export type ReminderType = 'expiry' | 'due' | 'both' | 'custom';

/**
 * Formats a raw phone number into WhatsApp international format.
 * Defaults to country code +91 for 10-digit Indian numbers.
 */
export function formatWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

/**
 * Builds the direct WhatsApp link.
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const formattedPhone = formatWhatsAppPhone(phone);
  return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
}

/**
 * Formats date string (YYYY-MM-DD) into readable Indian format (e.g. 12 Sep 2026).
 */
export function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  }
  return dateStr;
}

/**
 * Computes difference in calendar days from today (00:00:00) to target date (00:00:00).
 */
export function getDaysLeft(endDateStr?: string): number {
  if (!endDateStr) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parts = endDateStr.split('-');
  if (parts.length === 3) {
    const target = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  }

  const target = new Date(endDateStr);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Generates an Expiry Reminder message.
 */
export function generateExpiryReminderMessage(ctx: ReminderContext): string {
  const days = ctx.daysLeft ?? (ctx.endDate ? getDaysLeft(ctx.endDate) : 0);
  const formattedDate = formatDisplayDate(ctx.endDate);
  
  let timePhrase = '';
  if (days === 0) {
    timePhrase = 'expires TODAY';
  } else if (days === 1) {
    timePhrase = 'expires TOMORROW';
  } else if (days < 0) {
    timePhrase = `expired on ${formattedDate}`;
  } else {
    timePhrase = `is expiring in ${days} days (${formattedDate})`;
  }

  const seatInfo = ctx.seatNumber ? ` for Seat ${ctx.seatNumber}` : '';
  const shiftInfo = ctx.shiftName ? ` (${ctx.shiftName})` : '';
  const planInfo = ctx.planName ? ` [${ctx.planName}]` : '';

  return (
    `Hello ${ctx.studentName},\n\n` +
    `This is a gentle reminder from *${ctx.businessName}*.\n\n` +
    `Your study hall membership${seatInfo}${shiftInfo}${planInfo} ${timePhrase}.\n\n` +
    `To retain your reserved seat and continue your uninterrupted study routine, kindly renew your membership before the due date.\n\n` +
    `You can renew directly at the library desk or via UPI.\n\n` +
    `Warm regards,\n` +
    `${ctx.ownerName || 'Management'}\n` +
    `${ctx.businessName}${ctx.businessPhone ? ` | ${ctx.businessPhone}` : ''}`
  );
}

/**
 * Generates a Pending Due Fee Reminder message.
 */
export function generateDueReminderMessage(ctx: ReminderContext): string {
  const due = ctx.outstandingDue || 0;
  const seatInfo = ctx.seatNumber ? ` for Seat ${ctx.seatNumber}` : '';
  const shiftInfo = ctx.shiftName ? ` (${ctx.shiftName})` : '';

  return (
    `Hello ${ctx.studentName},\n\n` +
    `This is a friendly reminder from *${ctx.businessName}*.\n\n` +
    `You have a pending fee balance of *₹${due.toLocaleString('en-IN')}*${seatInfo}${shiftInfo}.\n\n` +
    `Kindly clear the outstanding amount at your earliest convenience at the library counter or via UPI.\n\n` +
    `If you have already made the payment, please share the transaction reference with us.\n\n` +
    `Thank you for your cooperation!\n\n` +
    `Warm regards,\n` +
    `${ctx.ownerName || 'Management'}\n` +
    `${ctx.businessName}${ctx.businessPhone ? ` | ${ctx.businessPhone}` : ''}`
  );
}

/**
 * Generates a Combined Expiry + Due Reminder message.
 */
export function generateCombinedReminderMessage(ctx: ReminderContext): string {
  const days = ctx.daysLeft ?? (ctx.endDate ? getDaysLeft(ctx.endDate) : 0);
  const formattedDate = formatDisplayDate(ctx.endDate);
  const due = ctx.outstandingDue || 0;

  let timePhrase = '';
  if (days === 0) {
    timePhrase = 'expires TODAY';
  } else if (days === 1) {
    timePhrase = 'expires TOMORROW';
  } else if (days < 0) {
    timePhrase = `expired on ${formattedDate}`;
  } else {
    timePhrase = `is expiring in ${days} days (${formattedDate})`;
  }

  const seatInfo = ctx.seatNumber ? ` for Seat ${ctx.seatNumber}` : '';
  const shiftInfo = ctx.shiftName ? ` (${ctx.shiftName})` : '';

  return (
    `Hello ${ctx.studentName},\n\n` +
    `This is an important update regarding your membership at *${ctx.businessName}*.\n\n` +
    `1. *Membership Expiry*: Your plan${seatInfo}${shiftInfo} ${timePhrase}.\n` +
    (due > 0 ? `2. *Pending Balance*: You have an outstanding fee of *₹${due.toLocaleString('en-IN')}*.\n\n` : '\n') +
    `Please clear your pending balance and confirm your renewal to retain your seat without disruption.\n\n` +
    `Feel free to reach out to us for any assistance.\n\n` +
    `Warm regards,\n` +
    `${ctx.ownerName || 'Management'}\n` +
    `${ctx.businessName}${ctx.businessPhone ? ` | ${ctx.businessPhone}` : ''}`
  );
}

/**
 * Dispatches WhatsApp message by opening window.
 */
export function openWhatsApp(phone: string, message: string): void {
  const url = buildWhatsAppUrl(phone, message);
  window.open(url, '_blank', 'noopener,noreferrer');
}
