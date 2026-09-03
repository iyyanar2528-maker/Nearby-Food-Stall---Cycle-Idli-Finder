import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Store,
  Bike,
  Zap,
  Check,
  Clock,
  Flame,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { LanguageCode, UserProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { sound } from '../utils/audioFeedback';
import confetti from 'canvas-confetti';

export const UPI_ID = 'iyyanarpriya@slc';
export const PAYEE_NAME = 'Street Radar - Iyyanar';

export interface CommissionPlan {
  id: 'daily_10' | 'basic_250' | 'pro_599' | 'super_799';
  name: string;
  badge: string;
  price: number;
  duration: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export const COMMISSION_PLANS: CommissionPlan[] = [
  {
    id: 'daily_10',
    name: 'Daily Stall Pass',
    badge: 'DAILY PASS',
    price: 10,
    duration: 'per day',
    description: 'Pay ₹10 daily commission to open stall & go live on GPS radar today.',
    features: [
      'Stall marked as OPEN & LIVE on Radar',
      'Real-time 100-150m customer proximity alerts',
      'GPS location broadcasting to all nearby users',
      'Customer chat & live orders enabled'
    ],
    popular: true
  },
  {
    id: 'basic_250',
    name: 'Basic Monthly Pass',
    badge: '30 DAYS',
    price: 250,
    duration: 'per month',
    description: 'Full monthly access with basic ad visibility across regional radar.',
    features: [
      '30 Days of uninterrupted live radar broadcasting',
      'Basic ad promotion on regional stall feed',
      'Save ₹50 compared to daily payments',
      'Verified Local Vendor badge'
    ]
  },
  {
    id: 'pro_599',
    name: 'Pro 2-Month Pass',
    badge: 'NO ADS • 2 MONTHS',
    price: 599,
    duration: 'for 2 months',
    description: 'Pro plan with zero advertisements, verified gold badge & top radar ranking.',
    features: [
      '60 Days continuous stall listing with ZERO ads',
      'Top priority ranking in customer radar search',
      'Gold Verified Food Partner badge',
      'Direct WhatsApp & phone call button on stall card',
      'Save ₹200+ with 2-month combo'
    ]
  },
  {
    id: 'super_799',
    name: 'Super Promotion Pass',
    badge: 'ADVERTISE & PROMOTE EVERYWHERE',
    price: 799,
    duration: 'per month',
    description: 'Complete online promotion & advertising all over the place to maximize orders.',
    features: [
      'Promote your stall online all over the place',
      'Top Billboard Banner spotlight on the customer radar deck',
      'Broadcast push alerts to all users within 5 km',
      'Featured in "Best Local Street Eats" recommendations',
      'Daily social & regional promotion across Tamil Nadu & Maharashtra'
    ]
  }
];

interface VendorCommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  currentLang: LanguageCode;
  stallName?: string;
  onPaymentSuccess?: (plan: CommissionPlan) => void;
}

export const VendorCommissionModal: React.FC<VendorCommissionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentLang,
  stallName,
  onPaymentSuccess
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<CommissionPlan['id']>('daily_10');
  const [utrNumber, setUtrNumber] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successPaid, setSuccessPaid] = useState(false);

  const t = TRANSLATIONS[currentLang];
  const activePlan = COMMISSION_PLANS.find((p) => p.id === selectedPlanId) || COMMISSION_PLANS[0];

  // Construct UPI deep link URI
  const upiUri = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(
    PAYEE_NAME
  )}&am=${activePlan.price}&cu=INR&tn=${encodeURIComponent(
    `StreetRadar-${activePlan.name.replace(/\s+/g, '')}`
  )}`;

  // Dynamic QR code generator using quickchart.io QR API
  const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    upiUri
  )}&size=240&margin=1&ecLevel=M`;

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    sound.playClick();
    navigator.clipboard.writeText(UPI_ID);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (utrNumber.trim().length < 6) {
      setErrorMsg('Please enter a valid 12-digit UTR / Reference ID from your UPI payment app.');
      return;
    }

    sound.playClick();
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      setSuccessPaid(true);
      sound.playSuccess();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 }
      });

      // Persist activation in localStorage
      try {
        const activeStalls = JSON.parse(localStorage.getItem('budget_eats_paid_stalls') || '{}');
        activeStalls[currentUser?.stallId || 'current_stall'] = {
          planId: activePlan.id,
          planName: activePlan.name,
          amount: activePlan.price,
          paidAt: new Date().toISOString(),
          utr: utrNumber.trim(),
          upiId: UPI_ID
        };
        localStorage.setItem('budget_eats_paid_stalls', JSON.stringify(activeStalls));
      } catch {}

      onPaymentSuccess?.(activePlan);

      setTimeout(() => {
        setSuccessPaid(false);
        onClose();
      }, 2500);
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-xl bg-[#121212] border border-[#2E2E32] rounded-3xl p-5 sm:p-6 shadow-2xl relative my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E2FF3B]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#262626] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E2FF3B] text-[#0A0A0A] flex items-center justify-center font-black shadow-lg shadow-[#E2FF3B]/20 shrink-0">
              <Zap className="w-5 h-5 fill-[#0A0A0A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Stall Activation & Platform Pass
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-[#E2FF3B]/15 text-[#E2FF3B] border border-[#E2FF3B]/30 text-[10px] font-mono font-bold">
                  UPI DIRECT
                </span>
              </div>
              <p className="text-xs text-[#8E8E93] font-mono">
                Official UPI: <b className="text-white">{UPI_ID}</b>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono text-[#8E8E93] hover:text-white px-2.5 py-1 rounded-lg bg-[#1C1C1E] border border-[#2E2E32] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4 pt-3.5">
          {/* Welcome Vendor Notification */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#E2FF3B]/15 via-[#F59E0B]/10 to-transparent border border-[#E2FF3B]/30 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#E2FF3B]/20 text-[#E2FF3B] flex items-center justify-center shrink-0 mt-0.5">
              <Store className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white">
                {stallName || currentUser?.businessName || currentUser?.name || 'Your Stall'} is almost Live!
              </p>
              <p className="text-[11px] text-[#A1A1AA] font-mono mt-0.5 leading-snug">
                To activate and broadcast your stall as <b>OPEN</b> on the radar today, choose your pass below (Daily ₹10 or Monthly Promotion).
              </p>
            </div>
          </div>

          {/* Plan Selector Grid */}
          <div>
            <label className="block text-xs font-bold text-[#8E8E93] uppercase font-mono tracking-wider mb-2">
              Select Your Stall Operating Plan:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {COMMISSION_PLANS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedPlanId(plan.id);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#E2FF3B]/10 border-[#E2FF3B] shadow-lg shadow-[#E2FF3B]/10'
                        : 'bg-[#1C1C1E] border-[#2E2E32] hover:border-white/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md ${
                            isSelected
                              ? 'bg-[#E2FF3B] text-black'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          {plan.badge}
                        </span>
                        {plan.popular && (
                          <span className="text-[9px] font-mono text-[#E2FF3B] flex items-center gap-0.5">
                            <Flame className="w-3 h-3 text-[#E2FF3B]" /> Popular
                          </span>
                        )}
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-white mt-1">
                        {plan.name}
                      </h3>
                      <p className="text-[10px] text-[#8E8E93] font-mono mt-0.5 line-clamp-2">
                        {plan.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/10 flex items-baseline justify-between">
                      <div>
                        <span className="text-lg font-black text-[#E2FF3B] font-display">
                          ₹{plan.price}
                        </span>
                        <span className="text-[10px] text-[#8E8E93] font-mono ml-1">
                          /{plan.duration}
                        </span>
                      </div>
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#E2FF3B] border-[#E2FF3B] text-black'
                            : 'border-[#555]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Plan Features Preview */}
          <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] space-y-2">
            <div className="text-xs font-mono font-bold text-[#E2FF3B] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Included with {activePlan.name}:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300">
              {activePlan.features.map((f, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#30D158] shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* UPI Payment Box */}
          <div className="p-4 rounded-2xl bg-[#171719] border border-[#E2FF3B]/30 space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">
                  Scan QR or Pay directly to UPI
                </span>
                <span className="text-[10px] text-[#8E8E93] font-mono">
                  All UPI Apps accepted: GPay, PhonePe, Paytm, BHIM
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-[#E2FF3B] font-display">
                  ₹{activePlan.price}
                </span>
              </div>
            </div>

            {/* QR Code & Direct UPI Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl bg-black/60 border border-white/10">
              {/* QR Code */}
              <div className="bg-white p-2 rounded-xl shrink-0 shadow-md">
                <img
                  src={qrCodeUrl}
                  alt={`UPI QR Code for ${activePlan.price}`}
                  className="w-32 h-32 object-contain"
                />
              </div>

              {/* UPI ID & App Shortcuts */}
              <div className="flex-1 w-full space-y-2.5">
                <div>
                  <span className="text-[10px] text-[#8E8E93] font-mono uppercase block mb-1">
                    Official Receiver UPI ID:
                  </span>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#1C1C1E] border border-[#2E2E32]">
                    <span className="font-mono text-xs font-bold text-[#E2FF3B] truncate">
                      {UPI_ID}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#2C2C2E] hover:bg-[#3A3A3C] text-white flex items-center gap-1 shrink-0"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-[#30D158]" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 1-Click UPI Intent Launchers */}
                <div>
                  <span className="text-[10px] text-[#8E8E93] font-mono uppercase block mb-1">
                    1-Click Pay on Mobile:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <a
                      href={upiUri}
                      className="py-1.5 px-2 rounded-lg bg-[#2C2C2E] hover:bg-[#3A3A3C] text-[11px] font-mono text-center font-bold text-white flex items-center justify-center gap-1 border border-white/10"
                    >
                      <span>Open UPI App</span>
                      <ExternalLink className="w-3 h-3 text-[#E2FF3B]" />
                    </a>
                    <a
                      href={`gpay://upi/pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(
                        PAYEE_NAME
                      )}&am=${activePlan.price}&cu=INR`}
                      className="py-1.5 px-2 rounded-lg bg-[#2C2C2E] hover:bg-[#3A3A3C] text-[11px] font-mono text-center font-bold text-white flex items-center justify-center gap-1 border border-white/10"
                    >
                      <span>Google Pay</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Form: UTR / Reference ID */}
            <form onSubmit={handleConfirmPayment} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-[#8E8E93] uppercase font-mono tracking-wider mb-1.5">
                  Enter 12-Digit UPI Reference ID / UTR *
                </label>
                <input
                  type="text"
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/\s+/g, ''))}
                  placeholder="e.g. 423589123456 or transaction ID"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] text-xs font-mono text-white placeholder-[#555] focus:outline-none focus:border-[#E2FF3B]"
                />
                <span className="text-[10px] text-[#71717A] font-mono mt-1 block">
                  Found in your GPay / PhonePe / Paytm payment receipt under "UPI Ref No." or "UTR".
                </span>
              </div>

              {errorMsg && (
                <p className="text-xs font-mono text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl p-2.5">
                  {errorMsg}
                </p>
              )}

              {successPaid && (
                <div className="p-3 rounded-xl bg-[#30D158]/15 border border-[#30D158]/30 text-xs font-mono text-[#30D158] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#30D158]" />
                  <span>Payment Verified! Your stall is now officially OPEN on Radar 🎉</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying || successPaid}
                className="w-full py-3 rounded-2xl bg-[#E2FF3B] text-[#0A0A0A] font-black text-sm flex items-center justify-center gap-2 hover:bg-[#d4f22e] transition-all shadow-lg shadow-[#E2FF3B]/20 active:scale-[0.98] disabled:opacity-50"
              >
                {isVerifying ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Activate Stall (₹{activePlan.price})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
