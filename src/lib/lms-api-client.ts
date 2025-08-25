// LMS API Client for External Loan Management System Integration
import { LMSConfig, LMSLoanData, LMSResponse, LMSPaymentRecord } from './lms-types';

export class LMSAPIClient {
  private config: LMSConfig;
  private requestCount: number = 0;
  private lastResetTime: number = Date.now();

  constructor(config: LMSConfig) {
    this.config = config;
  }

  // Rate limiting mechanism
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const timeWindow = 60 * 1000; // 1 minute

    if (now - this.lastResetTime > timeWindow) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    if (this.requestCount >= this.config.rateLimitPerMinute) {
      const waitTime = timeWindow - (now - this.lastResetTime);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.lastResetTime = Date.now();
    }

    this.requestCount++;
  }

  // Retry mechanism with exponential backoff
  private async makeRequest<T>(
    url: string, 
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<LMSResponse<T>> {
    await this.checkRateLimit();

    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

      const response = await fetch(`${this.config.baseUrl}${url}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (attempt < this.config.retryAttempts) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest<T>(url, options, attempt + 1);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  private getAuthHeaders(): Record<string, string> {
    switch (this.config.authType) {
      case 'api_key':
        return { 'X-API-Key': this.config.apiKey };
      case 'oauth':
        return { 'Authorization': `Bearer ${this.config.apiKey}` };
      case 'basic':
        return { 'Authorization': `Basic ${btoa(this.config.apiKey)}` };
      default:
        return {};
    }
  }

  // Fetch single loan data
  async getLoanData(loanId: string): Promise<LMSResponse<LMSLoanData>> {
    return this.makeRequest<LMSLoanData>(`/loans/${loanId}`);
  }

  // Fetch multiple loans with pagination
  async getLoansData(
    loanIds: string[], 
    page: number = 1, 
    limit: number = 100
  ): Promise<LMSResponse<LMSLoanData[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      loan_ids: loanIds.join(','),
    });

    return this.makeRequest<LMSLoanData[]>(`/loans?${params}`);
  }

  // Fetch loans updated since a specific date
  async getUpdatedLoans(
    since: Date,
    page: number = 1,
    limit: number = 100
  ): Promise<LMSResponse<LMSLoanData[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      updated_since: since.toISOString(),
    });

    return this.makeRequest<LMSLoanData[]>(`/loans/updated?${params}`);
  }

  // Fetch payment history for a loan
  async getPaymentHistory(
    loanId: string,
    since?: Date
  ): Promise<LMSResponse<LMSPaymentRecord[]>> {
    const params = new URLSearchParams();
    if (since) {
      params.set('since', since.toISOString());
    }

    const url = `/loans/${loanId}/payments${params.toString() ? `?${params}` : ''}`;
    return this.makeRequest<LMSPaymentRecord[]>(url);
  }

  // Test connection to LMS
  async testConnection(): Promise<LMSResponse<{ status: string; timestamp: string }>> {
    return this.makeRequest<{ status: string; timestamp: string }>('/health');
  }

  // Get LMS system information
  async getSystemInfo(): Promise<LMSResponse<{ version: string; capabilities: string[] }>> {
    return this.makeRequest<{ version: string; capabilities: string[] }>('/info');
  }

  // Batch update loan data
  async batchUpdateLoans(updates: Array<{
    loan_id: string;
    outstanding_balance: number;
    last_updated: string;
  }>): Promise<LMSResponse<{ updated: number; failed: number; errors: string[] }>> {
    return this.makeRequest('/loans/batch-update', {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  }

  // Map LMS data to internal format
  mapToInternalFormat(lmsData: LMSLoanData): any {
    return {
      loan_id: lmsData.loan_id,
      account_number: lmsData.account_number,
      outstanding_balance: lmsData.outstanding_balance,
      principal_balance: lmsData.principal_balance,
      annual_interest_rate: lmsData.interest_rate,
      payment_status: lmsData.payment_status,
      loan_status: lmsData.loan_status,
      last_payment_date: new Date(lmsData.last_payment_date),
      last_payment_amount: lmsData.last_payment_amount,
      maturity_date: new Date(lmsData.maturity_date),
      collateral_value: lmsData.collateral_value,
      updated_at: new Date(lmsData.updated_at),
      payment_history: lmsData.payment_history.map(payment => ({
        payment_date: new Date(payment.payment_date),
        amount: payment.amount,
        principal_portion: payment.principal_portion,
        interest_portion: payment.interest_portion,
        type: payment.type,
      })),
    };
  }
}