/**
 * Root component
 * Wraps the entire application with global providers
 * This includes the AnalyticsProvider for usage tracking
 */
import React from 'react';
import AnalyticsProvider from '@site/src/components/Analytics/AnalyticsProvider';

export default function Root({children}): React.ReactElement {
  return (
    <AnalyticsProvider>
      {children}
    </AnalyticsProvider>
  );
}
