/**
 * useSearchTracking hook
 * Tracks search queries from the Docusaurus search plugin
 * Monitors search input and result count to identify popular queries and zero-result searches
 */
import {useEffect} from 'react';
import {useAnalytics} from './AnalyticsProvider';

/**
 * Hook to automatically track search queries
 * Call this hook in the root layout to monitor search plugin activity
 * It will track search queries and the number of results returned
 */
export default function useSearchTracking(): void {
  const {trackSearchQuery} = useAnalytics();

  useEffect(() => {
    /**
     * Handle search input events from the Docusaurus search plugin
     * Tracks the search query and attempts to determine result count
     */
    const handleSearch = () => {
      // Get the search input element from the Docusaurus search plugin
      const searchInput = document.querySelector(
        'input[type="search"]'
      ) as HTMLInputElement;

      if (!searchInput) {
        return;
      }

      // Get the current search query
      const query = searchInput.value?.trim();

      if (!query) {
        return;
      }

      // Wait a short moment for results to render, then count them
      setTimeout(() => {
        // Count search result items in the results container
        const resultItems = document.querySelectorAll(
          '.DocSearch-Hit, [class*="searchResultItem"], [class*="search-result-item"]'
        );
        const resultCount = resultItems.length;

        // Track the search query with result count
        trackSearchQuery(query, resultCount);
      }, 300);
    };

    // Listen for input events on the search field
    const searchInput = document.querySelector(
      'input[type="search"]'
    ) as HTMLInputElement;

    if (searchInput) {
      // Track searches when user stops typing (debounced)
      let debounceTimer: NodeJS.Timeout;
      const debouncedSearch = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(handleSearch, 500);
      };

      searchInput.addEventListener('input', debouncedSearch);

      // Cleanup function
      return () => {
        searchInput.removeEventListener('input', debouncedSearch);
        clearTimeout(debounceTimer);
      };
    }

    // If search input not found yet, try again after a short delay
    const retryTimer = setTimeout(() => {
      const input = document.querySelector(
        'input[type="search"]'
      ) as HTMLInputElement;

      if (input) {
        let debounceTimer: NodeJS.Timeout;
        const debouncedSearch = () => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(handleSearch, 500);
        };

        input.addEventListener('input', debouncedSearch);
      }
    }, 1000);

    return () => {
      clearTimeout(retryTimer);
    };
  }, [trackSearchQuery]);
}
