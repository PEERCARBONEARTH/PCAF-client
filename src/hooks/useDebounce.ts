import { useCallback, useRef } from 'react';

/**
 * Custom hook for debouncing function calls
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  return debouncedCallback;
}

/**
 * Custom hook for preventing rapid successive calls
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        return callback(...args);
      }
    },
    [callback, delay]
  ) as T;

  return throttledCallback;
}

/**
 * Custom hook for preventing multiple rapid clicks
 */
export function useClickDebounce(
  callback: () => void,
  delay: number = 1000
) {
  const isProcessingRef = useRef(false);

  const debouncedClick = useCallback(async () => {
    if (isProcessingRef.current) {
      console.log('Click debounced - already processing');
      return;
    }

    isProcessingRef.current = true;
    
    try {
      await callback();
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false;
      }, delay);
    }
  }, [callback, delay]);

  return debouncedClick;
}