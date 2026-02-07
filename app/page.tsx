"use client";

import React from 'react';
import { Scene3D } from './components/Scene3D';
import { UIOverlay } from './components/UIOverlay';

export default function HomePage() {
  return (
    <div className="relative w-screen h-[calc(100vh-49px)] overflow-hidden bg-aero-900">
      {/* 3D Scene Layer */}
      <Scene3D />

      {/* UI Overlay Layer */}
      <UIOverlay />

      {/* Scanline overlay for aesthetic */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none z-50 opacity-20 mix-blend-overlay"></div>
    </div>
  );
}
