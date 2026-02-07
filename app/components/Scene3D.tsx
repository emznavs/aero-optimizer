"use client";

import React, { useMemo, type ComponentPropsWithoutRef } from 'react';
import { useRouter } from 'next/navigation';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { 
  Stars, 
  Environment, 
  PerspectiveCamera, 
  Html, 
  Float,
} from '@react-three/drei';
import * as THREE from 'three';
import { ViewMode, FuelType, MarkerData } from '@/app/data/types';
import { FUEL_CONFIGS, CRANFIELD_MARKERS, GLOBAL_HUBS } from '@/app/data/constants';
import { useAppContext } from '@/app/context/AppContext';

// --- Sub-components for 3D Elements ---

// 1. Aircraft Model
export const Aircraft = ({ 
  fuelType
}: { 
  fuelType: FuelType; 
}) => {
  const morph = FUEL_CONFIGS[fuelType].morphFactor;
  const fuselageWidth = 1 + (morph * 0.2); // More subtle morphing

  const fuselageMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e2e8f0", metalness: 0.9, roughness: 0.1 }), []);
  const wingMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#cbd5e1", metalness: 0.8, roughness: 0.3 }), []);
  const tailMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#b0b8c4", metalness: 0.8, roughness: 0.3 }), []);
  const windowMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0f172a", metalness: 0.95, roughness: 0.05 }), []);

  // A320-like shape using multiple cylinders for a tapered effect
  const fuselageShape = useMemo(() => {
    const group = new THREE.Group();
    const mainBody = new THREE.Mesh(new THREE.CylinderGeometry(0.8 * fuselageWidth, 1.2 * fuselageWidth, 12, 32), fuselageMaterial);
    mainBody.rotation.x = Math.PI / 2;
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.8 * fuselageWidth, 32, 32, 0, Math.PI * 2, 0, Math.PI/2), fuselageMaterial);
    nose.position.z = 6;
    nose.rotation.x = Math.PI / 2;
    const tailCone = new THREE.Mesh(new THREE.CylinderGeometry(1.2 * fuselageWidth, 0.4 * fuselageWidth, 3, 32), fuselageMaterial);
    tailCone.position.z = -7.5;
    tailCone.rotation.x = Math.PI / 2;
    
    group.add(mainBody, nose, tailCone);
    
    // Passenger windows
    const windowGeo = new THREE.BoxGeometry(0.1, 0.2, 0.1);
    for (let i = 0; i < 10; i++) {
      const windowLeft = new THREE.Mesh(windowGeo, windowMaterial);
      windowLeft.position.set(-1.1 * fuselageWidth, 0.5, -2 + i * 0.8);
      const windowRight = new THREE.Mesh(windowGeo, windowMaterial);
      windowRight.position.set(1.1 * fuselageWidth, 0.5, -2 + i * 0.8);
      group.add(windowLeft, windowRight);
    }
    return group;
  }, [fuselageWidth, fuselageMaterial, windowMaterial]);

  // More detailed cockpit
  const cockpit = useMemo(() => {
    const group = new THREE.Group();
    const cockpitMain = new THREE.Mesh(new THREE.BoxGeometry(1 * fuselageWidth, 0.6, 1), windowMaterial);
    cockpitMain.position.set(0, 0.8, 5.5);
    cockpitMain.rotation.x = -0.2;
    const cockpitTop = new THREE.Mesh(new THREE.BoxGeometry(0.8 * fuselageWidth, 0.2, 0.8), windowMaterial);
    cockpitTop.position.set(0, 1.1, 5.4);
    cockpitTop.rotation.x = -0.4;
    group.add(cockpitMain, cockpitTop);
    return group;
  }, [fuselageWidth, windowMaterial]);

  // Wing Shape (Airfoil-like)
  const wingShape = useMemo(() => new THREE.Shape()
    .moveTo(0, 0)
    .quadraticCurveTo(2, 0.5, 8, 0.3)
    .quadraticCurveTo(8.5, 0, 8, -1.5)
    .quadraticCurveTo(2, -0.8, 0, -0.5)
    .closePath(), []);
  const extrudeSettings = useMemo(() => ({ depth: 0.2, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.1 }), []);
  
  const wingletShape = useMemo(() => new THREE.Shape()
    .moveTo(0, 0)
    .lineTo(0.5, 1)
    .lineTo(0.3, 1)
    .lineTo(0, 0.1)
    .closePath(), []);
  const wingletExtrudeSettings = useMemo(() => ({ depth: 0.1, bevelEnabled: false }), []);

  return (
    <group rotation={[0, Math.PI, 0]}>
      <primitive object={fuselageShape} />
      <primitive object={cockpit} />
      
      {/* Swept-back Wings */}
      <mesh position={[-0.5, -0.2, 0]} rotation={[0, -0.4, -0.1]}>
        <extrudeGeometry args={[wingShape, extrudeSettings]} />
        <primitive object={wingMaterial} />
        {/* Winglet */}
        <mesh position={[8, -0.5, 0]} rotation={[0.4, 0, 0.5]}>
            <extrudeGeometry args={[wingletShape, wingletExtrudeSettings]} />
            <primitive object={wingMaterial} />
        </mesh>
      </mesh>
      <mesh position={[0.5, -0.2, 0]} rotation={[0, 0.4, 0.1]} scale={[-1, 1, 1]}>
        <extrudeGeometry args={[wingShape, extrudeSettings]} />
        <primitive object={wingMaterial} />
         {/* Winglet */}
        <mesh position={[8, -0.5, 0]} rotation={[0.4, 0, 0.5]}>
            <extrudeGeometry args={[wingletShape, wingletExtrudeSettings]} />
            <primitive object={wingMaterial} />
        </mesh>
      </mesh>
      
      {/* Engines */}
      <group position={[-3.5, -1, -1]} rotation={[0, 0.1, 0]}>
        <EngineMesh color={FUEL_CONFIGS[fuelType].color} label="ENG 1" />
      </group>
      <group position={[3.5, -1, -1]} rotation={[0, -0.1, 0]}>
        <EngineMesh color={FUEL_CONFIGS[fuelType].color} label="ENG 2" />
      </group>

      {/* Tail Fin (Vertical Stabilizer) */}
      <mesh position={[0, 2, -7]} rotation={[0, 0, 0.05]}>
        <extrudeGeometry 
            args={[
              new THREE.Shape()
                .moveTo(0, 0)
                .lineTo(0, 3)
                .lineTo(-1, 3.5)
                .lineTo(-2.5, -1)
                .closePath(),
              { depth: 0.15, bevelEnabled: true, bevelSize: 0.1, bevelThickness: 0.05 }
            ]} 
          />
        <primitive object={tailMaterial} />
      </mesh>

      {/* Horizontal Stabilizers */}
       <mesh position={[-1.5, 0, -7.5]} rotation={[0, -0.5, 0]}>
        <extrudeGeometry 
            args={[
              new THREE.Shape()
                .moveTo(0, 0)
                .lineTo(3, 0.2)
                .lineTo(3, -0.2)
                .lineTo(0, -0.3)
                .closePath(),
              { depth: 0.1, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 }
            ]} 
          />
        <primitive object={tailMaterial} />
      </mesh>
       <mesh position={[1.5, 0, -7.5]} rotation={[0, 0.5, 0]} scale={[-1, 1, 1]}>
        <extrudeGeometry 
            args={[
              new THREE.Shape()
                .moveTo(0, 0)
                .lineTo(3, 0.2)
                .lineTo(3, -0.2)
                .lineTo(0, -0.3)
                .closePath(),
              { depth: 0.1, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 }
            ]} 
          />
        <primitive object={tailMaterial} />
      </mesh>
    </group>
  );
};

export const EngineMesh = ({ color, label }: { color: string, label: string }) => {
    const { setInspectedPart, setModalOpen } = useAppContext();
    const [hovered, setHover] = React.useState(false);

    const handleEngineClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        setInspectedPart(label);
        setModalOpen(true);
    };

    const darkMaterial = React.useMemo(() => new THREE.MeshStandardMaterial({ color: "#374151", metalness: 0.9, roughness: 0.4 }), []);
    const metalMaterial = React.useMemo(() => new THREE.MeshStandardMaterial({ color: "#9ca3af", metalness: 1, roughness: 0.2 }), []);

    return (
        <group 
            onClick={handleEngineClick}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            scale={[0.8, 0.8, 0.8]}
        >
            {/* Nacelle (Engine Casing) */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[1.2, 1, 3, 32]} />
                <primitive object={hovered ? metalMaterial : darkMaterial} />
            </mesh>
             {/* Intake Lip */}
            <mesh position={[0, 0, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[1.2, 0.1, 16, 32]} />
                <primitive object={metalMaterial} />
            </mesh>

            {/* Exhaust Cone */}
            <mesh position={[0, 0, -1.5]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.8, 0.5, 0.5, 32]} />
                 <primitive object={darkMaterial} />
            </mesh>

            {/* Fan blades glow */}
            <mesh position={[0, 0, 1.2]} rotation={[Math.PI/2, 0, 0]}>
                <circleGeometry args={[1, 32]} />
                <meshStandardMaterial 
                    color={color} 
                    side={THREE.DoubleSide} 
                    emissive={color} 
                    emissiveIntensity={hovered ? 2 : 0.5} 
                />
            </mesh>
            
            {hovered && (
                <Html position={[0, 2, 0]} center distanceFactor={10}>
                    <div className="bg-aero-900/90 border border-aero-neon text-aero-neon px-2 py-1 text-xs font-mono whitespace-nowrap rounded pointer-events-none">
                        CLICK TO INSPECT: {label}
                    </div>
                </Html>
            )}
        </group>
    );
};

// 2. Airport Infrastructure
const Airport = ({ viewMode }: { viewMode: ViewMode }) => {
  const runwayMaterial = React.useMemo(() => new THREE.MeshStandardMaterial({ color: "#2c3e50", roughness: 0.8 }), []);
  const grassMaterial = React.useMemo(() => new THREE.MeshStandardMaterial({ color: "#2d572c" }), []);
  const markingMaterial = React.useMemo(() => new THREE.MeshBasicMaterial({ color: "#ffffff" }), []);

  return (
    <group position={[0, -5, 0]}>
        {/* Seamless Green Background */}
        <mesh position={[0, -0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[500, 500]} />
            <primitive object={grassMaterial} />
        </mesh>
        
        {/* Main Runway */}
        <mesh position={[-10, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[8, 80]} />
            <primitive object={runwayMaterial} />
        </mesh>
        {/* Runway Markings */}
        <mesh position={[-10, -0.09, 35]} rotation={[-Math.PI/2, 0, 0]}>
            <planeGeometry args={[4, 8]} />
            <primitive object={markingMaterial} />
        </mesh>
         <mesh position={[-10, -0.09, 0]} rotation={[-Math.PI/2, 0, 0]}>
            <planeGeometry args={[0.2, 20]} />
            <primitive object={markingMaterial} />
        </mesh>

        {/* Taxiways */}
         <mesh position={[5, -0.1, 10]} rotation={[-Math.PI / 2, 0, -0.8]}>
            <planeGeometry args={[4, 40]} />
            <primitive object={runwayMaterial} />
        </mesh>

        {/* Terminal Area Apron */}
         <mesh position={[30, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[40, 50]} />
            <primitive object={runwayMaterial} />
        </mesh>

        {/* Main Terminal (Stylized) */}
        <mesh position={[48, 2, 0]}>
            <boxGeometry args={[10, 4, 50]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>
         <mesh position={[48, 4, 0]}>
            <boxGeometry args={[12, 0.5, 52]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Airfield Infrastructure Markers */}
        {CRANFIELD_MARKERS.map((marker) => (
            <group key={marker.id} position={new THREE.Vector3(...marker.position)}>
                <Marker3D data={marker} viewMode={viewMode} />
            </group>
        ))}

        {/* Static Ground Vehicles */}
        <GroundVehicle position={[25, -0.1, 10]} rotation={[0, -0.8, 0]}/>
        <GroundVehicle position={[28, -0.1, 5]} />
    </group>
  );
};

const GroundVehicle: React.FC<ComponentPropsWithoutRef<'group'>> = (props) => (
    <group {...props}>
        <mesh>
            <boxGeometry args={[1, 0.5, 2]} />
            <meshStandardMaterial color="orange" />
        </mesh>
        <mesh position={[0, -0.2, 0.8]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial color="black" />
        </mesh>
         <mesh position={[0, -0.2, -0.8]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial color="black" />
        </mesh>
    </group>
)

const Marker3D = ({ data, viewMode }: { data: MarkerData, viewMode: ViewMode }) => {
    const [open, setOpen] = React.useState(false);
    const [hovered, setHover] = React.useState(false);

    React.useEffect(() => {
        if (viewMode !== ViewMode.AIRPORT) {
            setOpen(false);
        }
    }, [viewMode]);

    const infrastructureMaterial = React.useMemo(() => new THREE.MeshStandardMaterial({ color: "#7f8ea0", metalness: 0.8, roughness: 0.3 }), []);
    const highlightMaterial = React.useMemo(() => new THREE.MeshStandardMaterial({ color: "#00f3ff", emissive: "#00f3ff", emissiveIntensity: 2 }), []);
    
    const model = React.useMemo(() => {
        const group = new THREE.Group();
        switch (data.id) {
            case 'h2-farm':
                const tank = new THREE.Mesh(new THREE.SphereGeometry(2.5, 32, 32), infrastructureMaterial);
                const support = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.5, 32), infrastructureMaterial);
                support.position.y = -2.5;
                group.add(tank, support);
                break;
            case 'electrolyzer':
                const building = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 4), infrastructureMaterial);
                const pipes = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 5, 16), highlightMaterial);
                pipes.rotation.z = Math.PI / 2;
                pipes.position.set(0, 0, 2.5);
                group.add(building, pipes);
                break;
            case 'refuel-truck':
                const chassis = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 4), highlightMaterial);
                const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1, 1.5), infrastructureMaterial);
                cabin.position.set(0, 1, 1);
                group.add(chassis, cabin);
                break;
        }
        return group;
    }, [data.id, infrastructureMaterial, highlightMaterial]);

    return (
        <group onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
            <primitive object={model} />
            <Html position={[0, 4, 0]} center zIndexRange={[100, 0]}>
                <div 
                    className="relative group transition-transform duration-300 ease-in-out"
                    style={{ transform: `scale(${hovered || open ? 1.1 : 1})` }}
                >
                    <button 
                        className="w-10 h-10 rounded-full border-2 border-aero-neon bg-aero-900/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 shadow-lg shadow-aero-neon/20"
                        onClick={() => setOpen(!open)}
                    >
                        <div className="w-3 h-3 rounded-full bg-aero-neon animate-pulse" />
                    </button>
                    {open && (
                        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-56 bg-aero-900/95 border border-aero-neon/50 text-white p-4 rounded-lg backdrop-blur-md shadow-2xl shadow-aero-neon/20 animate-fade-in">
                            <h3 className="font-bold text-md text-aero-neon mb-2 font-mono uppercase tracking-widest">{data.label}</h3>
                            <p className="text-xs text-slate-300 mb-3 leading-snug">{data.description}</p>
                            <div className="space-y-1 border-t-2 border-aero-neon/30 pt-2">
                                {Object.entries(data.stats).map(([k, v]) => (
                                    <div key={k} className="flex justify-between text-xs font-mono">
                                        <span className="text-slate-400">{k}:</span>
                                        <span className="text-white font-bold">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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

    useFrame((state) => {
        // Target positions for each mode
        const targetPos = new THREE.Vector3(0, 0, 0);
        
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

/** Wrapper to make the Aircraft clickable and navigate to visualizer */
const ClickableAircraft = ({ fuelType }: { fuelType: FuelType }) => {
  const router = useRouter();
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        router.push('/airplane/default');
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      <Aircraft fuelType={fuelType} />
    </group>
  );
};

export const Scene3D: React.FC = () => {
  const { viewMode, fuelType, promoMode } = useAppContext();

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
                <ClickableAircraft fuelType={fuelType} />
             </Float>
        </group>

        <group visible={viewMode === ViewMode.AIRPORT}>
            <Airport viewMode={viewMode} />
             {/* Show aircraft landed in airport mode */}
            <group position={[-10, -4.3, 15]} rotation={[0, -Math.PI / 2, 0]} scale={[0.8, 0.8, 0.8]}>
                 <ClickableAircraft fuelType={fuelType} />
            </group>
        </group>

        <group visible={viewMode === ViewMode.GLOBAL}>
            <Globe />
        </group>

      </Canvas>
    </div>
  );
};
