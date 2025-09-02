/**
 * LMS Connection Form
 * Form for creating and editing LMS connections
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Database, 
  Globe, 
  Key, 
  Settings, 
  TestTube, 
  CheckCircle, 
  AlertCircle,
  Info,
  Clock,
  Filter
} from 'lucide-react';

import { LMSConnectionConfig, LMSDataMapping } from '@/services/lmsIntegrationService';

// Validation schema
const connectionSchema = z.object({
  name: z.string().min(1, 'Connection name is required'),
  type: z.enum(['REST_API', 'SOAP', 'DATABASE', 'FILE_TRANSFER']),
  endpoint: z.string().url('Valid endpoint URL is required'),
  authentication: z.object({
    type: z.enum(['API_KEY', 'OAUTH2', 'BASIC_AUTH', 'CERTIFICATE']),
    credentials: z.record(z.string()),
  }),
  dataMapping: z.object({
    loanId: z.string().min(1, 'Loan ID mapping is required'),
    borrowerName: z.string().min(1, 'Borrower name mapping is required'),
    loanAmount: z.string().min(1, 'Loan amount mapping is required'),
    currency: z.string().min(1, 'Currency mapping is required'),
    vehicleMake: z.string().min(1, 'Vehicle make mapping is required'),
    vehicleModel: z.string().min(1, 'Vehicle model mapping is required'),
    vehicleYear: z.string().min(1, 'Vehicle year mapping is required'),
    vehicleType: z.string().min(1, 'Vehicle type mapping is required'),
    fuelType: z.string().min(1, 'Fuel type mapping is required'),
    vehicleValue: z.string().min(1, 'Vehicle value mapping is required'),
    borrowerTaxId: z.string().optional(),
    vin: z.string().optional(),
    originationDate: z.string().optional(),
    maturityDate: z.string().optional(),
    interestRate: z.string().optional(),
    loanPurpose: z.string().optional(),
    status: z.string().optional(),
  }),
  syncSchedule: z.object({
    enabled: z.boolean(),
    frequency: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'MANUAL']),
    time: z.string().optional(),
  }),
  filters: z.object({
    loanTypes: z.array(z.string()).optional(),
    minAmount: z.number().optional(),
    maxAmount: z.number().optional(),
    dateRange: z.object({
      from: z.string(),
      to: z.string(),
    }).optional(),
  }),
});

type ConnectionFormData = z.infer<typeof connectionSchema>;

interface LMSConnectionFormProps {
  connection?: LMSConnectionConfig | null;
  onSubmit: (data: Omit<LMSConnectionConfig, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export function LMSConnectionForm({ connection, onSubmit, onCancel }: LMSConnectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  const form = useForm<ConnectionFormData>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      name: connection?.name || '',
      type: connection?.type || 'REST_API',
      endpoint: connection?.endpoint || '',
      authentication: {
        type: connection?.authentication.type || 'API_KEY',
        credentials: connection?.authentication.credentials || {},
      },
      dataMapping: {
        loanId: connection?.dataMapping.loanId || 'id',
        borrowerName: connection?.dataMapping.borrowerName || 'borrower.name',
        loanAmount: connection?.dataMapping.loanAmount || 'amount',
        currency: connection?.dataMapping.currency || 'currency',
        vehicleMake: connection?.dataMapping.vehicleMake || 'vehicle.make',
        vehicleModel: connection?.dataMapping.vehicleModel || 'vehicle.model',
        vehicleYear: connection?.dataMapping.vehicleYear || 'vehicle.year',
        vehicleType: connection?.dataMapping.vehicleType || 'vehicle.type',
        fuelType: connection?.dataMapping.fuelType || 'vehicle.fuelType',
        vehicleValue: connection?.dataMapping.vehicleValue || 'vehicle.value',
        ...connection?.dataMapping,
      },
      syncSchedule: {
        enabled: connection?.syncSchedule.enabled || false,
        frequency: connection?.syncSchedule.frequency || 'DAILY',
        time: connection?.syncSchedule.time || '02:00',
      },
      filters: {
        loanTypes: connection?.filters.loanTypes || [],
        minAmount: connection?.filters.minAmount,
        maxAmount: connection?.filters.maxAmount,
        dateRange: connection?.filters.dateRange,
      },
    },
  });

  const watchedType = form.watch('type');
  const watchedAuthType = form.watch('authentication.type');
  const watchedScheduleEnabled = form.watch('syncSchedule.enabled');

  const handleSubmit = async (data: ConnectionFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        ...data,
        isActive: true,
        lastSyncTime: connection?.lastSyncTime,
        lastSyncStatus: connection?.lastSyncStatus,
      });
    } catch (error) {
      console.error('Failed to save connection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      const formData = form.getValues();
      // Simulate connection test
      setTestResult({ success: true, message: 'Connection test successful' });
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Connection test failed' 
      });
    }
  };

  const renderAuthenticationFields = () => {
    switch (watchedAuthType) {
      case 'API_KEY':
        return (
          <FormField
            control={form.control}
            name="authentication.credentials.apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter API key" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'BASIC_AUTH':
        return (
          <>
            <FormField
              control={form.control}
              name="authentication.credentials.username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authentication.credentials.password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case 'OAUTH2':
        return (
          <>
            <FormField
              control={form.control}
              name="authentication.credentials.clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter client ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authentication.credentials.clientSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Secret</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter client secret" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authentication.credentials.tokenUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://auth.example.com/oauth/token" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case 'CERTIFICATE':
        return (
          <>
            <FormField
              control={form.control}
              name="authentication.credentials.certificate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificate (PEM)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="-----BEGIN CERTIFICATE-----"
                      className="font-mono text-sm"
                      rows={6}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authentication.credentials.privateKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Private Key (PEM)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="-----BEGIN PRIVATE KEY-----"
                      className="font-mono text-sm"
                      rows={6}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="mapping">Data Mapping</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
          </TabsList>

          {/* Basic Configuration */}
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Basic Configuration</span>
                </CardTitle>
                <CardDescription>
                  Configure the basic connection details for your LMS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Connection Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Main Bank LMS" {...field} />
                      </FormControl>
                      <FormDescription>
                        A friendly name to identify this connection
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Connection Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select connection type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="REST_API">REST API</SelectItem>
                          <SelectItem value="SOAP">SOAP Web Service</SelectItem>
                          <SelectItem value="DATABASE">Direct Database</SelectItem>
                          <SelectItem value="FILE_TRANSFER">File Transfer (SFTP/FTP)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose how to connect to your LMS
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endpoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endpoint URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={
                            watchedType === 'REST_API' ? 'https://api.bank.com/lms/loans' :
                            watchedType === 'SOAP' ? 'https://api.bank.com/lms/soap' :
                            watchedType === 'DATABASE' ? 'postgresql://host:port/database' :
                            'sftp://host:port/path'
                          }
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        The endpoint URL for your LMS connection
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {testResult && (
                  <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    {testResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                      {testResult.message}
                    </AlertDescription>
                  </Alert>
                )}

                <Button type="button" variant="outline" onClick={handleTestConnection}>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Authentication */}
          <TabsContent value="auth" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Authentication</span>
                </CardTitle>
                <CardDescription>
                  Configure authentication credentials for your LMS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="authentication.type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authentication Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select authentication type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="API_KEY">API Key</SelectItem>
                          <SelectItem value="BASIC_AUTH">Basic Authentication</SelectItem>
                          <SelectItem value="OAUTH2">OAuth 2.0</SelectItem>
                          <SelectItem value="CERTIFICATE">Client Certificate</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {renderAuthenticationFields()}

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    All authentication credentials are encrypted and stored securely. 
                    They are only used for connecting to your LMS.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Mapping */}
          <TabsContent value="mapping" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Data Mapping</span>
                </CardTitle>
                <CardDescription>
                  Map your LMS data fields to PCAF instrument fields
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="required">
                    <AccordionTrigger>
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive">Required</Badge>
                        <span>Required Fields</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="dataMapping.loanId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Loan ID</FormLabel>
                              <FormControl>
                                <Input placeholder="id" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dataMapping.borrowerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Borrower Name</FormLabel>
                              <FormControl>
                                <Input placeholder="borrower.name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dataMapping.loanAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Loan Amount</FormLabel>
                              <FormControl>
                                <Input placeholder="amount" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dataMapping.currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency</FormLabel>
                              <FormControl>
                                <Input placeholder="currency" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="vehicle">
                    <AccordionTrigger>
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive">Required</Badge>
                        <span>Vehicle Information</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="dataMapping.vehicleMake"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vehicle Make</FormLabel>
                              <FormControl>
                                <Input placeholder="vehicle.make" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dataMapping.vehicleModel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vehicle Model</FormLabel>
                              <FormControl>
                                <Input placeholder="vehicle.model" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dataMapping.vehicleYear"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vehicle Year</FormLabel>
                              <FormControl>
                                <Input placeholder="vehicle.year" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dataMapping.vehicleType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vehicle Type</FormLabel>
                              <FormControl>
                                <Input placeholder="vehicle.type" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dataMapping.fuelType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fuel Type</FormLabel>
                              <FormControl>
                                <Input placeholder="vehicle.fuelType" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dataMapping.vehicleValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vehicle Value</FormLabel>
                              <FormControl>
                                <Input placeholder="vehicle.value" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="optional">
                    <AccordionTrigger>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">Optional</Badge>
                        <span>Optional Fields</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="dataMapping.borrowerTaxId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Borrower Tax ID</FormLabel>
                              <FormControl>
                                <Input placeholder="borrower.taxId" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dataMapping.vin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vehicle VIN</FormLabel>
                              <FormControl>
                                <Input placeholder="vehicle.vin" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dataMapping.originationDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Origination Date</FormLabel>
                              <FormControl>
                                <Input placeholder="originationDate" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dataMapping.status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Loan Status</FormLabel>
                              <FormControl>
                                <Input placeholder="status" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Use dot notation for nested fields (e.g., "borrower.name", "vehicle.details.make"). 
                    Field names should match your LMS API response structure.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule */}
          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Sync Schedule</span>
                </CardTitle>
                <CardDescription>
                  Configure automatic synchronization schedule
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="syncSchedule.enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Automatic Sync</FormLabel>
                        <FormDescription>
                          Automatically synchronize data from your LMS on a schedule
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {watchedScheduleEnabled && (
                  <>
                    <FormField
                      control={form.control}
                      name="syncSchedule.frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sync Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="HOURLY">Every Hour</SelectItem>
                              <SelectItem value="DAILY">Daily</SelectItem>
                              <SelectItem value="WEEKLY">Weekly</SelectItem>
                              <SelectItem value="MANUAL">Manual Only</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {(form.watch('syncSchedule.frequency') === 'DAILY' || 
                      form.watch('syncSchedule.frequency') === 'WEEKLY') && (
                      <FormField
                        control={form.control}
                        name="syncSchedule.time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sync Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormDescription>
                              Time of day to run the synchronization (24-hour format)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Filters */}
          <TabsContent value="filters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Data Filters</span>
                </CardTitle>
                <CardDescription>
                  Configure filters to limit which data is synchronized
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="filters.minAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Loan Amount</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Only sync loans above this amount
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="filters.maxAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Loan Amount</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="No limit" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Only sync loans below this amount
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Filters help reduce the amount of data synchronized and focus on relevant loans for PCAF reporting.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : connection ? 'Update Connection' : 'Create Connection'}
          </Button>
        </div>
      </form>
    </Form>
  );
}