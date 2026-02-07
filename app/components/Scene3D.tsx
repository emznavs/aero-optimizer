import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Stars, 
  Environment, 
  PerspectiveCamera, 
  Html, 
  Float,
  Text,
  Line
} from '@react-three/drei';
import * as THREE from 'three';
import { ViewMode, FuelType, MarkerData } from '../types';
import { FUEL_CONFIGS, CRANFIELD_MARKERS, GLOBAL_HUBS } from '../constants';

// --- Sub-components for 3D Elements ---

// 1. Aircraft Model
const Aircraft = ({ 
  fuelType, 
  onInspectEngine 
}: { 
  fuelType: FuelType; 
  onInspectEngine: () => void 
}) => {
  const morph = FUEL_CONFIGS[fuelType].morphFactor;
  const color = FUEL_CONFIGS[fuelType].color;

  // Use refs for animation if needed, but here we react to props
  const fuselageRef = useRef<THREE.Group>(null);

  // Procedural Geometry Logic
  // Kerosene = 0 morph (Tube)
  // H2 = 1 morph (Wider body, blended wings)
  const fuselageWidth = 1 + (morph * 0.8); 
  const wingScale = 1 + (morph * 0.5);

  return (
    <group ref={fuselageRef}>
      {/* Fuselage */}
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[fuselageWidth, 8, 4, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Cockpit Window */}
      <mesh position={[0, 1, 3]}>
         <boxGeometry args={[1.2 * fuselageWidth, 0.8, 1.5]} />
         <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Wings - Blended Effect via grouping */}
      <group position={[0, -0.5, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} scale={[wingScale, 1, 1]}>
          {/* Simple wing representation */}
          <extrudeGeometry 
            args={[
              new THREE.Shape()
                .moveTo(0, 0)
                .lineTo(8, -4)
                .lineTo(8, -5)
                .lineTo(0, -2)
                .lineTo(-8, -5)
                .lineTo(-8, -4)
                .lineTo(0, 0),
              { depth: 0.5, bevelEnabled: true, bevelSize: 0.1, bevelThickness: 0.1 }
            ]} 
          />
          <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* Engines - Interactive */}
      <group position={[3 * wingScale, -1, 0.5]}>
         <EngineMesh color={color} onClick={onInspectEngine} label="ENG 1" />
      </group>
      <group position={[-3 * wingScale, -1, 0.5]}>
         <EngineMesh color={color} onClick={onInspectEngine} label="ENG 2" />
      </group>

      {/* Tail */}
      <group position={[0, 1.5, -3.5]}>
        <mesh>
            <boxGeometry args={[0.2, 3, 2]} />
            <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        <mesh position={[0, 0.5, 0]} rotation={[Math.PI/2, 0, 0]}>
            <boxGeometry args={[4, 1.5, 0.2]} />
            <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      </group>
    </group>
  );
};

const EngineMesh = ({ color, onClick, label }: { color: string, onClick: () => void, label: string }) => {
    const [hovered, setHover] = React.useState(false);

    return (
        <group 
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
        >
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.8, 0.6, 2.5, 32]} />
                <meshStandardMaterial 
                    color={hovered ? "#ffffff" : "#475569"} 
                    transparent 
                    opacity={hovered ? 0.8 : 1} 
                    emissive={color}
                    emissiveIntensity={hovered ? 0.5 : 0.1}
                />
            </mesh>
            {/* Fan blades glow */}
            <mesh position={[0, 0, 1.2]} rotation={[Math.PI/2, 0, 0]}>
                <ringGeometry args={[0.2, 0.7, 16]} />
                <meshBasicMaterial color={color} side={THREE.DoubleSide} />
            </mesh>
            
            {hovered && (
                <Html position={[0, 2, 0]} center distanceFactor={10}>
                    <div className="bg-aero-900/90 border border-aero-neon text-aero-neon px-2 py-1 text-xs font-mono whitespace-nowrap rounded pointer-events-none">
                        CLICK TO INSPECT {label}
                    </div>
                </Html>
            )}
        </group>
    );
};

// 2. Airport Infrastructure
const Airport = () => {
  return (
    <group position={[0, -5, 0]}>
        {/* Tarmac */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
        
        {/* Grid lines on floor */}
        <gridHelper args={[100, 50, 0x1e293b, 0x1e293b]} position={[0, -0.05, 0]} />

        {/* Buildings & Infrastructure */}
        {CRANFIELD_MARKERS.map((marker) => (
            <group key={marker.id} position={new THREE.Vector3(...marker.position)}>
                <Marker3D data={marker} />
            </group>
        ))}

        {/* Runway Stripes */}
        <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[10, 60]} />
            <meshStandardMaterial color="#1e293b" />
        </mesh>
    </group>
  );
};

const Marker3D = ({ data }: { data: MarkerData }) => {
    const [open, setOpen] = React.useState(false);

    return (
        <group>
            {/* The physical object */}
            {data.id === 'h2-farm' && (
                <mesh position={[0, 1, 0]}>
                    <sphereGeometry args={[1.5, 32, 32]} />
                    <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
                </mesh>
            )}
            {data.id === 'electrolyzer' && (
                <mesh position={[0, 1, 0]}>
                    <boxGeometry args={[3, 2, 4]} />
                    <meshStandardMaterial color="#94a3b8" metalness={0.5} />
                </mesh>
            )}
            {data.id === 'refuel-truck' && (
                <mesh position={[0, 0.5, 0]}>
                    <boxGeometry args={[1, 1, 2.5]} />
                    <meshStandardMaterial color="#f97316" />
                </mesh>
            )}

            {/* The Floating UI Marker */}
            <Html position={[0, 3, 0]} center zIndexRange={[100, 0]}>
                <div className="relative group">
                    <button 
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${open ? 'bg-aero-neon border-white scale-110' : 'bg-black/50 border-aero-neon hover:bg-aero-neon/30'}`}
                        onClick={() => setOpen(!open)}
                    >
                        <div className={`w-2 h-2 rounded-full ${open ? 'bg-black' : 'bg-aero-neon animate-pulse'}`} />
                    </button>
                    
                    {open && (
                        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-48 bg-aero-900/95 border border-aero-neon/50 text-white p-3 rounded backdrop-blur-md shadow-xl shadow-aero-neon/10">
                            <h3 className="font-bold text-sm text-aero-neon mb-1">{data.label}</h3>
                            <p className="text-[10px] text-slate-300 mb-2 leading-tight">{data.description}</p>
                            <div className="space-y-1 border-t border-slate-700 pt-2">
                                {Object.entries(data.stats).map(([k, v]) => (
                                    <div key={k} className="flex justify-between text-[10px] font-mono">
                                        <span className="text-slate-400">{k}:</span>
                                        <span className="text-white">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Connecting Line */}
                    {open && <div className="absolute top-full left-1/2 w-px h-4 bg-aero-neon/50 -translate-x-1/2"></div>}
                </div>
            </Html>
        </group>
    );
}

// 3. Global Route Map
const Globe = () => {
    return (
        <group>
            {/* Earth Sphere */}
            <mesh>
                <sphereGeometry args={[12, 64, 64]} />
                <meshStandardMaterial 
                    color="#0f172a" 
                    emissive="#1e293b" 
                    emissiveIntensity={0.2}
                    wireframe 
                />
            </mesh>
            <mesh scale={[0.99, 0.99, 0.99]}>
                 <sphereGeometry args={[12, 64, 64]} />
                 <meshBasicMaterial color="#000000" />
            </mesh>

            {/* Points of Interest */}
            {GLOBAL_HUBS.map((hub) => {
                // Convert simple normalized coords to Vector3 on sphere surface
                // Simplified spherical projection for demo
                const r = 12.2;
                const phi = Math.acos(2 * hub.position[1] - 1);
                const theta = 2 * Math.PI * hub.position[0];
                
                const x = r * Math.sin(phi) * Math.cos(theta);
                const y = r * Math.sin(phi) * Math.sin(theta);
                const z = r * Math.cos(phi);

                return (
                    <group key={hub.id} position={[x, y, z]} lookAt={new THREE.Vector3(0,0,0)}>
                        <mesh>
                             <sphereGeometry args={[0.3, 16, 16]} />
                             <meshBasicMaterial color="#00f3ff" />
                        </mesh>
                        <Html distanceFactor={20} position={[0,0,1]}>
                            <div className="text-xs font-mono text-aero-neon whitespace-nowrap drop-shadow-md">
                                {hub.label}
                            </div>
                        </Html>
                    </group>
                )
            })}
        </group>
    );
};

// --- Camera Controller ---
const CameraController = ({ mode, promoMode }: { mode: ViewMode, promoMode: boolean }) => {
    const { camera } = useThree();
    const vec = new THREE.Vector3();

    useFrame((state) => {
        // Target positions for each mode
        let targetPos = new THREE.Vector3(0, 0, 0);
        
        if (mode === ViewMode.AIRCRAFT) {
            targetPos.set(10, 5, 10);
            if (promoMode) {
                const t = state.clock.getElapsedTime() * 0.2;
                targetPos.set(Math.sin(t) * 15, 5, Math.cos(t) * 15);
            }
        } else if (mode === ViewMode.AIRPORT) {
            targetPos.set(0, 40, 40);
             if (promoMode) {
                targetPos.set(20, 40, 40);
            }
        } else if (mode === ViewMode.GLOBAL) {
            targetPos.set(0, 0, 35);
             if (promoMode) {
                 const t = state.clock.getElapsedTime() * 0.1;
                targetPos.set(Math.sin(t) * 35, 10, Math.cos(t) * 35);
            }
        }

        // Smoothly interpolate camera position
        camera.position.lerp(targetPos, 0.05);
        camera.lookAt(0, 0, 0);
    });

    return null;
}

interface Scene3DProps {
  viewMode: ViewMode;
  fuelType: FuelType;
  promoMode: boolean;
  onInspect: (part: string) => void;
}

export const Scene3D: React.FC<Scene3DProps> = ({ viewMode, fuelType, promoMode, onInspect }) => {
  return (
    <div className="w-full h-full absolute inset-0 bg-aero-900">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault fov={50} />
        <CameraController mode={viewMode} promoMode={promoMode} />
        
        <Environment preset="city" />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f3ff" />

        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        <group visible={viewMode === ViewMode.AIRCRAFT}>
             <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <Aircraft 
                    fuelType={fuelType} 
                    onInspectEngine={() => onInspect('Hydrogen Combustion Engine')}
                />
             </Float>
        </group>

        <group visible={viewMode === ViewMode.AIRPORT}>
            <Airport />
             {/* Show aircraft landed in airport mode */}
            <group position={[0, 0.7, 0]} scale={[0.5, 0.5, 0.5]}>
                 <Aircraft fuelType={fuelType} onInspectEngine={() => {}} />
            </group>
        </group>

        <group visible={viewMode === ViewMode.GLOBAL}>
            <Globe />
        </group>

      </Canvas>
    </div>
  );
};
