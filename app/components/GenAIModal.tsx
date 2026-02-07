import React, { useEffect, useState } from 'react';
import { X, Cpu, Loader2, Download } from 'lucide-react';
import { generateTechnicalSchematic } from '../services/geminiService';
import { FuelType } from '../types';

interface GenAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  partName: string;
  fuelType: FuelType;
}

export const GenAIModal: React.FC<GenAIModalProps> = ({ isOpen, onClose, partName, fuelType }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && partName) {
      const fetchSchematic = async () => {
        setLoading(true);
        setError(null);
        setImageUrl(null);

        try {
          const url = await generateTechnicalSchematic(partName, fuelType);
          if (url) {
            setImageUrl(url);
          } else {
            setError("Unable to generate schematic. Please check API configuration.");
          }
        } catch (e) {
          setError("Generation failed.");
        } finally {
          setLoading(false);
        }
      };

      fetchSchematic();
    }
  }, [isOpen, partName, fuelType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-aero-900 border border-aero-neon/30 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-aero-neon/20 relative">
        
        {/* Header */}
        <div className="p-4 border-b border-aero-700 flex justify-between items-center bg-aero-800">
          <div className="flex items-center gap-3">
            <Cpu className="text-aero-neon w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold font-mono tracking-wider text-white uppercase">
                Schematic: {partName}
              </h2>
              <p className="text-xs text-aero-neon/70 font-mono">
                System: {fuelType} | Source: AeroGenesis AI Core
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 bg-black relative flex items-center justify-center min-h-[400px]">
          {loading && (
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 text-aero-neon animate-spin mx-auto" />
              <p className="text-aero-neon font-mono animate-pulse">GENERATING TECHNICAL DATA...</p>
            </div>
          )}

          {error && (
            <div className="text-aero-alert font-mono p-8 text-center border border-aero-alert/30 bg-aero-alert/10 rounded">
              <p>ERROR: {error}</p>
              {!process.env.API_KEY && <p className="text-sm mt-2 opacity-70">API Key not found in environment.</p>}
            </div>
          )}

          {!loading && !error && imageUrl && (
            <img 
              src={imageUrl} 
              alt={`Schematic of ${partName}`} 
              className="w-full h-full object-contain"
            />
          )}

          {/* Overlay Grid Effect */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-aero-800 border-t border-aero-700 flex justify-between items-center">
            <div className="font-mono text-xs text-slate-400">
                <span className="text-aero-alert">RESTRICTED ACCESS</span> {/* // LEVEL 5 CLEARANCE */}
            </div>
            {!loading && imageUrl && (
                <button className="flex items-center gap-2 px-4 py-2 bg-aero-neon/10 hover:bg-aero-neon/20 border border-aero-neon/50 rounded text-aero-neon font-mono text-sm transition-all">
                    <Download className="w-4 h-4" />
                    EXPORT DWG
                </button>
            )}
        </div>
      </div>
    </div>
  );
};
