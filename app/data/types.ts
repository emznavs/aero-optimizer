export enum ViewMode {
  AIRCRAFT = 'AIRCRAFT',
  AIRPORT = 'AIRPORT',
  GLOBAL = 'GLOBAL'
}

export type TabId = 'editor' | 'analysis'

export enum FuelType {
  KEROSENE = 'Kerosene (Jet A-1)',
  SAF = 'Sustainable Aviation Fuel',
  LIQUID_H2 = 'Liquid Hydrogen (LH2)',
  ELECTRIC = 'Battery Electric'
}

export interface SchematicRequest {
  partName: string;
  context: string;
}

export interface MarkerData {
  id: string;
  label: string;
  position: [number, number, number];
  stats: Record<string, string>;
  description: string;
}
