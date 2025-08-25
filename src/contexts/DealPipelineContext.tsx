
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { masterSchoolProjects, getProjectById } from '@/lib/masterData';

export interface ProjectType {
  id: string;
  name: string;
  location: string;
  status: string;
  progress: number;
  funding: string;
  beneficiaries: string;
  category: string;
  lastUpdated: string;
  milestones: { completed: number; total: number };
  // Additional investment-focused fields
  roi?: string;
  fundingGap?: string;
  carbonCredits?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  investmentTimeline?: string;
  // New lifecycle fields
  lifecycleStatus?: 'concept' | 'planning' | 'due_diligence' | 'approved' | 'active' | 'deployed' | 'completed' | 'cancelled';
  dueDiligenceComplete?: boolean;
  investmentCommittee?: 'pending' | 'approved' | 'rejected';
}

// Convert master data to pipeline project format
const convertMasterDataToProjectType = (masterProject: any): ProjectType => {
  return {
    id: masterProject.id,
    name: masterProject.schoolName,
    location: `${masterProject.region}, ${masterProject.country}`,
    status: masterProject.status,
    progress: masterProject.progress,
    funding: `$${masterProject.financials.totalInvestment.toLocaleString()}`,
    beneficiaries: `${masterProject.studentsCount} students`,
    category: masterProject.assetType,
    lastUpdated: masterProject.timeline.lastUpdate,
    milestones: {
      completed: Math.floor(masterProject.progress / 20),
      total: 5
    },
    roi: `${Math.round(((masterProject.financials.expectedRevenue.payAsYouCook + masterProject.financials.expectedRevenue.carbonCredits + masterProject.financials.expectedRevenue.fuelSavings) / masterProject.financials.totalInvestment - 1) * 100)}%`,
    fundingGap: masterProject.financials.disbursed < masterProject.financials.totalInvestment 
      ? `$${(masterProject.financials.totalInvestment - masterProject.financials.disbursed).toLocaleString()}`
      : '$0',
    carbonCredits: `${masterProject.mrvData.carbonCreditsPerMonth.toFixed(1)} tCO₂/month`,
    riskLevel: masterProject.riskLevel,
    investmentTimeline: masterProject.timeline.nextVerification,
    lifecycleStatus: masterProject.verificationStage === 'verified' ? 'completed' : 
                    masterProject.verificationStage === 'operational' ? 'active' :
                    masterProject.verificationStage === 'construction' ? 'approved' :
                    masterProject.verificationStage === 'planning' ? 'due_diligence' : 'concept',
    dueDiligenceComplete: masterProject.verificationStage !== 'concept',
    investmentCommittee: masterProject.verificationStage === 'verified' || masterProject.verificationStage === 'operational' ? 'approved' : 'pending'
  };
};

interface DealPipelineContextType {
  pipelineProjects: ProjectType[];
  addToPipeline: (project: ProjectType) => void;
  removeFromPipeline: (projectId: string) => void;
  isInPipeline: (projectId: string) => boolean;
  clearPipeline: () => void;
  updateProjectStatus: (projectId: string, status: string) => void;
  pipelineCount: number;
  selectedForComparison: string[];
  toggleForComparison: (projectId: string) => void;
  clearComparison: () => void;
  // New workflow methods
  submitForApproval: (projectId: string) => void;
  approveForInvestment: (projectId: string, investmentAmount: number) => void;
  moveToPortfolio: (projectId: string) => void;
  getProjectsByStatus: (status: string) => ProjectType[];
  // Master data integration
  loadMasterDataProjects: () => void;
  masterDataProjects: ProjectType[];
}

const DealPipelineContext = createContext<DealPipelineContextType | undefined>(undefined);

export const DealPipelineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [pipelineProjects, setPipelineProjects] = useState<ProjectType[]>([]);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [masterDataProjects, setMasterDataProjects] = useState<ProjectType[]>([]);
  
  // Load master data projects on mount
  useEffect(() => {
    loadMasterDataProjects();
  }, []);
  
  useEffect(() => {
    const savedPipeline = localStorage.getItem('dealPipeline');
    if (savedPipeline) {
      setPipelineProjects(JSON.parse(savedPipeline));
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('dealPipeline', JSON.stringify(pipelineProjects));
  }, [pipelineProjects]);
  
  const loadMasterDataProjects = () => {
    const convertedProjects = masterSchoolProjects.map(convertMasterDataToProjectType);
    setMasterDataProjects(convertedProjects);
  };
  
  const addToPipeline = (project: ProjectType) => {
    if (!isInPipeline(project.id)) {
      const pipelineProject = {
        ...project,
        lifecycleStatus: project.lifecycleStatus || 'concept' as const,
        dueDiligenceComplete: project.dueDiligenceComplete || false,
        investmentCommittee: project.investmentCommittee || 'pending' as const
      };
      setPipelineProjects([...pipelineProjects, pipelineProject]);
      toast({
        title: "Added to Pipeline",
        description: `${project.name} has been added to your deal pipeline.`
      });
    } else {
      toast({
        title: "Already in Pipeline",
        description: `${project.name} is already in your deal pipeline.`
      });
    }
  };
  
  const removeFromPipeline = (projectId: string) => {
    const project = pipelineProjects.find(p => p.id === projectId);
    setPipelineProjects(pipelineProjects.filter(p => p.id !== projectId));
    
    setSelectedForComparison(selectedForComparison.filter(id => id !== projectId));
    
    if (project) {
      toast({
        title: "Removed from Pipeline",
        description: `${project.name} has been removed from your deal pipeline.`
      });
    }
  };
  
  const isInPipeline = (projectId: string) => {
    return pipelineProjects.some(p => p.id === projectId);
  };
  
  const clearPipeline = () => {
    setPipelineProjects([]);
    setSelectedForComparison([]);
    toast({
      title: "Pipeline Cleared",
      description: "All projects have been removed from your deal pipeline."
    });
  };
  
  const updateProjectStatus = (projectId: string, status: string) => {
    setPipelineProjects(pipelineProjects.map(p => 
      p.id === projectId ? { ...p, status } : p
    ));
    
    // Also update master data if project exists there
    const masterProject = getProjectById(projectId);
    if (masterProject) {
      // Update the pipeline project with fresh master data
      const updatedProject = convertMasterDataToProjectType(masterProject);
      setPipelineProjects(pipelineProjects.map(p => 
        p.id === projectId ? { ...p, ...updatedProject, status } : p
      ));
    }
  };

  const submitForApproval = (projectId: string) => {
    setPipelineProjects(pipelineProjects.map(p => 
      p.id === projectId 
        ? { 
            ...p, 
            lifecycleStatus: 'due_diligence',
            dueDiligenceComplete: true,
            investmentCommittee: 'pending'
          } 
        : p
    ));
    
    toast({
      title: "Submitted for Approval",
      description: "Project has been submitted to the investment committee."
    });
  };

  const approveForInvestment = (projectId: string, investmentAmount: number) => {
    setPipelineProjects(pipelineProjects.map(p => 
      p.id === projectId 
        ? { 
            ...p, 
            lifecycleStatus: 'approved',
            investmentCommittee: 'approved',
            funding: `$${investmentAmount.toLocaleString()}`
          } 
        : p
    ));
    
    toast({
      title: "Investment Approved",
      description: `Investment of $${investmentAmount.toLocaleString()} has been approved.`
    });
  };

  const moveToPortfolio = (projectId: string) => {
    const project = pipelineProjects.find(p => p.id === projectId);
    if (project && project.lifecycleStatus === 'approved') {
      // Remove from pipeline since it's moving to portfolio
      removeFromPipeline(projectId);
      
      toast({
        title: "Moved to Portfolio",
        description: `${project.name} has been moved to your active portfolio.`
      });
    }
  };

  const getProjectsByStatus = (status: string) => {
    return pipelineProjects.filter(p => p.lifecycleStatus === status);
  };
  
  const toggleForComparison = (projectId: string) => {
    if (selectedForComparison.includes(projectId)) {
      setSelectedForComparison(selectedForComparison.filter(id => id !== projectId));
    } else {
      if (selectedForComparison.length < 3) {
        setSelectedForComparison([...selectedForComparison, projectId]);
      } else {
        toast({
          title: "Comparison Limit Reached",
          description: "You can compare up to 3 projects at a time."
        });
      }
    }
  };
  
  const clearComparison = () => {
    setSelectedForComparison([]);
  };
  
  return (
    <DealPipelineContext.Provider value={{
      pipelineProjects,
      addToPipeline,
      removeFromPipeline,
      isInPipeline,
      clearPipeline,
      updateProjectStatus,
      pipelineCount: pipelineProjects.length,
      selectedForComparison,
      toggleForComparison,
      clearComparison,
      submitForApproval,
      approveForInvestment,
      moveToPortfolio,
      getProjectsByStatus,
      loadMasterDataProjects,
      masterDataProjects
    }}>
      {children}
    </DealPipelineContext.Provider>
  );
};

export const useDealPipeline = () => {
  const context = useContext(DealPipelineContext);
  if (context === undefined) {
    throw new Error('useDealPipeline must be used within a DealPipelineProvider');
  }
  return context;
};
