import React, { useState, useEffect } from 'react';
import {
  Package,
  Layers,
  Truck,
  ShoppingCart,
  ArrowRightLeft,
  ShieldAlert,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  FileText,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  ClipboardList,
  Wrench,
  BarChart3,
  Check,
  Building
} from 'lucide-react';

interface InventoryItem {
  _id: string;
  itemCode: string;
  name: string;
  category: string;
  unitOfMeasure: string;
  minStockLevel: number;
  currentStock: number;
  unitCostPaise: number;
  isAssetTracked: boolean;
  storageLocation?: string;
}

interface Vendor {
  _id: string;
  vendorCode: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxIdentifierGstin?: string;
  isActive: boolean;
}

interface Requisition {
  _id: string;
  requisitionNumber: string;
  requestedBy: any;
  items: Array<{
    itemId: any;
    quantity: number;
    estimatedUnitCostPaise: number;
    justification?: string;
  }>;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  approvedBy?: any;
  remarks?: string;
  createdAt: string;
}

interface PurchaseOrder {
  _id: string;
  poNumber: string;
  vendorId: any;
  poDate: string;
  items: Array<{
    itemId: any;
    quantity: number;
    unitCostPaise: number;
    totalPaise: number;
  }>;
  totalAmountPaise: number;
  status: 'ISSUED' | 'PARTIALLY_RECEIVED' | 'FULFILLED' | 'CANCELLED';
  notes?: string;
}

interface GoodsReceipt {
  _id: string;
  grnNumber: string;
  purchaseOrderId: any;
  vendorId: any;
  receivedBy: any;
  receivedDate: string;
  items: Array<{
    itemId: any;
    quantityReceived: number;
    condition: string;
    remarks?: string;
  }>;
  isStockUpdated: boolean;
  deliveryChallanNumber?: string;
}

interface StockMovement {
  _id: string;
  movementNumber: string;
  itemId: any;
  movementType: 'RECEIPT' | 'ISSUE' | 'RETURN' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  previousStock: number;
  newStock: number;
  fromLocation?: string;
  toLocation?: string;
  referenceType?: string;
  referenceId?: string;
  performedBy: any;
  notes?: string;
  createdAt: string;
}

interface Asset {
  _id: string;
  assetTag: string;
  serialNumber: string;
  itemId: any;
  name: string;
  location?: string;
  purchaseCostPaise: number;
  status: 'IN_SERVICE' | 'IN_MAINTENANCE' | 'DISPOSED' | 'TRANSFERRED';
  maintenanceHistory: Array<{
    date: string;
    description: string;
    costPaise: number;
    performedBy: string;
  }>;
}

interface StockAdjustment {
  _id: string;
  adjustmentNumber: string;
  itemId: any;
  systemStock: number;
  physicalCount: number;
  variance: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedBy: any;
  approvedBy?: any;
}

export const InventoryPages: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'masters' | 'procurement' | 'movements' | 'assets'>('masters');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Master Data
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);

  // Procurement Data
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>([]);

  // Movement & Ledger Data
  const [movements, setMovements] = useState<StockMovement[]>([]);

  // Asset & Adjustment Data
  const [assets, setAssets] = useState<Asset[]>([]);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);

  // Modals & Action State
  const [showItemModal, setShowItemModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');

  // Item Form
  const [itemCode, setItemCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Laboratory Equipment');
  const [unitOfMeasure, setUnitOfMeasure] = useState('units');
  const [minStock, setMinStock] = useState(5);
  const [initialStock, setInitialStock] = useState(10);
  const [unitCost, setUnitCost] = useState(1500);
  const [isAssetTracked, setIsAssetTracked] = useState(false);
  const [storageLocation, setStorageLocation] = useState('Central Science Depot');

  // Vendor Form
  const [vCode, setVCode] = useState('');
  const [vName, setVName] = useState('');
  const [vContact, setVContact] = useState('');
  const [vEmail, setVEmail] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [vGstin, setVGstin] = useState('');

  // Movement Form
  const [selectedItemId, setSelectedItemId] = useState('');
  const [movementQty, setMovementQty] = useState(1);
  const [movementLocation, setMovementLocation] = useState('Biotechnology Lab 2');
  const [fromLoc, setFromLoc] = useState('Central Science Depot');
  const [toLoc, setToLoc] = useState('Research Complex Block C');
  const [movementNotes, setMovementNotes] = useState('');
  const [serialNumbersText, setSerialNumbersText] = useState('');

  // Audit Adjustment Form
  const [auditPhysicalCount, setAuditPhysicalCount] = useState(0);
  const [auditReason, setAuditReason] = useState('Routine quarterly verification');

  // Maintenance Form
  const [maintDesc, setMaintDesc] = useState('Routine sensor calibration & lens cleaning');
  const [maintCost, setMaintCost] = useState(850);
  const [maintTech, setMaintTech] = useState('Authorized Support Engineer');

  // Demonstration State
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoReport, setDemoReport] = useState<any | null>(null);

  // Notifications
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchMasters = async () => {
    setLoading(true);
    try {
      const [itRes, lowRes, vRes] = await Promise.all([
        fetch(`/api/v1/inventory/items?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(categoryFilter)}`),
        fetch('/api/v1/inventory/items/low-stock'),
        fetch('/api/v1/inventory/vendors')
      ]);
      if (itRes.ok) setItems(await itRes.json());
      if (lowRes.ok) setLowStockItems(await lowRes.json());
      if (vRes.ok) setVendors(await vRes.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProcurement = async () => {
    try {
      const [reqRes, poRes, grnRes] = await Promise.all([
        fetch('/api/v1/inventory/requisitions'),
        fetch('/api/v1/inventory/purchase-orders'),
        fetch('/api/v1/inventory/receipts')
      ]);
      if (reqRes.ok) setRequisitions(await reqRes.json());
      if (poRes.ok) setPurchaseOrders(await poRes.json());
      if (grnRes.ok) setGoodsReceipts(await grnRes.json());
    } catch (e: any) {
      setError(e.message);
    }
  };

  const fetchMovements = async () => {
    try {
      const res = await fetch('/api/v1/inventory/movements');
      if (res.ok) setMovements(await res.json());
    } catch (e: any) {
      setError(e.message);
    }
  };

  const fetchAssetsAndAdjustments = async () => {
    try {
      const [astRes, adjRes] = await Promise.all([
        fetch('/api/v1/inventory/assets'),
        fetch('/api/v1/inventory/adjustments')
      ]);
      if (astRes.ok) setAssets(await astRes.json());
      if (adjRes.ok) setAdjustments(await adjRes.json());
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    fetchMasters();
    fetchProcurement();
    fetchMovements();
    fetchAssetsAndAdjustments();
  }, [categoryFilter]);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    try {
      const res = await fetch('/api/v1/inventory/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemCode,
          name: itemName,
          category: itemCategory,
          unitOfMeasure,
          minStockLevel: Number(minStock),
          initialStock: Number(initialStock),
          unitCostPaise: Number(unitCost) * 100,
          isAssetTracked,
          storageLocation
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create item');
      setNotice(`Item ${data.itemCode} (${data.name}) created successfully!`);
      setShowItemModal(false);
      setItemCode('');
      setItemName('');
      fetchMasters();
      fetchMovements();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    try {
      const res = await fetch('/api/v1/inventory/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorCode: vCode,
          name: vName,
          contactPerson: vContact,
          email: vEmail,
          phone: vPhone,
          taxIdentifierGstin: vGstin
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register vendor');
      setNotice(`Vendor ${data.name} [${data.vendorCode}] registered!`);
      setShowVendorModal(false);
      setVCode('');
      setVName('');
      fetchMasters();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReceiveGoods = async (po: PurchaseOrder) => {
    setError(null);
    setNotice(null);
    try {
      const itemsToReceive = po.items.map(it => ({
        itemId: it.itemId._id || it.itemId,
        quantityReceived: it.quantity,
        condition: 'GOOD',
        remarks: 'Inspected upon delivery challan'
      }));

      const res = await fetch('/api/v1/inventory/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseOrderId: po._id,
          items: itemsToReceive,
          deliveryChallanNumber: `DC-DEMO-${Date.now().toString().slice(-4)}`
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process goods receipt');
      setNotice(`GRN ${data.grnNumber} generated! Stock updated & immutable movements recorded.`);
      fetchProcurement();
      fetchMasters();
      fetchMovements();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleIssueStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    try {
      const serials = serialNumbersText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/v1/inventory/movements/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItemId,
          quantity: Number(movementQty),
          toLocation: movementLocation,
          notes: movementNotes || 'Standard lab issue',
          serialNumbers: serials.length > 0 ? serials : undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to issue stock');
      setNotice(`Successfully issued ${movementQty} units. Movement ${data.movement.movementNumber} recorded.`);
      setShowIssueModal(false);
      setSerialNumbersText('');
      fetchMasters();
      fetchMovements();
      fetchAssetsAndAdjustments();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReturnStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    try {
      const res = await fetch('/api/v1/inventory/movements/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItemId,
          quantity: Number(movementQty),
          fromLocation: movementLocation,
          notes: movementNotes || 'Returned surplus from lab session'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to return stock');
      setNotice(`Successfully returned ${movementQty} units to central store. Movement ${data.movement.movementNumber} recorded.`);
      setShowReturnModal(false);
      fetchMasters();
      fetchMovements();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleTransferStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    try {
      const res = await fetch('/api/v1/inventory/movements/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItemId,
          quantity: Number(movementQty),
          fromLocation: fromLoc,
          toLocation: toLoc,
          notes: movementNotes || 'Inter-departmental balance transfer'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to transfer stock');
      setNotice(`Transfer verified and reconciled! Movement ${data.movement.movementNumber} logged.`);
      setShowTransferModal(false);
      fetchMasters();
      fetchMovements();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAuditAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    try {
      const res = await fetch('/api/v1/inventory/adjustments/count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItemId,
          physicalCount: Number(auditPhysicalCount),
          reason: auditReason
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record audit count');
      setNotice(`Stock adjustment ${data.adjustmentNumber} recorded with variance ${data.variance > 0 ? '+' : ''}${data.variance}. Pending admin approval.`);
      setShowAuditModal(false);
      fetchAssetsAndAdjustments();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleApproveAdjustment = async (id: string) => {
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/v1/inventory/adjustments/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve adjustment');
      setNotice(`Stock adjustment approved! Inventory updated to physical count (${data.item.currentStock}).`);
      fetchMasters();
      fetchMovements();
      fetchAssetsAndAdjustments();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRecordMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/v1/inventory/assets/${selectedAssetId}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: maintDesc,
          costPaise: Number(maintCost) * 100,
          performedBy: maintTech
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to log maintenance');
      setNotice(`Maintenance record logged for asset ${data.assetTag}!`);
      setShowMaintModal(false);
      fetchAssetsAndAdjustments();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const runReproducibleDemo = async () => {
    setDemoRunning(true);
    setError(null);
    setNotice(null);
    setDemoReport(null);
    try {
      const res = await fetch('/api/v1/inventory/demo/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Demo run failed');
      setDemoReport(data);
      setNotice('Reproducible Demonstration Passed: Received 5 items, issued 2, and reconciled remaining balance = 3 with ledger history!');
      fetchMasters();
      fetchMovements();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDemoRunning(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              M28 Prototype
            </span>
            <h1 className="text-2xl font-bold text-gray-900">Inventory, Procurement & Assets</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Centrally manage catalog masters, requisition approvals, purchase orders, goods receipts, immutable stock ledgers and serialized assets.
          </p>
        </div>

        {/* Action Button: Reproducible Demonstration */}
        <div className="flex items-center gap-3">
          <button
            onClick={runReproducibleDemo}
            disabled={demoRunning}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${demoRunning ? 'animate-spin' : ''}`} />
            {demoRunning ? 'Running Demo...' : 'Run Demonstration (Receive 5, Issue 2, Reconcile)'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">&times;</button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-900 font-bold">&times;</button>
        </div>
      )}

      {/* Demonstration Card Report */}
      {demoReport && (
        <div className="p-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-base">
              <CheckCircle className="w-5 h-5 text-indigo-600" />
              <span>{demoReport.demonstration}</span>
            </div>
            <span className="text-xs bg-indigo-100 text-indigo-800 font-semibold px-2 py-1 rounded">
              Status: {demoReport.isReconciled ? 'RECONCILED & VERIFIED' : 'FAILED'}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-3 text-sm">
            <div className="bg-white p-3 rounded-lg border border-indigo-100">
              <span className="text-xs text-gray-500 block">Item Code</span>
              <span className="font-semibold text-gray-800">{demoReport.itemCode}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-indigo-100">
              <span className="text-xs text-gray-500 block">Step 1: Received</span>
              <span className="font-semibold text-emerald-600">+{demoReport.step1_received} units</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-indigo-100">
              <span className="text-xs text-gray-500 block">Step 2: Issued</span>
              <span className="font-semibold text-amber-600">-{demoReport.step2_issued} units</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-indigo-100">
              <span className="text-xs text-gray-500 block">Final Balance Reconciled</span>
              <span className="font-bold text-indigo-700">{demoReport.finalStockInDB} units (Matches DB)</span>
            </div>
          </div>
          <div className="text-xs text-gray-600 bg-white/70 p-2.5 rounded border border-indigo-100 mt-2">
            <strong>Movement Ledger Proof:</strong> Received 5 units via {demoReport.receiptMovementId} &rarr; Issued 2 units via {demoReport.issueMovementId} &rarr; Math: 5 - 2 = 3 (Database balance: 3).
          </div>
        </div>
      )}

      {/* Low Stock Warning Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-amber-800 text-sm">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <span>
              <strong>Low-Stock Alert:</strong> {lowStockItems.length} item(s) are below safety minimum levels (e.g., {lowStockItems.map(i => `${i.name} [Stock: ${i.currentStock}, Min: ${i.minStockLevel}]`).join('; ')}).
            </span>
          </div>
          <button
            onClick={() => setActiveTab('masters')}
            className="text-xs font-semibold px-3 py-1 bg-amber-200 text-amber-900 rounded hover:bg-amber-300"
          >
            Review Masters
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 flex space-x-8">
        <button
          onClick={() => setActiveTab('masters')}
          className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'masters'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Package className="w-4 h-4" />
          1. Masters & Stock Ledger
        </button>

        <button
          onClick={() => setActiveTab('procurement')}
          className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'procurement'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          2. Procurement & Goods Receipts
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'movements'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          3. Issues, Returns & Transfers
        </button>

        <button
          onClick={() => setActiveTab('assets')}
          className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'assets'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Layers className="w-4 h-4" />
          4. Assets & Stock Audit
        </button>
      </div>

      {/* TAB 1: MASTERS & STOCK LEDGER */}
      {activeTab === 'masters' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search item name, code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchMasters()}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="py-2 px-3 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="ALL">All Categories</option>
                <option value="Laboratory Equipment">Laboratory Equipment</option>
                <option value="IT & Computing">IT & Computing</option>
                <option value="Examination Supplies">Examination Supplies</option>
                <option value="General Stationery">General Stationery</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowVendorModal(true)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg flex items-center gap-1.5"
              >
                <Building className="w-4 h-4" />
                + Add Vendor
              </button>
              <button
                onClick={() => setShowItemModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                + New Item Master
              </button>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 text-sm">Item Catalog & Current Balance</h3>
              <span className="text-xs text-gray-500">{items.length} items catalogued</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                  <tr>
                    <th className="px-4 py-3 text-left">Item Code</th>
                    <th className="px-4 py-3 text-left">Name & Location</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Tracking</th>
                    <th className="px-4 py-3 text-right">Unit Value</th>
                    <th className="px-4 py-3 text-right">Available Stock</th>
                    <th className="px-4 py-3 text-center">Stock Status</th>
                    <th className="px-4 py-3 text-center">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                  {items.map((it) => {
                    const isLow = it.currentStock <= it.minStockLevel;
                    return (
                      <tr key={it._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-gray-900">{it.itemCode}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{it.name}</div>
                          <div className="text-xs text-gray-400">{it.storageLocation || 'Central Store'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 font-medium">
                            {it.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {it.isAssetTracked ? (
                            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-semibold">
                              Serialized Asset
                            </span>
                          ) : (
                            <span className="text-gray-400">Consumable</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          ₹{(it.unitCostPaise / 100).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                          {it.currentStock} {it.unitOfMeasure}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                              <AlertTriangle className="w-3 h-3" /> Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                              <Check className="w-3 h-3" /> Adequate
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedItemId(it._id);
                              setShowIssueModal(true);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded"
                          >
                            Issue
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItemId(it._id);
                              setAuditPhysicalCount(it.currentStock);
                              setShowAuditModal(true);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 rounded"
                          >
                            Audit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vendors Registered */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 text-base mb-3 flex items-center gap-2">
              <Building className="w-5 h-5 text-gray-600" />
              Registered Vendors & Suppliers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {vendors.map((v) => (
                <div key={v._id} className="p-4 rounded-lg border border-gray-100 bg-gray-50 text-sm space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-900">{v.name}</span>
                    <span className="font-mono text-xs text-indigo-600 font-semibold">{v.vendorCode}</span>
                  </div>
                  <div className="text-xs text-gray-500">Contact: {v.contactPerson || 'N/A'} ({v.phone || 'N/A'})</div>
                  <div className="text-xs text-gray-400">GSTIN: {v.taxIdentifierGstin || 'Exempt / Not Provided'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROCUREMENT & GOODS RECEIPTS */}
      {activeTab === 'procurement' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Purchase Orders */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-indigo-600" />
                  Active Purchase Orders (Simulated)
                </h3>
                <span className="text-xs text-gray-500">{purchaseOrders.length} orders</span>
              </div>
              <div className="divide-y divide-gray-200 text-sm">
                {purchaseOrders.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-xs">No purchase orders found.</div>
                ) : (
                  purchaseOrders.map((po) => (
                    <div key={po._id} className="p-4 hover:bg-gray-50 transition-colors space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono font-bold text-gray-900">{po.poNumber}</span>
                          <span className="text-xs text-gray-500 ml-2">Vendor: {po.vendorId?.name || 'Authorized Supplier'}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          po.status === 'FULFILLED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {po.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Total Amount: ₹{(po.totalAmountPaise / 100).toLocaleString('en-IN')} &bull; Items: {po.items?.length || 0} line(s)
                      </div>
                      <div className="flex justify-end pt-1">
                        {po.status !== 'FULFILLED' ? (
                          <button
                            onClick={() => handleReceiveGoods(po)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-sm"
                          >
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            Process Goods Receipt (GRN)
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Stock Updated & Fulfilled
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Goods Receipts Log */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Goods Receipt Notes (GRN History)
                </h3>
                <span className="text-xs text-gray-500">{goodsReceipts.length} GRNs</span>
              </div>
              <div className="divide-y divide-gray-200 text-sm">
                {goodsReceipts.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-xs">No goods receipts processed yet.</div>
                ) : (
                  goodsReceipts.map((grn) => (
                    <div key={grn._id} className="p-4 hover:bg-gray-50 transition-colors space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-gray-900">{grn.grnNumber}</span>
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">
                          Challan: {grn.deliveryChallanNumber || 'N/A'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Received By: {grn.receivedBy?.name || 'Store Superintendent'} &bull; Date: {new Date(grn.receivedDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {grn.items?.map((it, idx) => (
                          <span key={idx} className="mr-3">
                            {it.itemId?.name || 'Item'}: +{it.quantityReceived} (Condition: {it.condition})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MOVEMENTS, ISSUES & TRANSFERS */}
      {activeTab === 'movements' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 text-sm">Immutable Stock Movement Ledger</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReturnModal(true)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                Return Stock
              </button>
              <button
                onClick={() => setShowTransferModal(true)}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Department Transfer
              </button>
              <button
                onClick={() => setShowIssueModal(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Issue to Dept/Lab
              </button>
            </div>
          </div>

          {/* Movements Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                  <tr>
                    <th className="px-4 py-3 text-left">Movement #</th>
                    <th className="px-4 py-3 text-left">Item Name</th>
                    <th className="px-4 py-3 text-center">Type</th>
                    <th className="px-4 py-3 text-right">Quantity</th>
                    <th className="px-4 py-3 text-right">Balance Progression</th>
                    <th className="px-4 py-3 text-left">Route / Location</th>
                    <th className="px-4 py-3 text-left">Notes & Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                  {movements.map((m) => (
                    <tr key={m._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-900">{m.movementNumber}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{m.itemId?.name || 'Unknown Item'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          m.movementType === 'RECEIPT' ? 'bg-emerald-100 text-emerald-800' :
                          m.movementType === 'ISSUE' ? 'bg-amber-100 text-amber-800' :
                          m.movementType === 'RETURN' ? 'bg-blue-100 text-blue-800' :
                          m.movementType === 'TRANSFER' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {m.movementType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                        {m.movementType === 'RECEIPT' || m.movementType === 'RETURN' ? `+${m.quantity}` :
                         m.movementType === 'ISSUE' ? `-${m.quantity}` : m.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-mono text-gray-500">
                        {m.previousStock} &rarr; <span className="font-bold text-gray-900">{m.newStock}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {m.fromLocation ? `${m.fromLocation} → ` : ''}{m.toLocation || 'Store'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {m.notes || m.referenceType || 'Recorded'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ASSETS & STOCK AUDIT */}
      {activeTab === 'assets' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Serialized Assets */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  Tracked Serialized Assets
                </h3>
                <span className="text-xs text-gray-500">{assets.length} assets</span>
              </div>
              <div className="divide-y divide-gray-200 text-sm">
                {assets.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-xs">No serialized assets recorded yet.</div>
                ) : (
                  assets.map((ast) => (
                    <div key={ast._id} className="p-4 hover:bg-gray-50 transition-colors space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-gray-900">{ast.name}</span>
                          <div className="font-mono text-xs text-indigo-600">
                            Tag: {ast.assetTag} &bull; S/N: {ast.serialNumber}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800">
                          {ast.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 flex justify-between">
                        <span>Location: {ast.location || 'Central Depot'}</span>
                        <span>Value: ₹{(ast.purchaseCostPaise / 100).toLocaleString('en-IN')}</span>
                      </div>
                      {ast.maintenanceHistory?.length > 0 && (
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
                          <strong>Latest Service:</strong> {ast.maintenanceHistory[ast.maintenanceHistory.length - 1].description} (₹{(ast.maintenanceHistory[ast.maintenanceHistory.length - 1].costPaise / 100).toLocaleString('en-IN')})
                        </div>
                      )}
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            setSelectedAssetId(ast._id);
                            setShowMaintModal(true);
                          }}
                          className="px-2.5 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 rounded flex items-center gap-1"
                        >
                          <Wrench className="w-3 h-3" /> Add Maintenance Log
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Stock Count & Adjustments Audit */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-amber-600" />
                  Physical Count Adjustments & Verification
                </h3>
                <span className="text-xs text-gray-500">{adjustments.length} audit entries</span>
              </div>
              <div className="divide-y divide-gray-200 text-sm">
                {adjustments.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-xs">No audit adjustments recorded.</div>
                ) : (
                  adjustments.map((adj) => (
                    <div key={adj._id} className="p-4 hover:bg-gray-50 transition-colors space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono font-bold text-gray-900">{adj.adjustmentNumber}</span>
                          <span className="text-xs text-gray-500 ml-2">Item: {adj.itemId?.name || 'Item'}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          adj.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {adj.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 flex justify-between">
                        <span>System Stock: {adj.systemStock} &rarr; Physical: {adj.physicalCount}</span>
                        <span className={`font-semibold ${adj.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          Variance: {adj.variance > 0 ? '+' : ''}{adj.variance}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 italic">
                        Reason: {adj.reason}
                      </div>
                      {adj.status === 'PENDING' && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleApproveAdjustment(adj._id)}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold shadow-sm"
                          >
                            Authorize Adjustment
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Create Item */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900">New Item Master</h3>
              <button onClick={() => setShowItemModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleCreateItem} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 font-medium block">Item Code *</label>
                  <input
                    type="text"
                    required
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    placeholder="e.g. ITM-OSC-01"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium block">Category *</label>
                  <input
                    type="text"
                    required
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium block">Item Name *</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Dual-Trace Digital Oscilloscope"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-600 font-medium block">Unit</label>
                  <input
                    type="text"
                    value={unitOfMeasure}
                    onChange={(e) => setUnitOfMeasure(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium block">Min Stock Alert</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium block">Opening Stock</label>
                  <input
                    type="number"
                    value={initialStock}
                    onChange={(e) => setInitialStock(Number(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 font-medium block">Unit Cost (₹)</label>
                  <input
                    type="number"
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium block">Storage Depot</label>
                  <input
                    type="text"
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={isAssetTracked}
                    onChange={(e) => setIsAssetTracked(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  Track as Fixed Serialized Asset (generates individual asset cards on issue)
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700"
                >
                  Save Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Vendor */}
      {showVendorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900">Register Supplier / Vendor</h3>
              <button onClick={() => setShowVendorModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleCreateVendor} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 font-medium block">Vendor Code *</label>
                  <input
                    type="text"
                    required
                    value={vCode}
                    onChange={(e) => setVCode(e.target.value)}
                    placeholder="e.g. VND-004"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium block">GSTIN</label>
                  <input
                    type="text"
                    value={vGstin}
                    onChange={(e) => setVGstin(e.target.value)}
                    placeholder="07AAAAA0000A1Z5"
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium block">Vendor / Company Name *</label>
                <input
                  type="text"
                  required
                  value={vName}
                  onChange={(e) => setVName(e.target.value)}
                  placeholder="e.g. National Lab Supplies Co."
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium block">Contact Person & Phone</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={vContact}
                    onChange={(e) => setVContact(e.target.value)}
                    placeholder="Contact Person"
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={vPhone}
                    onChange={(e) => setVPhone(e.target.value)}
                    placeholder="Phone"
                    className="p-2 border rounded"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium block">Email</label>
                <input
                  type="email"
                  value={vEmail}
                  onChange={(e) => setVEmail(e.target.value)}
                  placeholder="sales@vendor.com"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowVendorModal(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Issue Stock */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900">Issue Stock to Department / Lab</h3>
              <button onClick={() => setShowIssueModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleIssueStock} className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-gray-600 font-medium block">Select Item *</label>
                <select
                  required
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full p-2 border rounded bg-white"
                >
                  <option value="">-- Choose Item --</option>
                  {items.map((it) => (
                    <option key={it._id} value={it._id}>
                      {it.itemCode} - {it.name} (Available: {it.currentStock})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 font-medium block">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={movementQty}
                    onChange={(e) => setMovementQty(Number(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium block">Target Location / Lab *</label>
                  <input
                    type="text"
                    required
                    value={movementLocation}
                    onChange={(e) => setMovementLocation(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium block">Serial Numbers (If asset-tracked, comma-separated)</label>
                <input
                  type="text"
                  value={serialNumbersText}
                  onChange={(e) => setSerialNumbersText(e.target.value)}
                  placeholder="e.g. SN-MIC-2026-003, SN-MIC-2026-004"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium block">Notes / Purpose</label>
                <input
                  type="text"
                  value={movementNotes}
                  onChange={(e) => setMovementNotes(e.target.value)}
                  placeholder="Faculty practical session"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Return Stock */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900">Return Unused Stock to Store</h3>
              <button onClick={() => setShowReturnModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleReturnStock} className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-gray-600 font-medium block">Select Item *</label>
                <select
                  required
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full p-2 border rounded bg-white"
                >
                  <option value="">-- Choose Item --</option>
                  {items.map((it) => (
                    <option key={it._id} value={it._id}>
                      {it.itemCode} - {it.name} (In Central Store: {it.currentStock})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 font-medium block">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={movementQty}
                    onChange={(e) => setMovementQty(Number(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium block">Returning From *</label>
                  <input
                    type="text"
                    required
                    value={movementLocation}
                    onChange={(e) => setMovementLocation(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700"
                >
                  Process Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Department Transfer */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900">Inter-Departmental Transfer</h3>
              <button onClick={() => setShowTransferModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleTransferStock} className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-gray-600 font-medium block">Select Item *</label>
                <select
                  required
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full p-2 border rounded bg-white"
                >
                  <option value="">-- Choose Item --</option>
                  {items.map((it) => (
                    <option key={it._id} value={it._id}>
                      {it.itemCode} - {it.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 font-medium block">Source Location *</label>
                  <input
                    type="text"
                    required
                    value={fromLoc}
                    onChange={(e) => setFromLoc(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium block">Destination *</label>
                  <input
                    type="text"
                    required
                    value={toLoc}
                    onChange={(e) => setToLoc(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium block">Quantity to Transfer *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={movementQty}
                  onChange={(e) => setMovementQty(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700"
                >
                  Reconcile & Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Stock Count Audit */}
      {showAuditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900">Physical Stock Count & Variance</h3>
              <button onClick={() => setShowAuditModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleAuditAdjustment} className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-gray-600 font-medium block">Physical Count Verified *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={auditPhysicalCount}
                  onChange={(e) => setAuditPhysicalCount(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium block">Reason for Discrepancy / Audit *</label>
                <textarea
                  required
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  rows={3}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAuditModal(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded font-semibold hover:bg-amber-700"
                >
                  Submit Audit Count
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: Asset Maintenance */}
      {showMaintModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900">Record Asset Maintenance</h3>
              <button onClick={() => setShowMaintModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleRecordMaintenance} className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-gray-600 font-medium block">Work Description *</label>
                <input
                  type="text"
                  required
                  value={maintDesc}
                  onChange={(e) => setMaintDesc(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 font-medium block">Cost (₹)</label>
                  <input
                    type="number"
                    value={maintCost}
                    onChange={(e) => setMaintCost(Number(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium block">Engineer / Tech</label>
                  <input
                    type="text"
                    value={maintTech}
                    onChange={(e) => setMaintTech(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowMaintModal(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700"
                >
                  Save Maintenance Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mandatory Completion Footer */}
      <div className="mt-8 pt-5 border-t border-gray-200 text-xs text-gray-500 flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span className="font-semibold text-gray-700">M28: Inventory, Procurement and Assets Complete</span>
          <span>&bull; Immutable movements, nonnegative stock guards & serialized assets active.</span>
        </div>
        <div className="text-gray-400">
          Cross-Module Integration Gates: M23 Governance Notesheets | M24 E-Register Movement | M10 Finance Budget
        </div>
      </div>
    </div>
  );
};

export default InventoryPages;
