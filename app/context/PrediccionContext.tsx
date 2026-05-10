import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PrediccionResult } from '@/types';

interface PrediccionContextType {
  prediccion: PrediccionResult | null;
  setPrediccion: (p: PrediccionResult | null) => void;
}

const PrediccionContext = createContext<PrediccionContextType>({
  prediccion: null,
  setPrediccion: () => {},
});

export function PrediccionProvider({ children }: { children: ReactNode }) {
  const [prediccion, setPrediccion] = useState<PrediccionResult | null>(null);
  return (
    <PrediccionContext.Provider value={{ prediccion, setPrediccion }}>
      {children}
    </PrediccionContext.Provider>
  );
}

export function usePrediccion() {
  return useContext(PrediccionContext);
}
