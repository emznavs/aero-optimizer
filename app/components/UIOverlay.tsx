import React from 'react';
import { ViewMode, FuelType } from '../types';
import { VIEW_STEPS, FUEL_CONFIGS } from '../constants';
import { Plane, Droplets, Zap, Flame, Map, PlayCircle, PauseCircle, Menu } from 'lucide-react';
import { clsx } from 'clsx';

interface UIOverlayProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  fuelType: FuelType;
  setFuelType: (type: FuelType) => void;
  promoMode: boolean;
  setPromoMode: (v: boolean) => void;
  apiKeySet: boolean;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({
  viewMode,
  setViewMode,
  fuelType,
  setFuelType,
  promoMode,
  setPromoMode,
  apiKeySet
}) => {
  
  const getFuelIcon = (type: FuelType) => {
    switch(type) {
      case FuelType.KEROSENE: return <Flame className="w-4 h-4" />;
      case FuelType.LIQUID_H2: return <Droplets className="w-4 h-4" />;
      case FuelType.ELECTRIC: return <Zap className="w-4 h-4" />;
      default: return <Plane className="w-4 h-4" />;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
      
      {/* Top Bar */}
      <header className="flex justify-between items-start pointer-events-auto">
        <div className="bg-aero-900/80 backdrop-blur border border-aero-700 p-4 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold tracking-widest text-white uppercase font-mono">
            Aero<span className="text-aero-neon">Genesis</span> Vis
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            FUTURE AVIATION ARCHITECTURES // SIMULATION V1.0
          </p>
        </div>

        <div className="flex gap-4">
             {!apiKeySet && (
                <div className="bg-aero-alert/20 border border-aero-alert text-aero-alert px-4 py-2 rounded font-mono text-sm animate-pulse">
                    API KEY MISSING - GEN AI DISABLED
                </div>
             )}
            <button 
                onClick={() => setPromoMode(!promoMode)}
                className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded border transition-all font-mono text-sm uppercase",
                    promoMode 
                        ? "bg-aero-neon/20 border-aero-neon text-aero-neon" 
                        : "bg-aero-900/80 border-slate-600 text-slate-300 hover:border-white"
                )}
            >
                {promoMode ? <PauseCircle className="w-4 h-4"/> : <PlayCircle className="w-4 h-4"/>}
                {promoMode ? "Cinema Mode: ON" : "Cinema Mode: OFF"}
            </button>
        </div>
      </header>

      {/* Left Sidebar: Fuel Selector (Only in Aircraft View) */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-auto">
        {viewMode === ViewMode.AIRCRAFT && (
          <div className="flex flex-col gap-3 bg-aero-900/50 backdrop-blur p-2 rounded-lg border border-slate-700/50">
             <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1 pl-1">Propulsion Source</div>
             {Object.values(FuelType).map((ft) => (
               <button
                 key={ft}
                 onClick={() => setFuelType(ft)}
                 className={clsx(
                   "flex items-center gap-3 px-4 py-3 rounded text-left transition-all border",
                   fuelType === ft 
                     ? "bg-aero-neon/10 border-aero-neon text-white shadow-[0_0_15px_rgba(0,243,255,0.3)]" 
                     : "bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-white"
                 )}
               >
                 <div className={clsx(
                     "p-1 rounded bg-black/50",
                     fuelType === ft ? "text-aero-neon" : "text-slate-500"
                 )}>
                    {getFuelIcon(ft)}
                 </div>
                 <div>
                    <div className="text-xs font-bold font-mono uppercase">{ft}</div>
                    {fuelType === ft && (
                        <div className="text-[9px] text-aero-neon/80 font-mono mt-0.5">
                            MORPH: {(FUEL_CONFIGS[ft].morphFactor * 100).toFixed(0)}%
                        </div>
                    )}
                 </div>
               </button>
             ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation: Timeline/Zoom Scrubber */}
      <div className="pointer-events-auto w-full max-w-3xl mx-auto mb-4">
        <div className="bg-aero-900/90 backdrop-blur border border-aero-700 rounded-full p-2 flex justify-between items-center relative shadow-2xl">
          
          {/* Progress Line */}
          <div className="absolute left-4 right-4 top-1/2 h-0.5 bg-slate-800 -z-10"></div>
          
          {VIEW_STEPS.map((step, index) => {
             const isActive = viewMode === step.id;
             return (
               <button
                 key={step.id}
                 onClick={() => setViewMode(step.id)}
                 className={clsx(
                    "relative flex flex-col items-center gap-2 group transition-all px-6 py-2 rounded-full",
                    isActive ? "bg-white/10" : "hover:bg-white/5"
                 )}
               >
                 <div className={clsx(
                    "w-4 h-4 rounded-full border-2 transition-all",
                    isActive 
                        ? "bg-aero-neon border-white scale-125 shadow-[0_0_10px_#00f3ff]" 
                        : "bg-aero-900 border-slate-600 group-hover:border-slate-400"
                 )}></div>
                 <span className={clsx(
                     "text-[10px] font-mono font-bold tracking-wider uppercase transition-colors",
                     isActive ? "text-white" : "text-slate-500"
                 )}>
                    {step.label}
                 </span>
               </button>
             )
          })}
        </div>
        
        {/* HUD Data Footer */}
        <div className="flex justify-between mt-2 px-4 text-[10px] font-mono text-slate-500 uppercase">
             <div>System: Online</div>
             <div>Time: {new Date().toLocaleTimeString()}</div>
             <div>Coords: 52.0725° N, 0.6276° W</div>
        </div>
      </div>

    </div>
  );
};
