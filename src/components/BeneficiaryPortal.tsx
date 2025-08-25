import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  ExternalLink,
  Bell,
  Eye,
  MapPin,
  Calendar,
  DollarSign,
  CreditCard,
  Smartphone,
  Building,
  Phone,
  Mail
} from "lucide-react";

interface PaymentStatus {
  id: string;
  schoolName: string;
  amount: number;
  currency: string;
  status: 'processing' | 'completed' | 'pending' | 'failed';
  method: string;
  estimatedArrival: string;
  transactionId?: string;
  lastUpdate: string;
  steps: PaymentStep[];
}

interface PaymentStep {
  name: string;
  status: 'completed' | 'current' | 'pending';
  timestamp?: string;
  description: string;
}

interface NotificationPreference {
  sms: boolean;
  email: boolean;
  whatsapp: boolean;
}

const SAMPLE_PAYMENTS: PaymentStatus[] = [
  {
    id: 'PMT-001',
    schoolName: 'Kilimani Primary School',
    amount: 5000,
    currency: 'USD',
    status: 'processing',
    method: 'M-Pesa',
    estimatedArrival: '5-10 minutes',
    lastUpdate: '2 minutes ago',
    steps: [
      {
        name: 'Payment Initiated',
        status: 'completed',
        timestamp: '10:30 AM',
        description: 'Disbursement request approved and initiated'
      },
      {
        name: 'Processing Payment',
        status: 'current',
        description: 'Transferring funds via M-Pesa network'
      },
      {
        name: 'Payment Complete',
        status: 'pending',
        description: 'Funds will be available in recipient account'
      }
    ]
  },
  {
    id: 'PMT-002',
    schoolName: 'Mombasa Primary School',
    amount: 4200,
    currency: 'USD',
    status: 'completed',
    method: 'Bank Transfer',
    estimatedArrival: 'Completed',
    transactionId: 'TXN-789456123',
    lastUpdate: '1 hour ago',
    steps: [
      {
        name: 'Payment Initiated',
        status: 'completed',
        timestamp: '9:15 AM',
        description: 'Disbursement request approved and initiated'
      },
      {
        name: 'Bank Processing',
        status: 'completed',
        timestamp: '9:45 AM',
        description: 'Funds transferred via SWIFT network'
      },
      {
        name: 'Payment Complete',
        status: 'completed',
        timestamp: '9:50 AM',
        description: 'Funds successfully deposited'
      }
    ]
  }
];

const getStatusIcon = (status: PaymentStatus['status']) => {
  switch (status) {
    case 'completed': return CheckCircle;
    case 'processing': return Clock;
    case 'failed': return AlertTriangle;
    default: return Clock;
  }
};

const getStatusColor = (status: PaymentStatus['status']) => {
  switch (status) {
    case 'completed': return 'success';
    case 'processing': return 'warning';
    case 'failed': return 'destructive';
    default: return 'secondary';
  }
};

const getMethodIcon = (method: string) => {
  if (method.toLowerCase().includes('bank')) return Building;
  if (method.toLowerCase().includes('mobile') || method.toLowerCase().includes('m-pesa')) return Smartphone;
  return CreditCard;
};

export function BeneficiaryPortal() {
  const [payments] = useState<PaymentStatus[]>(SAMPLE_PAYMENTS);
  const [notifications, setNotifications] = useState<NotificationPreference>({
    sms: true,
    email: true,
    whatsapp: false
  });

  const completedPayments = payments.filter(p => p.status === 'completed');
  const processingPayments = payments.filter(p => p.status === 'processing');
  const totalReceived = completedPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Payment Portal</h1>
              <p className="text-lg text-muted-foreground mt-2">
                Track your disbursements and payment history
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                Verified Recipient
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="metric-label">Total Received</p>
                  <p className="metric-value mt-2">${totalReceived.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">All time</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10 text-success">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="metric-label">Payments</p>
                  <p className="metric-value mt-2">{completedPayments.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Completed</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="metric-label">Processing</p>
                  <p className="metric-value mt-2">{processingPayments.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">In progress</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10 text-warning">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Payments */}
        {processingPayments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Payments in Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {processingPayments.map((payment) => {
                const StatusIcon = getStatusIcon(payment.status);
                const MethodIcon = getMethodIcon(payment.method);
                
                return (
                  <div key={payment.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                          <StatusIcon className="h-5 w-5 text-warning animate-pulse" />
                        </div>
                        <div>
                          <p className="font-medium">${payment.amount.toLocaleString()} {payment.currency}</p>
                          <p className="text-sm text-muted-foreground">
                            via {payment.method} • ETA: {payment.estimatedArrival}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(payment.status) as any} className="flex items-center gap-1">
                        <MethodIcon className="h-3 w-3" />
                        {payment.status}
                      </Badge>
                    </div>

                    {/* Progress Steps */}
                    <div className="ml-5 space-y-3">
                      {payment.steps.map((step, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            step.status === 'completed' ? 'bg-success' :
                            step.status === 'current' ? 'bg-warning' : 'bg-muted'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-medium ${
                                step.status === 'current' ? 'text-foreground' : 
                                step.status === 'completed' ? 'text-success' : 'text-muted-foreground'
                              }`}>
                                {step.name}
                              </p>
                              {step.timestamp && (
                                <span className="text-xs text-muted-foreground">{step.timestamp}</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Alert>
                      <Bell className="h-4 w-4" />
                      <AlertDescription>
                        You will receive an SMS notification when this payment is completed.
                      </AlertDescription>
                    </Alert>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Payment History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Payment History</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.map((payment) => {
                const StatusIcon = getStatusIcon(payment.status);
                const MethodIcon = getMethodIcon(payment.method);
                
                return (
                  <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        payment.status === 'completed' ? 'bg-success/10' :
                        payment.status === 'processing' ? 'bg-warning/10' : 'bg-muted/50'
                      }`}>
                        <StatusIcon className={`h-5 w-5 ${
                          payment.status === 'completed' ? 'text-success' :
                          payment.status === 'processing' ? 'text-warning' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">${payment.amount.toLocaleString()} {payment.currency}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MethodIcon className="h-3 w-3" />
                          {payment.method}
                          <span>•</span>
                          <Calendar className="h-3 w-3" />
                          {payment.lastUpdate}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusColor(payment.status) as any}>
                        {payment.status}
                      </Badge>
                      {payment.transactionId && (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Contact & Support */}
        <Card>
          <CardHeader>
            <CardTitle>Contact & Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">+1-800-CLIMATE</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">support@climate.finance</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">24/7 Monitoring</p>
                  <p className="text-sm text-muted-foreground">Real-time assistance</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}