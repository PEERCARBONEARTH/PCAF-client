
import { useState, useCallback, useEffect } from 'react';
import { TrancheAPI, TrancheData, TrancheFilters, TranchePaginatedResponse } from '@/api/tranches';
import { useToast } from '@/hooks/use-toast';

export interface UseTrancheDataReturn {
  tranches: TrancheData[];
  loading: boolean;
  error: string | null;
  pagination: TranchePaginatedResponse['pagination'] | null;
  filters: TrancheFilters;
  stats: {
    totalTranches: number;
    readyToDisburse: { count: number; amount: number };
    monitoring: { active: number; percentage: number };
    avgTriggerTime: number;
  } | null;
  setFilters: (filters: TrancheFilters) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  refreshData: () => Promise<void>;
  clearFilters: () => void;
}

export function useTrancheData(): UseTrancheDataReturn {
  const [tranches, setTranches] = useState<TrancheData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<TranchePaginatedResponse['pagination'] | null>(null);
  const [filters, setFilters] = useState<TrancheFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [stats, setStats] = useState<UseTrancheDataReturn['stats']>(null);
  const { toast } = useToast();

  const fetchTranches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await TrancheAPI.getTranches(page, pageSize, filters);
      setTranches(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tranches';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters, toast]);

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await TrancheAPI.getTrancheStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([fetchTranches(), fetchStats()]);
  }, [fetchTranches, fetchStats]);

  const handleSetFilters = useCallback((newFilters: TrancheFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  }, []);

  const handleSetPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
    setPage(1); // Reset to first page when page size changes
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchTranches();
  }, [fetchTranches]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    tranches,
    loading,
    error,
    pagination,
    filters,
    stats,
    setFilters: handleSetFilters,
    setPage: handleSetPage,
    setPageSize: handleSetPageSize,
    refreshData,
    clearFilters
  };
}
