import { createContext, useContext, useState, ReactNode } from 'react';
import { Experiment } from '@/types/api';

type ExperimentContextType = {
  selectedExperiment: Experiment | null;
  setSelectedExperiment: (experiment: Experiment | null) => void;
};

const ExperimentContext = createContext<ExperimentContextType | undefined>(undefined);

export function ExperimentProvider({ children }: { children: ReactNode }) {
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);

  return (
    <ExperimentContext.Provider value={{ selectedExperiment, setSelectedExperiment }}>
      {children}
    </ExperimentContext.Provider>
  );
}

export function useExperimentContext() {
  const context = useContext(ExperimentContext);
  if (context === undefined) {
    throw new Error('useExperimentContext must be used within an ExperimentProvider');
  }
  return context;
} 