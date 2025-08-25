// LMS Integration Types and Interfaces
export interface LMSConfig {
  baseUrl: string;
  apiKey: string;
  authType: 'api_key' | 'oauth' | 'basic';
  rateLimitPerMinute: number;
  timeoutMs: number;
  retryAttempts: number;
  syncIntervalDays: number;
  toleranceThreshold: number; // Percentage difference threshold
}

export interface LMSLoanData {
  loan_id: string;
  account_number: string;
  outstanding_balance: number;
  principal_balance: number;
  interest_rate: number;
  payment_status: 'current' | 'past_due' | 'paid_off' | 'defaulted';
  last_payment_date: string;
  last_payment_amount: number;
  next_payment_date: string;
  maturity_date: string;
  loan_status: 'active' | 'closed' | 'charged_off' | 'refinanced';
  collateral_value?: number;
  payment_history: LMSPaymentRecord[];
  updated_at: string;
}

export interface LMSPaymentRecord {
  payment_date: string;
  amount: number;
  principal_portion: number;
  interest_portion: number;
  type: 'regular' | 'extra' | 'payoff' | 'adjustment';
}

export interface LMSResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface SyncResult {
  processed: number;
  updated: number;
  failed: number;
  skipped: number;
  errors: string[];
  discrepancies: LoanDiscrepancy[];
  duration: number;
  timestamp: string;
}

export interface LoanDiscrepancy {
  loan_id: string;
  field: string;
  lms_value: any;
  internal_value: any;
  difference_percentage: number;
  severity: 'minor' | 'major' | 'critical';
  auto_resolved: boolean;
}

export interface SyncScheduleConfig {
  enabled: boolean;
  interval: 'daily' | 'weekly' | 'monthly' | 'bi-monthly' | 'quarterly';
  time: string; // HH:MM format
  timezone: string;
  lastSync: string;
  nextSync: string;
  autoResolveMinor: boolean;
  notificationThreshold: number;
}