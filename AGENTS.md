USE SHADCN COMPONENTS


avoid using complex next js stuff, this is a demo app, its client side only and only using DEMO data no api routes etc.



afetr making changes use npm run type-check to verify

when managing data, put all mock data in /app/data folder




when managing state, use this pattern for context:


put all context in /app/context folder

## State Management with React Context

We use **React Context** to share state across components without prop drilling.

### Why? (Benefits)

- **Scalability**: Enables us to split huge monolithic components into many small ones with shared state.
- **Simple & standard**: No external deps to learn. Easy for new devs or AI.
- **Modern performance**: Recent React updates fix context performance issues.
- **Auto type-safe**: Automatic type inference using the inner hook pattern.

### Example: `InputPanelsContext`

```tsx
// src/feat/input-panels/context.tsx

import { createContext, ReactNode, useContext, useState } from 'react'

export type PanelType = 'traffic-volume' | 'pedestrian-volume' | null

// 1. THE INTERNAL HOOK: Contains all state and logic. Not exported.
function useInputPanelsInner() {
  const [isOpen, setIsOpen] = useState(true)
  const [panelType, setPanelType] = useState<PanelType>('traffic-volume')

  const openPanel = (type: PanelType) => {
    setPanelType(type)
    setIsOpen(true)
  }

  const closePanel = () => {
    setIsOpen(false)
    setPanelType(null)
  }

  return { isOpen, panelType, openPanel, closePanel }
}

// 2. THE INFERRED TYPE: Automatically gets the type from the hook's return value.
type InputPanelsContextValue = ReturnType<typeof useInputPanelsInner>

const InputPanelsContext = createContext<InputPanelsContextValue | undefined>(undefined)

// 3. THE PROVIDER: Provides the value from the inner hook to its children.
export function InputPanelsProvider({ children }: { children: ReactNode }) {
  return (
    <InputPanelsContext.Provider value={useInputPanelsInner()}>
      {children}
    </InputPanelsContext.Provider>
  )
}

// 4. THE PUBLIC HOOK: Exported for components to consume the context safely.
export function useInputPanels() {
  const contextValue = useContext(InputPanelsContext)
  if (!contextValue) {
    throw new Error('useInputPanels must be used within an InputPanelsProvider')
  }
  return contextValue
}
```

### Usage in Components

```tsx
function MyComponent() {
  const { isOpen, panelType, openPanel, closePanel } = useInputPanels()
  
  return (
    <button onClick={() => openPanel('traffic-volume')}>
      Open Traffic Panel
    </button>
  )
}
```
### The `use...Inner` Pattern Explained

Ensures type safety by inferring context type from hook return value.

- **`use...Inner()`**: Internal hook with all state logic. Not exported.
- **Context Type**: Inferred via `ReturnType<typeof use...Inner>`. Changing the inner hook automatically updates this type.
- **`use...()`**: Public hook. Throws if used outside provider.
