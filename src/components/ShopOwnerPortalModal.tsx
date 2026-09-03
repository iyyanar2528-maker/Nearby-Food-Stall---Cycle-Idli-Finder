import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Store,
  MapPin,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  IndianRupee,
  Users,
  Eye,
  Star,
  FileCheck,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { FoodSpot, LanguageCode, MenuItem, UserProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { sound } from '../utils/audioFeedback';
import { api } from '../lib/api';
import confetti from 'canvas-confetti';

interface ShopOwnerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  currentLang: LanguageCode;
  spots: FoodSpot[];
  onUpdateSpot: (updatedSpot: FoodSpot) => void;
  onOpenCommissionPass?: () => void;
}

export const ShopOwnerPortalModal: React.FC<ShopOwnerPortalModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentLang,
  spots,
  onUpdateSpot,
  onOpenCommissionPass
}) => {
  const shopSpots = spots.filter((s) => s.stallType === 'fixed_stall' || s.stallType === 'small_shop' || s.stallType === 'handcart');
  const [selectedSpotId, setSelectedSpotId] = useState<string>(
    currentUser?.stallId || shopSpots[0]?.id || spots[0]?.id || 'spot-mh-1'
  );

  const [isOpenNow, setIsOpenNow] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemImage, setNewItemImage] = useState('https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500');
  const [shopImage, setShopImage] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const t = TRANSLATIONS[currentLang];

  useEffect(() => {
    if (isOpen && selectedSpotId) {
      const spot = spots.find((s) => s.id === selectedSpotId);
      if (spot) {
        setIsOpenNow(spot.isOpenNow);
        setMenuItems(spot.menu || []);
        setShopImage(spot.image || '');
      }
    }
  }, [isOpen, selectedSpotId, spots]);

  if (!isOpen) return null;

  const currentSpot = spots.find((s) => s.id === selectedSpotId) || shopSpots[0] || spots[0];

  const handleToggleOpenStatus = () => {
    sound.playClick();
    const nextStatus = !isOpenNow;
    setIsOpenNow(nextStatus);

    if (currentSpot) {
      const updated = { ...currentSpot, isOpenNow: nextStatus };
      onUpdateSpot(updated);
    }
  };

  const handleUpdateShopPhoto = (url: string) => {
    sound.playClick();
    setShopImage(url);
    if (currentSpot) {
      const updated = { ...currentSpot, image: url, thumbnail: url };
      onUpdateSpot(updated);
      setStatusMsg('Shop photo updated live!');
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const handleAddNewMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) return;

    sound.playClick();
    const priceNum = Number(newItemPrice);
    const newItem: MenuItem = {
      id: `item_${Date.now()}`,
      name: newItemName.trim(),
      price: isNaN(priceNum) ? 20 : priceNum,
      description: newItemDesc.trim() || 'Freshly prepared specialty',
      image: newItemImage || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500',
      isVegetarian: true,
      isBestseller: true
    };

    const updatedMenu = [...menuItems, newItem];
    setMenuItems(updatedMenu);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemDesc('');
    setIsAddingItem(false);

    try {
      await api.spots.updateMenu(selectedSpotId, updatedMenu);
      if (currentSpot) {
        onUpdateSpot({ ...currentSpot, menu: updatedMenu });
      }
      sound.playSuccess();
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
      setStatusMsg('New menu item published live!');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.warn('Menu update fallback:', err);
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    sound.playClick();
    const updatedMenu = menuItems.filter((m) => m.id !== itemId);
    setMenuItems(updatedMenu);

    try {
      await api.spots.updateMenu(selectedSpotId, updatedMenu);
      if (currentSpot) {
        onUpdateSpot({ ...currentSpot, menu: updatedMenu });
      }
    } catch (err) {
      console.warn('Menu delete fallback:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-[#121212] border border-[#262626] rounded-3xl p-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col my-6"
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#E2FF3B]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E2FF3B] text-[#0A0A0A] flex items-center justify-center font-black shadow-lg shadow-[#E2FF3B]/20">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F0F0F0] font-display">
                {t.shopManagementHub}
              </h3>
              <p className="text-xs text-[#8E8E93] font-mono">
                {currentUser?.name ? `${currentUser.name} (Shop Partner)` : 'Fixed Stall Management'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-mono text-[#8E8E93] hover:text-white px-2 py-1 rounded-lg bg-[#1C1C1E] border border-[#2E2E32]"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Shop Selector */}
          <div>
            <label className="block text-xs font-bold text-[#8E8E93] uppercase font-mono tracking-wider mb-1.5">
              Select Your Fixed Eatery / Stall:
            </label>
            <select
              value={selectedSpotId}
              onChange={(e) => setSelectedSpotId(e.target.value)}
              className="w-full p-2.5 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] text-xs font-bold text-[#F0F0F0] focus:outline-none focus:border-[#E2FF3B]"
            >
              {spots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.cityArea})
                </option>
              ))}
            </select>
          </div>

          {/* Vendor Commission / Stall Pass Status Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#E2FF3B]/10 via-[#1C1C1E] to-[#1C1C1E] border border-[#E2FF3B]/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E2FF3B]/20 text-[#E2FF3B] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Platform Pass & Promotion</span>
                <span className="text-[10px] text-[#8E8E93] font-mono">UPI ID: iyyanarpriya@slc • Daily ₹10 / Monthly ₹250</span>
              </div>
            </div>
            {onOpenCommissionPass && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onOpenCommissionPass();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-[#E2FF3B] hover:bg-[#d4f22e] text-black font-bold text-xs font-mono shadow-md transition-all shrink-0"
              >
                Pass / Pay
              </button>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-[#8E8E93] font-mono mb-1">
                <Eye className="w-3 h-3 text-[#E2FF3B]" /> Views Today
              </div>
              <div className="text-base font-black text-[#F0F0F0] font-display">
                {(currentSpot?.reviewCount || 30) * 8 + 140}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-[#8E8E93] font-mono mb-1">
                <Star className="w-3 h-3 text-[#E2FF3B]" /> Rating
              </div>
              <div className="text-base font-black text-[#E2FF3B] font-display">
                ★ {currentSpot?.rating || 4.8}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-[#8E8E93] font-mono mb-1">
                <IndianRupee className="w-3 h-3 text-[#E2FF3B]" /> Pass Revenue
              </div>
              <div className="text-base font-black text-[#F0F0F0] font-display">
                ₹{(currentSpot?.activeSubscribersCount || 12) * 499}
              </div>
            </div>
          </div>

          {/* Stall Status Toggle Bar */}
          <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#F0F0F0] block">
                Shop Live Operating Status
              </span>
              <span className="text-[10px] text-[#8E8E93] font-mono">
                {isOpenNow ? 'Visible on radar as OPEN' : 'Marked as CLOSED on radar'}
              </span>
            </div>

            <button
              onClick={handleToggleOpenStatus}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                isOpenNow
                  ? 'bg-[#E2FF3B] text-[#0A0A0A]'
                  : 'bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/30'
              }`}
            >
              {isOpenNow ? '● OPEN & SERVING' : '○ CLOSED NOW'}
            </button>
          </div>

          {/* Shop Front Photo Card */}
          <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F0F0F0]">Shop Front Photo</span>
              <button
                type="button"
                onClick={() => setIsEditingPhoto(!isEditingPhoto)}
                className="text-[11px] font-mono text-[#E2FF3B] hover:underline"
              >
                {isEditingPhoto ? 'Cancel' : 'Change Photo'}
              </button>
            </div>

            <div className="relative h-28 rounded-xl overflow-hidden border border-white/10 bg-black/40">
              <img
                src={shopImage || currentSpot?.image || 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800'}
                alt="Shop Front"
                className="w-full h-full object-cover"
              />
            </div>

            {isEditingPhoto && (
              <div className="space-y-2 pt-1">
                <input
                  type="url"
                  placeholder="Paste new image URL"
                  value={shopImage}
                  onChange={(e) => setShopImage(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#121212] border border-[#2E2E32] text-xs text-white focus:outline-none focus:border-[#E2FF3B]"
                />
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { name: 'Cycle Cart', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800' },
                    { name: 'Vada Pav Stall', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800' },
                    { name: 'Dosa Joint', url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800' }
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleUpdateShopPhoto(p.url)}
                      className="text-[10px] font-mono p-1 rounded-lg border border-[#262626] bg-[#121212] text-[#8E8E93] hover:text-white truncate"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (shopImage) handleUpdateShopPhoto(shopImage);
                    setIsEditingPhoto(false);
                  }}
                  className="w-full py-1.5 rounded-lg bg-[#E2FF3B] text-black font-bold text-xs"
                >
                  Save Photo
                </button>
              </div>
            )}
          </div>

          {/* Menu Items Manager */}
          <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F0F0F0]">
                Live Menu Items ({menuItems.length})
              </span>
              <button
                onClick={() => setIsAddingItem(!isAddingItem)}
                className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#E2FF3B] text-[#0A0A0A] font-bold flex items-center gap-1 hover:bg-[#d4f22e]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Add New Item Mini Form */}
            {isAddingItem && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={handleAddNewMenuItem}
                className="p-3 rounded-xl bg-[#121212] border border-[#2E2E32] space-y-2"
              >
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Dish Name (e.g. Masala Dosa)"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="col-span-2 px-3 py-1.5 rounded-lg bg-[#1C1C1E] border border-[#2E2E32] text-xs text-[#F0F0F0] placeholder-[#5C5C60] focus:outline-none focus:border-[#E2FF3B]"
                  />
                  <input
                    type="number"
                    required
                    placeholder="Price ₹"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-[#1C1C1E] border border-[#2E2E32] text-xs text-[#F0F0F0] placeholder-[#5C5C60] focus:outline-none focus:border-[#E2FF3B]"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Short description / ingredients"
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#1C1C1E] border border-[#2E2E32] text-xs text-[#F0F0F0] placeholder-[#5C5C60] focus:outline-none focus:border-[#E2FF3B]"
                />
                
                {/* Food Image Selector */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {[
                      { name: 'Idli', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500' },
                      { name: 'Dosa', url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500' },
                      { name: 'Vada Pav', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500' },
                      { name: 'Chai', url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500' }
                    ].map((f, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNewItemImage(f.url)}
                        className={`text-[9px] font-mono px-2 py-0.5 rounded border shrink-0 ${
                          newItemImage === f.url ? 'bg-[#E2FF3B] text-black font-bold' : 'bg-[#1C1C1E] text-[#8E8E93]'
                        }`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                  <input
                    type="url"
                    placeholder="Food Photo URL (optional)"
                    value={newItemImage}
                    onChange={(e) => setNewItemImage(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#1C1C1E] border border-[#2E2E32] text-xs text-[#F0F0F0] placeholder-[#5C5C60] focus:outline-none focus:border-[#E2FF3B]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-[#E2FF3B] text-[#0A0A0A] font-bold text-xs shadow"
                >
                  Publish to Menu
                </button>
              </motion.form>
            )}

            {/* List of Menu Items */}
            <div className="space-y-2">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#121212] border border-[#262626] gap-2.5"
                >
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500'}
                    alt={item.name}
                    className="w-9 h-9 rounded-lg object-cover shrink-0 border border-white/10"
                  />
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#F0F0F0] truncate">
                        {item.name}
                      </span>
                      {item.isBestseller && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#E2FF3B]/20 text-[#E2FF3B] font-bold">
                          STAR
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#8E8E93] truncate font-mono">
                      {item.description}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-black text-[#E2FF3B]">
                      ₹{item.price}
                    </span>
                    <button
                      onClick={() => handleDeleteMenuItem(item.id)}
                      className="text-[#8E8E93] hover:text-[#FF3B30] p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {statusMsg && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-mono text-[#E2FF3B] bg-[#E2FF3B]/10 border border-[#E2FF3B]/20 rounded-xl p-3 text-center"
            >
              {statusMsg}
            </motion.p>
          )}
        </div>
      </motion.div>
    </div>
  );
};
