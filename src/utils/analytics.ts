/**
 * Analytics Utility Module
 * Privacy-respecting analytics for tracking page views and search queries
 * All data stored locally in browser localStorage - no PII collection
 */

/**
 * Page view event data
 */
export interface PageView {
  path: string;
  timestamp: number;
  viewCount: number;
}

/**
 * Search query event data
 */
export interface SearchQuery {
  query: string;
  timestamp: number;
  resultCount: number;
  hasResults: boolean;
}

/**
 * Analytics data structure stored in localStorage
 */
export interface AnalyticsData {
  pageViews: PageView[];
  searchQueries: SearchQuery[];
  version: string;
}

/**
 * Analytics storage keys
 */
const STORAGE_KEY = 'viyu_analytics';
const STORAGE_VERSION = '1.0.0';

/**
 * Maximum number of events to store (prevent unbounded growth)
 */
const MAX_PAGE_VIEWS = 1000;
const MAX_SEARCH_QUERIES = 500;

/**
 * Get analytics data from localStorage
 */
export function getAnalyticsData(): AnalyticsData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return createEmptyAnalyticsData();
    }

    const data = JSON.parse(stored) as AnalyticsData;

    // Validate data structure
    if (!data.version || !Array.isArray(data.pageViews) || !Array.isArray(data.searchQueries)) {
      return createEmptyAnalyticsData();
    }

    return data;
  } catch (error) {
    // If parsing fails or localStorage is unavailable, return empty data
    return createEmptyAnalyticsData();
  }
}

/**
 * Save analytics data to localStorage
 */
export function saveAnalyticsData(data: AnalyticsData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    // Silently fail if localStorage is unavailable or quota exceeded
    // This ensures analytics never breaks the user experience
  }
}

/**
 * Create empty analytics data structure
 */
function createEmptyAnalyticsData(): AnalyticsData {
  return {
    pageViews: [],
    searchQueries: [],
    version: STORAGE_VERSION,
  };
}

/**
 * Track a page view
 * @param path - The page path (e.g., "/docs/getting-started/overview")
 */
export function trackPageView(path: string): void {
  if (!path) {
    return;
  }

  const data = getAnalyticsData();
  const now = Date.now();

  // Find existing page view for this path
  const existingIndex = data.pageViews.findIndex((pv) => pv.path === path);

  if (existingIndex >= 0) {
    // Update existing page view
    data.pageViews[existingIndex] = {
      path,
      timestamp: now,
      viewCount: data.pageViews[existingIndex].viewCount + 1,
    };
  } else {
    // Add new page view
    data.pageViews.push({
      path,
      timestamp: now,
      viewCount: 1,
    });
  }

  // Trim old page views if exceeding max
  if (data.pageViews.length > MAX_PAGE_VIEWS) {
    // Sort by timestamp (oldest first) and remove oldest entries
    data.pageViews.sort((a, b) => a.timestamp - b.timestamp);
    data.pageViews = data.pageViews.slice(-MAX_PAGE_VIEWS);
  }

  saveAnalyticsData(data);
}

/**
 * Track a search query
 * @param query - The search query string (anonymized)
 * @param resultCount - Number of results returned
 */
export function trackSearchQuery(query: string, resultCount: number): void {
  if (!query) {
    return;
  }

  const data = getAnalyticsData();
  const now = Date.now();

  // Anonymize query - trim whitespace and lowercase for consistency
  const anonymizedQuery = query.trim().toLowerCase();

  data.searchQueries.push({
    query: anonymizedQuery,
    timestamp: now,
    resultCount,
    hasResults: resultCount > 0,
  });

  // Trim old search queries if exceeding max
  if (data.searchQueries.length > MAX_SEARCH_QUERIES) {
    // Sort by timestamp (oldest first) and remove oldest entries
    data.searchQueries.sort((a, b) => a.timestamp - b.timestamp);
    data.searchQueries = data.searchQueries.slice(-MAX_SEARCH_QUERIES);
  }

  saveAnalyticsData(data);
}

/**
 * Get top pages by view count
 * @param limit - Maximum number of pages to return (default: 10)
 */
export function getTopPages(limit: number = 10): PageView[] {
  const data = getAnalyticsData();

  // Sort by view count (descending) and return top N
  return [...data.pageViews]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit);
}

/**
 * Get zero-result search queries
 * @param limit - Maximum number of queries to return (default: 20)
 */
export function getZeroResultQueries(limit: number = 20): SearchQuery[] {
  const data = getAnalyticsData();

  // Filter for queries with no results and return most recent
  return data.searchQueries
    .filter((sq) => !sq.hasResults)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

/**
 * Get recent search queries
 * @param limit - Maximum number of queries to return (default: 20)
 */
export function getRecentSearches(limit: number = 20): SearchQuery[] {
  const data = getAnalyticsData();

  // Return most recent searches
  return [...data.searchQueries]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

/**
 * Get all search query statistics
 */
export interface SearchStats {
  totalSearches: number;
  uniqueQueries: number;
  zeroResultCount: number;
  averageResultCount: number;
}

export function getSearchStats(): SearchStats {
  const data = getAnalyticsData();
  const uniqueQueries = new Set(data.searchQueries.map((sq) => sq.query));
  const zeroResultSearches = data.searchQueries.filter((sq) => !sq.hasResults);

  const totalResults = data.searchQueries.reduce((sum, sq) => sum + sq.resultCount, 0);
  const averageResultCount = data.searchQueries.length > 0
    ? totalResults / data.searchQueries.length
    : 0;

  return {
    totalSearches: data.searchQueries.length,
    uniqueQueries: uniqueQueries.size,
    zeroResultCount: zeroResultSearches.length,
    averageResultCount: Math.round(averageResultCount * 10) / 10, // Round to 1 decimal
  };
}

/**
 * Clear all analytics data
 * Useful for testing or privacy compliance
 */
export function clearAnalyticsData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // Silently fail if localStorage is unavailable
  }
}

/**
 * Export analytics data as JSON
 * Useful for downloading/exporting data
 */
export function exportAnalyticsData(): string {
  const data = getAnalyticsData();
  return JSON.stringify(data, null, 2);
}
