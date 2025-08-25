
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getProjectById } from '@/lib/masterData';

interface ProjectContext {
  projectId: string;
  schoolName: string;
  assetType: string;
  location: string;
  totalValue: number;
  expectedRevenue: {
    payAsYouCook: number;
    carbonCredits: number;
    fuelSavings: number;
  };
  currentPhase: number;
  setCurrentPhase: (phase: number) => void;
}

const ProjectContextContext = createContext<ProjectContext | null>(null);

interface ProjectContextProviderProps {
  children: React.ReactNode;
  projectId: string;
}

export function ProjectContextProvider({ children, projectId }: ProjectContextProviderProps) {
  const [currentPhase, setCurrentPhase] = useState(1);
  
  // Get project data from master data
  const projectData = getProjectById(projectId);
  
  // Fallback to default if project not found
  const contextValue = projectData ? {
    projectId: projectData.id,
    schoolName: projectData.schoolName,
    assetType: projectData.assetType,
    location: `${projectData.region}, ${projectData.country}`,
    totalValue: projectData.financials.totalValue,
    expectedRevenue: projectData.financials.expectedRevenue,
    currentPhase,
    setCurrentPhase
  } : {
    projectId,
    schoolName: "Kibera Primary School",
    assetType: "EcoBox Cookstove",
    location: "Nairobi, Kenya",
    totalValue: 45000,
    expectedRevenue: {
      payAsYouCook: 12000,
      carbonCredits: 8500,
      fuelSavings: 6200
    },
    currentPhase,
    setCurrentPhase
  };

  return (
    <ProjectContextContext.Provider value={contextValue}>
      {children}
    </ProjectContextContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContextContext);
  if (!context) {
    throw new Error('useProjectContext must be used within ProjectContextProvider');
  }
  return context;
}
