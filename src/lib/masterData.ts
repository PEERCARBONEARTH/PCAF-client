
export interface SchoolProject {
  id: string;
  schoolName: string;
  region: string;
  country: string;
  coordinates: [number, number]; // [longitude, latitude]
  assetType: 'EcoBox Cookstove' | 'Solar PV' | 'Water Purification';
  studentsCount: number;
  verificationStage: 'concept' | 'planning' | 'construction' | 'operational' | 'verified';
  financials: ProjectFinancials;
  mrvData: MRVMetrics;
  timeline: ProjectTimeline;
  status: 'active' | 'pending' | 'completed' | 'on_hold';
  progress: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ProjectFinancials {
  totalValue: number;
  totalInvestment: number;
  disbursed: number;
  expectedRevenue: {
    payAsYouCook: number;
    carbonCredits: number;
    fuelSavings: number;
  };
  costPerStudent: number;
  monthlyOperatingCost: number;
}

export interface MRVMetrics {
  dailyCookingHours: number;
  fuelSavingsKgPerMonth: number;
  carbonCreditsPerMonth: number;
  healthBeneficiaries: number;
  airQualityImprovement: number;
  cookingEfficiency: number;
  lastMeasurement: string;
  dataQualityScore: number;
}

export interface ProjectTimeline {
  projectStart: string;
  constructionComplete: string;
  operationalStart: string;
  nextVerification: string;
  lastUpdate: string;
}

// Master dataset of consistent school projects (MVP: 8 completed/active, 7 pipeline = 15 total max)
export const masterSchoolProjects: SchoolProject[] = [
  {
    id: "TRN-001",
    schoolName: "Kibera Primary School",
    region: "Nairobi",
    country: "Kenya",
    coordinates: [36.7822, -1.3133],
    assetType: "EcoBox Cookstove",
    studentsCount: 320,
    verificationStage: "verified",
    status: "completed",
    progress: 100,
    riskLevel: "low",
    financials: {
      totalValue: 28000,
      totalInvestment: 25000,
      disbursed: 25000,
      expectedRevenue: {
        payAsYouCook: 7200,
        carbonCredits: 5100,
        fuelSavings: 3800
      },
      costPerStudent: 78.1,
      monthlyOperatingCost: 280
    },
    mrvData: {
      dailyCookingHours: 5.5,
      fuelSavingsKgPerMonth: 180,
      carbonCreditsPerMonth: 1.2,
      healthBeneficiaries: 340,
      airQualityImprovement: 78,
      cookingEfficiency: 85,
      lastMeasurement: "2024-01-15",
      dataQualityScore: 4.2
    },
    timeline: {
      projectStart: "2023-03-15",
      constructionComplete: "2023-06-20",
      operationalStart: "2023-07-01",
      nextVerification: "2024-07-01",
      lastUpdate: "2024-01-15"
    }
  },
  {
    id: "TRN-002",
    schoolName: "Mwanza Secondary School",
    region: "Mwanza",
    country: "Tanzania",
    coordinates: [32.9147, -2.5164],
    assetType: "EcoBox Cookstove",
    studentsCount: 450,
    verificationStage: "operational",
    status: "active",
    progress: 65,
    riskLevel: "medium",
    financials: {
      totalValue: 35000,
      totalInvestment: 32000,
      disbursed: 21000,
      expectedRevenue: {
        payAsYouCook: 9300,
        carbonCredits: 6700,
        fuelSavings: 4900
      },
      costPerStudent: 71.1,
      monthlyOperatingCost: 350
    },
    mrvData: {
      dailyCookingHours: 6.2,
      fuelSavingsKgPerMonth: 220,
      carbonCreditsPerMonth: 1.4,
      healthBeneficiaries: 470,
      airQualityImprovement: 65,
      cookingEfficiency: 72,
      lastMeasurement: "2024-01-10",
      dataQualityScore: 3.8
    },
    timeline: {
      projectStart: "2023-08-01",
      constructionComplete: "2023-11-15",
      operationalStart: "2023-12-01",
      nextVerification: "2024-06-01",
      lastUpdate: "2024-01-10"
    }
  },
  {
    id: "TRN-003",
    schoolName: "Kampala Girls Academy",
    region: "Kampala",
    country: "Uganda",
    coordinates: [32.5816, 0.3136],
    assetType: "EcoBox Cookstove",
    studentsCount: 380,
    verificationStage: "verified",
    status: "completed",
    progress: 100,
    riskLevel: "low",
    financials: {
      totalValue: 30000,
      totalInvestment: 28000,
      disbursed: 28000,
      expectedRevenue: {
        payAsYouCook: 8400,
        carbonCredits: 5900,
        fuelSavings: 4300
      },
      costPerStudent: 73.7,
      monthlyOperatingCost: 320
    },
    mrvData: {
      dailyCookingHours: 6.8,
      fuelSavingsKgPerMonth: 195,
      carbonCreditsPerMonth: 1.3,
      healthBeneficiaries: 400,
      airQualityImprovement: 82,
      cookingEfficiency: 88,
      lastMeasurement: "2024-01-12",
      dataQualityScore: 4.5
    },
    timeline: {
      projectStart: "2023-02-01",
      constructionComplete: "2023-05-15",
      operationalStart: "2023-06-01",
      nextVerification: "2024-06-01",
      lastUpdate: "2024-01-12"
    }
  },
  {
    id: "TRN-004",
    schoolName: "Mombasa Technical Institute",
    region: "Mombasa",
    country: "Kenya",
    coordinates: [39.6682, -4.0435],
    assetType: "EcoBox Cookstove",
    studentsCount: 520,
    verificationStage: "operational",
    status: "active",
    progress: 78,
    riskLevel: "medium",
    financials: {
      totalValue: 38000,
      totalInvestment: 35000,
      disbursed: 27000,
      expectedRevenue: {
        payAsYouCook: 10800,
        carbonCredits: 7600,
        fuelSavings: 5600
      },
      costPerStudent: 67.3,
      monthlyOperatingCost: 420
    },
    mrvData: {
      dailyCookingHours: 6.8,
      fuelSavingsKgPerMonth: 260,
      carbonCreditsPerMonth: 1.7,
      healthBeneficiaries: 540,
      airQualityImprovement: 71,
      cookingEfficiency: 79,
      lastMeasurement: "2024-01-08",
      dataQualityScore: 3.9
    },
    timeline: {
      projectStart: "2023-09-01",
      constructionComplete: "2023-12-20",
      operationalStart: "2024-01-01",
      nextVerification: "2024-07-01",
      lastUpdate: "2024-01-08"
    }
  },
  {
    id: "TRN-005",
    schoolName: "Arusha Community School",
    region: "Arusha",
    country: "Tanzania",
    coordinates: [36.6873, -3.3869],
    assetType: "EcoBox Cookstove",
    studentsCount: 290,
    verificationStage: "verified",
    status: "completed",
    progress: 100,
    riskLevel: "low",
    financials: {
      totalValue: 24000,
      totalInvestment: 22000,
      disbursed: 22000,
      expectedRevenue: {
        payAsYouCook: 6500,
        carbonCredits: 4600,
        fuelSavings: 3400
      },
      costPerStudent: 75.9,
      monthlyOperatingCost: 240
    },
    mrvData: {
      dailyCookingHours: 5.8,
      fuelSavingsKgPerMonth: 150,
      carbonCreditsPerMonth: 1.0,
      healthBeneficiaries: 310,
      airQualityImprovement: 85,
      cookingEfficiency: 89,
      lastMeasurement: "2024-01-14",
      dataQualityScore: 4.3
    },
    timeline: {
      projectStart: "2023-01-15",
      constructionComplete: "2023-04-30",
      operationalStart: "2023-05-15",
      nextVerification: "2024-05-15",
      lastUpdate: "2024-01-14"
    }
  },
  {
    id: "TRN-006",
    schoolName: "Kigali Science Academy",
    region: "Kigali",
    country: "Rwanda",
    coordinates: [30.0588, -1.9441],
    assetType: "EcoBox Cookstove",
    studentsCount: 275,
    verificationStage: "construction",
    status: "active",
    progress: 45,
    riskLevel: "medium",
    financials: {
      totalValue: 23000,
      totalInvestment: 21000,
      disbursed: 9500,
      expectedRevenue: {
        payAsYouCook: 6200,
        carbonCredits: 4400,
        fuelSavings: 3200
      },
      costPerStudent: 76.4,
      monthlyOperatingCost: 230
    },
    mrvData: {
      dailyCookingHours: 0, // Not operational yet
      fuelSavingsKgPerMonth: 0,
      carbonCreditsPerMonth: 0,
      healthBeneficiaries: 0,
      airQualityImprovement: 0,
      cookingEfficiency: 0,
      lastMeasurement: "2024-01-01",
      dataQualityScore: 2.1
    },
    timeline: {
      projectStart: "2023-11-01",
      constructionComplete: "2024-03-15",
      operationalStart: "2024-04-01",
      nextVerification: "2024-10-01",
      lastUpdate: "2024-01-01"
    }
  },
  {
    id: "TRN-007",
    schoolName: "Bukavu Girls School",
    region: "Bukavu",
    country: "DRC",
    coordinates: [28.8728, -2.5081],
    assetType: "EcoBox Cookstove",
    studentsCount: 195,
    verificationStage: "planning",
    status: "pending",
    progress: 25,
    riskLevel: "high",
    financials: {
      totalValue: 18000,
      totalInvestment: 16000,
      disbursed: 4000,
      expectedRevenue: {
        payAsYouCook: 4700,
        carbonCredits: 3300,
        fuelSavings: 2400
      },
      costPerStudent: 82.1,
      monthlyOperatingCost: 180
    },
    mrvData: {
      dailyCookingHours: 0, // Not operational yet
      fuelSavingsKgPerMonth: 0,
      carbonCreditsPerMonth: 0,
      healthBeneficiaries: 0,
      airQualityImprovement: 0,
      cookingEfficiency: 0,
      lastMeasurement: "2023-12-20",
      dataQualityScore: 1.8
    },
    timeline: {
      projectStart: "2023-12-01",
      constructionComplete: "2024-05-01",
      operationalStart: "2024-06-01",
      nextVerification: "2024-12-01",
      lastUpdate: "2023-12-20"
    }
  },
  {
    id: "TRN-008",
    schoolName: "Dodoma Technical College",
    region: "Dodoma",
    country: "Tanzania",
    coordinates: [35.7396, -6.1630],
    assetType: "EcoBox Cookstove",
    studentsCount: 410,
    verificationStage: "operational",
    status: "active",
    progress: 82,
    riskLevel: "low",
    financials: {
      totalValue: 32000,
      totalInvestment: 29000,
      disbursed: 24000,
      expectedRevenue: {
        payAsYouCook: 8900,
        carbonCredits: 6300,
        fuelSavings: 4600
      },
      costPerStudent: 70.7,
      monthlyOperatingCost: 330
    },
    mrvData: {
      dailyCookingHours: 6.5,
      fuelSavingsKgPerMonth: 210,
      carbonCreditsPerMonth: 1.4,
      healthBeneficiaries: 430,
      airQualityImprovement: 74,
      cookingEfficiency: 81,
      lastMeasurement: "2024-01-11",
      dataQualityScore: 4.0
    },
    timeline: {
      projectStart: "2023-06-01",
      constructionComplete: "2023-09-15",
      operationalStart: "2023-10-01",
      nextVerification: "2024-04-01",
      lastUpdate: "2024-01-11"
    }
  }
];

// Regional aggregations for consistent reporting (MVP scale)
export const regionalData = {
  kenya: {
    name: "Kenya",
    totalSchools: 2,
    totalStudents: 840,
    totalInvestment: 60000,
    totalDisbursed: 52000,
    avgProgress: 89,
    carbonCreditsPerMonth: 2.9,
    color: "#059669"
  },
  tanzania: {
    name: "Tanzania",
    totalSchools: 3,
    totalStudents: 1150,
    totalInvestment: 83000,
    totalDisbursed: 67000,
    avgProgress: 82,
    carbonCreditsPerMonth: 3.8,
    color: "#2563eb"
  },
  uganda: {
    name: "Uganda",
    totalSchools: 1,
    totalStudents: 380,
    totalInvestment: 28000,
    totalDisbursed: 28000,
    avgProgress: 100,
    carbonCreditsPerMonth: 1.3,
    color: "#7c3aed"
  },
  rwanda: {
    name: "Rwanda",
    totalSchools: 1,
    totalStudents: 275,
    totalInvestment: 21000,
    totalDisbursed: 9500,
    avgProgress: 45,
    carbonCreditsPerMonth: 0,
    color: "#dc2626"
  },
  drc: {
    name: "DRC",
    totalSchools: 1,
    totalStudents: 195,
    totalInvestment: 16000,
    totalDisbursed: 4000,
    avgProgress: 25,
    carbonCreditsPerMonth: 0,
    color: "#ea580c"
  }
};

// Portfolio aggregations
export const portfolioMetrics = {
  totalProjects: masterSchoolProjects.length,
  totalStudents: masterSchoolProjects.reduce((sum, p) => sum + p.studentsCount, 0),
  totalInvestment: masterSchoolProjects.reduce((sum, p) => sum + p.financials.totalInvestment, 0),
  totalDisbursed: masterSchoolProjects.reduce((sum, p) => sum + p.financials.disbursed, 0),
  avgProgress: masterSchoolProjects.reduce((sum, p) => sum + p.progress, 0) / masterSchoolProjects.length,
  totalCarbonCredits: masterSchoolProjects.reduce((sum, p) => sum + p.mrvData.carbonCreditsPerMonth, 0),
  totalFuelSavings: masterSchoolProjects.reduce((sum, p) => sum + p.mrvData.fuelSavingsKgPerMonth, 0),
  totalBeneficiaries: masterSchoolProjects.reduce((sum, p) => sum + p.mrvData.healthBeneficiaries, 0),
  avgDataQuality: masterSchoolProjects.reduce((sum, p) => sum + p.mrvData.dataQualityScore, 0) / masterSchoolProjects.length
};

// Helper functions
export const getProjectById = (id: string): SchoolProject | undefined => {
  return masterSchoolProjects.find(p => p.id === id);
};

export const getProjectsByCountry = (country: string): SchoolProject[] => {
  return masterSchoolProjects.filter(p => p.country === country);
};

export const getProjectsByStatus = (status: string): SchoolProject[] => {
  return masterSchoolProjects.filter(p => p.status === status);
};

export const getProjectsByVerificationStage = (stage: string): SchoolProject[] => {
  return masterSchoolProjects.filter(p => p.verificationStage === stage);
};
