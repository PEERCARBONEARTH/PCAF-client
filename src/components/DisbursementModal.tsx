import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Clock, 
  Shield, 
  CreditCard, 
  Smartphone, 
  Coins, 
  CheckCircle, 
  AlertTriangle,
  User,
  MapPin,
  DollarSign,
  FileText
} from "lucide-react";
import { useDisbursement, PaymentMethod } from "@/hooks/useDisbursement";

interface DisbursementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tranche: {
    id: string;
    schoolName: string;
    region: string;
    milestone: string;
    targetAmount: number;
    progress: number;
  };
}

const getPaymentMethodIcon = (type: PaymentMethod['type']) => {
  switch (type) {
    case 'bank': return CreditCard;
    case 'mobile': return Smartphone;
    case 'crypto': return Coins;
    default: return CreditCard;
  }
};

const getApprovalInfo = (amount: number) => {
  if (amount < 1000) return { level: 'Automatic', time: 'Instant', color: 'success' };
  if (amount < 5000) return { level: 'Manager Approval', time: '2-4 hours', color: 'warning' };
  if (amount < 25000) return { level: 'Director Approval', time: '1-2 days', color: 'warning' };
  return { level: 'Board Approval', time: '3-5 days', color: 'destructive' };
};

export function DisbursementModal({ open, onOpenChange, tranche }: DisbursementModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { paymentMethods, createDisbursementRequest } = useDisbursement();
  
  const selectedMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethod);
  const approvalInfo = getApprovalInfo(tranche.targetAmount);

  const handleSubmit = async () => {
    if (!selectedPaymentMethod) return;
    
    setIsSubmitting(true);
    try {
      await createDisbursementRequest(
        tranche.id,
        tranche.schoolName,
        tranche.targetAmount,
        selectedPaymentMethod
      );
      onOpenChange(false);
      setSelectedPaymentMethod('');
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-success" />
            Create Disbursement Request
          </DialogTitle>
          <DialogDescription>
            Set up fund release for completed milestone
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tranche Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Disbursement Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Beneficiary</p>
                    <p className="font-medium">{tranche.schoolName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{tranche.region}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Milestone</p>
                    <p className="font-medium">{tranche.milestone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-medium text-lg text-success">
                      ${tranche.targetAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approval Process */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Approval Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 rounded-sm bg-muted/50">
                <div className="flex items-center gap-3">
                  <Badge variant={approvalInfo.color as any}>
                    {approvalInfo.level}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Required for this amount</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {approvalInfo.time}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label htmlFor="payment-method">Select disbursement method</Label>
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => {
                    const Icon = getPaymentMethodIcon(method.type);
                    return (
                      <SelectItem key={method.id} value={method.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{method.name}</span>
                          {method.verified && (
                            <CheckCircle className="h-3 w-3 text-success" />
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {selectedMethod && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{selectedMethod.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {selectedMethod.verified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedMethod.details}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Processing Time:</span>
                          <p className="font-medium">{selectedMethod.processingTime}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Fees:</span>
                          <p className="font-medium">{selectedMethod.fees}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any special instructions or notes for this disbursement..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Warning */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This action will create a formal disbursement request. Funds will be released according to your organization's approval process and cannot be cancelled once processing begins.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedPaymentMethod || isSubmitting}
          >
            {isSubmitting ? 'Creating Request...' : 'Create Disbursement Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}