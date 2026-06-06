import React, { createContext, ReactNode } from 'react';

const AIContext = createContext<null>(null);

export function AIProvider({ children }: { children: ReactNode }) {
  return (
    <AIContext.Provider value={null}>
      {children}
    </AIContext.Provider>
  );
}
