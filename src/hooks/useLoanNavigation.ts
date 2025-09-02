import { useState, useCallback } from 'react';
import { type LoanPortfolioItem } from '@/lib/db';

export interface LoanNavigationState {
  selectedLoan: LoanPortfolioItem | null;
  isModalOpen: boolean;
  previousLoan: LoanPortfolioItem | null;
  nextLoan: LoanPortfolioItem | null;
  currentIndex: number;
  totalLoans: number;
}

export function useLoanNavigation(loans: LoanPortfolioItem[]) {
  const [navigationState, setNavigationState] = useState<LoanNavigationState>({
    selectedLoan: null,
    isModalOpen: false,
    previousLoan: null,
    nextLoan: null,
    currentIndex: -1,
    totalLoans: loans.length
  });

  const openLoanDetail = useCallback((loan: LoanPortfolioItem) => {
    const currentIndex = loans.findIndex(l => l.loan_id === loan.loan_id);
    const previousLoan = currentIndex > 0 ? loans[currentIndex - 1] : null;
    const nextLoan = currentIndex < loans.length - 1 ? loans[currentIndex + 1] : null;

    setNavigationState({
      selectedLoan: loan,
      isModalOpen: true,
      previousLoan,
      nextLoan,
      currentIndex,
      totalLoans: loans.length
    });
  }, [loans]);

  const closeLoanDetail = useCallback(() => {
    setNavigationState(prev => ({
      ...prev,
      selectedLoan: null,
      isModalOpen: false
    }));
  }, []);

  const navigateToPrevious = useCallback(() => {
    if (navigationState.previousLoan) {
      openLoanDetail(navigationState.previousLoan);
    }
  }, [navigationState.previousLoan, openLoanDetail]);

  const navigateToNext = useCallback(() => {
    if (navigationState.nextLoan) {
      openLoanDetail(navigationState.nextLoan);
    }
  }, [navigationState.nextLoan, openLoanDetail]);

  const navigateToLoanById = useCallback((loanId: string) => {
    const loan = loans.find(l => l.loan_id === loanId);
    if (loan) {
      openLoanDetail(loan);
    }
  }, [loans, openLoanDetail]);

  return {
    navigationState,
    openLoanDetail,
    closeLoanDetail,
    navigateToPrevious,
    navigateToNext,
    navigateToLoanById
  };
}