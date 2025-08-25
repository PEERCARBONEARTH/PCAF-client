// Amortization Settings Page for PCAF Attribution Factor Management
import React from 'react';
import { AmortizationManager } from '@/components/AmortizationManager';
import { LMSConfigurationManager } from '@/components/LMSConfigurationManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AmortizationSettings() {
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="amortization" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="amortization">Amortization Manager</TabsTrigger>
          <TabsTrigger value="lms-integration">LMS Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="amortization" className="space-y-4">
          <AmortizationManager />
        </TabsContent>

        <TabsContent value="lms-integration" className="space-y-4">
          <LMSConfigurationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}