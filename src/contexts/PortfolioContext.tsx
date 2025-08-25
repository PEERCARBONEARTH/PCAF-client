
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ProjectType } from '@/contexts/DealPipelineContext';
import { ProjectLifecycleStatus, ProjectStage, useProjectLifecycle } from '@/hooks/useProjectLifecycle';
import { masterSchoolProjects, getProjectById } from '@/lib/masterData';

export interface PortfolioProject extends ProjectType {
  lifecycleStatus: ProjectLifecycleStatus;
  stage: ProjectStage;
  investmentAmount?: number;
  firstDisbursementDate?: string;
  lastDisbursementDate?: string;
  totalDisbursed?: number;
  expectedTotalDisbursement?: number;
  activeTrancheCount?: number;
  completedTrancheCount?: number;
  // Additional master data fields
  studentsCount?: number;
  carbonCreditsPerMonth?: number;
  fuelSavingsPerMonth?: number;
  healthBeneficiaries?: number;
  dataQualityScore?: number;
  verificationStage?: string;
}

interface PortfolioContextType {
  portfolioProjects: PortfolioProject[];
  addToPortfolio: (project: ProjectType, investmentAmount: number) => void;
  removeFromPortfolio: (projectId: string) => void;
  updateProjectStatus: (projectId: string, status: ProjectLifecycleStatus, notes?: string) => void;
  approveInvestment: (projectId: string, investmentAmount: number) => void;
  recordDisbursement: (projectId: string, amount: number, trancheId: string) => void;
  isInPortfolio: (projectId: string) => boolean;
  getProjectsByStage: (stage: ProjectStage) => PortfolioProject[];
  portfolioStats: {
    totalProjects: number;
    totalInvested: number;
    totalDisbursed: number;
    activeProjects: number;
    completedProjects: number;
    totalStudents: number;
    totalCarbonCredits: number;
    totalBeneficiaries: number;
    avgDataQuality: number;
  };
  loadMasterDataPortfolio: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const { getProjectStage, transitionProject } = useProjectLifecycle();
  const [portfolioProjects, setPortfolioProjects] = useState<PortfolioProject[]>([]);

  // Load master data on mount
  useEffect(() => {
    loadMasterDataPortfolio();
  }, []);

  // Load portfolio from localStorage
  useEffect(() => {
    const savedPortfolio = localStorage.getItem('portfolioProjects');
    if (savedPortfolio) {
      const parsed = JSON.parse(savedPortfolio);
      // Merge with master data to ensure consistency
      const mergedPortfolio = parsed.map((project: PortfolioProject) => {
        const masterProject = getProjectById(project.id);
        if (masterProject) {
          return {
            ...project,
            studentsCount: masterProject.studentsCount,
            carbonCreditsPerMonth: masterProject.mrvData.carbonCreditsPerMonth,
            fuelSavingsPerMonth: masterProject.mrvData.fuelSavingsKgPerMonth,
            healthBeneficiaries: masterProject.mrvData.healthBeneficiaries,
            dataQualityScore: masterProject.mrvData.dataQualityScore,
            verificationStage: masterProject.verificationStage,
            progress: masterProject.progress,
            name: masterProject.schoolName,
            location: `${masterProject.region}, ${masterProject.country}`
          };
        }
        return project;
      });
      setPortfolioProjects(mergedPortfolio);
    }
  }, []);

  // Save portfolio to localStorage
  useEffect(() => {
    localStorage.setItem('portfolioProjects', JSON.stringify(portfolioProjects));
  }, [portfolioProjects]);

  const loadMasterDataPortfolio = () => {
    // Load active and completed projects from master data
    const activeProjects = masterSchoolProjects
      .filter(project => project.status === 'active' || project.status === 'completed')
      .map(masterProject => {
        const portfolioProject: PortfolioProject = {
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
          lifecycleStatus: masterProject.status === 'completed' ? 'completed' : 'active',
          stage: masterProject.status === 'completed' ? 'asset_management' : 'portfolio',
          investmentAmount: masterProject.financials.totalInvestment,
          totalDisbursed: masterProject.financials.disbursed,
          expectedTotalDisbursement: masterProject.financials.totalInvestment,
          firstDisbursementDate: masterProject.timeline.operationalStart,
          lastDisbursementDate: masterProject.timeline.lastUpdate,
          activeTrancheCount: masterProject.status === 'active' ? 1 : 0,
          completedTrancheCount: masterProject.status === 'completed' ? 1 : 0,
          studentsCount: masterProject.studentsCount,
          carbonCreditsPerMonth: masterProject.mrvData.carbonCreditsPerMonth,
          fuelSavingsPerMonth: masterProject.mrvData.fuelSavingsKgPerMonth,
          healthBeneficiaries: masterProject.mrvData.healthBeneficiaries,
          dataQualityScore: masterProject.mrvData.dataQualityScore,
          verificationStage: masterProject.verificationStage,
          riskLevel: masterProject.riskLevel
        };
        return portfolioProject;
      });
    
    // Only load if portfolio is empty to avoid overwriting user data
    if (portfolioProjects.length === 0) {
      setPortfolioProjects(activeProjects);
    }
  };

  const addToPortfolio = (project: ProjectType, investmentAmount: number) => {
    if (!isInPortfolio(project.id)) {
      const masterProject = getProjectById(project.id);
      const portfolioProject: PortfolioProject = {
        ...project,
        lifecycleStatus: 'approved',
        stage: 'portfolio',
        investmentAmount,
        totalDisbursed: 0,
        expectedTotalDisbursement: investmentAmount,
        activeTrancheCount: 0,
        completedTrancheCount: 0,
        // Add master data fields if available
        studentsCount: masterProject?.studentsCount,
        carbonCreditsPerMonth: masterProject?.mrvData.carbonCreditsPerMonth,
        fuelSavingsPerMonth: masterProject?.mrvData.fuelSavingsKgPerMonth,
        healthBeneficiaries: masterProject?.mrvData.healthBeneficiaries,
        dataQualityScore: masterProject?.mrvData.dataQualityScore,
        verificationStage: masterProject?.verificationStage
      };
      
      setPortfolioProjects([...portfolioProjects, portfolioProject]);
      
      toast({
        title: "Added to Portfolio",
        description: `${project.name} has been approved and added to your portfolio.`
      });
    }
  };

  const removeFromPortfolio = (projectId: string) => {
    const project = portfolioProjects.find(p => p.id === projectId);
    setPortfolioProjects(portfolioProjects.filter(p => p.id !== projectId));
    
    if (project) {
      toast({
        title: "Removed from Portfolio",
        description: `${project.name} has been removed from your portfolio.`
      });
    }
  };

  const updateProjectStatus = async (projectId: string, status: ProjectLifecycleStatus, notes?: string) => {
    const project = portfolioProjects.find(p => p.id === projectId);
    if (!project) return;

    await transitionProject(projectId, project.lifecycleStatus, status, 'manual', notes);
    
    setPortfolioProjects(portfolioProjects.map(p => 
      p.id === projectId 
        ? { 
            ...p, 
            lifecycleStatus: status,
            stage: getProjectStage(status)
          } 
        : p
    ));
  };

  const approveInvestment = (projectId: string, investmentAmount: number) => {
    setPortfolioProjects(portfolioProjects.map(p => 
      p.id === projectId 
        ? { 
            ...p, 
            lifecycleStatus: 'approved' as ProjectLifecycleStatus,
            stage: 'portfolio' as ProjectStage,
            investmentAmount,
            expectedTotalDisbursement: investmentAmount
          } 
        : p
    ));
  };

  const recordDisbursement = async (projectId: string, amount: number, trancheId: string) => {
    const project = portfolioProjects.find(p => p.id === projectId);
    if (!project) return;

    const isFirstDisbursement = !project.firstDisbursementDate;
    const newTotalDisbursed = (project.totalDisbursed || 0) + amount;

    setPortfolioProjects(portfolioProjects.map(p => 
      p.id === projectId 
        ? { 
            ...p,
            totalDisbursed: newTotalDisbursed,
            firstDisbursementDate: isFirstDisbursement ? new Date().toISOString() : p.firstDisbursementDate,
            lastDisbursementDate: new Date().toISOString(),
            completedTrancheCount: (p.completedTrancheCount || 0) + 1,
            lifecycleStatus: isFirstDisbursement ? 'active' : p.lifecycleStatus
          } 
        : p
    ));

    // Auto-transition to active status on first disbursement
    if (isFirstDisbursement) {
      await transitionProject(projectId, project.lifecycleStatus, 'active', 'first_disbursement');
    }
  };

  const isInPortfolio = (projectId: string) => {
    return portfolioProjects.some(p => p.id === projectId);
  };

  const getProjectsByStage = (stage: ProjectStage) => {
    return portfolioProjects.filter(p => p.stage === stage);
  };

  const portfolioStats = {
    totalProjects: portfolioProjects.length,
    totalInvested: portfolioProjects.reduce((sum, p) => sum + (p.investmentAmount || 0), 0),
    totalDisbursed: portfolioProjects.reduce((sum, p) => sum + (p.totalDisbursed || 0), 0),
    activeProjects: portfolioProjects.filter(p => p.lifecycleStatus === 'active').length,
    completedProjects: portfolioProjects.filter(p => p.lifecycleStatus === 'completed').length,
    totalStudents: portfolioProjects.reduce((sum, p) => sum + (p.studentsCount || 0), 0),
    totalCarbonCredits: portfolioProjects.reduce((sum, p) => sum + (p.carbonCreditsPerMonth || 0), 0),
    totalBeneficiaries: portfolioProjects.reduce((sum, p) => sum + (p.healthBeneficiaries || 0), 0),
    avgDataQuality: portfolioProjects.length > 0 
      ? portfolioProjects.reduce((sum, p) => sum + (p.dataQualityScore || 0), 0) / portfolioProjects.length 
      : 0
  };

  return (
    <PortfolioContext.Provider value={{
      portfolioProjects,
      addToPortfolio,
      removeFromPortfolio,
      updateProjectStatus,
      approveInvestment,
      recordDisbursement,
      isInPortfolio,
      getProjectsByStage,
      portfolioStats,
      loadMasterDataPortfolio
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
