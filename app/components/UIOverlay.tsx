"use client";

import React from 'react';
import { TabId } from '@/data/types';
import { Plus, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppContext } from '@/context/AppContext';

const AIRPORTS = [
  { id: 'cranfield', label: 'Cranfield Airport' },
  { id: 'heathrow', label: 'London Heathrow' },
  { id: 'toulouse', label: 'Toulouse (Airbus)' },
] as const;

const TABS: { id: TabId; label: string }[] = [
  { id: 'editor', label: 'Editor' },
  { id: 'analysis', label: 'Analysis' },
];

export const UIOverlay: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedAirport,
    setSelectedAirport,
  } = useAppContext();

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col z-10">

      {/* Navbar */}
      <nav className="pointer-events-auto flex items-center gap-4 px-4 py-3 bg-aero-900/80 backdrop-blur border-b border-aero-700">
        {/* Airport Dropdown */}
        <div className="relative">
          <select
            aria-label="Select airport"
            value={selectedAirport}
            onChange={(e) => setSelectedAirport(e.target.value)}
            className={clsx(
              "appearance-none bg-aero-900 border border-aero-700 text-white",
              "pl-3 pr-8 py-1.5 rounded text-sm font-mono cursor-pointer",
              "hover:border-slate-500 focus:outline-none focus:border-aero-neon"
            )}
          >
            {AIRPORTS.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "px-4 py-1.5 rounded text-sm font-mono transition-colors",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Add Airplane Button - top right of content area */}
      <div className="pointer-events-auto absolute top-16 right-6">
        <button
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded border",
            "bg-aero-900/80 border-aero-700 text-white",
            "text-sm font-mono hover:border-aero-neon hover:text-aero-neon transition-colors"
          )}
        >
          <Plus className="w-4 h-4" />
          Add Airplane
        </button>
      </div>
    </div>
  );
};
