import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PaymentMode, FeeType, formatPaiseToRupees } from '@shared/index';
import { IndianRupee, ShieldCheck, CheckCircle2, Receipt, Lock } from 'lucide-react';
import { IdempotencyBadge, SimulationBadge, LoadingState } from '../components/BadgesAndStates';

export const StudentFeePage: React.FC = () => {
  const { user, token } = useAuth();
  const [ledger, setLedger] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);

  const fetchLedger = async () => {
    const studentId = user?.studentId || '600000000000000000000008';
    try {
      const res = await fetch(`/api/v1/fees/ledger/${studentId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setLedger(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [user, token]);

  const handleCheckout = async () => {
    setIsPaying(true);
    const idempotencyKey = `FEE-CHECKOUT-${Date.now()}`;
    const studentId = user?.studentId || '600000000000000000000008';
    const institutionId = user?.institutionId || '600000000000000000000001';

    try {
      const res = await fetch('/api/v1/fees/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          studentId,
          institutionId,
          amountPaise: 5000000, // ₹50,000.00
          feeType: FeeType.TUITION,
          paymentMode: PaymentMode.UPI,
          idempotencyKey
        })
      });
      const data = await res.json();
      if (res.ok) {
        setReceipt(data);
        fetchLedger();
      } else {
        alert(data.error || 'Payment failed');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) return <LoadingState message="Loading fee ledger..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Student Fee Portal</h1>
          <p style={{ color: 'var(--text-muted)' }}>Integer paise balance ledger & Razorpay simulated checkout</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <IdempotencyBadge />
          <SimulationBadge label="RAZORPAY SIMULATION" />
        </div>
      </div>

      {receipt && (
        <div className="glass-card" style={{ borderColor: 'rgba(16, 185, 129, 0.4)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <CheckCircle2 size={32} style={{ color: '#10b981' }} />
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>Payment Processed Successfully!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Receipt Number: <strong>{receipt.receiptNumber}</strong></p>
            </div>
          </div>
          <p>Transaction ID: <code style={{ color: '#818cf8' }}>{receipt.transactionId}</code></p>
          <p>Amount Paid: <strong>{formatPaiseToRupees(receipt.amountPaise)}</strong> ({receipt.amountPaise} paise)</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <div className="glass-card">
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Semester Fee</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px' }}>{ledger?.formattedDue || '₹50,000.00'}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ledger?.totalDuePaise || 5000000} paise</span>
        </div>

        <div className="glass-card">
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Paid</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>{ledger?.formattedPaid || '₹50,000.00'}</div>
          <span style={{ fontSize: '0.75rem', color: '#34d399' }}>{ledger?.totalPaidPaise || 5000000} paise</span>
        </div>

        <div className="glass-card">
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Outstanding Balance</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f87171', marginTop: '4px' }}>{ledger?.formattedBalance || '₹0.00'}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>0 paise</span>
        </div>
      </div>

      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Semester 4 Fee Breakdown</h3>
          <button onClick={handleCheckout} className="btn btn-primary" disabled={isPaying}>
            <IndianRupee size={18} /> {isPaying ? 'Processing...' : 'Pay Fee via Razorpay [SIMULATION]'}
          </button>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt / Txn ID</th>
                <th>Fee Type</th>
                <th>Mode</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {ledger?.transactions?.map((t: any) => (
                <tr key={t._id}>
                  <td><span className="badge badge-idempotency">{t.receiptNumber}</span></td>
                  <td>{t.feeType}</td>
                  <td>{t.paymentMode}</td>
                  <td><strong style={{ color: '#34d399' }}>{formatPaiseToRupees(t.amountPaise)}</strong></td>
                  <td><span className="badge badge-paise">{t.status}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AdminFeePage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Fee Collections & Defaulters Ledger</h1>
        <p style={{ color: 'var(--text-muted)' }}>Fee template creator, collection reports & defaulter tracking</p>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Fee Collection Summary</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Semester</th>
                <th>Fee Type</th>
                <th>Fee Amount (Paise)</th>
                <th>Formatted INR</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Computer Science & Engineering</td>
                <td>Semester 4</td>
                <td>TUITION</td>
                <td>5,000,000 paise</td>
                <td><strong style={{ color: '#34d399' }}>₹50,000.00</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const PayrollPage: React.FC = () => {
  const { token } = useAuth();
  const [slips, setSlips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlips = async () => {
      try {
        const res = await fetch('/api/v1/payroll/slips', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setSlips(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSlips();
  }, [token]);

  if (loading) return <LoadingState message="Loading staff payroll ledger..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Staff Payroll & Expense Ledger</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monthly salary approvals, base/HRA breakdown in integer paise</p>
        </div>
        <IdempotencyBadge label="PAYROLL IDEMPOTENCY ENFORCED" />
      </div>

      <div className="glass-card">
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Staff Member</th>
                <th>Base Salary</th>
                <th>HRA</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {slips.map(s => (
                <tr key={s._id}>
                  <td><span className="badge badge-idempotency">{s.monthYear}</span></td>
                  <td style={{ fontWeight: 600 }}>{s.staffId?.name || 'Prof. Rajesh Sharma'}</td>
                  <td>{formatPaiseToRupees(s.baseSalaryPaise)}</td>
                  <td>{formatPaiseToRupees(s.hraPaise)}</td>
                  <td>{formatPaiseToRupees(s.deductionsPaise)}</td>
                  <td><strong style={{ color: '#34d399' }}>{formatPaiseToRupees(s.netSalaryPaise)}</strong></td>
                  <td><span className="badge badge-paise">{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
