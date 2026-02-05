/**
 * AnalyticsProvider component
 * Provides analytics tracking functions throughout the app via React Context
 * Wraps analytics utility functions for easy consumption by components
 */
import React, {createContext, useContext, useMemo} from 'react';
import {
  trackPageView,
  trackSearchQuery,
  getTopPages,
  getZeroResultQueries,
  getRecentSearches,
  getSearchStats,
  clearAnalyticsData,
  exportAnalyticsData,
  type PageView,
  type SearchQuery,
  type SearchStats,
} from '@site/src/utils/analytics';

/**
 * Analytics context value type
 */
export interface AnalyticsContextValue {
  trackPageView: (path: string) => void;
  trackSearchQuery: (query: string, resultCount: number) => void;
  getTopPages: (limit?: number) => PageView[];
  getZeroResultQueries: (limit?: number) => SearchQuery[];
  getRecentSearches: (limit?: number) => SearchQuery[];
  getSearchStats: () => SearchStats;
  clearAnalyticsData: () => void;
  exportAnalyticsData: () => string;
}

/**
 * Analytics context
 */
const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

/**
 * Props for AnalyticsProvider component
 */
export interface AnalyticsProviderProps {
  children: React.ReactNode;
}

/**
 * AnalyticsProvider component
 * Provides analytics tracking functions to all child components
 */
export default function AnalyticsProvider({
  children,
}: AnalyticsProviderProps): React.ReactElement {
  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo<AnalyticsContextValue>(
    () => ({
      trackPageView,
      trackSearchQuery,
      getTopPages,
      getZeroResultQueries,
      getRecentSearches,
      getSearchStats,
      clearAnalyticsData,
      exportAnalyticsData,
    }),
    []
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

/**
 * Hook to access analytics context
 * @throws Error if used outside AnalyticsProvider
 */
export function useAnalytics(): AnalyticsContextValue {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }

  return context;
}
