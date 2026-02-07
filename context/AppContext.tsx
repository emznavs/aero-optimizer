"use client";

import { createContext, ReactNode, useContext, useState } from 'react'
import { ViewMode, FuelType, TabId } from '@/data/types'

// 1. THE INTERNAL HOOK: Contains all state and logic. Not exported.
function useAppContextInner() {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.AIRPORT)
  const [fuelType, setFuelType] = useState<FuelType>(FuelType.KEROSENE)
  const [promoMode, setPromoMode] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<TabId>('editor')
  const [selectedAirport, setSelectedAirport] = useState<string>('cranfield')

  const apiKeySet = !!process.env.API_KEY;

  return { 
    viewMode, 
    setViewMode, 
    fuelType, 
    setFuelType, 
    promoMode, 
    setPromoMode,
    apiKeySet,
    activeTab,
    setActiveTab,
    selectedAirport,
    setSelectedAirport,
  }
}

// 2. THE INFERRED TYPE: Automatically gets the type from the hook's return value.
type AppContextValue = ReturnType<typeof useAppContextInner>

const AppContext = createContext<AppContextValue | undefined>(undefined)

// 3. THE PROVIDER: Provides the value from the inner hook to its children.
export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AppContext.Provider value={useAppContextInner()}>
      {children}
    </AppContext.Provider>
  )
}

// 4. THE PUBLIC HOOK: Exported for components to consume the context safely.
export function useAppContext() {
  const contextValue = useContext(AppContext)
  if (!contextValue) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return contextValue
}