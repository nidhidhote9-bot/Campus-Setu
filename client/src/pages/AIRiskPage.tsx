import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { LoadingState, EvaluationLimitBadge } from '../components/BadgesAndStates';

export const AIRiskPage: React.FC = () => {
  const { token } = useAuth();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const res = await fetch('/api/v1/analytics/dropout-risk', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setReport(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRisk();
  }, [token]);

  if (loading) return <LoadingState message="Evaluating AI academic risk indicators..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>AI Academic Risk / Dropout Early Warning</h1>
          <p style={{ color: 'var(--text-muted)' }}>Predictive student risk classification based on attendance & CGPA baseline</p>
        </div>
        <EvaluationLimitBadge />
      </div>

      <div className="glass-card" style={{ padding: '16px 20px', background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
        <p style={{ fontSize: '0.85rem', color: '#fbbf24' }}>
          <strong>Notice:</strong> {report?.evaluationDisclaimer || 'DISCLAIMER: Risk indicators generated via synthetic statistical rules. Model evaluation limits: Prototype dataset only.'}
        </p>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Evaluated Student Risk Roster</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Department</th>
                <th>CGPA</th>
                <th>Attendance</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th>Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {report?.students?.map((s: any) => (
                <tr key={s.studentId}>
                  <td><span className="badge badge-idempotency">{s.rollNumber}</span></td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>{s.department}</td>
                  <td>{s.cgpa}</td>
                  <td>{s.attendancePct}%</td>
                  <td><strong>{s.riskScore} / 100</strong></td>
                  <td>
                    <span className={`badge ${s.riskLevel === 'HIGH' ? 'badge-high' : s.riskLevel === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`}>
                      {s.riskLevel} RISK
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.recommendedAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
