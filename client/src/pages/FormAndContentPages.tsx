import React, { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { FileText, Layers, Globe, Send, CheckCircle2, Eye, Plus, ShieldCheck, History } from 'lucide-react';
import { LoadingState, IdempotencyBadge, SimulationBadge } from '../components/BadgesAndStates';

export const FormBuilderPage: React.FC = () => {
  const [version, setVersion] = useState('v1.0');
  const [published, setPublished] = useState(true);
  const [formTitle, setFormTitle] = useState('Campus Feedback & Course Rating Form');
  const [fields, setFields] = useState([
    { id: 'f1', label: 'Overall Course Satisfaction', type: 'select', required: true, options: 'Excellent, Good, Average, Poor' },
    { id: 'f2', label: 'Detailed Comments', type: 'text', required: false }
  ]);

  const handlePublishNewVersion = () => {
    const nextVer = version === 'v1.0' ? 'v2.0' : 'v3.0';
    setVersion(nextVer);
    setPublished(true);
    alert(`Published Immutable Form Schema Version ${nextVer}! Past v1.0 submissions retain version 1.0 snapshot.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Versioned Form Builder</h1>
          <p style={{ color: 'var(--text-muted)' }}>Schema editor, preview, immutable publishing & version history</p>
        </div>
        <IdempotencyBadge label={`ACTIVE SCHEMA: ${version}`} />
      </div>

      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{formTitle}</h3>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Schema Version: {version} ({published ? 'PUBLISHED' : 'DRAFT'})</span>
          </div>
          <button onClick={handlePublishNewVersion} className="btn btn-primary">
            <Plus size={16} /> Publish New Version ({version === 'v1.0' ? 'v2.0' : 'v3.0'})
          </button>
        </div>

        <div className="data-table-container" style={{ marginBottom: '20px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Field ID</th>
                <th>Label</th>
                <th>Type</th>
                <th>Required</th>
                <th>Allowed Field Types</th>
              </tr>
            </thead>
            <tbody>
              {fields.map(f => (
                <tr key={f.id}>
                  <td><span className="badge badge-idempotency">{f.id}</span></td>
                  <td style={{ fontWeight: 600 }}>{f.label}</td>
                  <td><span className="badge badge-simulation">{f.type}</span></td>
                  <td>{f.required ? 'YES' : 'NO'}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>text, number, date, select, multiselect, checkbox, attachment</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const FormSubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState([
    { id: 'SUB-2026-001', formVersion: 'v1.0', applicant: 'Aarav Sharma', score: 'Excellent', submittedAt: '2026-09-28' },
    { id: 'SUB-2026-002', formVersion: 'v2.0', applicant: 'Ananya Patel', score: 'Good', submittedAt: '2026-09-30' }
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Form Submissions & Validation Logs</h1>
        <p style={{ color: 'var(--text-muted)' }}>Immutable submission snapshots retained per schema version</p>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Received Form Submissions</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Submission ID</th>
                <th>Schema Version</th>
                <th>Respondent</th>
                <th>Satisfaction Response</th>
                <th>Submitted Date</th>
                <th>Version Lock</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(s => (
                <tr key={s.id}>
                  <td><span className="badge badge-idempotency">{s.id}</span></td>
                  <td><span className="badge badge-simulation">{s.formVersion}</span></td>
                  <td style={{ fontWeight: 600 }}>{s.applicant}</td>
                  <td><strong style={{ color: '#34d399' }}>{s.score}</strong></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.submittedAt}</td>
                  <td><span className="badge badge-paise"><CheckCircle2 size={12} /> RETAINED UNMUTATED</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const TranslationsPage: React.FC = () => {
  const { lang, setLang } = useI18n();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Localization & Translation Dictionary</h1>
          <p style={{ color: 'var(--text-muted)' }}>English and Hindi label dictionary with fallback mechanism</p>
        </div>
        <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} className="btn btn-primary">
          <Globe size={16} /> Switch Language Mode: {lang === 'en' ? 'English (EN)' : 'Hindi (HI)'}
        </button>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Dictionary Translation Keys</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Key ID</th>
                <th>English Label (Fallback)</th>
                <th>Hindi Label (हिन्दी)</th>
                <th>Translation Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>appTitle</code></td>
                <td>CampusSetu</td>
                <td>कैंपससेतु (CampusSetu)</td>
                <td><span className="badge badge-paise">COMPLETE</span></td>
              </tr>
              <tr>
                <td><code>fees</code></td>
                <td>Fee Management</td>
                <td>शुल्क प्रबंधन</td>
                <td><span className="badge badge-paise">COMPLETE</span></td>
              </tr>
              <tr>
                <td><code>aiRisk</code></td>
                <td>AI Early Warning System</td>
                <td>एआई प्रारंभिक चेतावनी प्रणाली</td>
                <td><span className="badge badge-paise">COMPLETE</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const TemplatesAndContentPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Document Templates & Content Editor</h1>
        <p style={{ color: 'var(--text-muted)' }}>HTML/Markdown document templates with sanitized output</p>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Official Document Template Versions</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Template Name</th>
                <th>Version</th>
                <th>Target Format</th>
                <th>Sanitization Rule</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>Fee Receipt PDF Template</td>
                <td><span className="badge badge-idempotency">v1.2</span></td>
                <td>HTML / PDF</td>
                <td><span className="badge badge-paise">STRICT XSS SANITIZED</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Official Grade Transcript Template</td>
                <td><span className="badge badge-idempotency">v2.0</span></td>
                <td>HTML / PDF</td>
                <td><span className="badge badge-paise">STRICT XSS SANITIZED</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
