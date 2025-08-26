import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wallet,
  Zap,
  Eye,
  FileText,
  Users,
  Lock,
  Scan,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { useAdvancedDisbursement, BeneficiaryProfile, SmartContract } from "@/hooks/useAdvancedDisbursement";

const getRiskColor = (score: number) => {
  if (score < 30) return 'success';
  if (score < 60) return 'warning';
  return 'destructive';
};

const getComplianceIcon = (status: string) => {
  switch (status) {
    case 'passed': return CheckCircle;
    case 'failed': return AlertTriangle;
    case 'manual_review': return Eye;
    default: return Clock;
  }
};

interface BeneficiaryCardProps {
  beneficiary: BeneficiaryProfile;
  onRunCheck: (beneficiaryId: string, checkType: any) => void;
}

function BeneficiaryCard({ beneficiary, onRunCheck }: BeneficiaryCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{beneficiary.name}</CardTitle>
          <Badge variant={beneficiary.kycStatus === 'verified' ? 'default' : 'secondary'}>
            {beneficiary.kycStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Risk Score</p>
            <div className="flex items-center gap-2">
              <Progress value={beneficiary.riskScore} className="flex-1" />
              <span className={`text-sm font-medium text-${getRiskColor(beneficiary.riskScore)}`}>
                {beneficiary.riskScore}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Preferred Method</p>
            <p className="font-medium capitalize">{beneficiary.preferredMethod}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Compliance Checks</p>
          <div className="space-y-2">
            {beneficiary.complianceChecks.map((check) => {
              const Icon = getComplianceIcon(check.status);
              return (
                <div key={check.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 text-${check.status === 'passed' ? 'success' : check.status === 'failed' ? 'destructive' : 'warning'}`} />
                    <span className="text-sm font-medium">{check.type.toUpperCase()}</span>
                    <span className="text-sm text-muted-foreground">({check.score}/100)</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {check.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onRunCheck(beneficiary.id, 'kyc')}>
            Run KYC
          </Button>
          <Button size="sm" variant="outline" onClick={() => onRunCheck(beneficiary.id, 'aml')}>
            AML Check
          </Button>
          <Button size="sm" variant="outline" onClick={() => onRunCheck(beneficiary.id, 'fraud')}>
            Fraud Scan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface SmartContractCardProps {
  contract: SmartContract;
  onExecute: (contractId: string, amount: number, recipient: string) => void;
}

function SmartContractCard({ contract, onExecute }: SmartContractCardProps) {
  const [amount, setAmount] = useState(1000);
  const [recipient, setRecipient] = useState('0x742d35...');

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {contract.type.charAt(0).toUpperCase() + contract.type.slice(1)} Contract
          </CardTitle>
          <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
            {contract.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Address:</span>
            <span className="font-mono">{contract.address.substring(0, 10)}...</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Network:</span>
            <span className="capitalize">{contract.network}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Balance:</span>
            <span className="font-medium">{contract.balance.toLocaleString()} {contract.currency}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Threshold:</span>
            <span>{contract.threshold}/{contract.signatories.length} signatures</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-medium">Quick Transfer</p>
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="flex-1 px-2 py-1 text-sm border rounded"
              placeholder="Amount"
            />
            <Button 
              size="sm" 
              onClick={() => onExecute(contract.id, amount, recipient)}
            >
              Execute
            </Button>
          </div>
        </div>

        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Transactions require {contract.threshold} of {contract.signatories.length} signatures
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

export function ComplianceCenter() {
  const {
    smartContracts,
    beneficiaries,
    isProcessing,
    runComplianceCheck,
    executeMultisigTransaction,
    detectFraud
  } = useAdvancedDisbursement();

  const overallStats = {
    totalBeneficiaries: beneficiaries.length,
    verifiedBeneficiaries: beneficiaries.filter(b => b.kycStatus === 'verified').length,
    highRiskBeneficiaries: beneficiaries.filter(b => b.riskScore > 70).length,
    totalContractBalance: smartContracts.reduce((sum, c) => sum + c.balance, 0),
    activeContracts: smartContracts.filter(c => c.status === 'active').length
  };

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">Total Beneficiaries</p>
                <p className="metric-value mt-2">{overallStats.totalBeneficiaries}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {overallStats.verifiedBeneficiaries} verified
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">High Risk</p>
                <p className="metric-value mt-2">{overallStats.highRiskBeneficiaries}</p>
                <p className="text-sm text-muted-foreground mt-1">Requires attention</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-destructive/10 text-destructive">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">Active Contracts</p>
                <p className="metric-value mt-2">{overallStats.activeContracts}</p>
                <p className="text-sm text-muted-foreground mt-1">Smart contracts</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-success/10 text-success">
                <Lock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">Contract Balance</p>
                <p className="metric-value mt-2">${overallStats.totalContractBalance.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">Total secured</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-finance/10 text-finance">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="beneficiaries" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="beneficiaries" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Beneficiary Compliance
          </TabsTrigger>
          <TabsTrigger value="contracts" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Smart Contracts
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Risk Monitoring
          </TabsTrigger>
        </TabsList>

        {/* Beneficiary Compliance */}
        <TabsContent value="beneficiaries">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {beneficiaries.map((beneficiary) => (
                    <BeneficiaryCard
                      key={beneficiary.id}
                      beneficiary={beneficiary}
                      onRunCheck={runComplianceCheck}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Smart Contracts */}
        <TabsContent value="contracts">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Smart Contract Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {smartContracts.map((contract) => (
                    <SmartContractCard
                      key={contract.id}
                      contract={contract}
                      onExecute={executeMultisigTransaction}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Risk Monitoring */}
        <TabsContent value="monitoring">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Real-Time Risk Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      All disbursements are monitored in real-time for fraud patterns and compliance violations.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Scan className="h-5 w-5 text-warning" />
                        <h3 className="font-medium">Fraud Detection</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Transactions Scanned:</span>
                          <span className="font-medium">1,247</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Flagged for Review:</span>
                          <span className="font-medium text-warning">3</span>
                        </div>
                        <div className="flex justify-between">
                          <span>False Positives:</span>
                          <span className="font-medium">0.2%</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Shield className="h-5 w-5 text-success" />
                        <h3 className="font-medium">Compliance Status</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Compliance Rate:</span>
                          <span className="font-medium text-success">98.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Manual Reviews:</span>
                          <span className="font-medium">12</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Violations:</span>
                          <span className="font-medium">0</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}