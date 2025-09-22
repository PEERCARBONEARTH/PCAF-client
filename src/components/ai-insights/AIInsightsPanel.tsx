// AI Insights Panel Component - Displays AI-generated insights with automatic updates
import React, { useState } from 'react';
import { useAIInsights } from '../../hooks/useAIInsights';
import { Brain, RefreshCw, AlertCircle, Clock, TrendingUp, Users } from 'lucide-react';

interface AIInsightsPanelProps {
  userRole?: string;
  className?: string;
  showRefreshButton?: boolean;
  showRoleSelector?: boolean;
}

const USER_ROLES = [
  { value: 'executive', label: 'Executive', icon: TrendingUp },
  { value: 'risk_manager', label: 'Risk Manager', icon: AlertCircle },
  { value: 'compliance_officer', label: 'Compliance Officer', icon: Users },
  { value: 'loan_officer', label: 'Loan Officer', icon: Users },
  { value: 'data_analyst', label: 'Data Analyst', icon: Brain }
];

export function AIInsightsPanel({
  userRole = 'risk_manager',
  className = '',
  showRefreshButton = true,
  showRoleSelector = false
}: AIInsightsPanelProps) {
  const [selectedRole, setSelectedRole] = useState(userRole);
  
  const {
    insights,
    isLoading,
    error,
    lastUpdated,
    hasRecentInsights,
    refreshInsights,
    loadInsightsForRole,
    summary
  } = useAIInsights({
    userRole: selectedRole,
    autoRefresh: true,
    refreshIntervalMinutes: 30,
    loadOnMount: true
  });

  const handleRoleChange = async (newRole: string) => {
    setSelectedRole(newRole);
    await loadInsightsForRole(newRole);
  };

  const handleRefresh = async () => {
    await refreshInsights();
  };

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center space-x-2 text-red-700 mb-2">
          <AlertCircle className="h-5 w-5" />
          <h3 className="font-semibold">AI Insights Error</h3>
        </div>
        <p className="text-red-600 text-sm">{error}</p>
        {showRefreshButton && (
          <button
            onClick={handleRefresh}
            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
            {!hasRecentInsights && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Stale Data
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {lastUpdated && (
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {(() => {
                  try {
                    const date = lastUpdated instanceof Date ? lastUpdated : new Date(lastUpdated);
                    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleTimeString();
                  } catch (error) {
                    return 'Unknown time';
                  }
                })()}
              </div>
            )}
            
            {showRefreshButton && (
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                title="Refresh insights"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Role Selector */}
        {showRoleSelector && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              View for Role:
            </label>
            <select
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {USER_ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-600">Generating AI insights...</span>
          </div>
        ) : insights ? (
          <div className="space-y-6">
            {/* Executive Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {insights.title}
              </h3>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <p className="text-sm text-blue-800 font-medium">
                  {insights.executiveSummary}
                </p>
              </div>
            </div>

            {/* Key Takeaways */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Key Takeaways</h4>
              <ul className="space-y-2">
                {insights.keyTakeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Items */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Recommended Actions</h4>
              <ul className="space-y-2">
                {insights.actionItems.map((action, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Business Impact */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Business Impact</h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {insights.businessImpact}
              </p>
            </div>

            {/* Risk Assessment */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Risk Assessment</h4>
              <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg">
                {insights.riskAssessment}
              </p>
            </div>

            {/* Benchmark Comparison */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Benchmark Comparison</h4>
              <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                {insights.benchmarkComparison}
              </p>
            </div>

            {/* Detailed Narrative */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Detailed Analysis</h4>
              <div 
                className="text-sm text-gray-700 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: insights.narrative.replace(/\n/g, '<br />') }}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No AI insights available</p>
            <p className="text-sm text-gray-500 mt-1">
              Complete a data ingestion to generate insights
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIInsightsPanel;