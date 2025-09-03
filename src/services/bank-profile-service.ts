/**
 * Bank Profile Service
 * Manages bank profile, targets, and configuration for personalized insights
 */

import { BankProfile } from './dynamic-insights-engine';

class BankProfileService {
  private static instance: BankProfileService;
  private currentProfile: BankProfile | null = null;

  static getInstance(): BankProfileService {
    if (!BankProfileService.instance) {
      BankProfileService.instance = new BankProfileService();
    }
    return BankProfileService.instance;
  }

  /**
   * Initialize with demo bank profile
   */
  initializeDemoProfile(): BankProfile {
    const demoProfile: BankProfile = {
      id: 'community_bank_demo',
      name: 'Community Bank',
      type: 'community',
      assets: 850, // $850M in assets
      portfolioSize: 247,
      primaryMarkets: ['Regional Metro Area', 'Suburban Communities'],
      experienceLevel: 'intermediate',
      businessGoals: [
        {
          type: 'sustainability',
          priority: 'high',
          target: '25% EV portfolio by 2025',
          deadline: new Date('2025-12-31')
        },
        {
          type: 'compliance',
          priority: 'high',
          target: 'PCAF score ≤ 3.0',
          deadline: new Date('2024-06-30')
        },
        {
          type: 'growth',
          priority: 'medium',
          target: '15% green finance revenue growth',
          deadline: new Date('2024-12-31')
        }
      ],
      currentChallenges: [
        {
          type: 'data_quality',
          severity: 'medium',
          description: 'Need to improve data collection processes for better PCAF scores'
        },
        {
          type: 'regulatory_compliance',
          severity: 'medium',
          description: 'Preparing for upcoming climate disclosure requirements'
        },
        {
          type: 'market_competition',
          severity: 'low',
          description: 'Competing with larger banks on green finance products'
        }
      ],
      climateTargets: {
        netZeroTarget: new Date('2050-12-31'),
        emissionReductionTarget: 50, // 50% reduction by 2030
        evPortfolioTarget: 25, // 25% EV portfolio
        dataQualityTarget: 3.0 // PCAF score target
      },
      preferredTone: 'conversational',
      reportingRequirements: ['TCFD', 'SEC Climate Disclosure', 'State Regulatory Reporting']
    };

    this.currentProfile = demoProfile;
    return demoProfile;
  }

  /**
   * Get current bank profile
   */
  getCurrentProfile(): BankProfile | null {
    return this.currentProfile;
  }

  /**
   * Update bank profile
   */
  updateProfile(updates: Partial<BankProfile>): BankProfile {
    if (!this.currentProfile) {
      this.initializeDemoProfile();
    }

    this.currentProfile = {
      ...this.currentProfile!,
      ...updates
    };

    // Save to localStorage for persistence
    localStorage.setItem('bank_profile', JSON.stringify(this.currentProfile));
    
    return this.currentProfile;
  }

  /**
   * Load profile from localStorage
   */
  loadProfile(): BankProfile | null {
    try {
      const saved = localStorage.getItem('bank_profile');
      if (saved) {
        this.currentProfile = JSON.parse(saved);
        // Convert date strings back to Date objects
        if (this.currentProfile?.climateTargets?.netZeroTarget) {
          this.currentProfile.climateTargets.netZeroTarget = new Date(this.currentProfile.climateTargets.netZeroTarget);
        }
        this.currentProfile?.businessGoals.forEach(goal => {
          if (goal.deadline) {
            goal.deadline = new Date(goal.deadline);
          }
        });
        return this.currentProfile;
      }
    } catch (error) {
      console.error('Failed to load bank profile:', error);
    }
    return null;
  }

  /**
   * Update business goals
   */
  updateBusinessGoals(goals: BankProfile['businessGoals']): void {
    if (this.currentProfile) {
      this.currentProfile.businessGoals = goals;
      this.saveProfile();
    }
  }

  /**
   * Update climate targets
   */
  updateClimateTargets(targets: BankProfile['climateTargets']): void {
    if (this.currentProfile) {
      this.currentProfile.climateTargets = targets;
      this.saveProfile();
    }
  }

  /**
   * Update current challenges
   */
  updateChallenges(challenges: BankProfile['currentChallenges']): void {
    if (this.currentProfile) {
      this.currentProfile.currentChallenges = challenges;
      this.saveProfile();
    }
  }

  /**
   * Add a new business goal
   */
  addBusinessGoal(goal: BankProfile['businessGoals'][0]): void {
    if (this.currentProfile) {
      this.currentProfile.businessGoals.push(goal);
      this.saveProfile();
    }
  }

  /**
   * Remove a business goal
   */
  removeBusinessGoal(index: number): void {
    if (this.currentProfile && this.currentProfile.businessGoals[index]) {
      this.currentProfile.businessGoals.splice(index, 1);
      this.saveProfile();
    }
  }

  /**
   * Add a new challenge
   */
  addChallenge(challenge: BankProfile['currentChallenges'][0]): void {
    if (this.currentProfile) {
      this.currentProfile.currentChallenges.push(challenge);
      this.saveProfile();
    }
  }

  /**
   * Remove a challenge
   */
  removeChallenge(index: number): void {
    if (this.currentProfile && this.currentProfile.currentChallenges[index]) {
      this.currentProfile.currentChallenges.splice(index, 1);
      this.saveProfile();
    }
  }

  /**
   * Get profile summary for display
   */
  getProfileSummary(): {
    name: string;
    type: string;
    goals: number;
    challenges: number;
    hasTargets: boolean;
  } | null {
    if (!this.currentProfile) return null;

    return {
      name: this.currentProfile.name,
      type: this.currentProfile.type,
      goals: this.currentProfile.businessGoals.length,
      challenges: this.currentProfile.currentChallenges.length,
      hasTargets: !!this.currentProfile.climateTargets
    };
  }

  /**
   * Check if profile is complete
   */
  isProfileComplete(): boolean {
    if (!this.currentProfile) return false;

    return !!(
      this.currentProfile.name &&
      this.currentProfile.type &&
      this.currentProfile.businessGoals.length > 0 &&
      this.currentProfile.climateTargets
    );
  }

  /**
   * Get profile completion percentage
   */
  getCompletionPercentage(): number {
    if (!this.currentProfile) return 0;

    let completed = 0;
    const total = 8;

    if (this.currentProfile.name) completed++;
    if (this.currentProfile.type) completed++;
    if (this.currentProfile.assets) completed++;
    if (this.currentProfile.primaryMarkets.length > 0) completed++;
    if (this.currentProfile.businessGoals.length > 0) completed++;
    if (this.currentProfile.currentChallenges.length > 0) completed++;
    if (this.currentProfile.climateTargets) completed++;
    if (this.currentProfile.reportingRequirements.length > 0) completed++;

    return Math.round((completed / total) * 100);
  }

  /**
   * Save profile to localStorage
   */
  private saveProfile(): void {
    if (this.currentProfile) {
      localStorage.setItem('bank_profile', JSON.stringify(this.currentProfile));
    }
  }

  /**
   * Reset profile to defaults
   */
  resetProfile(): void {
    localStorage.removeItem('bank_profile');
    this.currentProfile = null;
  }

  /**
   * Export profile for backup
   */
  exportProfile(): string {
    return JSON.stringify(this.currentProfile, null, 2);
  }

  /**
   * Import profile from backup
   */
  importProfile(profileJson: string): BankProfile {
    try {
      const profile = JSON.parse(profileJson);
      this.currentProfile = profile;
      this.saveProfile();
      return profile;
    } catch (error) {
      throw new Error('Invalid profile format');
    }
  }
}

export const bankProfileService = BankProfileService.getInstance();