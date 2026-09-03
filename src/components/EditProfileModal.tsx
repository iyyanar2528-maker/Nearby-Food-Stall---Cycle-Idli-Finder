import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  User,
  Mail,
  Store,
  Languages,
  MapPin,
  CheckCircle2,
  Sparkles,
  Save,
  X,
  ShieldCheck,
  Award
} from 'lucide-react';
import { LanguageCode, StateRegion, UserProfile, UserRole } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { sound } from '../utils/audioFeedback';
import { firebaseSync } from '../lib/firebaseSync';
import confetti from 'canvas-confetti';

const AVATAR_OPTIONS = [
  { emoji: '😋', label: 'Foodie' },
  { emoji: '🧑‍🍳', label: 'Chef' },
  { emoji: '🚲', label: 'Rider' },
  { emoji: '🍲', label: 'Idli Lover' },
  { emoji: '🌶️', label: 'Spice Hunter' },
  { emoji: '☕', label: 'Chai Lover' }
];

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUpdateProfile: (updated: UserProfile) => void;
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateProfile,
  currentLang,
  onLanguageChange
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('😋');
  const [stateRegion, setStateRegion] = useState<StateRegion>('all');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const t = TRANSLATIONS[currentLang];

  useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setAvatar(currentUser.avatar || '😋');
      setStateRegion(currentUser.stateRegion || 'all');
      setBusinessName(currentUser.businessName || '');
      setBusinessAddress(currentUser.businessAddress || '');
      setFssaiNumber(currentUser.fssaiNumber || '');
      setIsSaved(false);
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    sound.playClick();

    const updatedUser: UserProfile = {
      ...currentUser,
      name: name.trim(),
      email: email.trim(),
      avatar,
      stateRegion,
      language: currentLang,
      businessName: businessName.trim() || undefined,
      businessAddress: businessAddress.trim() || undefined,
      fssaiNumber: fssaiNumber.trim() || undefined
    };

    localStorage.setItem('budget_eats_user', JSON.stringify(updatedUser));
    firebaseSync.syncUserProfile(updatedUser);
    onUpdateProfile(updatedUser);

    setIsSaved(true);
    sound.playSuccess();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-[#141414] border border-[#2E2E32] rounded-3xl p-5 sm:p-6 shadow-2xl relative my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#262626] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E2FF3B]/15 border border-[#E2FF3B]/30 flex items-center justify-center text-xl">
              {avatar}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Edit Profile Details</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-[#E2FF3B]">
                  {currentUser.role.replace(/_/g, ' ')}
                </span>
              </h2>
              <p className="text-xs text-[#8E8E93] font-mono">
                Update your name, foodie avatar & settings
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono text-[#8E8E93] hover:text-white px-2.5 py-1 rounded-lg bg-[#1C1C1E] border border-[#2E2E32]"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSave} className="overflow-y-auto pr-1 flex-1 space-y-4 pt-3.5">
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-bold text-[#8E8E93] uppercase font-mono tracking-wider mb-2">
              Choose Foodie Avatar:
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map((item) => (
                <button
                  key={item.emoji}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setAvatar(item.emoji);
                  }}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                    avatar === item.emoji
                      ? 'bg-[#E2FF3B]/15 border-[#E2FF3B] scale-105'
                      : 'bg-[#1C1C1E] border-[#2E2E32] hover:border-white/30'
                  }`}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-[9px] font-mono text-slate-300 truncate w-full">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-[#8E8E93] uppercase font-mono tracking-wider mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] text-sm text-white focus:outline-none focus:border-[#E2FF3B]"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-[#8E8E93] uppercase font-mono tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] text-sm font-mono text-white focus:outline-none focus:border-[#E2FF3B]"
              />
            </div>
          </div>

          {/* Preferred Language */}
          <div>
            <label className="block text-xs font-bold text-[#8E8E93] uppercase font-mono tracking-wider mb-1.5">
              App Language
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['en', 'ta', 'hi'] as LanguageCode[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onLanguageChange(l);
                  }}
                  className={`py-2 rounded-xl border text-xs font-mono transition-all ${
                    currentLang === l
                      ? 'bg-[#E2FF3B] text-black font-bold border-[#E2FF3B]'
                      : 'bg-[#1C1C1E] text-[#8E8E93] border-[#2E2E32]'
                  }`}
                >
                  {l === 'en' ? 'English' : l === 'ta' ? 'தமிழ்' : 'हिंदी'}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Region Filter */}
          <div>
            <label className="block text-xs font-bold text-[#8E8E93] uppercase font-mono tracking-wider mb-1.5">
              Region / State Filter
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'All Regions' },
                { id: 'maharashtra', label: 'MH (Mumbai)' },
                { id: 'tamil_nadu', label: 'TN (Chennai)' }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setStateRegion(r.id as StateRegion);
                  }}
                  className={`py-2 rounded-xl border text-xs font-mono transition-all ${
                    stateRegion === r.id
                      ? 'bg-[#E2FF3B]/15 border-[#E2FF3B] text-[#E2FF3B] font-bold'
                      : 'bg-[#1C1C1E] text-[#8E8E93] border-[#2E2E32]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Vendor Specific Business Info */}
          {(currentUser.role === 'shop_owner' || currentUser.role === 'moving_stall_owner') && (
            <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#E2FF3B] font-mono uppercase">
                <Store className="w-3.5 h-3.5" />
                <span>Stall & Business Information</span>
              </div>

              <div>
                <label className="block text-[11px] text-[#8E8E93] font-mono mb-1">
                  Stall / Shop Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Ramesh Idli Cart"
                  className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-[#262626] text-xs text-white focus:outline-none focus:border-[#E2FF3B]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8E8E93] font-mono mb-1">
                  Area / Operating Route
                </label>
                <input
                  type="text"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  placeholder="e.g. T. Nagar, Chennai"
                  className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-[#262626] text-xs text-white focus:outline-none focus:border-[#E2FF3B]"
                />
              </div>

              {currentUser.role === 'shop_owner' && (
                <div>
                  <label className="block text-[11px] text-[#8E8E93] font-mono mb-1">
                    FSSAI License
                  </label>
                  <input
                    type="text"
                    value={fssaiNumber}
                    onChange={(e) => setFssaiNumber(e.target.value)}
                    placeholder="e.g. FSSAI-21524098000123"
                    className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-[#262626] text-xs text-white focus:outline-none focus:border-[#E2FF3B]"
                  />
                </div>
              )}
            </div>
          )}

          {isSaved && (
            <div className="p-3 rounded-xl bg-[#30D158]/15 border border-[#30D158]/30 text-xs font-mono text-[#30D158] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#30D158]" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-[#E2FF3B] text-[#0A0A0A] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#d4f22e] transition-all shadow-lg shadow-[#E2FF3B]/20 active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Changes</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};
