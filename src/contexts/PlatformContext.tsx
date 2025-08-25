import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Platform = 'green-finance' | 'financed-emissions';

interface PlatformContextType {
  currentPlatform: Platform | null;
  setPlatform: (platform: Platform) => void;
  clearPlatform: () => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

interface PlatformProviderProps {
  children: ReactNode;
}

export function PlatformProvider({ children }: PlatformProviderProps) {
  const [currentPlatform, setCurrentPlatform] = useState<Platform | null>(null);

  useEffect(() => {
    // Only auto-load saved platform if not on root path
    // This ensures app.peercarbon.earth always shows platform selection
    if (window.location.pathname !== '/') {
      const savedPlatform = localStorage.getItem('peercarbon-platform') as Platform | null;
      if (savedPlatform && (savedPlatform === 'green-finance' || savedPlatform === 'financed-emissions')) {
        setCurrentPlatform(savedPlatform);
      }
    }
  }, []);

  const setPlatform = (platform: Platform) => {
    setCurrentPlatform(platform);
    localStorage.setItem('peercarbon-platform', platform);
  };

  const clearPlatform = () => {
    setCurrentPlatform(null);
    localStorage.removeItem('peercarbon-platform');
  };

  return (
    <PlatformContext.Provider value={{ currentPlatform, setPlatform, clearPlatform }}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (context === undefined) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
}