import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "KES" | "UGX" | "TZS" | "NGN" | "INR";

export type ActivityBasis = 'distance' | 'fuel';

export interface CategoryAssumption {
  basis: ActivityBasis; // distance = km/year, fuel = liters/year
  annual_km?: number;
  region?: 'local' | 'regional' | 'national';
  source_label?: string; // e.g., "Nairobi city transport survey 2022"
  evidence_url?: string;
  approved?: boolean;
  version?: string; // stamped when approved
  updated_at?: string; // ISO
}

export interface Assumptions {
  total_portfolio_revenue?: number; // in selected currency
  currency?: CurrencyCode;
  period_year?: string; // e.g., "2024"
  evidence_url?: string;
  notes?: string;
  last_updated?: string; // ISO date string
  // New: Per-vehicle-type assumptions and versioning
  categories?: Record<string, CategoryAssumption>;
  active_version?: string; // current approved version id
  version_history?: Array<{ id: string; date: string; note?: string }>; // simple audit trail
}

interface AssumptionsContextType {
  assumptions: Assumptions;
  isComplete: boolean;
  save: (updates: Assumptions) => void;
  clear: () => void;
  // New helpers (backward compatible: existing callers unaffected)
  saveCategory: (vehicleType: string, updates: Partial<CategoryAssumption>) => void;
  approveVersion: (note?: string) => void;
  getCategory: (vehicleType: string) => CategoryAssumption | undefined;
}

const STORAGE_KEY = "pcaf-assumptions";

const AssumptionsContext = createContext<AssumptionsContextType | undefined>(undefined);

export function AssumptionsProvider({ children }: { children: React.ReactNode }) {
  const [assumptions, setAssumptions] = useState<Assumptions>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setAssumptions(JSON.parse(raw));
    } catch (e) {
      console.error("Failed to load assumptions", e);
    }
  }, []);

  const isComplete = useMemo(() => {
    const hasRevenue = !!assumptions.total_portfolio_revenue && (assumptions.total_portfolio_revenue as number) > 0;
    const hasAnyCategory = assumptions.categories && Object.keys(assumptions.categories).length > 0;
    return !!(hasRevenue || hasAnyCategory);
  }, [assumptions]);

  const persist = (next: Assumptions) => {
    setAssumptions(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error("Failed to persist assumptions", e);
    }
  };

  const save = (updates: Assumptions) => {
    const next = {
      ...assumptions,
      ...updates,
      last_updated: new Date().toISOString(),
    } as Assumptions;
    persist(next);
  };

  const saveCategory = (vehicleType: string, updates: Partial<CategoryAssumption>) => {
    const key = vehicleType; // keep as provided (e.g., "passenger_car")
    const existing = assumptions.categories?.[key] || ({} as CategoryAssumption);
    const merged: CategoryAssumption = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
      // reset approval if modified
      approved: updates ? false : existing.approved,
    };
    const next: Assumptions = {
      ...assumptions,
      categories: { ...(assumptions.categories || {}), [key]: merged },
      last_updated: new Date().toISOString(),
    };
    persist(next);
  };

  const approveVersion = (note?: string) => {
    const id = new Date().toISOString();
    const stampedCategories: Record<string, CategoryAssumption> = Object.fromEntries(
      Object.entries(assumptions.categories || {}).map(([k, v]) => [
        k,
        {
          ...v,
          approved: true,
          version: id,
          updated_at: new Date().toISOString(),
        },
      ])
    );

    const next: Assumptions = {
      ...assumptions,
      categories: stampedCategories,
      active_version: id,
      version_history: [
        { id, date: id, note },
        ...((assumptions.version_history as Array<{ id: string; date: string; note?: string }>) || []),
      ],
      last_updated: new Date().toISOString(),
    };
    persist(next);
  };

  const clear = () => {
    setAssumptions({});
    localStorage.removeItem(STORAGE_KEY);
  };

  const getCategory = (vehicleType: string) => assumptions.categories?.[vehicleType];

  return (
    <AssumptionsContext.Provider value={{ assumptions, isComplete, save, clear, saveCategory, approveVersion, getCategory }}>
      {children}
    </AssumptionsContext.Provider>
  );
}

export function useAssumptions() {
  const ctx = useContext(AssumptionsContext);
  if (!ctx) throw new Error("useAssumptions must be used within AssumptionsProvider");
  return ctx;
}

