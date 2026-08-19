import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface DatasetContextType {
  sessionId: string | null;
  datasetInfo: any | null;
  datasetProfile: any | null;
  datasetRecommendations: any | null;
  modelResults: any | null;
  globalExplanations: any | null;
  setSessionId: (id: string | null) => void;
  setDatasetInfo: (info: any | null) => void;
  setDatasetProfile: (profile: any | null) => void;
  setDatasetRecommendations: (recs: any | null) => void;
  setModelResults: (results: any | null) => void;
  setGlobalExplanations: (explanations: any | null) => void;
  isProfileLoading: boolean;
  setIsProfileLoading: (isLoading: boolean) => void;
  isRecommendationsLoading: boolean;
  setIsRecommendationsLoading: (isLoading: boolean) => void;
  isTrainingModels: boolean;
  setIsTrainingModels: (isLoading: boolean) => void;
  isExplainabilityLoading: boolean;
  setIsExplainabilityLoading: (isLoading: boolean) => void;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [datasetInfo, setDatasetInfo] = useState<any | null>(null);
  const [datasetProfile, setDatasetProfile] = useState<any | null>(null);
  const [datasetRecommendations, setDatasetRecommendations] = useState<any | null>(null);
  const [modelResults, setModelResults] = useState<any | null>(null);
  const [globalExplanations, setGlobalExplanations] = useState<any | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState<boolean>(false);
  const [isTrainingModels, setIsTrainingModels] = useState<boolean>(false);
  const [isExplainabilityLoading, setIsExplainabilityLoading] = useState<boolean>(false);

  return (
    <DatasetContext.Provider
      value={{
        sessionId,
        datasetInfo,
        datasetProfile,
        datasetRecommendations,
        modelResults,
        globalExplanations,
        setSessionId,
        setDatasetInfo,
        setDatasetProfile,
        setDatasetRecommendations,
        setModelResults,
        setGlobalExplanations,
        isProfileLoading,
        setIsProfileLoading,
        isRecommendationsLoading,
        setIsRecommendationsLoading,
        isTrainingModels,
        setIsTrainingModels,
        isExplainabilityLoading,
        setIsExplainabilityLoading,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  const context = useContext(DatasetContext);
  if (context === undefined) {
    throw new Error('useDataset must be used within a DatasetProvider');
  }
  return context;
}
