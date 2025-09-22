// AI Insights Demo Component - Demonstrates the AI insights integration
import React, { useState } from 'react';
import { AIInsightsPanel } from './AIInsightsPanel';
import { useAIInsights } from '../../hooks/useAIInsights';
import { Brain, Database, RefreshCw, CheckCircle } from 'lucide-react';

export function AIInsightsDemo() {
  const [selectedRole, setSelectedRole] = useState('risk_manager');
  const { summary, refreshInsights, isLoading } = useAIInsights({
    userRole: selectedRole,
    loadOnMount: true
  });

  const simulateDataIngestion = () => {
    // Simulate a data ingestion completion event
    const mockIngestionResult = {
      uploadId: `demo_${Date.now()}`,
      totalLoans: 1247,
      successfulCalculations: 1198,
      totalEmissions: 2847.5,
      averageDataQuality: 2.3,
      processingTime: '45 seconds',
      timestamp: new Date(),
      fromMock: true
    };

    console.log('🧪 Demo: Simulating data ingestion completion');
    
    // Dispatch the same events that the real workflow would dispatch
    window.dispatchEvent(new CustomEvent('dataIngestionComplete', {
      detail: mockIngestionResult
    }));
    
    window.dispatchEvent(new CustomEvent('aiInsightsRefresh', {
      detail: {
        trigger: 'data_ingestion_complete',
        ingestionResult: mockIngestionResult,
        timestamp: new Date()
      }
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              AI Insights Integration Demo
            </h1>
            <p className="text-gray-600">
              Demonstrates how AI insights automatically update when data ingestion completes
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Data Status</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              {summary.hasInsights ? 'Data Available' : 'No Data'}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Last Updated</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              {summary.lastUpdated || 'Never'}
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">Insights Status</span>
            </div>
            <p className="text-sm text-purple-700 mt-1">
              {summary.isStale ? 'Stale' : 'Fresh'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={simulateDataIngestion}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Database className="h-4 w-4" />
            <span>Simulate Data Ingestion</span>
          </button>

          <button
            onClick={refreshInsights}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Manual Refresh</span>
          </button>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="executive">Executive</option>
            <option value="risk_manager">Risk Manager</option>
            <option value="compliance_officer">Compliance Officer</option>
            <option value="loan_officer">Loan Officer</option>
            <option value="data_analyst">Data Analyst</option>
          </select>
        </div>
      </div>

      {/* AI Insights Panel */}
      <AIInsightsPanel
        userRole={selectedRole}
        showRefreshButton={true}
        showRoleSelector={false}
        className="min-h-[600px]"
      />

      {/* Integration Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Integration Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Automatic Updates</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Listens for data ingestion completion events</li>
              <li>• Automatically refreshes insights with new data</li>
              <li>• Updates portfolio metrics and recommendations</li>
              <li>• Maintains data version tracking</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Real-time Features</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Live status indicators</li>
              <li>• Automatic stale data detection</li>
              <li>• Role-based insight customization</li>
              <li>• Error handling and recovery</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIInsightsDemo;