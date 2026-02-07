"use client";

import React from 'react';

export const UIOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col z-10">
      {/* Future overlay UI elements can go here */}
    </div>
  );
};
