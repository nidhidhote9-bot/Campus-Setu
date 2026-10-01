import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Bookmark,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  UserCheck,
  FileText,
  DollarSign,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface BookTitle {
  _id: string;
  isbn: string;
  title: string;
  authors: string[];
  publisher?: string;
  category: string;
  edition?: string;
  totalCopiesCount: number;
  availableCopiesCount: number;
}

interface BookCopy {
  _id: string;
  bookTitleId: any;
  accessionNumber: string;
  barcode: string;
  locationRack: string;
  status: 'AVAILABLE' | 'ISSUED' | 'RESERVED' | 'LOST' | 'MAINTENANCE';
  condition: string;
}

interface Loan {
  _id: string;
  copyId: any;
  bookTitleId: any;
  userId: any;
  issuedAt: string;
  dueDate: string;
  returnedAt?: string;
  renewCount: number;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'RENEWED';
  overdueFinePaise: number;
  fineInvoiceId?: any;
}

interface LibraryClearance {
  _id: string;
  userId: any;
  status: 'CLEARED' | 'BLOCKED' | 'PENDING_REVIEW';
  outstandingLoansCount: number;
  unpaidFinesPaise: number;
  remarks?: string;
  verifiedAt?: string;
}

export const LibraryPages: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'accessions' | 'circulation' | 'my-library'>('catalog');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Catalog State
  const [titles, setTitles] = useState<BookTitle[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<any | null>(null);
  const [showTitleModal, setShowTitleModal] = useState(false);

  // New Book Title Form
  const [newIsbn, setNewIsbn] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newAuthors, setNewAuthors] = useState('');
  const [newCategory, setNewCategory] = useState('Computer Science');
  const [newPublisher, setNewPublisher] = useState('');
  const [newCopiesCount, setNewCopiesCount] = useState(2);

  // Circulation State
  const [allLoans, setAllLoans] = useState<Loan[]>([]);
  const [issueAccession, setIssueAccession] = useState('');
  const [issueUserId, setIssueUserId] = useState('');
  const [simulatedReturnDate, setSimulatedReturnDate] = useState('2026-10-25');

  // Student / My Library State
  const [myLoans, setMyLoans] = useState<Loan[]>([]);
  const [clearance, setClearance] = useState<LibraryClearance | null>(null);

  // Notifications
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/library/catalog?search=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTitles(data);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoans = async () => {
    try {
      const res = await fetch('/api/v1/library/loans', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setAllLoans(await res.json());

      const myRes = await fetch('/api/v1/library/my-loans', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (myRes.ok) setMyLoans(await myRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchClearance = async () => {
    try {
      const res = await fetch('/api/v1/library/clearance', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setClearance(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCatalog();
    fetchLoans();
    fetchClearance();
  }, [searchQuery]);

  const handleCreateTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setError(null);
    try {
      const res = await fetch('/api/v1/library/catalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          isbn: newIsbn,
          title: newTitle,
          authors: newAuthors.split(',').map(a => a.trim()),
          category: newCategory,
          publisher: newPublisher,
          initialCopiesCount: newCopiesCount
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create title');

      setNotice(`Book title '${data.title}' added to catalog with ${newCopiesCount} accession copies.`);
      setShowTitleModal(false);
      fetchCatalog();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setError(null);
    try {
      const res = await fetch('/api/v1/library/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          accessionNumber: issueAccession,
          userId: issueUserId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to issue book');

      setNotice(`Book issued successfully! Due Date: ${new Date(data.dueDate).toLocaleDateString()}`);
      setIssueAccession('');
      fetchLoans();
      fetchCatalog();
      fetchClearance();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReturnBook = async (loanId: string, customReturnDate?: string) => {
    setNotice(null);
    setError(null);
    try {
      const res = await fetch('/api/v1/library/return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          loanId,
          returnDate: customReturnDate
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to return book');

      if (data.finePaise > 0) {
        setNotice(`Book returned. Overdue Fine Calculated: ₹${(data.finePaise / 100).toFixed(2)} (Linked Fee Invoice #${data.fineInvoice?.invoiceNumber || 'Created'})`);
      } else {
        setNotice('Book copy returned and updated to AVAILABLE status cleanly.');
      }

      fetchLoans();
      fetchCatalog();
      fetchClearance();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRenewBook = async (loanId: string) => {
    setNotice(null);
    setError(null);
    try {
      const res = await fetch('/api/v1/library/renew', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ loanId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to renew book');

      setNotice(`Loan renewed! New Due Date: ${new Date(data.dueDate).toLocaleDateString()} (Renew Count: ${data.renewCount})`);
      fetchLoans();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReserveBook = async (bookTitleId: string) => {
    setNotice(null);
    setError(null);
    try {
      const res = await fetch('/api/v1/library/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ bookTitleId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reserve book');

      setNotice(`Book reserved! Queue Position #${data.queuePosition}`);
      fetchCatalog();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Library Services & Circulation Desk</h1>
              <p className="text-slate-400 text-sm">
                M27 Prototype — Catalog, Accession Management, Circulation Counter & Graduation No-Dues Clearance
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold rounded-full uppercase tracking-wider">
            [M10 Fee Invoice Fine Linked]
          </span>
          <button
            onClick={() => setShowTitleModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Catalog Entry
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notice && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-emerald-200 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-emerald-400 hover:text-emerald-200">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-500/30 rounded-xl text-rose-200 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-700/60 gap-4">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'catalog'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-4 h-4" /> Search Catalog
        </button>
        <button
          onClick={() => setActiveTab('accessions')}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'accessions'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> Accessions & Membership
        </button>
        <button
          onClick={() => setActiveTab('circulation')}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'circulation'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <RefreshCw className="w-4 h-4" /> Issue / Return Counter
        </button>
        <button
          onClick={() => setActiveTab('my-library')}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'my-library'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" /> My Library & Clearance
        </button>
      </div>

      {/* TAB 1: Searchable Catalog */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="relative max-w-lg">
            <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, author, ISBN or category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {titles.map(title => (
              <div
                key={title._id}
                className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs font-semibold rounded-md">
                      {title.category}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                        title.availableCopiesCount > 0
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border-rose-800'
                      }`}
                    >
                      {title.availableCopiesCount > 0 ? `${title.availableCopiesCount} Available` : 'Out of Stock'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 line-clamp-2">{title.title}</h3>
                  <p className="text-slate-400 text-xs font-medium">By {title.authors.join(', ')}</p>
                  <p className="text-slate-500 text-xs">ISBN: {title.isbn} | Publisher: {title.publisher || 'N/A'}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">
                    Total Copies: {title.totalCopiesCount}
                  </span>
                  <div className="flex gap-2">
                    {title.availableCopiesCount === 0 && (
                      <button
                        onClick={() => handleReserveBook(title._id)}
                        className="px-3 py-1.5 bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-500/30 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
                      >
                        <Bookmark className="w-3.5 h-3.5" /> Reserve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Accessions & Membership */}
      {activeTab === 'accessions' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" /> Catalog Accession Register
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-3">ISBN</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Total Copies</th>
                    <th className="p-3">Available</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {titles.map(t => (
                    <tr key={t._id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono text-xs">{t.isbn}</td>
                      <td className="p-3 font-semibold text-slate-100">{t.title}</td>
                      <td className="p-3 text-slate-400">{t.category}</td>
                      <td className="p-3 font-mono">{t.totalCopiesCount}</td>
                      <td className="p-3 font-mono text-emerald-400">{t.availableCopiesCount}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-xs">
                          CATALOGED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Issue / Return Counter */}
      {activeTab === 'circulation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form: Issue Book */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" /> Issue Book Copy
            </h3>
            <form onSubmit={handleIssueBook} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Accession Number</label>
                <input
                  type="text"
                  placeholder="e.g. ACC-CS-101"
                  value={issueAccession}
                  onChange={e => setIssueAccession(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Borrower User ID</label>
                <input
                  type="text"
                  placeholder="Enter Student or Faculty User ID"
                  value={issueUserId}
                  onChange={e => setIssueUserId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm transition-all shadow-md"
              >
                Issue Copy Now
              </button>
            </form>
          </div>

          {/* Right Area: Active Loans Table */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-emerald-400" /> Active Loans & Overdue Calculator
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-2.5">Book Title</th>
                    <th className="p-2.5">Borrower</th>
                    <th className="p-2.5">Due Date</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {allLoans.map(loan => (
                    <tr key={loan._id} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-semibold text-slate-100">
                        {loan.bookTitleId?.title || 'Book Copy'}
                      </td>
                      <td className="p-2.5">{loan.userId?.name || loan.userId || 'Student'}</td>
                      <td className="p-2.5 font-mono">{new Date(loan.dueDate).toLocaleDateString()}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            loan.status === 'ACTIVE' || loan.status === 'RENEWED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : loan.status === 'RETURNED'
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {loan.status}
                        </span>
                      </td>
                      <td className="p-2.5 flex items-center gap-2">
                        {loan.status !== 'RETURNED' && (
                          <>
                            <button
                              onClick={() => handleReturnBook(loan._id)}
                              className="px-2.5 py-1 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 rounded text-xs font-semibold"
                            >
                              Return
                            </button>
                            <button
                              onClick={() => handleReturnBook(loan._id, '2026-11-15')}
                              className="px-2.5 py-1 bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-500/30 rounded text-xs font-semibold"
                              title="Simulate return on 2026-11-15 (Overdue fine)"
                            >
                              Simulate Overdue
                            </button>
                            <button
                              onClick={() => handleRenewBook(loan._id)}
                              className="px-2 py-1 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 rounded text-xs font-semibold"
                            >
                              Renew
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: My Library & Graduation Clearance */}
      {activeTab === 'my-library' && (
        <div className="space-y-6">
          {/* Clearance Badge Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`p-4 rounded-2xl border ${
                  clearance?.status === 'CLEARED'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : 'bg-rose-950 text-rose-400 border-rose-800'
                }`}
              >
                {clearance?.status === 'CLEARED' ? (
                  <ShieldAlert className="w-8 h-8 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-rose-400" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100">
                  Graduation & Library Clearance Status:{' '}
                  <span
                    className={
                      clearance?.status === 'CLEARED' ? 'text-emerald-400' : 'text-rose-400'
                    }
                  >
                    {clearance?.status || 'PENDING'}
                  </span>
                </h3>
                <p className="text-slate-400 text-sm mt-1">{clearance?.remarks}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono">
                Active Loans: {clearance?.outstandingLoansCount || 0} | Unpaid Fines: ₹
                {((clearance?.unpaidFinesPaise || 0) / 100).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Student Active Loans */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" /> My Current Loans & Due Dates
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Book Title</th>
                    <th className="p-3">Issued On</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Overdue Fine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {myLoans.map(loan => (
                    <tr key={loan._id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-100">
                        {loan.bookTitleId?.title || 'Book Title'}
                      </td>
                      <td className="p-3 font-mono">{new Date(loan.issuedAt).toLocaleDateString()}</td>
                      <td className="p-3 font-mono text-emerald-400">
                        {new Date(loan.dueDate).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-xs font-semibold">
                          {loan.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono">
                        {loan.overdueFinePaise > 0
                          ? `₹${(loan.overdueFinePaise / 100).toFixed(2)}`
                          : '₹0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Catalog Title */}
      {showTitleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100">Add New Book Title to Catalog</h3>
              <button
                onClick={() => setShowTitleModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTitle} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">ISBN</label>
                <input
                  type="text"
                  value={newIsbn}
                  onChange={e => setNewIsbn(e.target.value)}
                  placeholder="978-XXXXXXXXXX"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Book Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Operating System Concepts"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Authors (comma separated)</label>
                <input
                  type="text"
                  value={newAuthors}
                  onChange={e => setNewAuthors(e.target.value)}
                  placeholder="Silberschatz, Galvin, Gagne"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Initial Copies</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newCopiesCount}
                    onChange={e => setNewCopiesCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTitleModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold"
                >
                  Add Catalog Title
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
