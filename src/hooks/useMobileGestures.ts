import { useState, useEffect, useRef, useCallback } from 'react';

export interface TouchGesture {
  type: 'swipe' | 'pinch' | 'tap' | 'long-press';
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  scale?: number;
  duration?: number;
}

export interface UseMobileGesturesOptions {
  onSwipe?: (gesture: TouchGesture) => void;
  onPinch?: (gesture: TouchGesture) => void;
  onTap?: (gesture: TouchGesture) => void;
  onLongPress?: (gesture: TouchGesture) => void;
  swipeThreshold?: number;
  longPressDelay?: number;
  pinchThreshold?: number;
}

export function useMobileGestures(options: UseMobileGesturesOptions = {}) {
  const {
    onSwipe,
    onPinch,
    onTap,
    onLongPress,
    swipeThreshold = 50,
    longPressDelay = 500,
    pinchThreshold = 0.1
  } = options;

  const [isTouch, setIsTouch] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number; time: number } | null>(null);
  const [initialDistance, setInitialDistance] = useState<number | null>(null);
  const [currentScale, setCurrentScale] = useState(1);
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  // Detect if device supports touch
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Calculate distance between two touch points
  const getDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const startTime = Date.now();
    
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: startTime
    });

    // Handle multi-touch for pinch gestures
    if (e.touches.length === 2) {
      const distance = getDistance(e.touches[0], e.touches[1]);
      setInitialDistance(distance);
      setCurrentScale(1);
    }

    // Start long press timer
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress({
          type: 'long-press',
          duration: Date.now() - startTime
        });
      }, longPressDelay);
    }
  }, [onLongPress, longPressDelay, getDistance]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Cancel long press on move
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Handle pinch gesture
    if (e.touches.length === 2 && initialDistance && onPinch) {
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialDistance;
      
      if (Math.abs(scale - currentScale) > pinchThreshold) {
        setCurrentScale(scale);
        onPinch({
          type: 'pinch',
          scale: scale
        });
      }
    }
  }, [initialDistance, currentScale, onPinch, pinchThreshold, getDistance]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const endTime = Date.now();
    const endPoint = {
      x: touch.clientX,
      y: touch.clientY,
      time: endTime
    };

    setTouchEnd(endPoint);

    const deltaX = endPoint.x - touchStart.x;
    const deltaY = endPoint.y - touchStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = endTime - touchStart.time;

    // Determine gesture type
    if (distance < 10 && duration < 300) {
      // Tap gesture
      if (onTap) {
        onTap({
          type: 'tap',
          duration: duration
        });
      }
    } else if (distance > swipeThreshold) {
      // Swipe gesture
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      
      let direction: 'left' | 'right' | 'up' | 'down';
      
      if (absX > absY) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      if (onSwipe) {
        onSwipe({
          type: 'swipe',
          direction: direction,
          distance: distance
        });
      }
    }

    // Reset state
    setTouchStart(null);
    setTouchEnd(null);
    setInitialDistance(null);
    setCurrentScale(1);
  }, [touchStart, onTap, onSwipe, swipeThreshold]);

  // Attach event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !isTouch) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isTouch, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Prevent default touch behaviors when needed
  const preventDefaultTouch = useCallback((e: TouchEvent) => {
    if (e.touches.length > 1) {
      e.preventDefault(); // Prevent pinch-to-zoom
    }
  }, []);

  return {
    ref: elementRef,
    isTouch,
    touchStart,
    touchEnd,
    currentScale,
    preventDefaultTouch,
    // Helper methods
    enableTouchGestures: (element: HTMLElement) => {
      elementRef.current = element;
    },
    disableTouchGestures: () => {
      elementRef.current = null;
    }
  };
}

// Hook for detecting mobile device characteristics
export function useMobileDevice() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    orientation: 'portrait' as 'portrait' | 'landscape',
    screenSize: 'small' as 'small' | 'medium' | 'large',
    hasTouch: false,
    platform: 'unknown' as 'ios' | 'android' | 'windows' | 'macos' | 'unknown'
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Detect platform
      let platform: typeof deviceInfo.platform = 'unknown';
      if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        platform = 'ios';
      } else if (userAgent.includes('android')) {
        platform = 'android';
      } else if (userAgent.includes('windows')) {
        platform = 'windows';
      } else if (userAgent.includes('mac')) {
        platform = 'macos';
      }

      // Detect device type
      const isMobile = width <= 768;
      const isTablet = width > 768 && width <= 1024;
      const isDesktop = width > 1024;

      // Detect orientation
      const orientation = width > height ? 'landscape' : 'portrait';

      // Detect screen size
      let screenSize: typeof deviceInfo.screenSize = 'small';
      if (width >= 768 && width < 1024) {
        screenSize = 'medium';
      } else if (width >= 1024) {
        screenSize = 'large';
      }

      // Detect touch capability
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        orientation,
        screenSize,
        hasTouch,
        platform
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

// Hook for managing mobile-specific UI states
export function useMobileUI() {
  const [mobileUIState, setMobileUIState] = useState({
    isKeyboardOpen: false,
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
    statusBarHeight: 0,
    navigationBarHeight: 0
  });

  useEffect(() => {
    // Detect virtual keyboard
    const detectKeyboard = () => {
      const initialHeight = window.innerHeight;
      
      const handleResize = () => {
        const currentHeight = window.innerHeight;
        const heightDifference = initialHeight - currentHeight;
        
        setMobileUIState(prev => ({
          ...prev,
          isKeyboardOpen: heightDifference > 150 // Threshold for keyboard detection
        }));
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    };

    // Detect safe area insets (for notched devices)
    const detectSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      
      setMobileUIState(prev => ({
        ...prev,
        safeAreaInsets: {
          top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
          bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
          left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0'),
          right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0')
        }
      }));
    };

    const keyboardCleanup = detectKeyboard();
    detectSafeArea();

    return keyboardCleanup;
  }, []);

  return mobileUIState;
}

// Hook for mobile performance optimization
export function useMobilePerformance() {
  const [performanceMetrics, setPerformanceMetrics] = useState({
    isLowEndDevice: false,
    connectionType: 'unknown' as 'slow-2g' | '2g' | '3g' | '4g' | 'unknown',
    memoryInfo: null as any,
    batteryLevel: null as number | null,
    isCharging: false
  });

  useEffect(() => {
    // Detect device performance characteristics
    const detectPerformance = async () => {
      // Check hardware concurrency (CPU cores)
      const cores = navigator.hardwareConcurrency || 1;
      
      // Check memory (if available)
      const memory = (navigator as any).deviceMemory;
      
      // Estimate if it's a low-end device
      const isLowEndDevice = cores <= 2 || (memory && memory <= 2);

      // Check connection type
      const connection = (navigator as any).connection;
      const connectionType = connection?.effectiveType || 'unknown';

      // Check battery status (if available)
      let batteryLevel = null;
      let isCharging = false;
      
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          batteryLevel = battery.level;
          isCharging = battery.charging;
        } catch (error) {
          console.log('Battery API not available');
        }
      }

      setPerformanceMetrics({
        isLowEndDevice,
        connectionType,
        memoryInfo: { cores, memory },
        batteryLevel,
        isCharging
      });
    };

    detectPerformance();
  }, []);

  return performanceMetrics;
}