/**
 * PageSuggestions component
 * Displays "You might also need" suggestions based on the current page context
 */
import React, {useMemo} from 'react';
import Link from '@docusaurus/Link';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import {PAGE_SUGGESTIONS, type PageSuggestion} from '@site/src/data/pageSuggestions';
import styles from './styles.module.css';

export interface PageSuggestionsProps {
  maxSuggestions?: number;
}

export default function PageSuggestions({
  maxSuggestions = 5,
}: PageSuggestionsProps): React.ReactElement | null {
  const doc = useDoc();

  const suggestions = useMemo((): PageSuggestion[] => {
    // Get current page path
    const currentPath = doc?.metadata?.permalink;

    if (!currentPath) {
      return [];
    }

    // Look up suggestions for this page
    const pageSuggestions = PAGE_SUGGESTIONS[currentPath] || [];

    // Limit to max suggestions
    return pageSuggestions.slice(0, maxSuggestions);
  }, [doc?.metadata?.permalink, maxSuggestions]);

  // Don't render if no suggestions found
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <aside className={styles.pageSuggestions} role="complementary" aria-label="Related suggestions">
      <div className={styles.header}>
        <h3 className={styles.title}>You Might Also Need</h3>
      </div>

      <ul className={styles.suggestionList} role="list">
        {suggestions.map((suggestion) => (
          <li key={suggestion.href} className={styles.suggestionItem}>
            <Link
              to={suggestion.href}
              className={styles.suggestionLink}
            >
              <span className={styles.suggestionLabel}>{suggestion.label}</span>
              <span className={styles.suggestionDescription}>{suggestion.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
