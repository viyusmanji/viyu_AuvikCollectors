import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import AnalyticsDashboard from '@site/src/components/Analytics/AnalyticsDashboard';

export default function Analytics(): ReactNode {
  return (
    <Layout
      title="Usage Analytics"
      description="Privacy-respecting usage analytics for the Raspberry Pi 5 Auvik Collector documentation">
      <main style={{padding: '2rem 0'}}>
        <div className="container">
          <AnalyticsDashboard />
        </div>
      </main>
    </Layout>
  );
}
