'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { TabId } from '@/app/data/types';
import { Plus, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppContext } from '@/app/context/AppContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AIRPORTS = [
  { id: 'cranfield', label: 'Cranfield Airport' },
  { id: 'heathrow', label: 'London Heathrow' },
  { id: 'toulouse', label: 'Toulouse (Airbus)' },
] as const;

const TABS: { id: TabId; label: string }[] = [
  { id: 'editor', label: 'Editor' },
  { id: 'analysis', label: 'Analysis' },
];

export function Navbar() {
  const {
    setActiveTab,
    selectedAirport,
    setSelectedAirport,
  } = useAppContext();

  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';
  const isAnalysis = pathname === '/analysis';

  return (
    <nav className="sticky top-0 z-50 flex items-center gap-4 px-4 py-3 bg-aero-900/80 backdrop-blur border-b border-aero-700">
      {!isHome && !isAnalysis && (
        <Link
          href="/"
          className={clsx(
            'flex items-center gap-2 px-3 py-1.5 rounded text-sm font-mono',
            'text-slate-400 hover:text-white hover:bg-white/5 transition-colors'
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      )}

      {/* Airport Dropdown */}
      <Select value={selectedAirport} onValueChange={setSelectedAirport}>
        <SelectTrigger
          aria-label="Select airport"
          className={clsx(
            'bg-aero-900 border-aero-700 text-white font-mono text-sm',
            'hover:border-slate-500 focus:border-aero-neon'
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {AIRPORTS.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Tab Buttons */}
      <div className="flex gap-1">
        {TABS.map((tab) => {
          const isActive = tab.id === 'analysis' ? isAnalysis : !isAnalysis;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                router.push(tab.id === 'analysis' ? '/analysis' : '/');
              }}
              className={clsx(
                'px-4 py-1.5 rounded text-sm font-mono transition-colors',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Add Airplane Button */}
      {isHome && (
        <Link
          href="/airplane/new"
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded border',
            'bg-aero-900/80 border-aero-700 text-white',
            'text-sm font-mono hover:border-aero-neon hover:text-aero-neon transition-colors'
          )}
        >
          <Plus className="w-4 h-4" />
          Add Airplane
        </Link>
      )}
    </nav>
  );
}
