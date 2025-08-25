// API service for tranche monitoring and management
export interface TrancheData {
  id: string;
  schoolName: string;
  region: string;
  trancheNumber: number;
  milestone: string;
  triggerType: string;
  targetAmount: number;
  progress: number;
  status: 'Ready to Disburse' | 'In Progress' | 'Disbursed' | 'At Risk';
  triggerMet: boolean;
  lastUpdate: string;
  verificationDate: string | null;
  country?: string;
  programId?: string;
  projectId?: string;
  beneficiaryCount?: number;
  totalHoursCooked?: number;
  targetHours?: number;
  isInPipeline?: boolean;
  isInPortfolio?: boolean;
  // New portfolio integration fields
  projectLifecycleStatus?: 'concept' | 'planning' | 'due_diligence' | 'approved' | 'active' | 'deployed' | 'completed' | 'cancelled';
  portfolioStage?: 'pipeline' | 'portfolio' | 'asset_management';
  investmentAmount?: number;
  totalProjectDisbursed?: number;
}

export interface TrancheFilters {
  status?: string;
  region?: string;
  country?: string;
  milestone?: string;
  search?: string;
  projectFilter?: 'all' | 'pipeline' | 'portfolio' | 'asset_management';
  dateRange?: {
    start: string;
    end: string;
  };
  lifecycleStatus?: string;
}

export interface TranchePaginatedResponse {
  data: TrancheData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Mock API implementation - replace with actual API calls
export class TrancheAPI {
  private static baseUrl = '/api/tranches';

  // Simulate API delay
  private static delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Enhanced mock data with portfolio integration
  private static mockData: TrancheData[] = [
    {
      id: "TRN-001",
      schoolName: "Kilimani Primary School",
      region: "Nairobi, Kenya",
      trancheNumber: 1,
      milestone: "Initial Installation",
      triggerType: "100 Hours Cooked",
      targetAmount: 5000,
      progress: 100,
      status: "Ready to Disburse",
      triggerMet: true,
      lastUpdate: "2 hours ago",
      verificationDate: "2024-01-15",
      country: "Kenya",
      projectId: "PRJ-001",
      beneficiaryCount: 150,
      totalHoursCooked: 105,
      targetHours: 100,
      isInPipeline: false,
      isInPortfolio: true,
      projectLifecycleStatus: 'active',
      portfolioStage: 'portfolio',
      investmentAmount: 45000,
      totalProjectDisbursed: 15000
    },
    {
      id: "TRN-002", 
      schoolName: "Mwanza Secondary School",
      region: "Mwanza, Tanzania",
      trancheNumber: 2,
      milestone: "Performance Milestone",
      triggerType: "200 Hours Cooked",
      targetAmount: 7500,
      progress: 85,
      status: "In Progress",
      triggerMet: false,
      lastUpdate: "6 hours ago",
      verificationDate: null,
      country: "Tanzania",
      projectId: "PRJ-002",
      beneficiaryCount: 300,
      totalHoursCooked: 170,
      targetHours: 200,
      isInPipeline: false,
      isInPortfolio: true,
      projectLifecycleStatus: 'active',
      portfolioStage: 'portfolio',
      investmentAmount: 62000,
      totalProjectDisbursed: 22500
    },
    {
      id: "TRN-003",
      schoolName: "Kampala Technical Institute",
      region: "Kampala, Uganda", 
      trancheNumber: 1,
      milestone: "Initial Installation",
      triggerType: "50 Hours Cooked",
      targetAmount: 3000,
      progress: 100,
      status: "Disbursed",
      triggerMet: true,
      lastUpdate: "2 days ago",
      verificationDate: "2024-01-10",
      country: "Uganda",
      projectId: "PRJ-003",
      beneficiaryCount: 80,
      totalHoursCooked: 65,
      targetHours: 50,
      isInPipeline: false,
      isInPortfolio: true,
      projectLifecycleStatus: 'deployed',
      portfolioStage: 'asset_management',
      investmentAmount: 28000,
      totalProjectDisbursed: 28000
    },
    {
      id: "TRN-004",
      schoolName: "Kigali Girls School",
      region: "Kigali, Rwanda",
      trancheNumber: 3,
      milestone: "Scale-up Phase",
      triggerType: "500 Hours Cooked",
      targetAmount: 12000,
      progress: 45,
      status: "In Progress",
      triggerMet: false,
      lastUpdate: "1 day ago",
      verificationDate: null,
      country: "Rwanda",
      projectId: "PRJ-001",
      beneficiaryCount: 450,
      totalHoursCooked: 225,
      targetHours: 500,
      isInPipeline: true,
      isInPortfolio: false,
      projectLifecycleStatus: 'due_diligence',
      portfolioStage: 'pipeline',
      investmentAmount: 0,
      totalProjectDisbursed: 0
    },
    {
      id: "TRN-005",
      schoolName: "Dodoma Community School",
      region: "Dodoma, Tanzania",
      trancheNumber: 2,
      milestone: "Performance Milestone", 
      triggerType: "300 Hours Cooked",
      targetAmount: 8500,
      progress: 12,
      status: "At Risk",
      triggerMet: false,
      lastUpdate: "3 days ago",
      verificationDate: null,
      country: "Tanzania",
      projectId: "PRJ-002",
      beneficiaryCount: 200,
      totalHoursCooked: 36,
      targetHours: 300,
      isInPipeline: false,
      isInPortfolio: true,
      projectLifecycleStatus: 'active',
      portfolioStage: 'portfolio',
      investmentAmount: 52000,
      totalProjectDisbursed: 18500
    },
    {
      id: "TRN-006",
      schoolName: "Mombasa Primary School",
      region: "Mombasa, Kenya",
      trancheNumber: 1,
      milestone: "Initial Installation",
      triggerType: "75 Hours Cooked",
      targetAmount: 4200,
      progress: 100,
      status: "Ready to Disburse",
      triggerMet: true,
      lastUpdate: "5 hours ago",
      verificationDate: "2024-01-14",
      country: "Kenya",
      projectId: "PRJ-004",
      beneficiaryCount: 120,
      totalHoursCooked: 78,
      targetHours: 75,
      isInPipeline: true,
      isInPortfolio: false,
      projectLifecycleStatus: 'approved',
      portfolioStage: 'pipeline',
      investmentAmount: 0,
      totalProjectDisbursed: 0
    }
  ];

  static async getTranches(
    page: number = 1,
    limit: number = 10,
    filters: TrancheFilters = {}
  ): Promise<TranchePaginatedResponse> {
    await this.delay(500);

    let filteredData = [...this.mockData];

    if (filters.status) {
      filteredData = filteredData.filter(tranche => tranche.status === filters.status);
    }

    if (filters.region) {
      filteredData = filteredData.filter(tranche => 
        tranche.region.toLowerCase().includes(filters.region!.toLowerCase())
      );
    }

    if (filters.country) {
      filteredData = filteredData.filter(tranche => 
        tranche.country?.toLowerCase().includes(filters.country!.toLowerCase())
      );
    }

    if (filters.milestone) {
      filteredData = filteredData.filter(tranche => tranche.milestone === filters.milestone);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredData = filteredData.filter(tranche =>
        tranche.schoolName.toLowerCase().includes(searchTerm) ||
        tranche.region.toLowerCase().includes(searchTerm) ||
        tranche.milestone.toLowerCase().includes(searchTerm) ||
        tranche.id.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.projectFilter) {
      if (filters.projectFilter === 'pipeline') {
        filteredData = filteredData.filter(tranche => tranche.isInPipeline);
      } else if (filters.projectFilter === 'portfolio') {
        filteredData = filteredData.filter(tranche => tranche.isInPortfolio && tranche.portfolioStage === 'portfolio');
      } else if (filters.projectFilter === 'asset_management') {
        filteredData = filteredData.filter(tranche => tranche.portfolioStage === 'asset_management');
      }
    }

    if (filters.lifecycleStatus) {
      filteredData = filteredData.filter(tranche => tranche.projectLifecycleStatus === filters.lifecycleStatus);
    }

    const total = filteredData.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  static async getTrancheById(id: string): Promise<TrancheData | null> {
    await this.delay(300);
    return this.mockData.find(tranche => tranche.id === id) || null;
  }

  static async getTrancheStats(): Promise<{
    totalTranches: number;
    readyToDisburse: { count: number; amount: number };
    monitoring: { active: number; percentage: number };
    avgTriggerTime: number;
  }> {
    await this.delay(200);
    
    const readyTranches = this.mockData.filter(t => t.status === 'Ready to Disburse');
    const activeTranches = this.mockData.filter(t => t.status === 'In Progress');
    
    return {
      totalTranches: this.mockData.length,
      readyToDisburse: {
        count: readyTranches.length,
        amount: readyTranches.reduce((sum, t) => sum + t.targetAmount, 0)
      },
      monitoring: {
        active: activeTranches.length,
        percentage: Math.round((activeTranches.length / this.mockData.length) * 100)
      },
      avgTriggerTime: 14
    };
  }

  static async recordDisbursement(trancheId: string, projectId: string): Promise<void> {
    await this.delay(300);
    
    const trancheIndex = this.mockData.findIndex(t => t.id === trancheId);
    if (trancheIndex !== -1) {
      this.mockData[trancheIndex].status = 'Disbursed';
      this.mockData[trancheIndex].lastUpdate = 'Just now';
      
      // Trigger project lifecycle transition if this is first disbursement
      // This would integrate with the portfolio context in a real implementation
    }
  }
}
