import React, { useState, useEffect } from 'react';
import { ViewMode, FuelType } from './types';
import { Scene3D } from './components/Scene3D';
import { UIOverlay } from './components/UIOverlay';
import { GenAIModal } from './components/GenAIModal';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.AIRCRAFT);
  const [fuelType, setFuelType] = useState<FuelType>(FuelType.KEROSENE);
  const [promoMode, setPromoMode] = useState<boolean>(false);
  
  // GenAI Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [inspectPart, setInspectPart] = useState<string>('');

  const handleInspect = (partName: string) => {
    setInspectPart(partName);
    setModalOpen(true);
    // Pause promo mode when inspecting
    if (promoMode) setPromoMode(false);
  };

  const apiKeySet = !!process.env.API_KEY;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-aero-900">
      
      {/* 3D Scene Layer */}
      <Scene3D 
        viewMode={viewMode}
        fuelType={fuelType}
        promoMode={promoMode}
        onInspect={handleInspect}
      />

      {/* UI Overlay Layer */}
      <UIOverlay 
        viewMode={viewMode}
        setViewMode={setViewMode}
        fuelType={fuelType}
        setFuelType={setFuelType}
        promoMode={promoMode}
        setPromoMode={setPromoMode}
        apiKeySet={apiKeySet}
      />

      {/* AI Schematic Modal */}
      <GenAIModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        partName={inspectPart}
        fuelType={fuelType}
      />
      
      {/* Scanline overlay for aesthetic */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none z-50 opacity-20 mix-blend-overlay"></div>
    </div>
  );
};

export default App;
