import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FeeType,
  PaymentMode,
  InvoiceStatus,
  PaymentOrderStatus,
  ConcessionCategory,
  ConcessionStatus,
  formatPaiseToRupees,
  parseRupeesToPaise
} from '@shared/index';
import {
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileText,
  Clock,
  Plus,
  RefreshCw,
  Download,
  DollarSign,
  PieChart,
  ArrowRight,
  X,
  CreditCard,
  Building,
  Check,
  AlertCircle
} from 'lucide-react';
import { LoadingState, IdempotencyBadge, SimulationBadge } from '../components/BadgesAndStates';

// ==========================================
// 1. FEE RULES & CONFIGURATION PAGE
// ==========================================
export const FeeRulesPage: React.FC = () => {
  const { token, user } = useAuth();
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [name, setName] = useState('B.Tech Standard Semester Scheme');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [feeCategory, setFeeCategory] = useState<FeeType>(FeeType.TUITION);
  const [graceDays, setGraceDays] = useState(15);
  const [dailyLateFeeRupees, setDailyLateFeeRupees] = useState(50);
  const [maxLateFeeRupees, setMaxLateFeeRupees] = useState(1000);
  const [heads, setHeads] = useState<Array<{ name: string; code: string; amountRupees: number; isMandatory: boolean }>>([
    { name: 'Tuition Fee', code: 'TUIT', amountRupees: 40000, isMandatory: true },
    { name: 'Computer Lab & Cloud Resources', code: 'LAB', amountRupees: 10000, isMandatory: true },
    { name: 'Digital Library & Database Subscriptions', code: 'LIB', amountRupees: 2500, isMandatory: true },
    { name: 'Examination & Assessment Fee', code: 'EXAM', amountRupees: 2500, isMandatory: true }
  ]);

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/v1/finance/rules', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setRules(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [token]);

  const addHead = () => {
    setHeads([...heads, { name: '', code: '', amountRupees: 1000, isMandatory: true }]);
  };

  const removeHead = (index: number) => {
    setHeads(heads.filter((_, i) => i !== index));
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        institutionId: user?.institutionId || '600000000000000000000001',
        name,
        academicYear,
        feeCategory,
        heads: heads.map(h => ({
          name: h.name,
          code: h.code.toUpperCase(),
          amountPaise: parseRupeesToPaise(h.amountRupees),
          isMandatory: h.isMandatory
        })),
        lateFeeRule: {
          graceDays: Number(graceDays),
          dailyLateFeePaise: parseRupeesToPaise(dailyLateFeeRupees),
          maxLateFeePaise: parseRupeesToPaise(maxLateFeeRupees)
        },
        status: 'ACTIVE'
      };

      const res = await fetch('/api/v1/finance/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowCreateModal(false);
        fetchRules();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create fee rule');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingState message="Loading fee rules & structures..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>Fee Structures & Policy Engine</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configurable fee heads, late fee grace periods, and versioned fee rules</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Create Fee Rule Version
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {rules.map((rule) => (
          <div key={rule._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-idempotency" style={{ marginBottom: '6px', display: 'inline-block' }}>
                  {rule.academicYear} • V{rule.version || 1}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{rule.name}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Category: {rule.feeCategory}</span>
              </div>
              <span className={`badge ${rule.status === 'ACTIVE' ? 'badge-paise' : 'badge-subtle'}`}>
                {rule.status}
              </span>
            </div>

            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Fee Heads Breakdown
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {rule.heads?.map((h: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span>{h.name} ({h.code})</span>
                    <strong>{formatPaiseToRupees(h.amountPaise)}</strong>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px dashed #CBD5E1', marginTop: '10px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Total Term Fee</span>
                <span style={{ color: '#2563EB', fontSize: '1.05rem' }}>{formatPaiseToRupees(rule.totalAmountPaise)}</span>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: '#F1F5F9', padding: '10px', borderRadius: '6px' }}>
              <strong>Late Fee Policy:</strong> {rule.lateFeeRule?.graceDays || 15} days grace period. Then{' '}
              {formatPaiseToRupees(rule.lateFeeRule?.dailyLateFeePaise || 5000)}/day (Capped at{' '}
              {formatPaiseToRupees(rule.lateFeeRule?.maxLateFeePaise || 100000)}).
            </div>
          </div>
        ))}
      </div>

      {/* CREATE RULE MODAL */}
      {showCreateModal && (
        <div className="modal-backdrop" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ maxWidth: '650px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Create New Fee Rule Version</h2>
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleCreateRule} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Rule / Structure Name</label>
                <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Academic Year</label>
                  <input className="form-input" value={academicYear} onChange={e => setAcademicYear(e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">Fee Category</label>
                  <select className="form-input" value={feeCategory} onChange={e => setFeeCategory(e.target.value as FeeType)}>
                    {Object.values(FeeType).map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Fee Heads Breakdown</label>
                  <button type="button" className="btn btn-secondary" onClick={addHead} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
                    <Plus size={14} /> Add Head
                  </button>
                </div>
                {heads.map((h, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr auto', gap: '8px', marginBottom: '8px' }}>
                    <input className="form-input" placeholder="Head Name" value={h.name} onChange={e => {
                      const updated = [...heads];
                      updated[i].name = e.target.value;
                      setHeads(updated);
                    }} required />
                    <input className="form-input" placeholder="Code" value={h.code} onChange={e => {
                      const updated = [...heads];
                      updated[i].code = e.target.value;
                      setHeads(updated);
                    }} required />
                    <input className="form-input" type="number" placeholder="₹ Amount" value={h.amountRupees} onChange={e => {
                      const updated = [...heads];
                      updated[i].amountRupees = Number(e.target.value);
                      setHeads(updated);
                    }} required />
                    <button type="button" className="btn btn-secondary" onClick={() => removeHead(i)} style={{ color: '#EF4444' }}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>Late Fee Rules (Server Enforced)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Grace Days</label>
                    <input className="form-input" type="number" value={graceDays} onChange={e => setGraceDays(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Daily Late Fee (₹)</label>
                    <input className="form-input" type="number" value={dailyLateFeeRupees} onChange={e => setDailyLateFeeRupees(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Max Cap (₹)</label>
                    <input className="form-input" type="number" value={maxLateFeeRupees} onChange={e => setMaxLateFeeRupees(Number(e.target.value))} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Fee Rule Version</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. STUDENT MY-FEES PORTAL PAGE
// ==========================================
export const StudentMyFeesPage: React.FC = () => {
  const { user, token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'invoices' | 'receipts' | 'concessions' | 'refunds'>('invoices');

  // Checkout modal
  const [checkoutInvoice, setCheckoutInvoice] = useState<any>(null);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  // Refund request modal
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundInvoice, setRefundInvoice] = useState<any>(null);
  const [refundAmountRupees, setRefundAmountRupees] = useState(5000);
  const [refundReason, setRefundReason] = useState('Eligible scholarship concession credit adjustment');

  const fetchStudentData = async () => {
    const studentId = user?.studentId || '600000000000000000000008';
    try {
      const res = await fetch(`/api/v1/finance/invoices/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setData(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [user, token]);

  const handleStartCheckout = async (invoice: any) => {
    setCheckoutInvoice(invoice);
    setCreatedOrder(null);
    setPaymentResult(null);

    const remainingDuePaise = invoice.payableAmountPaise - invoice.paidAmountPaise;
    const idempotencyKey = `ORD-IDEMP-${invoice.invoiceNumber}-${Date.now()}`;

    try {
      const res = await fetch('/api/v1/finance/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          invoiceId: invoice._id,
          studentId: user?.studentId || '600000000000000000000008',
          institutionId: user?.institutionId || '600000000000000000000001',
          amountPaise: remainingDuePaise,
          idempotencyKey
        })
      });
      const order = await res.json();
      if (res.ok) {
        setCreatedOrder(order);
      } else {
        alert(order.error || 'Failed to initialize payment order');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSimulatePayment = async (mode: 'SUCCESS' | 'TAMPERED_SIG' | 'TAMPERED_AMOUNT' | 'REPLAY') => {
    if (!createdOrder) return;
    setIsProcessing(true);

    try {
      const providerPaymentId = `pay_sim_${Date.now()}`;
      let amountToSend = createdOrder.amountPaise;

      // 1. Get HMAC Signature
      const sigRes = await fetch('/api/v1/finance/simulator/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          orderId: createdOrder.orderId,
          amountPaise: mode === 'TAMPERED_AMOUNT' ? 10000 : amountToSend,
          providerPaymentId
        })
      });
      const sigData = await sigRes.json();
      let signature = sigData.signature;

      if (mode === 'TAMPERED_SIG') {
        signature = 'INVALID_TAMPERED_SIGNATURE_9999';
      }
      if (mode === 'TAMPERED_AMOUNT') {
        amountToSend = 10000; // Altered to ₹100
      }

      // 2. Dispatch simulated provider callback
      const callbackRes = await fetch('/api/v1/finance/orders/simulate-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          orderId: createdOrder.orderId,
          providerPaymentId,
          amountPaise: amountToSend,
          eventType: 'PAYMENT_SUCCESS',
          signature
        })
      });

      const result = await callbackRes.json();
      setPaymentResult(result);
      if (callbackRes.ok) {
        fetchStudentData();
      }
    } catch (err: any) {
      setPaymentResult({ error: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/finance/refunds/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          invoiceId: refundInvoice._id,
          studentId: user?.studentId || '600000000000000000000008',
          amountPaise: parseRupeesToPaise(refundAmountRupees),
          reason: refundReason
        })
      });
      const resData = await res.json();
      if (res.ok) {
        alert('Refund request submitted successfully! Awaiting finance controller audit approval.');
        setShowRefundModal(false);
        fetchStudentData();
      } else {
        alert(resData.error || 'Refund request rejected');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingState message="Loading your invoices & fee ledger..." />;

  const summary = data?.summary || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Student Fee & Payment Portal</h1>
          <p style={{ color: 'var(--text-muted)' }}>Real-time balance ledger, concessions, and simulated payment gateway checkout</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <IdempotencyBadge />
          <SimulationBadge label="RAZORPAY GATEWAY SIMULATOR" />
        </div>
      </div>

      {/* METRIC CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-card">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Invoiced</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>{summary.formattedInvoiced || '₹0.00'}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{summary.totalInvoicedPaise || 0} paise</span>
        </div>

        <div className="glass-card">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Approved Concessions</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>
            {formatPaiseToRupees(summary.totalConcessionsPaise || 0)}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#2563EB' }}>{summary.totalConcessionsPaise || 0} paise credit</span>
        </div>

        <div className="glass-card">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Net Paid Balance</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981', marginTop: '4px' }}>{summary.formattedPaid || '₹0.00'}</div>
          <span style={{ fontSize: '0.75rem', color: '#10B981' }}>Verified via immutable receipts</span>
        </div>

        <div className="glass-card">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Outstanding Due</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: (summary.balancePaise || 0) > 0 ? '#EF4444' : '#10B981', marginTop: '4px' }}>
            {summary.formattedBalance || '₹0.00'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {(summary.balancePaise || 0) > 0 ? 'Payment required' : 'All cleared'}
          </span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
        <button
          className={`btn ${activeTab === 'invoices' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('invoices')}
        >
          <FileText size={16} /> Invoices ({data?.invoices?.length || 0})
        </button>
        <button
          className={`btn ${activeTab === 'receipts' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('receipts')}
        >
          <Receipt size={16} /> Official Receipts ({data?.receipts?.length || 0})
        </button>
        <button
          className={`btn ${activeTab === 'concessions' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('concessions')}
        >
          <ShieldCheck size={16} /> Scholarships ({data?.concessions?.length || 0})
        </button>
        <button
          className={`btn ${activeTab === 'refunds' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('refunds')}
        >
          <RefreshCw size={16} /> Refund Requests ({data?.refunds?.length || 0})
        </button>
      </div>

      {/* TAB CONTENT: INVOICES */}
      {activeTab === 'invoices' && (
        <div className="glass-card">
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Academic Term</th>
                  <th>Due Date</th>
                  <th>Total Amount</th>
                  <th>Concession</th>
                  <th>Paid Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.invoices?.map((inv: any) => {
                  const remainingPaise = inv.payableAmountPaise - inv.paidAmountPaise;
                  return (
                    <tr key={inv._id}>
                      <td style={{ fontWeight: 700 }}>{inv.invoiceNumber}</td>
                      <td>{inv.academicYear} • Sem {inv.semester}</td>
                      <td>{inv.dueDate}</td>
                      <td>{formatPaiseToRupees(inv.totalAmountPaise)}</td>
                      <td style={{ color: '#2563EB' }}>
                        {inv.concessionAmountPaise > 0 ? `-${formatPaiseToRupees(inv.concessionAmountPaise)}` : '₹0.00'}
                      </td>
                      <td style={{ color: '#10B981', fontWeight: 600 }}>{formatPaiseToRupees(inv.paidAmountPaise)}</td>
                      <td>
                        <span className={`badge ${inv.status === InvoiceStatus.PAID ? 'badge-paise' : inv.status === InvoiceStatus.PARTIALLY_PAID ? 'badge-idempotency' : 'badge-subtle'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td>
                        {remainingPaise > 0 ? (
                          <button className="btn btn-primary" onClick={() => handleStartCheckout(inv)} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                            <CreditCard size={14} /> Pay {formatPaiseToRupees(remainingPaise)}
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary"
                            onClick={() => {
                              setRefundInvoice(inv);
                              setShowRefundModal(true);
                            }}
                            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                          >
                            Request Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: RECEIPTS */}
      {activeTab === 'receipts' && (
        <div className="glass-card">
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Receipt Number</th>
                  <th>Order Reference</th>
                  <th>Amount Paid</th>
                  <th>Payment Mode</th>
                  <th>Date & Time</th>
                  <th>Counterfoil</th>
                </tr>
              </thead>
              <tbody>
                {data?.receipts?.map((r: any) => (
                  <tr key={r._id}>
                    <td><span className="badge badge-idempotency">{r.receiptNumber}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{r.paymentOrderId}</td>
                    <td style={{ fontWeight: 700, color: '#10B981' }}>{formatPaiseToRupees(r.amountPaise)}</td>
                    <td>{r.paymentMode}</td>
                    <td>{new Date(r.issuedAt).toLocaleString()}</td>
                    <td>
                      <button className="btn btn-secondary" onClick={() => alert(`Receipt Counterfoil:\nReceipt: ${r.receiptNumber}\nTxn: ${r.counterfoilData?.providerPaymentId || 'N/A'}\nMode: ${r.paymentMode}\nAmount: ${formatPaiseToRupees(r.amountPaise)}`)} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
                        View Counterfoil
                      </button>
                    </td>
                  </tr>
                ))}
                {data?.receipts?.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No receipts generated yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CONCESSIONS */}
      {activeTab === 'concessions' && (
        <div className="glass-card">
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Concession ID</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Reason / Merit Justification</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.concessions?.map((c: any) => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 700 }}>{c.concessionId}</td>
                    <td>{c.category}</td>
                    <td style={{ fontWeight: 700, color: '#2563EB' }}>{formatPaiseToRupees(c.amountPaise)}</td>
                    <td>{c.reason}</td>
                    <td>
                      <span className={`badge ${c.status === 'APPROVED' ? 'badge-paise' : 'badge-idempotency'}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: REFUNDS */}
      {activeTab === 'refunds' && (
        <div className="glass-card">
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Refund ID</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Provider Ref</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data?.refunds?.map((rf: any) => (
                  <tr key={rf._id}>
                    <td style={{ fontWeight: 700 }}>{rf.refundId}</td>
                    <td style={{ fontWeight: 700, color: '#EF4444' }}>{formatPaiseToRupees(rf.amountPaise)}</td>
                    <td>{rf.reason}</td>
                    <td>
                      <span className={`badge ${rf.status === 'APPROVED' ? 'badge-paise' : 'badge-idempotency'}`}>
                        {rf.status}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{rf.providerRefundId || 'PENDING'}</td>
                    <td>{new Date(rf.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {data?.refunds?.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No refund requests on record.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SIMULATED CHECKOUT MODAL */}
      {checkoutInvoice && createdOrder && (
        <div className="modal-backdrop" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ maxWidth: '560px', width: '90%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Simulated Payment Gateway</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Binding Order: <code>{createdOrder.orderId}</code></span>
              </div>
              <button className="btn btn-secondary" onClick={() => setCheckoutInvoice(null)}><X size={16} /></button>
            </div>

            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Invoice Number</span>
                <strong>{checkoutInvoice.invoiceNumber}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Idempotency Key</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{createdOrder.idempotencyKey}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
                <span style={{ fontWeight: 700 }}>Total Order Amount</span>
                <strong style={{ fontSize: '1.25rem', color: '#2563EB' }}>{formatPaiseToRupees(createdOrder.amountPaise)}</strong>
              </div>
            </div>

            {paymentResult && (
              <div style={{
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px',
                background: paymentResult.error ? '#FEE2E2' : '#DCFCE7',
                border: `1px solid ${paymentResult.error ? '#FCA5A5' : '#86EFAC'}`,
                color: paymentResult.error ? '#991B1B' : '#166534'
              }}>
                {paymentResult.error ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} />
                    <span><strong>Simulator Rejection:</strong> {paymentResult.error}</span>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                      <CheckCircle2 size={18} />
                      <span>{paymentResult.message || 'Payment Settled Successfully!'}</span>
                    </div>
                    {paymentResult.receipt && (
                      <div style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                        Receipt Number: <strong>{paymentResult.receipt.receiptNumber}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn btn-primary"
                onClick={() => handleSimulatePayment('SUCCESS')}
                disabled={isProcessing}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Check size={16} /> Complete Payment (Signed Provider Callback)
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => handleSimulatePayment('REPLAY')}
                disabled={isProcessing}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <RefreshCw size={16} /> Replay Callback (Test Idempotent Single Settlement)
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleSimulatePayment('TAMPERED_SIG')}
                  disabled={isProcessing}
                  style={{ fontSize: '0.8rem', color: '#DC2626' }}
                >
                  <AlertCircle size={14} /> Test Tampered Signature
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleSimulatePayment('TAMPERED_AMOUNT')}
                  disabled={isProcessing}
                  style={{ fontSize: '0.8rem', color: '#DC2626' }}
                >
                  <AlertCircle size={14} /> Test Tampered Amount
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST REFUND MODAL */}
      {showRefundModal && refundInvoice && (
        <div className="modal-backdrop" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '90%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Request Fee Refund</h2>
              <button className="btn btn-secondary" onClick={() => setShowRefundModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleRefundSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '6px', fontSize: '0.85rem' }}>
                Paid balance on this invoice: <strong>{formatPaiseToRupees(refundInvoice.paidAmountPaise)}</strong>
              </div>

              <div>
                <label className="form-label">Refund Amount (₹)</label>
                <input
                  className="form-input"
                  type="number"
                  value={refundAmountRupees}
                  onChange={e => setRefundAmountRupees(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className="form-label">Reason for Refund</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRefundModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Refund Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. RECONCILIATION & FINANCE DASHBOARD
// ==========================================
export const FinanceReconciliationPage: React.FC = () => {
  const { token, user } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reconRun, setReconRun] = useState<any>(null);
  const [isRunningRecon, setIsRunningRecon] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/v1/finance/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDashboard(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  const handleExecuteReconciliation = async () => {
    setIsRunningRecon(true);
    try {
      const res = await fetch('/api/v1/finance/reconciliation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          periodStart: '2026-01-01',
          periodEnd: '2026-12-31'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setReconRun(data);
        fetchDashboard();
      } else {
        alert(data.error || 'Reconciliation execution failed');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsRunningRecon(false);
    }
  };

  if (loading) return <LoadingState message="Loading financial ledger & reconciliation queue..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Finance Dashboard & Reconciliation Queue</h1>
          <p style={{ color: 'var(--text-muted)' }}>Dual-ledger audit comparing bank/provider events with institutional receipts</p>
        </div>
        <button className="btn btn-primary" onClick={handleExecuteReconciliation} disabled={isRunningRecon}>
          <RefreshCw size={16} className={isRunningRecon ? 'spin' : ''} /> {isRunningRecon ? 'Reconciling Ledger...' : 'Run Daily Reconciliation'}
        </button>
      </div>

      {/* METRIC CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="glass-card">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Gross Invoiced</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>{dashboard?.formattedInvoiced || '₹0.00'}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total billed</span>
        </div>

        <div className="glass-card">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Gross Collections</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981', marginTop: '4px' }}>{dashboard?.formattedCollected || '₹0.00'}</div>
          <span style={{ fontSize: '0.75rem', color: '#10B981' }}>Settled receipts</span>
        </div>

        <div className="glass-card">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Approved Concessions</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>{dashboard?.formattedConcessions || '₹0.00'}</div>
          <span style={{ fontSize: '0.75rem', color: '#2563EB' }}>Scholarship discounts</span>
        </div>

        <div className="glass-card">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Refunds Disbursed</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#EF4444', marginTop: '4px' }}>{dashboard?.formattedRefunded || '₹0.00'}</div>
          <span style={{ fontSize: '0.75rem', color: '#EF4444' }}>Approved credits</span>
        </div>

        <div className="glass-card">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Net Realized Collection</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>{dashboard?.formattedNetCollected || '₹0.00'}</div>
          <span style={{ fontSize: '0.75rem', color: '#059669' }}>After refunds</span>
        </div>
      </div>

      {/* LATEST RECONCILIATION RESULT */}
      {reconRun && (
        <div className="glass-card" style={{
          borderLeft: `4px solid ${reconRun.discrepancyCount > 0 ? '#F59E0B' : '#10B981'}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {reconRun.discrepancyCount > 0 ? <AlertTriangle style={{ color: '#F59E0B' }} size={24} /> : <CheckCircle2 style={{ color: '#10B981' }} size={24} />}
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  Reconciliation Run: <code>{reconRun.runId}</code> ({reconRun.status})
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Audited period: {reconRun.periodStart} to {reconRun.periodEnd}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem' }}>
              <span>Total Orders Checked: <strong>{reconRun.totalOrdersChecked}</strong></span>
              <span>Matched: <strong style={{ color: '#10B981' }}>{reconRun.matchedCount}</strong></span>
              <span>Exceptions: <strong style={{ color: reconRun.discrepancyCount > 0 ? '#EF4444' : '#10B981' }}>{reconRun.discrepancyCount}</strong></span>
            </div>
          </div>

          {reconRun.unmatchedOrders?.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Unmatched & Deliberately Pending Orders</h4>
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Expected Amount</th>
                      <th>Actual Provider Settle</th>
                      <th>Audit Status</th>
                      <th>Exception Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reconRun.unmatchedOrders.map((u: any, idx: number) => (
                      <tr key={idx}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{u.orderId}</td>
                        <td>{formatPaiseToRupees(u.expectedPaise)}</td>
                        <td>{formatPaiseToRupees(u.actualPaise)}</td>
                        <td>
                          <span className={`badge ${u.status === 'PENDING_ORDER' ? 'badge-idempotency' : 'badge-subtle'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td>{u.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* INSTITUTIONAL FUNDS & BUDGET REGISTER */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Institutional Funds & Departmental Budgets</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {dashboard?.funds?.map((fund: any) => {
            const pct = Math.round((fund.utilizedPaise / fund.totalAllocatedPaise) * 100) || 0;
            return (
              <div key={fund._id} style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span className="badge badge-idempotency">{fund.code}</span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '4px' }}>{fund.name}</h4>
                  </div>
                  <strong style={{ color: '#2563EB' }}>{formatPaiseToRupees(fund.totalAllocatedPaise)}</strong>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{fund.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span>Utilized: {formatPaiseToRupees(fund.utilizedPaise)}</span>
                  <span>{pct}%</span>
                </div>
                <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: '#2563EB', borderRadius: '4px' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. CONCESSIONS & SCHOLARSHIPS REVIEW PAGE
// ==========================================
export const ConcessionsPage: React.FC = () => {
  const { token, user } = useAuth();
  const [concessions, setConcessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConcessions = async () => {
    try {
      const res = await fetch('/api/v1/finance/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const d = await res.json();
        setConcessions(d.concessions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcessions();
  }, [token]);

  const handleReview = async (concessionId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/v1/finance/concessions/${concessionId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchConcessions();
      } else {
        const d = await res.json();
        alert(d.error || 'Review submission failed');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Concession ID', 'Category', 'Amount (Paise)', 'Amount (INR)', 'Reason', 'Status', 'Date'];
    const rows = concessions.map(c => [
      c.concessionId,
      c.category,
      c.amountPaise,
      formatPaiseToRupees(c.amountPaise),
      `"${c.reason.replace(/"/g, '""')}"`,
      c.status,
      new Date(c.createdAt).toISOString()
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `concessions_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <LoadingState message="Loading concession requests..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Scholarships & Fee Concessions</h1>
          <p style={{ color: 'var(--text-muted)' }}>Merit aid review, hardship concessions, and finance export reports</p>
        </div>
        <button className="btn btn-secondary" onClick={handleExportCSV}>
          <Download size={16} /> Export Concessions (CSV)
        </button>
      </div>

      <div className="glass-card">
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Concession ID</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Reason / Documentation</th>
                <th>Status</th>
                <th>Authorized Action</th>
              </tr>
            </thead>
            <tbody>
              {concessions.map((c: any) => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 700 }}>{c.concessionId}</td>
                  <td><span className="badge badge-idempotency">{c.category}</span></td>
                  <td style={{ fontWeight: 700, color: '#2563EB' }}>{formatPaiseToRupees(c.amountPaise)}</td>
                  <td>{c.reason}</td>
                  <td>
                    <span className={`badge ${c.status === 'APPROVED' ? 'badge-paise' : c.status === 'REJECTED' ? 'badge-subtle' : 'badge-idempotency'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    {c.status === 'PENDING_APPROVAL' ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-primary" onClick={() => handleReview(c.concessionId, 'APPROVED')} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
                          Approve
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleReview(c.concessionId, 'REJECTED')} style={{ padding: '4px 8px', fontSize: '0.8rem', color: '#EF4444' }}>
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Audited</span>
                    )}
                  </td>
                </tr>
              ))}
              {concessions.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No scholarship requests found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
