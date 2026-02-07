import { ViewMode, FuelType, MarkerData } from './types';

export const VIEW_STEPS = [
  { id: ViewMode.AIRCRAFT, label: 'MICRO: ARCHITECTURE' },
  { id: ViewMode.AIRPORT, label: 'MESO: INFRASTRUCTURE' },
  { id: ViewMode.GLOBAL, label: 'MACRO: NETWORK' },
];

export const FUEL_CONFIGS = {
  [FuelType.KEROSENE]: { color: '#fbbf24', emission: 0.1, morphFactor: 0 },
  [FuelType.SAF]: { color: '#4ade80', emission: 0.3, morphFactor: 0.2 },
  [FuelType.LIQUID_H2]: { color: '#00f3ff', emission: 0.8, morphFactor: 1.0 }, // Full morph
  [FuelType.ELECTRIC]: { color: '#a78bfa', emission: 0.6, morphFactor: 0.5 },
};

export const CRANFIELD_MARKERS: MarkerData[] = [
  {
    id: 'h2-farm',
    label: 'LH2 Storage Farm',
    position: [-15, 0.5, -15],
    stats: { 'Capacity': '50,000 L', 'Temp': '-253°C' },
    description: 'Cryogenic spherical storage tanks for liquid hydrogen.'
  },
  {
    id: 'electrolyzer',
    label: 'Green H2 Electrolyzer',
    position: [15, 0.5, -10],
    stats: { 'Production': '700 kg/day', 'Source': 'Solar PV' },
    description: 'On-site PEM electrolysis unit powered by airfield solar arrays.'
  },
  {
    id: 'refuel-truck',
    label: 'Mobile Refueler',
    position: [8, 0.5, 5],
    stats: { 'Flow Rate': '50 L/min', 'Safety': 'ISO 12345' },
    description: 'Autonomous refueling truck with boil-off gas management.'
  }
];

export const GLOBAL_HUBS: MarkerData[] = [
  {
    id: 'LHR',
    label: 'London Heathrow',
    position: [0.8, 0.6, 0.1], // Normalized sphere coords for simplicity in this demo
    stats: { 'Readiness': 'High', 'H2 Hub': 'Planned' },
    description: 'Primary testing hub for transatlantic H2 flights.'
  },
  {
    id: 'TLS',
    label: 'Toulouse (Airbus)',
    position: [0.85, 0.55, 0.15],
    stats: { 'Readiness': 'Active', 'Prototype': 'ZEROe' },
    description: 'Assembly and flight testing for ZEROe demonstrators.'
  },
  {
    id: 'DXB',
    label: 'Dubai Int.',
    position: [0.6, 0.4, 0.7],
    stats: { 'Readiness': 'Medium', 'Solar': 'Abundant' },
    description: 'Potential SAF refinement hub using solar energy.'
  }
];
