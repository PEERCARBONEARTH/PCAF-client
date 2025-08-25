import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface PaymentMethod {
  id: string;
  type: 'bank' | 'mobile' | 'crypto';
  name: string;
  details: string;
  verified: boolean;
  processingTime: string;
  fees: string;
}

export interface DisbursementRequest {
  id: string;
  trancheId: string;
  schoolName: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  approvalLevel: 'auto' | 'manager' | 'director' | 'board';
  status: 'draft' | 'pending_approval' | 'approved' | 'processing' | 'completed' | 'failed' | 'rejected';
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  processedAt?: string;
  failureReason?: string;
  transactionId?: string;
  auditTrail: AuditEntry[];
}

export interface AuditEntry {
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  metadata?: Record<string, any>;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'bank-swift',
    type: 'bank',
    name: 'SWIFT Bank Transfer',
    details: 'International wire transfer via SWIFT network',
    verified: true,
    processingTime: '1-3 business days',
    fees: '$25 + 0.5%'
  },
  {
    id: 'mpesa',
    type: 'mobile',
    name: 'M-Pesa',
    details: 'Mobile money transfer via Safaricom M-Pesa',
    verified: true,
    processingTime: 'Instant',
    fees: '1.5% (min $0.50)'
  },
  {
    id: 'airtel-money',
    type: 'mobile',
    name: 'Airtel Money',
    details: 'Mobile money transfer via Airtel',
    verified: true,
    processingTime: 'Instant',
    fees: '1.2% (min $0.30)'
  },
  {
    id: 'polygon-usdc',
    type: 'crypto',
    name: 'Polygon USDC',
    details: 'USDC stable coin on Polygon network',
    verified: true,
    processingTime: '2-5 minutes',
    fees: '$0.01-0.05'
  }
];

const getApprovalLevel = (amount: number): DisbursementRequest['approvalLevel'] => {
  if (amount < 1000) return 'auto';
  if (amount < 5000) return 'manager';
  if (amount < 25000) return 'director';
  return 'board';
};

export const useDisbursement = () => {
  const [requests, setRequests] = useState<DisbursementRequest[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const createAuditEntry = (action: string, details: string, metadata?: Record<string, any>): AuditEntry => ({
    timestamp: new Date().toISOString(),
    action,
    actor: 'Current User', // In real app, get from auth context
    details,
    metadata
  });

  const createDisbursementRequest = useCallback(async (
    trancheId: string,
    schoolName: string,
    amount: number,
    paymentMethodId: string
  ): Promise<DisbursementRequest> => {
    const paymentMethod = PAYMENT_METHODS.find(pm => pm.id === paymentMethodId);
    if (!paymentMethod) {
      throw new Error('Invalid payment method');
    }

    const approvalLevel = getApprovalLevel(amount);
    const request: DisbursementRequest = {
      id: `DSB-${Date.now()}`,
      trancheId,
      schoolName,
      amount,
      currency: 'USD',
      paymentMethod,
      approvalLevel,
      status: approvalLevel === 'auto' ? 'approved' : 'pending_approval',
      requestedBy: 'Current User',
      requestedAt: new Date().toISOString(),
      auditTrail: [
        createAuditEntry(
          'DISBURSEMENT_REQUESTED',
          `Disbursement requested for ${schoolName} - $${amount.toLocaleString()}`,
          { trancheId, paymentMethodId, approvalLevel }
        )
      ]
    };

    if (approvalLevel === 'auto') {
      request.approvedBy = 'System';
      request.approvedAt = new Date().toISOString();
      request.auditTrail.push(
        createAuditEntry('AUTO_APPROVED', 'Automatically approved - amount below threshold')
      );
    }

    setRequests(prev => [...prev, request]);
    
    toast({
      title: "Disbursement Request Created",
      description: `${approvalLevel === 'auto' ? 'Auto-approved and' : ''} Ready for ${approvalLevel === 'auto' ? 'processing' : 'approval'}`,
    });

    return request;
  }, [toast]);

  const approveDisbursement = useCallback(async (requestId: string, approverNotes?: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === requestId && req.status === 'pending_approval') {
        const updatedRequest = {
          ...req,
          status: 'approved' as const,
          approvedBy: 'Current User',
          approvedAt: new Date().toISOString(),
          auditTrail: [
            ...req.auditTrail,
            createAuditEntry(
              'DISBURSEMENT_APPROVED',
              `Disbursement approved by manager${approverNotes ? ': ' + approverNotes : ''}`,
              { approverNotes }
            )
          ]
        };
        
        toast({
          title: "Disbursement Approved",
          description: `$${req.amount.toLocaleString()} disbursement for ${req.schoolName} approved`,
        });
        
        return updatedRequest;
      }
      return req;
    }));
  }, [toast]);

  const rejectDisbursement = useCallback(async (requestId: string, reason: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === requestId && req.status === 'pending_approval') {
        const updatedRequest = {
          ...req,
          status: 'rejected' as const,
          failureReason: reason,
          auditTrail: [
            ...req.auditTrail,
            createAuditEntry('DISBURSEMENT_REJECTED', `Disbursement rejected: ${reason}`, { reason })
          ]
        };
        
        toast({
          title: "Disbursement Rejected",
          description: `$${req.amount.toLocaleString()} disbursement for ${req.schoolName} rejected`,
          variant: "destructive"
        });
        
        return updatedRequest;
      }
      return req;
    }));
  }, [toast]);

  const processDisbursement = useCallback(async (requestId: string) => {
    setIsProcessing(true);
    
    try {
      // Update status to processing
      setRequests(prev => prev.map(req => {
        if (req.id === requestId && req.status === 'approved') {
          return {
            ...req,
            status: 'processing' as const,
            auditTrail: [
              ...req.auditTrail,
              createAuditEntry('PROCESSING_STARTED', 'Payment processing initiated')
            ]
          };
        }
        return req;
      }));

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate success/failure (90% success rate)
      const success = Math.random() > 0.1;
      const transactionId = success ? `TXN-${Date.now()}` : undefined;
      
      setRequests(prev => prev.map(req => {
        if (req.id === requestId && req.status === 'processing') {
          const updatedRequest = {
            ...req,
            status: success ? 'completed' as const : 'failed' as const,
            processedAt: new Date().toISOString(),
            transactionId,
            failureReason: success ? undefined : 'Payment gateway timeout - please retry',
            auditTrail: [
              ...req.auditTrail,
              createAuditEntry(
                success ? 'PAYMENT_COMPLETED' : 'PAYMENT_FAILED',
                success 
                  ? `Payment completed successfully. Transaction ID: ${transactionId}`
                  : 'Payment failed - gateway timeout',
                { transactionId, success }
              )
            ]
          };
          
          toast({
            title: success ? "Payment Completed" : "Payment Failed",
            description: success 
              ? `$${req.amount.toLocaleString()} successfully sent to ${req.schoolName}`
              : `Payment failed - please retry`,
            variant: success ? "default" : "destructive"
          });
          
          return updatedRequest;
        }
        return req;
      }));
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const retryDisbursement = useCallback(async (requestId: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === requestId && req.status === 'failed') {
        return {
          ...req,
          status: 'approved' as const,
          failureReason: undefined,
          auditTrail: [
            ...req.auditTrail,
            createAuditEntry('RETRY_REQUESTED', 'Payment retry requested by user')
          ]
        };
      }
      return req;
    }));
    
    toast({
      title: "Retry Scheduled",
      description: "Disbursement moved back to approved status for retry",
    });
  }, [toast]);

  const batchProcess = useCallback(async (requestIds: string[]) => {
    setIsProcessing(true);
    
    try {
      for (const requestId of requestIds) {
        await processDisbursement(requestId);
        // Small delay between batch items
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      toast({
        title: "Batch Processing Complete",
        description: `Processed ${requestIds.length} disbursements`,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [processDisbursement, toast]);

  return {
    requests,
    paymentMethods: PAYMENT_METHODS,
    isProcessing,
    createDisbursementRequest,
    approveDisbursement,
    rejectDisbursement,
    processDisbursement,
    retryDisbursement,
    batchProcess
  };
};