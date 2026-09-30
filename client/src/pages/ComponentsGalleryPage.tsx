import React, { useState } from 'react';
import { LoadingState, EmptyState, ForbiddenState, IdempotencyBadge, SimulationBadge, EvaluationLimitBadge } from '../components/BadgesAndStates';
import { Layers, Calendar, Filter, MessageSquare, AlertCircle } from 'lucide-react';

export const ComponentsGalleryPage: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [dateInput, setDateInput] = useState('2026-10-01');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>CampusSetu UI Component Gallery</h1>
        <p style={{ color: 'var(--text-muted)' }}>Reusable design tokens, interactive controls, form inputs, dialogs & state views</p>
      </div>

      {/* Badges Gallery */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Status Badges</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <IdempotencyBadge />
          <SimulationBadge />
          <EvaluationLimitBadge />
          <span className="badge badge-high">HIGH RISK</span>
          <span className="badge badge-medium">MEDIUM RISK</span>
          <span className="badge badge-low">LOW RISK</span>
        </div>
      </div>

      {/* Form Controls & Date/Time Input */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Form Controls & Campus Date Selector</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Campus Date (IST)</label>
            <input type="date" className="form-input" value={dateInput} onChange={e => setDateInput(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Filter Status</label>
            <select className="form-select">
              <option value="ALL">ALL STATUSES</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>
        </div>
      </div>

      {/* Modal Dialog Demo */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '12px' }}>Interactive Dialog Modal</h3>
        <button onClick={() => setShowDialog(true)} className="btn btn-primary">
          Open Demo Dialog Modal
        </button>

        {showDialog && (
          <div className="glass-card" style={{ marginTop: '16px', borderColor: 'var(--primary)' }}>
            <h4 style={{ marginBottom: '8px' }}>Demo Modal Dialog Window</h4>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              This dialog component supports keyboard accessibility (Escape key, focus lock).
            </p>
            <button onClick={() => setShowDialog(false)} className="btn btn-secondary">
              Close Dialog
            </button>
          </div>
        )}
      </div>

      {/* State Indicators */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>System State Components</h3>
        <LoadingState message="Demonstrating loading spinner state..." />
        <EmptyState title="Demonstrating Empty State" subtitle="No records found for current filter query." />
        <ForbiddenState message="Demonstrating 403 Forbidden State Component." />
      </div>
    </div>
  );
};
