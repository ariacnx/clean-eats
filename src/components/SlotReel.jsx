import React from 'react';

/**
 * Slot Machine Reel Component
 * Displays a spinning reel with icon and value
 */
export const SlotReel = ({ value, label, isSpinning, icon: Icon }) => (
  <div className="flex flex-col items-center gap-2 w-1/3">
    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    <div className={`relative w-full h-24 bg-white rounded-xl border-2 border-[#d6ced9] flex items-center justify-center overflow-hidden shadow-sm transition-all duration-300 ${isSpinning ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}>
      <div className={`absolute inset-0 bg-[#ded7e0]/20 flex flex-col items-center justify-center transition-transform duration-100 ${isSpinning ? 'animate-pulse translate-y-1' : 'translate-y-0'}`}>
        <Icon size={28} className="text-amber-600 mb-1" />
        <span className="font-bold text-gray-800 text-sm text-center px-1 truncate w-full">{isSpinning ? "..." : value}</span>
      </div>
    </div>
  </div>
);

