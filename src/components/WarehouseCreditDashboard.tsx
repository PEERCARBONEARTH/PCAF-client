
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  DollarSign,
  TrendingUp,
  Package,
  Truck,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Factory,
  MapPin,
  Calendar,
  Percent,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useWarehouseCredit } from "@/hooks/useWarehouseCredit";

const getStatusColor = (status: string) => {
  switch (status) {
    case 'verified': 
    case 'active':
    case 'delivered':
    case 'paid':
      return 'success';
    case 'pending':
    case 'manufacturing':
    case 'shipped':
      return 'warning';
    case 'rejected':
    case 'suspended':
    case 'overdue':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'verified':
    case 'delivered':
    case 'paid':
      return CheckCircle;
    case 'pending':
    case 'manufacturing':
    case 'shipped':
      return Clock;
    case 'rejected':
    case 'overdue':
      return AlertTriangle;
    default:
      return Package;
  }
};

export function WarehouseCreditDashboard() {
  const { 
    oemPartners, 
    warehouseFacility, 
    ecoboxOrders, 
    getOEMPerformanceMetrics,
    isProcessing 
  } = useWarehouseCredit();

  const performanceMetrics = getOEMPerformanceMetrics();
  const totalOrders = ecoboxOrders.length;
  const activeOrders = ecoboxOrders.filter(o => ['manufacturing', 'shipped'].includes(o.status)).length;
  const totalFinancingOutstanding = ecoboxOrders
    .filter(o => o.status !== 'delivered')
    .reduce((sum, o) => sum + o.financingAmount, 0);

  return (
    <div className="space-y-8">
      {/* Facility Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">Total Capacity</p>
                <p className="metric-value mt-2">${(warehouseFacility.totalCapacity / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-muted-foreground mt-1">USD</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                <Building className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">Available Credit</p>
                <p className="metric-value mt-2">${(warehouseFacility.availableCapacity / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-muted-foreground mt-1">{warehouseFacility.utilizationRate.toFixed(1)}% utilized</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-success/10 text-success">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
            <Progress value={warehouseFacility.utilizationRate} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">Active Orders</p>
                <p className="metric-value mt-2">{activeOrders}</p>
                <p className="text-sm text-muted-foreground mt-1">In production/transit</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-warning/10 text-warning">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">Outstanding</p>
                <p className="metric-value mt-2">${(totalFinancingOutstanding / 1000).toFixed(0)}K</p>
                <p className="text-sm text-muted-foreground mt-1">Financing amount</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-orange-500/10 text-orange-500">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="oem-partners" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="oem-partners">OEM Partners</TabsTrigger>
          <TabsTrigger value="orders">Ecobox Orders</TabsTrigger>
          <TabsTrigger value="repayments">Repayment Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="oem-partners">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="h-5 w-5" />
                OEM Partner Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Credit Utilization</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Payment Performance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceMetrics.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{partner.name}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {partner.country}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>${(partner.creditLimit - partner.availableCredit).toLocaleString()}</span>
                            <span className="text-muted-foreground">of ${partner.creditLimit.toLocaleString()}</span>
                          </div>
                          <Progress value={partner.utilizationRate} className="h-2" />
                          <p className="text-xs text-muted-foreground">{partner.utilizationRate.toFixed(1)}% utilized</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={partner.riskScore < 30 ? 'default' : partner.riskScore < 60 ? 'secondary' : 'destructive'}>
                            {partner.riskScore}/100
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-success">
                            <ArrowUpRight className="w-3 h-3" />
                            {partner.onTimePaymentRate}% on-time
                          </div>
                          <p className="text-muted-foreground">Avg: {partner.avgRepaymentTime} days</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(partner.verificationStatus) as any}>
                          {partner.verificationStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Ecobox Orders & Financing
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ecoboxOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No Ecobox orders yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Orders will appear here once created from tranche configurations</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Details</TableHead>
                      <TableHead>Financing</TableHead>
                      <TableHead>Timeline</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ecoboxOrders.map((order) => {
                      const StatusIcon = getStatusIcon(order.status);
                      return (
                        <TableRow key={order.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.schoolName}</p>
                              <p className="text-sm text-muted-foreground">
                                {order.quantity} units × ${order.unitCost.toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">{order.poNumber}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">${order.financingAmount.toLocaleString()}</p>
                              <p className="text-sm text-muted-foreground">
                                {order.financingPercentage}% of ${order.totalCost.toLocaleString()}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Expected: {new Date(order.expectedDelivery).toLocaleDateString()}</span>
                              </div>
                              {order.actualDelivery && (
                                <div className="flex items-center gap-1 text-success mt-1">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Delivered: {new Date(order.actualDelivery).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(order.status) as any} className="flex items-center gap-1 w-fit">
                              <StatusIcon className="w-3 h-3" />
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repayments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Repayment Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Automatic repayment tracking</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Repayments are automatically processed when tranche disbursements occur
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
