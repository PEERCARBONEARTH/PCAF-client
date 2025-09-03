import { useState, useCallback } from 'react';
import { useAssumptions } from '@/contexts/AssumptionsContext';

export interface AssumptionRow {
  id: string;
  vehicleType: string;
  activityBasis: 'distance' | 'fuel';
  annualDistance: number;
  fuelConsumption: number;
  region: string;
  sourceLabel: string;
  evidenceUrl: string;
}

export function useAssumptionsBuilder() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const { assumptions, updateAssumptions } = useAssumptions();

  const openBuilder = useCallback(() => {
    setIsBuilderOpen(true);
  }, []);

  const closeBuilder = useCallback(() => {
    setIsBuilderOpen(false);
  }, []);

  const saveAssumptions = useCallback((newAssumptions: AssumptionRow[]) => {
    // Convert AssumptionRow[] to the format expected by AssumptionsContext
    const assumptionsData = {
      vehicleTypes: newAssumptions.reduce((acc, assumption) => {
        acc[assumption.vehicleType] = {
          activityBasis: assumption.activityBasis,
          annualDistance: assumption.annualDistance,
          fuelConsumption: assumption.fuelConsumption,
          region: assumption.region,
          sourceLabel: assumption.sourceLabel,
          evidenceUrl: assumption.evidenceUrl,
          lastUpdated: new Date().toISOString()
        };
        return acc;
      }, {} as Record<string, any>),
      lastUpdated: new Date().toISOString(),
      version: (assumptions?.version || 0) + 1
    };

    updateAssumptions(assumptionsData);
  }, [assumptions, updateAssumptions]);

  const getCurrentAssumptions = useCallback((): AssumptionRow[] => {
    if (!assumptions?.vehicleTypes) {
      return [];
    }

    return Object.entries(assumptions.vehicleTypes).map(([vehicleType, data]: [string, any]) => ({
      id: vehicleType,
      vehicleType,
      activityBasis: data.activityBasis || 'distance',
      annualDistance: data.annualDistance || 15000,
      fuelConsumption: data.fuelConsumption || 8.5,
      region: data.region || 'Global',
      sourceLabel: data.sourceLabel || '',
      evidenceUrl: data.evidenceUrl || ''
    }));
  }, [assumptions]);

  return {
    isBuilderOpen,
    openBuilder,
    closeBuilder,
    saveAssumptions,
    getCurrentAssumptions,
    hasAssumptions: !!assumptions?.vehicleTypes && Object.keys(assumptions.vehicleTypes).length > 0
  };
}