import PageWrapper from '../../components/layout/PageWrapper';
import { BarChart3 } from 'lucide-react';

export default function Analytics() {
  return (
    <PageWrapper title="Analytics" subtitle="Detailed platform analytics">
      <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <BarChart3 size={48} color="#4f46e5" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Advanced Analytics Coming Soon
        </h3>
        <p style={{ color: '#6b7280', maxWidth: 400, margin: '0 auto' }}>
          Detailed charts, conversion funnels, and engagement metrics will be available in the next release.
          Basic stats are on the Dashboard.
        </p>
      </div>
    </PageWrapper>
  );
}
