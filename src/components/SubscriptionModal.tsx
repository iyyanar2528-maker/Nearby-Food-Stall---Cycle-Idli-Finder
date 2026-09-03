import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  QrCode,
  PauseCircle,
  PlayCircle,
  IndianRupee,
  ShieldCheck,
  Bike,
  Store,
  User,
  Zap,
  Clock,
  ArrowRight,
  Receipt,
  Calendar,
  Layers
} from 'lucide-react';
import { SubscriptionPlan, UserSubscription, UserProfile, LanguageCode } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { sound } from '../utils/audioFeedback';
import { api } from '../lib/api';
import confetti from 'canvas-confetti';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  currentLang: LanguageCode;
  onOpenLogin: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentLang,
  onOpenLogin
}) => {
  const [activeTab, setActiveTab] = useState<'customer' | 'vendor' | 'my_passes'>('customer');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [mySubscriptions, setMySubscriptions] = useState<UserSubscription[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi_gpay' | 'upi_phonepe' | 'upi_paytm' | 'card' | 'cash'>('upi_gpay');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successModalSub, setSuccessModalSub] = useState<UserSubscription | null>(null);

  const t = TRANSLATIONS[currentLang];

  // Fetch plans and subscriptions on mount / user change
  useEffect(() => {
    if (isOpen) {
      api.subscriptions.getPlans().then((res) => {
        if (res.plans) setPlans(res.plans);
      }).catch(console.warn);

      if (currentUser?.id) {
        api.subscriptions.getMySubscriptions(currentUser.id).then((res) => {
          if (res.subscriptions) setMySubscriptions(res.subscriptions);
        }).catch(console.warn);
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const customerPlans = plans.filter((p) => p.targetRole === 'customer');
  const vendorPlans = plans.filter((p) => p.targetRole === 'vendor' || p.targetRole === 'shop');

  const handleSelectPlanToSubscribe = (plan: SubscriptionPlan) => {
    sound.playClick();
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    setSelectedPlan(plan);
  };

  const handleCompletePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !currentUser) return;

    sound.playClick();
    setIsProcessing(true);

    try {
      const res = await api.subscriptions.create({
        userId: currentUser.id,
        userName: currentUser.name,
        userPhone: currentUser.phone,
        planId: selectedPlan.id,
        paymentMethod,
        selectedSpotId: currentUser.stallId || 'spot-cycle-1',
        specialInstructions
      });

      const newSub = res.subscription;
      setMySubscriptions((prev) => [newSub, ...prev]);
      setSuccessModalSub(newSub);
      setSelectedPlan(null);
      setIsProcessing(false);

      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.5 }
      });
      sound.playSuccess();
      setActiveTab('my_passes');
    } catch (err) {
      console.warn('Subscription creation fallback:', err);
      setIsProcessing(false);
    }
  };

  const handleTogglePassStatus = async (subId: string, currentStatus: string) => {
    sound.playClick();
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await api.subscriptions.updateStatus(subId, newStatus);
      setMySubscriptions((prev) =>
        prev.map((s) => (s.id === subId ? { ...s, status: newStatus } : s))
      );
      sound.playSuccess();
    } catch (err) {
      console.warn('Toggle status fallback:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-[#121212] border border-[#262626] rounded-3xl p-6 shadow-2xl relative overflow-hidden my-6 max-h-[90vh] flex flex-col"
      >
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E2FF3B]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E2FF3B] text-[#0A0A0A] flex items-center justify-center font-black shadow-lg shadow-[#E2FF3B]/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F0F0F0] font-display">
                {t.subscriptionsTitle}
              </h3>
              <p className="text-xs text-[#8E8E93] font-mono">
                {t.subscriptionsSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-mono text-[#8E8E93] hover:text-white px-2.5 py-1 rounded-lg bg-[#1C1C1E] border border-[#2E2E32]"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigator */}
        <div className="flex items-center gap-2 py-3 border-b border-[#262626]">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('customer');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'customer'
                ? 'bg-[#E2FF3B] text-[#0A0A0A]'
                : 'bg-[#1C1C1E] text-[#8E8E93] hover:text-white border border-[#2E2E32]'
            }`}
          >
            <span>😋</span> {t.customerPassesTab}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('vendor');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'vendor'
                ? 'bg-[#E2FF3B] text-[#0A0A0A]'
                : 'bg-[#1C1C1E] text-[#8E8E93] hover:text-white border border-[#2E2E32]'
            }`}
          >
            <span>🚀</span> {t.vendorPlansTab}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('my_passes');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 relative ${
              activeTab === 'my_passes'
                ? 'bg-[#E2FF3B] text-[#0A0A0A]'
                : 'bg-[#1C1C1E] text-[#8E8E93] hover:text-white border border-[#2E2E32]'
            }`}
          >
            <span>🎫</span> {t.myActivePasses}
            {mySubscriptions.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#FF3B30] text-white text-[10px] font-bold flex items-center justify-center">
                {mySubscriptions.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="py-4 overflow-y-auto flex-1 space-y-4 pr-1">
          {/* 1. Customer Passes View */}
          {activeTab === 'customer' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-[#E2FF3B]/10 border border-[#E2FF3B]/30 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#E2FF3B] text-[#0A0A0A] flex items-center justify-center font-black">
                  🚲
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-[#F0F0F0]">
                    Cycle Idli Doorstep Proximity Pass
                  </div>
                  <div className="text-[10px] text-[#A0A0A0] font-mono">
                    When the cycle idli vendor arrives at your street (50-100m), your app rings audio chime and your breakfast is handed over instantly!
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {customerPlans.map((plan) => {
                  const title = currentLang === 'ta' ? plan.titleTa : currentLang === 'hi' ? plan.titleHi : plan.title;
                  const features = currentLang === 'ta' ? plan.featuresTa : currentLang === 'hi' ? plan.featuresHi : plan.features;
                  return (
                    <div
                      key={plan.id}
                      className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                        plan.popular
                          ? 'bg-[#1C1C1E] border-[#E2FF3B] shadow-lg shadow-[#E2FF3B]/5'
                          : 'bg-[#1C1C1E]/60 border-[#2E2E32]'
                      }`}
                    >
                      {plan.badge && (
                        <span className="absolute -top-2.5 right-4 text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-[#E2FF3B] text-[#0A0A0A]">
                          {plan.badge}
                        </span>
                      )}

                      <div>
                        <h4 className="text-sm font-bold text-[#F0F0F0] mb-1">
                          {title}
                        </h4>
                        <div className="flex items-baseline gap-1 my-2">
                          <span className="text-2xl font-black text-[#E2FF3B] font-display">
                            ₹{plan.price}
                          </span>
                          <span className="text-xs text-[#8E8E93] font-mono">
                            /{plan.period === 'weekly' ? '7 days' : plan.period === '15days' ? '15 days' : 'month'}
                          </span>
                        </div>
                        {plan.savingsText && (
                          <p className="text-[11px] text-[#A0A0A0] mb-3 font-mono">
                            ⚡ {plan.savingsText}
                          </p>
                        )}

                        <ul className="space-y-1.5 mb-4">
                          {features.map((f, i) => (
                            <li key={i} className="text-xs text-[#CCCCCC] flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#E2FF3B] shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() => handleSelectPlanToSubscribe(plan)}
                        className="w-full py-2.5 rounded-xl bg-[#E2FF3B] text-[#0A0A0A] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#d4f22e] transition-all shadow-md active:scale-95"
                      >
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>{t.subscribeNowBtn}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Vendor SaaS Plans View */}
          {activeTab === 'vendor' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-[#E2FF3B]/10 border border-[#E2FF3B]/30 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#E2FF3B] text-[#0A0A0A] flex items-center justify-center font-black">
                  📢
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-[#F0F0F0]">
                    Supercharge Your Food Cart / Stall with Pro Radar
                  </div>
                  <div className="text-[10px] text-[#A0A0A0] font-mono">
                    Broadcast your live GPS coords, ring customer proximity alerts within 150m, manage subscriber breakfast packets & zero-commission orders.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {vendorPlans.map((plan) => {
                  const title = currentLang === 'ta' ? plan.titleTa : currentLang === 'hi' ? plan.titleHi : plan.title;
                  const features = currentLang === 'ta' ? plan.featuresTa : currentLang === 'hi' ? plan.featuresHi : plan.features;
                  return (
                    <div
                      key={plan.id}
                      className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                        plan.popular
                          ? 'bg-[#1C1C1E] border-[#E2FF3B]'
                          : 'bg-[#1C1C1E]/60 border-[#2E2E32]'
                      }`}
                    >
                      {plan.badge && (
                        <span className="absolute -top-2.5 right-4 text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-[#E2FF3B] text-[#0A0A0A]">
                          {plan.badge}
                        </span>
                      )}

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">
                            {plan.targetRole === 'vendor' ? '🚲' : '🏪'}
                          </span>
                          <h4 className="text-sm font-bold text-[#F0F0F0]">
                            {title}
                          </h4>
                        </div>

                        <div className="flex items-baseline gap-1 my-2">
                          <span className="text-2xl font-black text-[#E2FF3B] font-display">
                            ₹{plan.price}
                          </span>
                          <span className="text-xs text-[#8E8E93] font-mono">/month</span>
                        </div>

                        <ul className="space-y-1.5 mb-4">
                          {features.map((f, i) => (
                            <li key={i} className="text-xs text-[#CCCCCC] flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#E2FF3B] shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() => handleSelectPlanToSubscribe(plan)}
                        className="w-full py-2.5 rounded-xl bg-[#E2FF3B] text-[#0A0A0A] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#d4f22e] transition-all shadow-md active:scale-95"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Activate Vendor License</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. My Active Passes Tab */}
          {activeTab === 'my_passes' && (
            <div className="space-y-4">
              {mySubscriptions.length === 0 ? (
                <div className="py-12 text-center bg-[#1C1C1E] border border-[#2E2E32] rounded-2xl p-6">
                  <span className="text-3xl mb-2 block">🎫</span>
                  <h4 className="text-sm font-bold text-[#F0F0F0] mb-1">
                    No Active Meal Passes Found
                  </h4>
                  <p className="text-xs text-[#8E8E93] font-mono mb-4 max-w-sm mx-auto">
                    Subscribe to a Daily Morning Cycle Idli Pass or Breakfast Club to enjoy automated doorstep alerts and discounts.
                  </p>
                  <button
                    onClick={() => setActiveTab('customer')}
                    className="px-4 py-2 rounded-xl bg-[#E2FF3B] text-[#0A0A0A] font-bold text-xs"
                  >
                    Browse Daily Passes
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {mySubscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base">
                              {sub.targetRole === 'customer' ? '😋' : '🚀'}
                            </span>
                            <h4 className="text-sm font-bold text-[#F0F0F0]">
                              {sub.planTitle}
                            </h4>
                            <span
                              className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                                sub.status === 'active'
                                  ? 'bg-[#E2FF3B]/20 text-[#E2FF3B] border border-[#E2FF3B]/30'
                                  : 'bg-[#FF9500]/20 text-[#FF9500] border border-[#FF9500]/30'
                              }`}
                            >
                              {sub.status === 'active' ? '● ACTIVE' : '❚❚ PAUSED'}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#8E8E93] font-mono mt-0.5">
                            Pass ID: {sub.qrPassCode} • ₹{sub.amount} paid via {sub.paymentMethod.toUpperCase()}
                          </div>
                        </div>

                        <button
                          onClick={() => handleTogglePassStatus(sub.id, sub.status)}
                          className={`text-xs font-mono px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                            sub.status === 'active'
                              ? 'bg-[#2C2C2E] border-[#3A3A3C] text-[#FF9500] hover:bg-[#3A3A3C]'
                              : 'bg-[#E2FF3B]/10 border-[#E2FF3B] text-[#E2FF3B] hover:bg-[#E2FF3B]/20'
                          }`}
                        >
                          {sub.status === 'active' ? (
                            <>
                              <PauseCircle className="w-3.5 h-3.5" />
                              <span>{t.pausePassBtn}</span>
                            </>
                          ) : (
                            <>
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span>{t.resumePassBtn}</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* QR Pass Box */}
                      <div className="p-3 rounded-xl bg-[#121212] border border-[#2E2E32] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center">
                            <QrCode className="w-8 h-8 text-black" />
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-[#F0F0F0]">
                              Show QR Pass to Cycle Vendor / Stall
                            </div>
                            <div className="text-[10px] text-[#8E8E93] font-mono">
                              {sub.deliveriesRemaining ? `${sub.deliveriesRemaining} deliveries remaining` : 'Unlimited 30-Day Pass'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[9px] font-mono text-[#8E8E93] uppercase block">
                            Valid Until
                          </span>
                          <span className="text-xs font-mono font-bold text-[#E2FF3B]">
                            {new Date(sub.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Interactive Payment Checkout Modal Layer */}
        <AnimatePresence>
          {selectedPlan && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="absolute inset-x-0 bottom-0 bg-[#18181A] border-t border-[#3A3A3C] p-5 rounded-t-3xl shadow-2xl z-20"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#2E2E32]">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#E2FF3B]" />
                  <span className="text-sm font-bold text-[#F0F0F0]">
                    {t.checkoutTitle}: {selectedPlan.title}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="text-xs font-mono text-[#8E8E93] hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleCompletePayment} className="pt-3 space-y-3">
                <div className="flex items-center justify-between bg-[#121212] p-3 rounded-xl border border-[#2E2E32]">
                  <div>
                    <span className="text-[10px] font-mono text-[#8E8E93] uppercase block">
                      Amount Due
                    </span>
                    <span className="text-xl font-black text-[#E2FF3B] font-display">
                      ₹{selectedPlan.price}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#8E8E93] uppercase block">
                      Subscriber
                    </span>
                    <span className="text-xs font-mono font-bold text-[#F0F0F0]">
                      {currentUser?.name} (+91 {currentUser?.phone})
                    </span>
                  </div>
                </div>

                {/* Payment Option Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-[#8E8E93] uppercase font-mono mb-1.5">
                    Select Instant Payment Mode:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi_gpay')}
                      className={`p-2 rounded-xl border text-left text-xs font-mono flex items-center gap-2 transition-all ${
                        paymentMethod === 'upi_gpay'
                          ? 'bg-[#E2FF3B]/10 border-[#E2FF3B] text-[#E2FF3B] font-bold'
                          : 'bg-[#121212] border-[#2E2E32] text-[#8E8E93]'
                      }`}
                    >
                      <span>⚡</span> Google Pay / PhonePe UPI
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2 rounded-xl border text-left text-xs font-mono flex items-center gap-2 transition-all ${
                        paymentMethod === 'card'
                          ? 'bg-[#E2FF3B]/10 border-[#E2FF3B] text-[#E2FF3B] font-bold'
                          : 'bg-[#121212] border-[#2E2E32] text-[#8E8E93]'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Debit / RuPay / Visa
                    </button>
                  </div>
                </div>

                {/* Optional Instructions */}
                <div>
                  <input
                    type="text"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Delivery notes: e.g. Ring bell at 7:30 AM / Gate 2"
                    className="w-full px-3 py-2 rounded-xl bg-[#121212] border border-[#2E2E32] text-xs text-[#F0F0F0] placeholder-[#5C5C60] focus:outline-none focus:border-[#E2FF3B]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-[#E2FF3B] text-[#0A0A0A] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#d4f22e] transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Pay ₹{selectedPlan.price} & Activate Pass</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
