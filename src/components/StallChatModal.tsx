import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Send,
  X,
  Store,
  Bike,
  CheckCheck,
  Sparkles,
  MapPin,
  Clock,
  PhoneCall,
  User,
  Coffee,
  IndianRupee
} from 'lucide-react';
import { FoodSpot, LanguageCode, UserProfile } from '../types';
import { sound } from '../utils/audioFeedback';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'stall_owner';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  '📍 Where are you right now?',
  '🍲 Are steaming hot idlis available?',
  '⏱️ Please keep 2 plates ready for me!',
  '🛵 Are you coming towards my street?',
  '💳 Can I pay via UPI / GPay?'
];

interface StallChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  spot: FoodSpot | null;
  currentUser: UserProfile | null;
  currentLang: LanguageCode;
}

export const StallChatModal: React.FC<StallChatModalProps> = ({
  isOpen,
  onClose,
  spot,
  currentUser,
  currentLang
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history for this specific stall
  useEffect(() => {
    if (isOpen && spot) {
      try {
        const stored = localStorage.getItem(`stall_chat_${spot.id}`);
        if (stored) {
          setMessages(JSON.parse(stored));
        } else {
          // Welcome greeting from vendor
          const initialGreeting: ChatMessage = {
            id: 'msg_welcome',
            sender: 'stall_owner',
            text: `Vanakkam / Namaste! ${spot.vendorName || 'Anna'} here from ${spot.name}. Fresh batch is steaming hot right now. How can I serve you today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages([initialGreeting]);
        }
      } catch {
        // storage fallback
      }
    }
  }, [isOpen, spot]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen || !spot) return null;

  const saveMessages = (msgs: ChatMessage[]) => {
    setMessages(msgs);
    try {
      localStorage.setItem(`stall_chat_${spot.id}`, JSON.stringify(msgs));
    } catch {}
  };

  const generateVendorReply = (userText: string): string => {
    const lower = userText.toLowerCase();
    if (lower.includes('where') || lower.includes('location') || lower.includes('right now')) {
      return spot.stallType === 'moving_cycle'
        ? `I am moving through ${spot.cityArea || 'the main street'}, currently ${spot.distanceMeters}m from you! Taking a quick halt near the corner.`
        : `We are open at ${spot.address || spot.cityArea}. Look for our signboard, just ${spot.distanceMeters}m away!`;
    }
    if (lower.includes('idli') || lower.includes('hot') || lower.includes('food') || lower.includes('available')) {
      return `Yes! Steaming hot batch fresh off the idli steamer. Podi butter and spicy coconut chutney are also fresh!`;
    }
    if (lower.includes('ready') || lower.includes('keep') || lower.includes('plate') || lower.includes('order')) {
      return `Done thambi / sir! Packing 2 hot plates for you right now with extra chutney. Arrive in 5 minutes!`;
    }
    if (lower.includes('upi') || lower.includes('gpay') || lower.includes('paytm') || lower.includes('cash') || lower.includes('pay')) {
      return `Yes, GPay / PhonePe / Paytm scanner is right here on my cycle cart / counter. You can scan and pay!`;
    }
    if (lower.includes('coming') || lower.includes('street') || lower.includes('area') || lower.includes('lane')) {
      return `Yes, ringing my cycle bell as I enter your lane in about 5-8 minutes! Keep a vessel or container ready if you need takeaway.`;
    }
    return `Got your message! Preparing it fresh. See you in a few minutes at ${spot.name}!`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    sound.playClick();
    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...messages, userMsg];
    saveMessages(updated);
    setInputText('');

    // Vendor automated response simulation
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const vendorReply: ChatMessage = {
        id: `msg_vendor_${Date.now()}`,
        sender: 'stall_owner',
        text: generateVendorReply(text),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      saveMessages([...updated, vendorReply]);
      sound.playNotification();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="w-full max-w-lg bg-[#141414] border border-[#2E2E32] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[85vh] sm:h-[680px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Chat Header */}
        <div className="p-3.5 sm:p-4 border-b border-[#262626] bg-[#18181A] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <img
                src={spot.thumbnail || spot.image}
                alt={spot.name}
                className="w-11 h-11 rounded-2xl object-cover border border-white/10"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#30D158] border-2 border-[#18181A]" />
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                <span>{spot.name}</span>
                {spot.stallType === 'moving_cycle' && (
                  <span className="px-1.5 py-0.2 rounded bg-[#E2FF3B]/15 text-[#E2FF3B] text-[9px] font-mono font-bold flex items-center gap-0.5">
                    <Bike className="w-2.5 h-2.5" /> CYCLE
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-[#8E8E93] font-mono flex items-center gap-1.5">
                <span className="text-[#30D158] font-bold">● Live on Radar</span>
                <span>•</span>
                <span>{spot.distanceMeters}m away</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono text-[#8E8E93] hover:text-white px-2.5 py-1.5 rounded-xl bg-[#222] border border-[#333]"
          >
            ✕
          </button>
        </div>

        {/* Quick Questions Strip */}
        <div className="p-2 border-b border-[#222] bg-[#121212] overflow-x-auto flex items-center gap-1.5 shrink-0 no-scrollbar">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] text-slate-300 hover:text-white border border-[#2E2E32] whitespace-nowrap shrink-0 transition-all active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 bg-[#0E0E10]">
          {messages.map((msg) => {
            const isMe = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[82%] sm:max-w-[75%] p-3 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
                    isMe
                      ? 'bg-[#E2FF3B] text-[#0A0A0A] font-medium rounded-br-none shadow-md shadow-[#E2FF3B]/10'
                      : 'bg-[#1C1C1E] text-white border border-[#2E2E32] rounded-bl-none shadow-sm'
                  }`}
                >
                  <p>{msg.text}</p>
                  <div
                    className={`text-[9px] font-mono mt-1 flex items-center justify-end gap-1 ${
                      isMe ? 'text-black/60' : 'text-[#8E8E93]'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-black/70" />}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Vendor is typing animation */}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs font-mono text-[#8E8E93] bg-[#1C1C1E] border border-[#2E2E32] px-3 py-2 rounded-2xl w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2FF3B] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2FF3B] animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2FF3B] animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1">{spot.vendorName || 'Anna'} is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-[#262626] bg-[#18181A] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask stall owner (e.g. Is hot idli ready?)..."
              className="flex-1 px-3.5 py-2.5 rounded-2xl bg-[#121212] border border-[#2E2E32] text-xs sm:text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#E2FF3B]"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-2xl bg-[#E2FF3B] text-[#0A0A0A] flex items-center justify-center font-bold hover:bg-[#d4f22e] transition-all active:scale-95 disabled:opacity-40 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
