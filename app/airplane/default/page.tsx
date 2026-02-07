"use client";

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Stars } from '@react-three/drei';

import { Aircraft } from '@/app/components/Scene3D';
import { GenAIModal } from '@/app/components/GenAIModal';
import { useAppContext } from '@/app/context/AppContext';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const AirplaneVisualizerPage = () => {
  const { inspectedPart, isModalOpen, setModalOpen, fuelType } = useAppContext();

  return (
    <div className="w-screen h-screen bg-aero-900">
      <Link href="/" className="absolute top-6 left-6 z-10 p-2 bg-aero-800/50 rounded-full hover:bg-aero-700 transition-colors">
          <ArrowLeft className="text-white w-6 h-6" />
      </Link>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [20, 10, 20], fov: 50 }}>
        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#00f3ff" />
        <Stars radius={200} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Aircraft fuelType={fuelType} />

        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={50}
        />
      </Canvas>
      
      <GenAIModal 
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        partName={inspectedPart}
        fuelType={fuelType}
      />
    </div>
  );
};

export default AirplaneVisualizerPage;
