
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface OEMPartner {
  id: string;
  name: string;
  country: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  creditLimit: number;
  availableCredit: number;
  riskScore: number;
  lastPaymentDate?: string;
  totalFinanced: number;
  repaymentHistory: RepaymentRecord[];
}

export interface WarehouseCreditFacility {
  id: string;
  name: string;
  totalCapacity: number;
  availableCapacity: number;
  utilizationRate: number;
  interestRate: number;
  currency: string;
  status: 'active' | 'suspended' | 'closed';
  oemPartners: string[];
}

export interface EcoboxOrder {
  id: string;
  projectId: string;
  trancheId: string;
  schoolName: string;
  oemPartnerId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  financingAmount: number;
  financingPercentage: number;
  status: 'draft' | 'po_issued' | 'financing_approved' | 'manufacturing' | 'shipped' | 'delivered';
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  poNumber: string;
  trackingInfo?: string;
}

export interface RepaymentRecord {
  id: string;
  orderid: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  tranchePaymentId?: string;
  automaticRepayment: boolean;
}

const SAMPLE_OEM_PARTNERS: OEMPartner[] = [
  {
    id: 'oem-001',
    name: 'EcoTech Manufacturing Kenya',
    country: 'Kenya',
    verificationStatus: 'verified',
    creditLimit: 500000,
    availableCredit: 350000,
    riskScore: 25,
    lastPaymentDate: '2024-01-10',
    totalFinanced: 150000,
    repaymentHistory: []
  },
  {
    id: 'oem-002',
    name: 'Green Solutions Uganda',
    country: 'Uganda',
    verificationStatus: 'verified',
    creditLimit: 300000,
    availableCredit: 200000,
    riskScore: 35,
    lastPaymentDate: '2024-01-08',
    totalFinanced: 100000,
    repaymentHistory: []
  }
];

const SAMPLE_WAREHOUSE_FACILITY: WarehouseCreditFacility = {
  id: 'wcf-001',
  name: 'East Africa Warehouse Credit Facility',
  totalCapacity: 2000000,
  availableCapacity: 1450000,
  utilizationRate: 27.5,
  interestRate: 8.5,
  currency: 'USD',
  status: 'active',
  oemPartners: ['oem-001', 'oem-002']
};

export const useWarehouseCredit = () => {
  const [oemPartners, setOemPartners] = useState<OEMPartner[]>(SAMPLE_OEM_PARTNERS);
  const [warehouseFacility, setWarehouseFacility] = useState<WarehouseCreditFacility>(SAMPLE_WAREHOUSE_FACILITY);
  const [ecoboxOrders, setEcoboxOrders] = useState<EcoboxOrder[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const createEcoboxOrder = useCallback(async (
    projectId: string,
    trancheId: string,
    schoolName: string,
    oemPartnerId: string,
    quantity: number,
    unitCost: number
  ): Promise<EcoboxOrder> => {
    setIsProcessing(true);
    
    try {
      const totalCost = quantity * unitCost;
      const financingPercentage = 85; // 85% financing typical
      const financingAmount = totalCost * (financingPercentage / 100);
      
      const order: EcoboxOrder = {
        id: `ECO-${Date.now()}`,
        projectId,
        trancheId,
        schoolName,
        oemPartnerId,
        quantity,
        unitCost,
        totalCost,
        financingAmount,
        financingPercentage,
        status: 'draft',
        orderDate: new Date().toISOString(),
        expectedDelivery: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        poNumber: `PO-${Date.now()}`
      };

      setEcoboxOrders(prev => [...prev, order]);
      
      toast({
        title: "Ecobox Order Created",
        description: `Order for ${quantity} units created for ${schoolName}`,
      });

      return order;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const approveFinancing = useCallback(async (orderId: string) => {
    setIsProcessing(true);
    
    try {
      setEcoboxOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          // Update facility utilization
          setWarehouseFacility(facility => ({
            ...facility,
            availableCapacity: facility.availableCapacity - order.financingAmount,
            utilizationRate: ((facility.totalCapacity - facility.availableCapacity + order.financingAmount) / facility.totalCapacity) * 100
          }));

          return {
            ...order,
            status: 'financing_approved' as const
          };
        }
        return order;
      }));

      toast({
        title: "Financing Approved",
        description: "Warehouse facility has approved the financing request",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const processRepayment = useCallback(async (
    orderId: string,
    tranchePaymentAmount: number,
    tranchePaymentId: string
  ) => {
    const order = ecoboxOrders.find(o => o.id === orderId);
    if (!order) return;

    // Calculate repayment amount (financing + interest)
    const repaymentAmount = order.financingAmount * 1.085; // 8.5% interest
    const actualRepayment = Math.min(repaymentAmount, tranchePaymentAmount);

    // Update facility capacity
    setWarehouseFacility(prev => ({
      ...prev,
      availableCapacity: prev.availableCapacity + actualRepayment,
      utilizationRate: ((prev.totalCapacity - prev.availableCapacity - actualRepayment) / prev.totalCapacity) * 100
    }));

    toast({
      title: "Automatic Repayment Processed",
      description: `$${actualRepayment.toLocaleString()} repaid to warehouse facility`,
    });
  }, [ecoboxOrders, toast]);

  const getOEMPerformanceMetrics = useCallback(() => {
    return oemPartners.map(partner => ({
      ...partner,
      utilizationRate: ((partner.creditLimit - partner.availableCredit) / partner.creditLimit) * 100,
      avgRepaymentTime: 14, // days - would be calculated from actual data
      onTimePaymentRate: 95 // percentage
    }));
  }, [oemPartners]);

  return {
    // State
    oemPartners,
    warehouseFacility,
    ecoboxOrders,
    isProcessing,
    
    // Order Management
    createEcoboxOrder,
    approveFinancing,
    
    // Repayment Management
    processRepayment,
    
    // Analytics
    getOEMPerformanceMetrics
  };
};
