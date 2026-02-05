/**
 * AnalyticsDashboard component
 * Displays usage analytics including page views, search queries, and zero-result searches
 * Privacy-respecting - all data stored locally in browser localStorage
 */
import React, {useState, useEffect, useCallback} from 'react';
import {useAnalytics} from '@site/src/components/Analytics/AnalyticsProvider';
import type {PageView, SearchQuery, SearchStats} from '@site/src/utils/analytics';
import styles from './styles.module.css';

export interface AnalyticsDashboardProps {
  /**
   * Maximum number of top pages to display
   */
  maxTopPages?: number;
  /**
   * Maximum number of recent searches to display
   */
  maxRecentSearches?: number;
  /**
   * Maximum number of zero-result queries to display
   */
  maxZeroResultQueries?: number;
}

export default function AnalyticsDashboard({
  maxTopPages = 10,
  maxRecentSearches = 10,
  maxZeroResultQueries = 10,
}: AnalyticsDashboardProps): React.ReactElement {
  const analytics = useAnalytics();

  // State for analytics data
  const [topPages, setTopPages] = useState<PageView[]>([]);
  const [searchStats, setSearchStats] = useState<SearchStats | null>(null);
  const [recentSearches, setRecentSearches] = useState<SearchQuery[]>([]);
  const [zeroResultQueries, setZeroResultQueries] = useState<SearchQuery[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load analytics data
  const loadData = useCallback(() => {
    try {
      setTopPages(analytics.getTopPages(maxTopPages));
      setSearchStats(analytics.getSearchStats());
      setRecentSearches(analytics.getRecentSearches(maxRecentSearches));
      setZeroResultQueries(analytics.getZeroResultQueries(maxZeroResultQueries));
      setLastRefresh(new Date());
    } catch (error) {
      // Silently fail - analytics should never break the user experience
    }
  }, [analytics, maxTopPages, maxRecentSearches, maxZeroResultQueries]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle refresh
  const handleRefresh = (): void => {
    loadData();
  };

  // Handle clear data
  const handleClearData = (): void => {
    if (confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
      analytics.clearAnalyticsData();
      loadData();
    }
  };

  // Handle export data
  const handleExportData = (): void => {
    try {
      const data = analytics.exportAnalyticsData();
      const blob = new Blob([data], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export analytics data');
    }
  };

  // Format date for display
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className={styles.dashboard} role="main" aria-label="Analytics Dashboard">
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Usage Analytics Dashboard</h1>
        <p className={styles.subtitle}>
          Privacy-respecting analytics stored locally in your browser
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleRefresh}
            className={styles.actionButton}
            aria-label="Refresh analytics data"
          >
            🔄 Refresh
          </button>
          <button
            type="button"
            onClick={handleExportData}
            className={styles.actionButton}
            aria-label="Export analytics data"
          >
            📥 Export
          </button>
          <button
            type="button"
            onClick={handleClearData}
            className={styles.actionButtonDanger}
            aria-label="Clear all analytics data"
          >
            🗑️ Clear Data
          </button>
        </div>
        <p className={styles.lastRefresh}>
          Last updated: {lastRefresh.toLocaleString()}
        </p>
      </div>

      {/* Search Statistics Overview */}
      {searchStats && (
        <section className={styles.section} aria-labelledby="search-stats-heading">
          <h2 id="search-stats-heading" className={styles.sectionTitle}>
            Search Statistics
          </h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{searchStats.totalSearches}</div>
              <div className={styles.statLabel}>Total Searches</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{searchStats.uniqueQueries}</div>
              <div className={styles.statLabel}>Unique Queries</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{searchStats.zeroResultCount}</div>
              <div className={styles.statLabel}>Zero-Result Searches</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{searchStats.averageResultCount}</div>
              <div className={styles.statLabel}>Avg Results per Search</div>
            </div>
          </div>
        </section>
      )}

      {/* Top Pages */}
      <section className={styles.section} aria-labelledby="top-pages-heading">
        <h2 id="top-pages-heading" className={styles.sectionTitle}>
          Top Pages
        </h2>
        {topPages.length > 0 ? (
          <div className={styles.tableContainer}>
            <table className={styles.table} role="table">
              <thead>
                <tr>
                  <th scope="col">Rank</th>
                  <th scope="col">Page Path</th>
                  <th scope="col">View Count</th>
                  <th scope="col">Last Viewed</th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((page, index) => (
                  <tr key={page.path}>
                    <td>{index + 1}</td>
                    <td>
                      <a href={page.path} className={styles.pageLink}>
                        {page.path}
                      </a>
                    </td>
                    <td className={styles.numberCell}>{page.viewCount}</td>
                    <td className={styles.dateCell}>{formatDate(page.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={styles.emptyMessage}>No page views recorded yet</p>
        )}
      </section>

      {/* Recent Searches */}
      <section className={styles.section} aria-labelledby="recent-searches-heading">
        <h2 id="recent-searches-heading" className={styles.sectionTitle}>
          Recent Searches
        </h2>
        {recentSearches.length > 0 ? (
          <div className={styles.tableContainer}>
            <table className={styles.table} role="table">
              <thead>
                <tr>
                  <th scope="col">Query</th>
                  <th scope="col">Results</th>
                  <th scope="col">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {recentSearches.map((search, index) => (
                  <tr key={`${search.query}-${search.timestamp}-${index}`}>
                    <td className={styles.queryCell}>{search.query}</td>
                    <td className={styles.numberCell}>
                      {search.hasResults ? (
                        search.resultCount
                      ) : (
                        <span className={styles.zeroResults}>0 (No Results)</span>
                      )}
                    </td>
                    <td className={styles.dateCell}>{formatDate(search.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={styles.emptyMessage}>No searches recorded yet</p>
        )}
      </section>

      {/* Zero-Result Queries */}
      <section className={styles.section} aria-labelledby="zero-result-heading">
        <h2 id="zero-result-heading" className={styles.sectionTitle}>
          Zero-Result Searches
        </h2>
        <p className={styles.sectionDescription}>
          These queries returned no results. Consider adding content or improving search for these terms.
        </p>
        {zeroResultQueries.length > 0 ? (
          <ul className={styles.queryList} role="list">
            {zeroResultQueries.map((query, index) => (
              <li key={`${query.query}-${query.timestamp}-${index}`} className={styles.queryItem}>
                <span className={styles.queryText}>{query.query}</span>
                <span className={styles.queryDate}>{formatDate(query.timestamp)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyMessage}>No zero-result searches recorded 🎉</p>
        )}
      </section>
    </div>
  );
}
