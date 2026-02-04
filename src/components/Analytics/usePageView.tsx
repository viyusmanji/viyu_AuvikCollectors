/**
 * usePageView hook
 * Tracks page visits automatically when the page path changes
 * Integrates with the analytics system to record page views with timestamps and visit counts
 */
import {useEffect} from 'react';
import {useLocation} from '@docusaurus/router';
import {useAnalytics} from './AnalyticsProvider';

/**
 * Hook to automatically track page views
 * Call this hook in any component where you want to track page visits
 * It will automatically track the current page whenever the route changes
 */
export default function usePageView(): void {
  const location = useLocation();
  const {trackPageView} = useAnalytics();

  useEffect(() => {
    // Get the current page path
    const currentPath = location.pathname;

    if (!currentPath) {
      return;
    }

    // Track the page view
    trackPageView(currentPath);
  }, [location.pathname, trackPageView]);
}
