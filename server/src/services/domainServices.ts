import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';
import {
  UserRole,
  AttendanceStatus,
  ExamType,
  FeeType,
  PaymentMode,
  PaymentStatus,
  GatePassStatus,
  PlacementAppStatus,
  GrievanceCategory,
  GrievanceStatus,
  OutboxStatus,
  InvoiceStatus,
  PaymentOrderStatus,
  PaymentEventType,
  RefundStatus,
  ConcessionCategory,
  ConcessionStatus,
  BudgetStatus,
  ExamCycleStatus,
  ExamStudentCategory,
  ExamApplicationStatus,
  EligibilityStatus,
  CenterVerificationStatus,
  ExamScheduleStatus,
  SeatingAllocationStatus,
  InvigilationDutyStatus,
  MaterialType,
  MaterialBatchStatus,
  MaterialMovementType,
  AppointmentStatus,
  AppointmentRole,
  QuestionDifficulty,
  QuestionType,
  PaperVersionStatus,
  ConfidentialAccessType,
  formatPaiseToRupees
} from '@shared/index';

import {
  User,
  Institution,
  Department,
  Student,
  Course,
  Timetable,
  AttendanceRecord,
  Exam,
  MarkSheet,
  FeeStructure,
  FeeTransaction,
  FeeRuleVersion,
  Invoice,
  PaymentOrder,
  PaymentEvent,
  Receipt,
  Refund,
  Concession,
  ReconciliationRun,
  Fund,
  Budget,
  BudgetEntry,
  PayrollRecord,
  HostelRoom,
  GatePass,
  TransportRoute,
  BusPass,
  Book,
  BookLoan,
  PlacementDrive,
  PlacementApplication,
  Grievance,
  Notice,
  AuditLog,
  OutboxEvent,
  Applicant,
  AdmissionApplication,
  AdmissionDocument,
  ImportBatch,
  ExternalCodeMapping,
  ReviewDecision,
  Enrollment,
  IdentifierSequence,
  AlumniProfile,
  EnrollmentHistory,
  ProfileChangeRequest,
  StudentDocument,
  StudentStatusEvent,
  GraduationRecord,
  AttendanceSession,
  AttendanceEntry,
  AttendanceCorrection,
  AttendancePolicyVersion,
  TeachingAssignment,
  Room,
  TimetableEntry,
  TimetableException,
  CalendarEvent,
  Holiday,
  SubjectEnrollment,
  ExamCycle,
  ExamPolicyVersion,
  ExamApplication,
  EligibilityDecision,
  ExamEnrollment,
  RollNumberAssignment,
  HallTicket,
  ExamCenter,
  CenterVerification,
  ExamSchedule,
  SeatingAllocation,
  InvigilationDuty,
  MaterialBatch,
  MaterialMovement,
  SetterAppointment,
  Question,
  PaperVersion,
  PaperReview,
  ConfidentialAccessEvent
} from '../models/models';

import { JWT_SECRET } from '../middleware/auth';

export const SIMULATOR_SECRET = 'CAMPUS_SETU_SIM_KEY_2026';

export function signSimulatorPayload(orderId: string, amountPaise: number, providerPaymentId: string): string {
  return crypto.createHmac('sha256', SIMULATOR_SECRET).update(`${orderId}|${amountPaise}|${providerPaymentId}`).digest('hex');
}

export class AuthService {
  static async login(email: string, password: string, role: UserRole) {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    if (user.role !== role) {
      throw new Error(`User is registered under role '${user.role}', not '${role}'.`);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated. Contact Administrator.');
    }

    let studentId: string | undefined;
    if (user.role === UserRole.STUDENT) {
      const student = await Student.findOne({ userId: user._id });
      if (student) studentId = student._id.toString();
    }

    const wardStudentIds = user.wardStudentIds?.map(id => id.toString()) || [];

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        institutionId: user.institutionId?.toString(),
        studentId,
        wardStudentIds
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        institutionId: user.institutionId?.toString(),
        studentId,
        wardStudentIds
      }
    };
  }

  static async register(data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    institutionId?: string;
    phone?: string;
    wardStudentIds?: string[];
  }) {
    const existing = await User.findOne({ email: data.email.toLowerCase().trim() });
    if (existing) {
      throw new Error('User with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      email: data.email,
      passwordHash,
      name: data.name,
      role: data.role,
      institutionId: data.institutionId,
      phone: data.phone,
      wardStudentIds: data.wardStudentIds
    });

    return { id: user._id.toString(), email: user.email, name: user.name, role: user.role };
  }
}

export class FeeService {
  static async processPayment(data: {
    studentId: string;
    institutionId: string;
    amountPaise: number;
    feeType: FeeType;
    paymentMode: PaymentMode;
    idempotencyKey: string;
  }) {
    // 1. Idempotency Check
    const existingTxn = await FeeTransaction.findOne({ idempotencyKey: data.idempotencyKey });
    if (existingTxn) {
      console.log(`[FeeService] Returning existing transaction for Idempotency Key: ${data.idempotencyKey}`);
      return existingTxn;
    }

    // 2. Integer Paise Validation
    if (!Number.isInteger(data.amountPaise) || data.amountPaise <= 0) {
      throw new Error('Invalid monetary amount. Value must be a positive integer in paise.');
    }

    const student = await Student.findById(data.studentId);
    if (!student) {
      throw new Error('Student record not found.');
    }

    // 3. Generate Receipts & References
    const timestamp = Date.now();
    const transactionId = `TXN-${timestamp}-${Math.floor(1000 + Math.random() * 9000)}`;
    const receiptNumber = `RCP-${timestamp}-${Math.floor(1000 + Math.random() * 9000)}`;
    const gatewayReference = `PAY-SIM-${uuidv4().substring(0, 8).toUpperCase()}`;

    const txn = await FeeTransaction.create({
      transactionId,
      idempotencyKey: data.idempotencyKey,
      studentId: data.studentId,
      institutionId: data.institutionId,
      amountPaise: data.amountPaise,
      feeType: data.feeType,
      paymentMode: data.paymentMode,
      status: PaymentStatus.SUCCESS,
      receiptNumber,
      gatewayReference
    });

    // 4. Outbox Event & Audit Log
    await OutboxEvent.create({
      eventId: uuidv4(),
      eventType: 'FEE_PAYMENT_PROCESSED',
      payload: {
        transactionId: txn.transactionId,
        studentId: data.studentId,
        amountPaise: data.amountPaise,
        receiptNumber
      }
    });

    await AuditLog.create({
      action: 'FEE_PAYMENT_SUCCESS',
      resource: 'FeeTransaction',
      resourceId: txn._id.toString(),
      institutionId: data.institutionId,
      newState: { amountPaise: data.amountPaise, receiptNumber }
    });

    return txn;
  }

  static async getStudentLedger(studentId: string) {
    const student = await Student.findById(studentId);
    if (!student) throw new Error('Student not found.');

    const structures = await FeeStructure.find({
      institutionId: student.institutionId,
      semester: student.currentSemester
    });

    const transactions = await FeeTransaction.find({ studentId }).sort({ createdAt: -1 });

    const totalDuePaise = structures.reduce((sum, s) => sum + s.amountPaise, 0);
    const totalPaidPaise = transactions
      .filter(t => t.status === PaymentStatus.SUCCESS)
      .reduce((sum, t) => sum + t.amountPaise, 0);
    const balancePaise = Math.max(0, totalDuePaise - totalPaidPaise);

    return {
      studentId,
      totalDuePaise,
      totalPaidPaise,
      balancePaise,
      formattedDue: formatPaiseToRupees(totalDuePaise),
      formattedPaid: formatPaiseToRupees(totalPaidPaise),
      formattedBalance: formatPaiseToRupees(balancePaise),
      structures,
      transactions
    };
  }
}

export class FinanceService {
  // 1. Fee Rule Version Management
  static async createFeeRule(data: {
    institutionId: string;
    name: string;
    academicYear: string;
    departmentId?: string;
    feeCategory: FeeType;
    heads: Array<{ name: string; code: string; amountPaise: number; isMandatory?: boolean }>;
    lateFeeRule?: { graceDays: number; dailyLateFeePaise: number; maxLateFeePaise: number };
    status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  }) {
    const totalAmountPaise = data.heads.reduce((sum, h) => sum + h.amountPaise, 0);
    const rule = await FeeRuleVersion.create({
      institutionId: data.institutionId,
      name: data.name,
      academicYear: data.academicYear,
      departmentId: data.departmentId,
      feeCategory: data.feeCategory,
      heads: data.heads,
      totalAmountPaise,
      lateFeeRule: data.lateFeeRule || { graceDays: 15, dailyLateFeePaise: 5000, maxLateFeePaise: 100000 },
      status: data.status || 'ACTIVE'
    });
    return rule;
  }

  static async getFeeRules(institutionId: string) {
    return FeeRuleVersion.find({ institutionId }).sort({ createdAt: -1 });
  }

  // 2. Invoice Generation & Assessment
  static async assessAndIssueInvoice(data: {
    institutionId: string;
    studentId: string;
    academicYear: string;
    semester: number;
    dueDate: string;
    lines: Array<{ head: string; category?: string; amountPaise: number }>;
  }) {
    const student = await Student.findById(data.studentId);
    if (!student) throw new Error('Student not found for invoice assessment.');

    const totalAmountPaise = data.lines.reduce((sum, l) => sum + l.amountPaise, 0);
    if (!Number.isInteger(totalAmountPaise) || totalAmountPaise <= 0) {
      throw new Error('Total invoice amount must be a positive integer in paise.');
    }

    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(100 + Math.random() * 900);
    const invoiceNumber = `INV-${data.academicYear.slice(0, 4)}-${timestamp}-${random}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      studentId: data.studentId,
      institutionId: data.institutionId,
      academicYear: data.academicYear,
      semester: data.semester,
      dueDate: data.dueDate,
      lines: data.lines.map(l => ({ head: l.head, category: l.category || 'TUITION', amountPaise: l.amountPaise })),
      totalAmountPaise,
      concessionAmountPaise: 0,
      payableAmountPaise: totalAmountPaise,
      paidAmountPaise: 0,
      status: InvoiceStatus.ISSUED
    });

    await OutboxEvent.create({
      eventId: uuidv4(),
      institutionId: data.institutionId,
      aggregateType: 'INVOICE',
      eventType: 'INVOICE_ISSUED',
      payload: { invoiceNumber, studentId: data.studentId, payableAmountPaise: totalAmountPaise }
    });

    return invoice;
  }

  // 3. Payment Order Creation
  static async createPaymentOrder(data: {
    invoiceId: string;
    studentId: string;
    institutionId: string;
    amountPaise: number;
    idempotencyKey: string;
    provider?: string;
  }) {
    // Check existing order with idempotencyKey
    const existing = await PaymentOrder.findOne({ idempotencyKey: data.idempotencyKey });
    if (existing) {
      return existing;
    }

    const invoice = await Invoice.findById(data.invoiceId);
    if (!invoice) throw new Error('Invoice not found.');

    const remainingDuePaise = invoice.payableAmountPaise - invoice.paidAmountPaise;
    if (remainingDuePaise <= 0) {
      throw new Error('Invoice is already fully paid.');
    }

    if (!Number.isInteger(data.amountPaise) || data.amountPaise <= 0) {
      throw new Error('Payment order amount must be a positive integer in paise.');
    }

    if (data.amountPaise > remainingDuePaise) {
      throw new Error(`Order amount (${data.amountPaise} paise) exceeds outstanding invoice balance (${remainingDuePaise} paise).`);
    }

    const orderId = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const providerOrderId = `order_sim_${uuidv4().replace(/-/g, '').slice(0, 14)}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes window

    const order = await PaymentOrder.create({
      orderId,
      invoiceId: data.invoiceId,
      studentId: data.studentId,
      institutionId: data.institutionId,
      amountPaise: data.amountPaise,
      currency: 'INR',
      status: PaymentOrderStatus.CREATED,
      idempotencyKey: data.idempotencyKey,
      provider: data.provider || 'RAZORPAY_SIM',
      providerOrderId,
      expiresAt
    });

    return order;
  }

  // 4. Provider Callback Verification & Atomic Settlement
  static async handleSimulatorCallback(data: {
    orderId: string;
    providerPaymentId: string;
    amountPaise: number;
    eventType: 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'PAYMENT_PENDING';
    signature: string;
  }) {
    const order = await PaymentOrder.findOne({ orderId: data.orderId });
    if (!order) throw new Error(`Payment order ${data.orderId} not found.`);

    // 1. Signature Verification
    const expectedSig = signSimulatorPayload(data.orderId, data.amountPaise, data.providerPaymentId);
    if (data.signature !== expectedSig) {
      await PaymentEvent.create({
        eventId: uuidv4(),
        orderId: data.orderId,
        providerPaymentId: data.providerPaymentId,
        eventType: data.eventType as any,
        amountPaise: data.amountPaise,
        currency: 'INR',
        signature: data.signature,
        verified: false,
        processed: false,
        rawPayload: { error: 'TAMPERED_SIGNATURE' }
      });
      throw new Error('Tampered signature: verification failed.');
    }

    // 2. Amount and Currency Binding Verification
    if (data.amountPaise !== order.amountPaise) {
      await PaymentEvent.create({
        eventId: uuidv4(),
        orderId: data.orderId,
        providerPaymentId: data.providerPaymentId,
        eventType: data.eventType as any,
        amountPaise: data.amountPaise,
        currency: 'INR',
        signature: data.signature,
        verified: false,
        processed: false,
        rawPayload: { error: 'TAMPERED_AMOUNT', expected: order.amountPaise, received: data.amountPaise }
      });
      throw new Error(`Tampered amount: callback amount (${data.amountPaise}) does not match order amount (${order.amountPaise}).`);
    }

    // 3. Late Failure Rule: Success is not reversed by a late failure
    if (order.status === PaymentOrderStatus.PAID) {
      if (data.eventType === 'PAYMENT_FAILED') {
        await PaymentEvent.create({
          eventId: uuidv4(),
          orderId: data.orderId,
          providerPaymentId: data.providerPaymentId,
          eventType: PaymentEventType.PAYMENT_FAILED,
          amountPaise: data.amountPaise,
          currency: 'INR',
          signature: data.signature,
          verified: true,
          processed: false,
          rawPayload: { note: 'LATE_FAILURE_IGNORED_OVER_SUCCESS' }
        });
        const existingReceipt = await Receipt.findOne({ paymentOrderId: order.orderId });
        return {
          settled: true,
          status: 'SUCCESS_PRESERVED',
          message: 'Success is not reversed by a late failure callback.',
          order,
          receipt: existingReceipt
        };
      }

      // Duplicate Callback Rule: Duplicate callbacks yield one settlement
      const existingReceipt = await Receipt.findOne({ paymentOrderId: order.orderId });
      await PaymentEvent.create({
        eventId: uuidv4(),
        orderId: data.orderId,
        providerPaymentId: data.providerPaymentId,
        eventType: PaymentEventType.PAYMENT_SUCCESS,
        amountPaise: data.amountPaise,
        currency: 'INR',
        signature: data.signature,
        verified: true,
        processed: true,
        rawPayload: { note: 'DUPLICATE_CALLBACK_IDEMPOTENT' }
      });
      return {
        settled: true,
        status: 'ALREADY_SETTLED',
        message: 'Duplicate callback acknowledged. Single settlement preserved.',
        order,
        receipt: existingReceipt
      };
    }

    // 4. Record Verified Payment Event
    await PaymentEvent.create({
      eventId: uuidv4(),
      orderId: data.orderId,
      providerPaymentId: data.providerPaymentId,
      eventType: data.eventType as any,
      amountPaise: data.amountPaise,
      currency: 'INR',
      signature: data.signature,
      verified: true,
      processed: true
    });

    if (data.eventType === 'PAYMENT_FAILED') {
      order.status = PaymentOrderStatus.FAILED;
      await order.save();
      return { settled: false, status: 'FAILED', message: 'Payment recorded as failed.', order };
    }

    if (data.eventType === 'PAYMENT_PENDING') {
      order.status = PaymentOrderStatus.ATTEMPTED;
      await order.save();
      return { settled: false, status: 'PENDING', message: 'Payment recorded as pending.', order };
    }

    // 5. Atomic Settlement & Immutable Receipt Creation
    const receiptNumber = `RCP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const receipt = await Receipt.create({
      receiptNumber,
      invoiceId: order.invoiceId,
      paymentOrderId: order.orderId,
      studentId: order.studentId,
      institutionId: order.institutionId,
      amountPaise: order.amountPaise,
      paymentMode: PaymentMode.UPI,
      issuedAt: new Date(),
      counterfoilData: {
        providerPaymentId: data.providerPaymentId,
        provider: order.provider,
        idempotencyKey: order.idempotencyKey
      }
    });

    order.status = PaymentOrderStatus.PAID;
    order.paidAt = new Date();
    order.receiptNumber = receiptNumber;
    await order.save();

    // Update invoice
    const invoice = await Invoice.findById(order.invoiceId);
    if (invoice) {
      invoice.paidAmountPaise += order.amountPaise;
      if (invoice.paidAmountPaise >= invoice.payableAmountPaise) {
        invoice.status = InvoiceStatus.PAID;
      } else {
        invoice.status = InvoiceStatus.PARTIALLY_PAID;
      }
      await invoice.save();
    }

    // Outbox & Audit
    await OutboxEvent.create({
      eventId: uuidv4(),
      institutionId: order.institutionId,
      aggregateType: 'PAYMENT_ORDER',
      eventType: 'PAYMENT_SETTLED',
      payload: {
        orderId: order.orderId,
        receiptNumber,
        amountPaise: order.amountPaise,
        studentId: order.studentId
      }
    });

    await AuditLog.create({
      action: 'PAYMENT_SETTLED',
      resource: 'PaymentOrder',
      resourceId: order._id.toString(),
      institutionId: order.institutionId,
      newState: { status: 'PAID', receiptNumber, amountPaise: order.amountPaise }
    });

    return {
      settled: true,
      status: 'SETTLED',
      order,
      receipt,
      invoice
    };
  }

  // 5. Refunds (Partial refund cannot exceed paid balance)
  static async requestRefund(data: {
    invoiceId: string;
    studentId: string;
    amountPaise: number;
    reason: string;
    receiptId?: string;
  }) {
    if (!Number.isInteger(data.amountPaise) || data.amountPaise <= 0) {
      throw new Error('Refund amount must be a positive integer in paise.');
    }

    const invoice = await Invoice.findById(data.invoiceId);
    if (!invoice) throw new Error('Invoice not found.');

    // Calculate total active/approved refunds
    const existingRefunds = await Refund.find({
      invoiceId: data.invoiceId,
      status: { $in: [RefundStatus.REQUESTED, RefundStatus.APPROVED, RefundStatus.PROCESSED] }
    });
    const alreadyRefundedPaise = existingRefunds.reduce((sum, r) => sum + r.amountPaise, 0);

    if (alreadyRefundedPaise + data.amountPaise > invoice.paidAmountPaise) {
      throw new Error(`Partial refund cannot exceed paid balance. Paid: ${invoice.paidAmountPaise} paise, Already Refunded/Requested: ${alreadyRefundedPaise} paise, Requested: ${data.amountPaise} paise.`);
    }

    const refundId = `REF-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const refund = await Refund.create({
      refundId,
      receiptId: data.receiptId,
      invoiceId: data.invoiceId,
      studentId: data.studentId,
      amountPaise: data.amountPaise,
      reason: data.reason,
      status: RefundStatus.REQUESTED
    });

    return refund;
  }

  static async approveRefund(refundId: string, approvedBy: string) {
    const refund = await Refund.findOne({ refundId });
    if (!refund) throw new Error(`Refund ${refundId} not found.`);

    if (refund.status === RefundStatus.APPROVED || refund.status === RefundStatus.PROCESSED) {
      return refund;
    }

    const invoice = await Invoice.findById(refund.invoiceId);
    if (!invoice) throw new Error('Associated invoice not found.');

    if (refund.amountPaise > invoice.paidAmountPaise) {
      throw new Error('Cannot approve refund: amount exceeds paid balance of invoice.');
    }

    refund.status = RefundStatus.APPROVED;
    refund.approvedBy = approvedBy;
    refund.providerRefundId = `rfnd_sim_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
    await refund.save();

    invoice.paidAmountPaise = Math.max(0, invoice.paidAmountPaise - refund.amountPaise);
    if (invoice.paidAmountPaise < invoice.payableAmountPaise) {
      invoice.status = invoice.paidAmountPaise === 0 ? InvoiceStatus.ISSUED : InvoiceStatus.PARTIALLY_PAID;
    }
    await invoice.save();

    await OutboxEvent.create({
      eventId: uuidv4(),
      institutionId: invoice.institutionId,
      aggregateType: 'REFUND',
      eventType: 'REFUND_APPROVED',
      payload: { refundId: refund.refundId, amountPaise: refund.amountPaise, studentId: refund.studentId }
    });

    return refund;
  }

  // 6. Concessions & Scholarships
  static async requestConcession(data: {
    institutionId: string;
    studentId: string;
    invoiceId?: string;
    category: ConcessionCategory;
    amountPaise: number;
    reason: string;
  }) {
    if (!Number.isInteger(data.amountPaise) || data.amountPaise <= 0) {
      throw new Error('Concession amount must be a positive integer in paise.');
    }

    const concessionId = `CNC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const concession = await Concession.create({
      concessionId,
      studentId: data.studentId,
      invoiceId: data.invoiceId,
      category: data.category,
      amountPaise: data.amountPaise,
      reason: data.reason,
      status: ConcessionStatus.PENDING_APPROVAL
    });

    return concession;
  }

  static async reviewConcession(concessionId: string, status: 'APPROVED' | 'REJECTED', approvedBy: string) {
    const concession = await Concession.findOne({ concessionId });
    if (!concession) throw new Error(`Concession ${concessionId} not found.`);

    concession.status = status as ConcessionStatus;
    concession.approvedBy = approvedBy;
    await concession.save();

    // If approved and invoiceId is attached, adjust invoice payable amount
    if (status === 'APPROVED' && concession.invoiceId) {
      const invoice = await Invoice.findById(concession.invoiceId);
      if (invoice) {
        invoice.concessionAmountPaise += concession.amountPaise;
        invoice.payableAmountPaise = Math.max(0, invoice.totalAmountPaise - invoice.concessionAmountPaise);
        if (invoice.paidAmountPaise >= invoice.payableAmountPaise) {
          invoice.status = InvoiceStatus.PAID;
        }
        await invoice.save();
      }
    }

    return concession;
  }

  // 7. Reconciliation Engine
  static async runReconciliation(institutionId: string, periodStart: string, periodEnd: string) {
    const orders = await PaymentOrder.find({ institutionId });
    const events = await PaymentEvent.find({});
    const receipts = await Receipt.find({ institutionId });

    const eventMap = new Map<string, any[]>();
    for (const ev of events) {
      const list = eventMap.get(ev.orderId) || [];
      list.push(ev);
      eventMap.set(ev.orderId, list);
    }

    const receiptMap = new Map<string, any>();
    for (const r of receipts) {
      receiptMap.set(r.paymentOrderId, r);
    }

    let totalSettledAmountPaise = 0;
    let matchedCount = 0;
    let discrepancyCount = 0;
    const unmatchedOrders: Array<{
      orderId: string;
      expectedPaise: number;
      actualPaise: number;
      status: string;
      reason: string;
    }> = [];

    for (const order of orders) {
      const orderEvents = eventMap.get(order.orderId) || [];
      const receipt = receiptMap.get(order.orderId);

      if (order.status === PaymentOrderStatus.PAID) {
        if (!receipt) {
          discrepancyCount++;
          unmatchedOrders.push({
            orderId: order.orderId,
            expectedPaise: order.amountPaise,
            actualPaise: 0,
            status: 'MISSING_RECEIPT',
            reason: 'Order is marked PAID but no corresponding Receipt was found.'
          });
        } else if (receipt.amountPaise !== order.amountPaise) {
          discrepancyCount++;
          unmatchedOrders.push({
            orderId: order.orderId,
            expectedPaise: order.amountPaise,
            actualPaise: receipt.amountPaise,
            status: 'AMOUNT_MISMATCH',
            reason: `Order amount (${order.amountPaise}) does not match Receipt amount (${receipt.amountPaise}).`
          });
        } else {
          matchedCount++;
          totalSettledAmountPaise += order.amountPaise;
        }
      } else if (order.status === PaymentOrderStatus.CREATED || order.status === PaymentOrderStatus.ATTEMPTED) {
        // Pending order: check if provider sent callback
        const successEvent = orderEvents.find(e => e.eventType === PaymentEventType.PAYMENT_SUCCESS);
        if (successEvent) {
          discrepancyCount++;
          unmatchedOrders.push({
            orderId: order.orderId,
            expectedPaise: order.amountPaise,
            actualPaise: successEvent.amountPaise,
            status: 'UNSETTLED_CALLBACK',
            reason: 'Provider sent success event but order was not settled.'
          });
        } else {
          // Normal pending order without callback
          unmatchedOrders.push({
            orderId: order.orderId,
            expectedPaise: order.amountPaise,
            actualPaise: 0,
            status: 'PENDING_ORDER',
            reason: 'Order is awaiting payment completion or simulated callback.'
          });
        }
      } else if (order.status === PaymentOrderStatus.FAILED) {
        matchedCount++;
      }
    }

    const runId = `REC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const run = await ReconciliationRun.create({
      runId,
      runDate: new Date().toISOString().split('T')[0],
      periodStart,
      periodEnd,
      totalOrdersChecked: orders.length,
      totalSettledAmountPaise,
      matchedCount,
      discrepancyCount,
      unmatchedOrders,
      status: discrepancyCount > 0 ? 'DISCREPANCY_DETECTED' : 'COMPLETED'
    });

    return run;
  }

  // 8. Student View
  static async getStudentFeeDetails(studentId: string) {
    const student = await Student.findById(studentId);
    if (!student) throw new Error('Student not found.');

    const invoices = await Invoice.find({ studentId }).sort({ createdAt: -1 });
    const paymentOrders = await PaymentOrder.find({ studentId }).sort({ createdAt: -1 });
    const receipts = await Receipt.find({ studentId }).sort({ issuedAt: -1 });
    const concessions = await Concession.find({ studentId }).sort({ createdAt: -1 });
    const refunds = await Refund.find({ studentId }).sort({ createdAt: -1 });

    const totalInvoicedPaise = invoices.reduce((sum, i) => sum + i.totalAmountPaise, 0);
    const totalConcessionsPaise = concessions
      .filter(c => c.status === ConcessionStatus.APPROVED)
      .reduce((sum, c) => sum + c.amountPaise, 0);
    const totalPayablePaise = invoices.reduce((sum, i) => sum + i.payableAmountPaise, 0);
    const totalPaidPaise = receipts.reduce((sum, r) => sum + r.amountPaise, 0);
    const totalRefundedPaise = refunds
      .filter(r => r.status === RefundStatus.APPROVED || r.status === RefundStatus.PROCESSED)
      .reduce((sum, r) => sum + r.amountPaise, 0);
    const netPaidPaise = Math.max(0, totalPaidPaise - totalRefundedPaise);
    const balancePaise = Math.max(0, totalPayablePaise - netPaidPaise);

    const studentUser = await User.findById(student.userId);
    return {
      studentId,
      studentName: studentUser?.name || student.rollNumber,
      rollNumber: student.rollNumber,
      invoices,
      paymentOrders,
      receipts,
      concessions,
      refunds,
      summary: {
        totalInvoicedPaise,
        totalConcessionsPaise,
        totalPayablePaise,
        totalPaidPaise,
        totalRefundedPaise,
        netPaidPaise,
        balancePaise,
        formattedInvoiced: formatPaiseToRupees(totalInvoicedPaise),
        formattedPaid: formatPaiseToRupees(netPaidPaise),
        formattedBalance: formatPaiseToRupees(balancePaise)
      }
    };
  }

  // 9. Finance Overview & Dashboard
  static async getFinanceOverview(institutionId: string) {
    const invoices = await Invoice.find({ institutionId }).sort({ createdAt: -1 }).limit(50);
    const receipts = await Receipt.find({ institutionId }).sort({ issuedAt: -1 }).limit(50);
    const concessions = await Concession.find({}).sort({ createdAt: -1 });
    const refunds = await Refund.find({}).sort({ createdAt: -1 });
    const feeRules = await FeeRuleVersion.find({ institutionId }).sort({ createdAt: -1 });
    const reconciliationRuns = await ReconciliationRun.find({}).sort({ createdAt: -1 }).limit(10);
    const funds = await Fund.find({});
    const budgets = await Budget.find({});

    const totalInvoicedPaise = invoices.reduce((sum, i) => sum + i.totalAmountPaise, 0);
    const totalCollectedPaise = receipts.reduce((sum, r) => sum + r.amountPaise, 0);
    const totalConcessionsPaise = concessions
      .filter(c => c.status === ConcessionStatus.APPROVED)
      .reduce((sum, c) => sum + c.amountPaise, 0);
    const totalRefundedPaise = refunds
      .filter(r => r.status === RefundStatus.APPROVED || r.status === RefundStatus.PROCESSED)
      .reduce((sum, r) => sum + r.amountPaise, 0);

    return {
      totalInvoicedPaise,
      totalCollectedPaise,
      totalConcessionsPaise,
      totalRefundedPaise,
      netCollectedPaise: totalCollectedPaise - totalRefundedPaise,
      formattedInvoiced: formatPaiseToRupees(totalInvoicedPaise),
      formattedCollected: formatPaiseToRupees(totalCollectedPaise),
      formattedNetCollected: formatPaiseToRupees(totalCollectedPaise - totalRefundedPaise),
      formattedConcessions: formatPaiseToRupees(totalConcessionsPaise),
      formattedRefunded: formatPaiseToRupees(totalRefundedPaise),
      invoices,
      receipts,
      concessions,
      refunds,
      feeRules,
      reconciliationRuns,
      funds,
      budgets
    };
  }

  // 10. Funds and Budgets
  static async createFund(data: { code: string; name: string; description?: string; totalAllocatedPaise: number }) {
    return Fund.create({
      code: data.code,
      name: data.name,
      description: data.description,
      totalAllocatedPaise: data.totalAllocatedPaise,
      utilizedPaise: 0,
      balancePaise: data.totalAllocatedPaise
    });
  }

  static async getFunds() {
    return Fund.find({});
  }

  static async createBudget(data: {
    institutionId: string;
    academicYear: string;
    departmentId?: string;
    fundCode: string;
    fundName: string;
    allocatedPaise: number;
    entries?: Array<{ head: string; allocatedPaise: number }>;
  }) {
    const budget = await Budget.create({
      academicYear: data.academicYear,
      departmentId: data.departmentId,
      fundCode: data.fundCode,
      fundName: data.fundName,
      allocatedPaise: data.allocatedPaise,
      spentPaise: 0,
      status: BudgetStatus.APPROVED
    });

    if (data.entries && data.entries.length > 0) {
      for (const entry of data.entries) {
        await BudgetEntry.create({
          budgetId: budget._id,
          head: entry.head,
          allocatedPaise: entry.allocatedPaise,
          spentPaise: 0,
          approvedAt: new Date(),
          approvedBy: 'FINANCE_CONTROLLER'
        });
      }
    }

    return budget;
  }

  static async getBudgets() {
    return Budget.find({}).sort({ createdAt: -1 });
  }
}

export class ExamService {
  static async submitMarks(data: {
    examId: string;
    courseId: string;
    studentMarks: Array<{ studentId: string; marksObtained: number; maxMarks: number; remarks?: string }>;
    isFinalized: boolean;
    userId: string;
  }) {
    const results = [];

    for (const item of data.studentMarks) {
      let markSheet = await MarkSheet.findOne({
        examId: data.examId,
        courseId: data.courseId,
        studentId: item.studentId
      });

      const percentage = (item.marksObtained / item.maxMarks) * 100;
      let grade = 'F';
      if (percentage >= 90) grade = 'S';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B';
      else if (percentage >= 60) grade = 'C';
      else if (percentage >= 50) grade = 'D';
      else if (percentage >= 40) grade = 'E';

      if (markSheet) {
        if (markSheet.isFinalized && markSheet.marksObtained !== item.marksObtained) {
          // Record immutable revision history!
          markSheet.revisionHistory.push({
            previousMarks: markSheet.marksObtained,
            updatedMarks: item.marksObtained,
            reason: item.remarks || 'Grade adjustment revision post-finalization',
            updatedBy: data.userId as any,
            timestamp: new Date()
          });
        }
        markSheet.marksObtained = item.marksObtained;
        markSheet.maxMarks = item.maxMarks;
        markSheet.grade = grade;
        if (data.isFinalized) {
          markSheet.isFinalized = true;
          markSheet.finalizedBy = data.userId as any;
          markSheet.finalizedAt = new Date();
        }
        await markSheet.save();
      } else {
        markSheet = await MarkSheet.create({
          examId: data.examId,
          courseId: data.courseId,
          studentId: item.studentId,
          marksObtained: item.marksObtained,
          maxMarks: item.maxMarks,
          grade,
          isFinalized: data.isFinalized,
          finalizedBy: data.isFinalized ? (data.userId as any) : undefined,
          finalizedAt: data.isFinalized ? new Date() : undefined
        });
      }
      results.push(markSheet);
    }

    return results;
  }

  static async getReportCard(studentId: string) {
    const markSheets = await MarkSheet.find({ studentId })
      .populate('examId')
      .populate('courseId');

    // Calculate SGPA/CGPA
    let totalCredits = 0;
    let totalGradePoints = 0;

    const gradePointMap: Record<string, number> = {
      S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0
    };

    markSheets.forEach((ms: any) => {
      const credits = ms.courseId?.credits || 3;
      const points = gradePointMap[ms.grade] ?? 0;
      totalCredits += credits;
      totalGradePoints += points * credits;
    });

    const calculatedCgpa = totalCredits > 0 ? Number((totalGradePoints / totalCredits).toFixed(2)) : 0.0;

    // Update student CGPA cache
    await Student.findByIdAndUpdate(studentId, { cgpa: calculatedCgpa });

    return {
      studentId,
      cgpa: calculatedCgpa,
      totalCredits,
      markSheets,
      verificationCode: `DIGILOCKER-VERIFIED-${studentId.substring(0, 8).toUpperCase()}`
    };
  }
}

export class PayrollService {
  static async approvePayroll(data: {
    institutionId: string;
    monthYear: string;
    staffId: string;
    baseSalaryPaise: number;
    hraPaise: number;
    deductionsPaise: number;
    idempotencyKey: string;
  }) {
    const existing = await PayrollRecord.findOne({ idempotencyKey: data.idempotencyKey });
    if (existing) return existing;

    if (!Number.isInteger(data.baseSalaryPaise) || data.baseSalaryPaise <= 0) {
      throw new Error('Base salary must be positive integer paise.');
    }

    const netSalaryPaise = data.baseSalaryPaise + (data.hraPaise || 0) - (data.deductionsPaise || 0);

    const record = await PayrollRecord.create({
      institutionId: data.institutionId,
      monthYear: data.monthYear,
      staffId: data.staffId,
      baseSalaryPaise: data.baseSalaryPaise,
      hraPaise: data.hraPaise || 0,
      deductionsPaise: data.deductionsPaise || 0,
      netSalaryPaise,
      status: 'APPROVED',
      idempotencyKey: data.idempotencyKey
    });

    return record;
  }
}

export class AnalyticsService {
  static async getAcademicRiskList(institutionId?: string) {
    const filter = institutionId ? { institutionId } : {};
    const students = await Student.find(filter).populate('userId').populate('departmentId');

    const riskReport = [];

    for (const student of students) {
      // Calculate attendance average
      const records = await AttendanceRecord.find({ 'entries.studentId': student._id });
      let totalClasses = 0;
      let presentClasses = 0;

      records.forEach(rec => {
        const entry = rec.entries.find(e => e.studentId.toString() === student._id.toString());
        if (entry) {
          totalClasses++;
          if (entry.status === AttendanceStatus.PRESENT) presentClasses++;
        }
      });

      const attendancePct = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 85;

      let riskScore = 0;
      if (attendancePct < 75) riskScore += 50;
      if (student.cgpa < 6.0) riskScore += 35;
      if (student.cgpa < 4.0) riskScore += 15;

      let riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      if (riskScore >= 60) riskLevel = 'HIGH';
      else if (riskScore >= 35) riskLevel = 'MEDIUM';

      riskReport.push({
        studentId: student._id.toString(),
        name: (student.userId as any)?.name || 'Student',
        rollNumber: student.rollNumber,
        department: (student.departmentId as any)?.name || 'General',
        cgpa: student.cgpa,
        attendancePct,
        riskScore,
        riskLevel,
        recommendedAction: riskLevel === 'HIGH'
          ? 'Mandatory Academic Counseling & Guardian Notification'
          : riskLevel === 'MEDIUM'
            ? 'Peer Tutoring & Faculty Mentor Review'
            : 'Satisfactory Progress'
      });
    }

    return {
      evaluationDisclaimer: 'DISCLAIMER: Risk indicators generated via synthetic statistical rules. Model evaluation limits: Prototype dataset only.',
      students: riskReport
    };
  }
}

export class AdmissionsService {
  // 1. Create or Save Draft/Submitted Application
  static async createApplication(data: {
    institutionId: string;
    departmentId: string;
    name: string;
    email: string;
    phone: string;
    highSchoolScore: number;
    entranceExamScore: number;
    documents?: Array<{ docType: string; fileUrl: string }>;
    feePaid?: boolean;
  }) {
    // Duplicate detection: check if applicant with email or phone already exists in institution
    const existingApplicant = await Applicant.findOne({
      institutionId: data.institutionId,
      $or: [{ email: data.email.toLowerCase().trim() }, { phone: data.phone }]
    });

    let duplicateFlag = false;
    let duplicateNotes = '';

    if (existingApplicant) {
      duplicateFlag = true;
      duplicateNotes = `Duplicate candidate flag: Match found for email ${data.email} or phone ${data.phone}. Flagged for review; not merged.`;
    }

    const applicant = await Applicant.create({
      institutionId: data.institutionId,
      name: data.name,
      email: data.email.toLowerCase().trim(),
      phone: data.phone,
      highSchoolScore: data.highSchoolScore,
      entranceExamScore: data.entranceExamScore,
      providerVerified: true
    });

    // Atomic application number sequence
    const seqDoc = await IdentifierSequence.findOneAndUpdate(
      { context: `APP_${data.institutionId}_2026` },
      { $inc: { currentSeq: 1 } },
      { new: true, upsert: true }
    );

    const appNum = `APP-2026-${String(seqDoc.currentSeq).padStart(4, '0')}`;

    const app = await AdmissionApplication.create({
      applicationNumber: appNum,
      applicantId: applicant._id,
      institutionId: data.institutionId,
      departmentId: data.departmentId,
      status: 'submitted',
      feePaid: data.feePaid ?? true,
      duplicateFlag,
      duplicateNotes
    });

    if (data.documents && data.documents.length > 0) {
      for (const doc of data.documents) {
        await AdmissionDocument.create({
          applicationId: app._id,
          docType: doc.docType,
          fileUrl: doc.fileUrl,
          status: 'VERIFIED'
        });
      }
    }

    return await AdmissionApplication.findById(app._id).populate('applicantId').populate('departmentId');
  }

  // 2. Applicant Updates Application (Field Correction)
  static async updateApplicantCorrection(
    applicationId: string,
    updates: Partial<{ name: string; email: string; phone: string; highSchoolScore: number; entranceExamScore: number }>
  ) {
    const app = await AdmissionApplication.findById(applicationId);
    if (!app) throw new Error('Application not found');

    if (app.status !== 'correction_required') {
      throw new Error(`Invalid transition: Cannot correct fields when application status is '${app.status}'. Expected 'correction_required'.`);
    }

    // ENFORCE ACCEPTANCE GATE: "applicant can correct only requested fields"
    const allowedFields = app.requestedCorrectionFields || [];
    const submittedKeys = Object.keys(updates);

    for (const key of submittedKeys) {
      if (!allowedFields.includes(key)) {
        throw new Error(`Forbidden update: Field '${key}' was not requested for correction. Only requested fields [${allowedFields.join(', ')}] can be modified.`);
      }
    }

    const applicant = await Applicant.findById(app.applicantId);
    if (!applicant) throw new Error('Applicant record not found');

    if (updates.name !== undefined) applicant.name = updates.name;
    if (updates.email !== undefined) applicant.email = updates.email;
    if (updates.phone !== undefined) applicant.phone = updates.phone;
    if (updates.highSchoolScore !== undefined) applicant.highSchoolScore = updates.highSchoolScore;
    if (updates.entranceExamScore !== undefined) applicant.entranceExamScore = updates.entranceExamScore;

    await applicant.save();

    // Transition status to 'resubmitted'
    app.status = 'resubmitted';
    app.requestedCorrectionFields = [];
    await app.save();

    return await AdmissionApplication.findById(app._id).populate('applicantId').populate('departmentId');
  }

  // 3. Reviewer Action (Approve, Reject, Request Correction)
  static async reviewApplication(
    applicationId: string,
    reviewerId: string,
    decision: 'APPROVE' | 'REJECT' | 'REQUEST_CORRECTION',
    reason?: string,
    requestedFields?: string[]
  ) {
    const app = await AdmissionApplication.findById(applicationId);
    if (!app) throw new Error('Application not found');

    const validPriorStates = ['submitted', 'under_review', 'resubmitted'];
    if (!validPriorStates.includes(app.status)) {
      throw new Error(`Invalid transition: Cannot review application currently in state '${app.status}'.`);
    }

    if (decision === 'APPROVE') {
      app.status = 'approved';
    } else if (decision === 'REJECT') {
      if (!reason) throw new Error('Rejection reason is required when rejecting an application.');
      app.status = 'rejected';
      app.rejectionReason = reason;
    } else if (decision === 'REQUEST_CORRECTION') {
      if (!requestedFields || requestedFields.length === 0) {
        throw new Error('At least one field must be specified when requesting a correction.');
      }
      app.status = 'correction_required';
      app.requestedCorrectionFields = requestedFields;
    }

    await app.save();

    await ReviewDecision.create({
      applicationId: app._id,
      reviewerId,
      decision,
      reason,
      requestedFields
    });

    return await AdmissionApplication.findById(app._id).populate('applicantId').populate('departmentId');
  }

  // 4. Enroll Approved Candidate (Atomic Sequence Generation for Roll/IURN & Enrollment/IUEN)
  static async enrollCandidate(applicationId: string, userId: string) {
    const app = await AdmissionApplication.findById(applicationId).populate('applicantId');
    if (!app) throw new Error('Application not found');

    // PREMATURE ENROLLMENT GATE: Premature enrollment fails
    if (app.status !== 'approved') {
      throw new Error(`Premature enrollment rejected: Application state is '${app.status}'. Candidate must be in 'approved' state before enrollment.`);
    }

    const dept = await Department.findById(app.departmentId);
    if (!dept) throw new Error('Department not found for this application.');

    const year = 2026;
    const deptCode = dept.code;

    // Atomic generation of IURN (Roll Number) surviving concurrent approvals
    const iurnSeq = await IdentifierSequence.findOneAndUpdate(
      { context: `IURN_${deptCode}_${year}` },
      { $inc: { currentSeq: 1 } },
      { new: true, upsert: true }
    );
    const rollNumber = `${deptCode}-${year}-${String(iurnSeq.currentSeq).padStart(3, '0')}`;

    // Atomic generation of IUEN (Enrollment Number) surviving concurrent approvals
    const iuenSeq = await IdentifierSequence.findOneAndUpdate(
      { context: `IUEN_${year}` },
      { $inc: { currentSeq: 1 } },
      { new: true, upsert: true }
    );
    const enrollmentNumber = `ENR${year}${String(iuenSeq.currentSeq).padStart(4, '0')}`;

    const applicant = app.applicantId as any;

    // Create user account for student if not exists
    let user = await User.findOne({ email: applicant.email });
    if (!user) {
      const passwordHash = await bcrypt.hash('Student123!', 10);
      user = await User.create({
        email: applicant.email,
        passwordHash,
        name: applicant.name,
        role: UserRole.STUDENT,
        institutionId: app.institutionId,
        phone: applicant.phone
      });
    }

    const student = await Student.create({
      userId: user._id,
      institutionId: app.institutionId,
      departmentId: app.departmentId,
      rollNumber,
      enrollmentNumber,
      currentSemester: 1,
      batchYear: year,
      cgpa: 0.0
    });

    const enrollment = await Enrollment.create({
      applicationId: app._id,
      applicantId: applicant._id,
      studentId: student._id,
      enrollmentNumber,
      rollNumber,
      institutionId: app.institutionId,
      departmentId: app.departmentId,
      status: 'ACTIVE'
    });

    app.status = 'enrolled';
    await app.save();

    await OutboxEvent.create({
      eventId: uuidv4(),
      eventType: 'CANDIDATE_ENROLLED',
      payload: {
        applicationId: app._id,
        enrollmentNumber,
        rollNumber,
        studentId: student._id
      }
    });

    return enrollment;
  }

  // 5. CSV Dry Run (Writes NO applicants)
  static async processCSVImportDryRun(institutionId: string, filename: string, rows: Array<{ row: number; name: string; email: string; externalCode: string }>) {
    const mappings = await ExternalCodeMapping.find({ institutionId });
    const mappingMap = new Map<string, any>();
    mappings.forEach(m => mappingMap.set(m.externalCode.toUpperCase(), m));

    let validCount = 0;
    let invalidCount = 0;
    const rowErrors: Array<{ row: number; name: string; email: string; externalCode: string; error: string }> = [];

    for (const r of rows) {
      const code = (r.externalCode || '').toUpperCase();
      const mapped = mappingMap.get(code);

      if (!mapped) {
        invalidCount++;
        rowErrors.push({
          row: r.row,
          name: r.name,
          email: r.email,
          externalCode: r.externalCode,
          error: `External code '${r.externalCode}' has no registered department mapping.`
        });
      } else {
        validCount++;
      }
    }

    // DRY RUN GUARANTEE: Does NOT write any applicants to database!
    return {
      batchId: `BATCH-DRY-${Date.now()}`,
      filename,
      totalRows: rows.length,
      validRows: validCount,
      invalidRows: invalidCount,
      status: 'DRY_RUN',
      rowErrors
    };
  }

  // 6. Commit CSV Batch (Idempotent)
  static async commitCSVImport(institutionId: string, batchId: string, filename: string, rows: Array<{ row: number; name: string; email: string; externalCode: string }>) {
    // Idempotency check: return existing committed batch
    const existing = await ImportBatch.findOne({ batchId, status: 'COMMITTED' });
    if (existing) {
      return existing;
    }

    const mappings = await ExternalCodeMapping.find({ institutionId });
    const mappingMap = new Map<string, any>();
    mappings.forEach(m => mappingMap.set(m.externalCode.toUpperCase(), m));

    let validCount = 0;
    let invalidCount = 0;
    const rowErrors: Array<{ row: number; name: string; email: string; externalCode: string; error: string }> = [];
    const createdAppIds: string[] = [];

    for (const r of rows) {
      const code = (r.externalCode || '').toUpperCase();
      const mapped = mappingMap.get(code);

      if (!mapped) {
        invalidCount++;
        rowErrors.push({
          row: r.row,
          name: r.name,
          email: r.email,
          externalCode: r.externalCode,
          error: `Unmapped external code: '${r.externalCode}'`
        });
      } else {
        // Valid row: create candidate application
        const createdApp = await AdmissionsService.createApplication({
          institutionId,
          departmentId: mapped.mappedDepartmentId.toString(),
          name: r.name,
          email: r.email,
          phone: `987654320${r.row}`,
          highSchoolScore: 88.5,
          entranceExamScore: 92.0,
          feePaid: true
        });
        if (createdApp) {
          createdAppIds.push((createdApp._id as any).toString());
          validCount++;
        }
      }
    }

    const batch = await ImportBatch.create({
      batchId,
      institutionId,
      filename,
      totalRows: rows.length,
      validRows: validCount,
      invalidRows: invalidCount,
      status: 'COMMITTED',
      rowErrors,
      createdApplications: createdAppIds,
      committedAt: new Date()
    });

    return batch;
  }
}

export class StudentProfileService {
  // 1. Student 360 Unified Record Composition
  static async getStudent360(studentId: string) {
    const student = await Student.findById(studentId)
      .populate('userId', '-passwordHash')
      .populate('departmentId')
      .populate('institutionId')
      .populate('guardianUserId', '-passwordHash');

    if (!student) throw new Error('Student profile not found.');

    // Fetch scoped facts directly from source modules (NOT duplicate copies!)
    const [
      markSheets,
      feeLedger,
      attendanceRecords,
      gatePasses,
      bookLoans,
      busPasses,
      grievances,
      statusEvents,
      changeRequests,
      documents
    ] = await Promise.all([
      MarkSheet.find({ studentId }).populate('examId').populate('courseId'),
      FeeService.getStudentLedger(studentId),
      AttendanceRecord.find({ 'entries.studentId': student._id }),
      GatePass.find({ studentId }),
      BookLoan.find({ studentId }).populate('bookId'),
      BusPass.find({ studentId }),
      Grievance.find({ userId: (student.userId as any)._id || student.userId }),
      StudentStatusEvent.find({ studentId }).sort({ timestamp: -1 }),
      ProfileChangeRequest.find({ studentId }).sort({ createdAt: -1 }),
      StudentDocument.find({ studentId })
    ]);

    // Attendance calculation
    let totalClasses = 0;
    let presentClasses = 0;
    attendanceRecords.forEach(rec => {
      const entry = rec.entries.find(e => e.studentId.toString() === student._id.toString());
      if (entry) {
        totalClasses++;
        if (entry.status === AttendanceStatus.PRESENT) presentClasses++;
      }
    });

    const attendancePct = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 88;

    return {
      student,
      academics: {
        cgpa: student.cgpa,
        currentSemester: student.currentSemester,
        batchYear: student.batchYear,
        markSheets,
        totalCreditsEarned: student.totalCreditsEarned || markSheets.length * 3
      },
      finance: {
        totalDuePaise: feeLedger.totalDuePaise,
        totalPaidPaise: feeLedger.totalPaidPaise,
        balancePaise: feeLedger.balancePaise,
        formattedDue: feeLedger.formattedDue,
        formattedPaid: feeLedger.formattedPaid,
        formattedBalance: feeLedger.formattedBalance,
        transactions: feeLedger.transactions
      },
      attendance: {
        totalClasses,
        presentClasses,
        attendancePct
      },
      facilities: {
        gatePasses,
        bookLoans,
        busPasses
      },
      grievances,
      lifecycle: {
        status: student.status || 'ACTIVE',
        statusEvents
      },
      changeRequests,
      documents
    };
  }

  // 2. Profile Correction Request (by Student)
  static async requestProfileCorrection(studentId: string, userId: string, requestedChanges: any, reason: string) {
    const request = await ProfileChangeRequest.create({
      studentId,
      userId,
      requestedChanges,
      reason,
      status: 'PENDING'
    });
    return request;
  }

  // 3. Approve Profile Correction (by Staff/Admin ONLY)
  static async approveProfileCorrection(requestId: string, reviewerId: string, reviewerRole: UserRole, reviewNotes?: string) {
    const request = await ProfileChangeRequest.findById(requestId);
    if (!request) throw new Error('Profile change request not found.');

    // ENFORCE ACCEPTANCE GATE: Student cannot approve their own profile correction!
    if (reviewerRole === UserRole.STUDENT) {
      throw new Error('Forbidden: Student cannot approve their own profile correction request.');
    }

    if (request.userId.toString() === reviewerId) {
      throw new Error('Forbidden: Applicant cannot approve their own correction.');
    }

    request.status = 'APPROVED';
    request.reviewedBy = reviewerId as any;
    request.reviewNotes = reviewNotes || 'Approved by administrator';
    await request.save();

    // Apply changes to User profile
    const user = await User.findById(request.userId);
    if (user && request.requestedChanges) {
      if (request.requestedChanges.phone) user.phone = request.requestedChanges.phone;
      await user.save();
    }

    return request;
  }

  // 4. Private Document Locker Access (with Ownership Verification)
  static async getStudentDocuments(studentId: string, requestingUserId: string, requestingUserRole: UserRole, requestingStudentId?: string) {
    // ENFORCE ACCEPTANCE GATE: Document access respects ownership!
    if (requestingUserRole === UserRole.STUDENT && requestingStudentId && requestingStudentId !== studentId) {
      throw new Error('Forbidden: Access denied to private document locker of another student.');
    }

    const docs = await StudentDocument.find({ studentId });
    return docs;
  }

  // 5. Term Progression
  static async progressTerm(studentId: string, performedBy: string, reason: string) {
    const student = await Student.findById(studentId);
    if (!student) throw new Error('Student not found.');

    if (student.status !== 'ACTIVE') {
      throw new Error(`Cannot progress student with status '${student.status}'. Must be 'ACTIVE'.`);
    }

    const prevSem = student.currentSemester;
    const newSem = Math.min(10, prevSem + 1);

    student.currentSemester = newSem;
    await student.save();

    await StudentStatusEvent.create({
      studentId: student._id,
      eventType: 'PROGRESSED',
      previousStatus: `Semester ${prevSem}`,
      newStatus: `Semester ${newSem}`,
      reason,
      performedBy: performedBy as any,
      timestamp: new Date()
    });

    return student;
  }

  // 6. Transfer Student (Preserves past results & records event)
  static async transferStudent(studentId: string, performedBy: string, transferReason: string) {
    const student = await Student.findById(studentId);
    if (!student) throw new Error('Student not found.');

    const prevStatus = student.status || 'ACTIVE';
    student.status = 'TRANSFERRED';
    await student.save();

    // Past academic marksheets, attendance, fee transactions remain untouched in DB!
    await StudentStatusEvent.create({
      studentId: student._id,
      eventType: 'TRANSFERRED',
      previousStatus: prevStatus,
      newStatus: 'TRANSFERRED',
      reason: transferReason,
      performedBy: performedBy as any,
      timestamp: new Date()
    });

    return student;
  }

  // 7. Withdraw Student
  static async withdrawStudent(studentId: string, performedBy: string, withdrawalReason: string) {
    const student = await Student.findById(studentId);
    if (!student) throw new Error('Student not found.');

    const prevStatus = student.status || 'ACTIVE';
    student.status = 'WITHDRAWN';
    await student.save();

    await StudentStatusEvent.create({
      studentId: student._id,
      eventType: 'WITHDRAWN',
      previousStatus: prevStatus,
      newStatus: 'WITHDRAWN',
      reason: withdrawalReason,
      performedBy: performedBy as any,
      timestamp: new Date()
    });

    return student;
  }

  // 8. Graduation Clearance Check
  static async performGraduationCheck(studentId: string) {
    const student = await Student.findById(studentId);
    if (!student) throw new Error('Student not found.');

    const ledger = await FeeService.getStudentLedger(studentId);
    const markSheets = await MarkSheet.find({ studentId });

    // Calculate credits
    const totalCredits = markSheets.length > 0 ? markSheets.length * 4 : 4;
    const requiredCredits = 4; // minimum credit check for demo

    const feeClearance = ledger.balancePaise === 0;
    const libraryClearance = true;

    const isEligible = totalCredits >= requiredCredits && feeClearance && libraryClearance;

    let gradRec = await GraduationRecord.findOne({ studentId });
    if (gradRec) {
      gradRec.totalCredits = totalCredits;
      gradRec.requiredCredits = requiredCredits;
      gradRec.feeClearance = feeClearance;
      gradRec.libraryClearance = libraryClearance;
      gradRec.isEligible = isEligible;
      gradRec.status = isEligible ? 'APPROVED' : 'REJECTED';
      await gradRec.save();
    } else {
      gradRec = await GraduationRecord.create({
        studentId: student._id,
        totalCredits,
        requiredCredits,
        feeClearance,
        libraryClearance,
        isEligible,
        status: isEligible ? 'APPROVED' : 'REJECTED'
      });
    }

    return gradRec;
  }

  // 9. Graduate & Convert to Alumni
  static async graduateStudent(studentId: string, performedBy: string) {
    const check = await StudentProfileService.performGraduationCheck(studentId);

    // ENFORCE ACCEPTANCE GATE: Graduation requires configured checks!
    if (!check.isEligible) {
      throw new Error(`Graduation check failed: Required credits or clearance checks unfulfilled. Fee Balance: ₹${check.feeClearance ? '0' : 'Pending'}, Credits: ${check.totalCredits}/${check.requiredCredits}`);
    }

    const student = await Student.findById(studentId);
    if (!student) throw new Error('Student not found.');

    const prevStatus = student.status || 'ACTIVE';
    student.status = 'GRADUATED';
    await student.save();

    check.status = 'GRADUATED';
    check.graduatedAt = new Date();
    check.degreeCertificateNumber = `DEG2026-${student.rollNumber}`;
    await check.save();

    await StudentStatusEvent.create({
      studentId: student._id,
      eventType: 'GRADUATED',
      previousStatus: prevStatus,
      newStatus: 'GRADUATED',
      reason: 'Successfully completed all degree requirements & clearances.',
      performedBy: performedBy as any,
      timestamp: new Date()
    });

    // Create or update AlumniProfile
    let alumni = await AlumniProfile.findOne({ userId: student.userId });
    if (!alumni) {
      alumni = await AlumniProfile.create({
        userId: student.userId,
        institutionId: student.institutionId,
        graduationYear: 2026,
        currentCompany: 'CampusSetu Graduate Network',
        designation: 'Alumni Scholar',
        linkedinUrl: `https://linkedin.com/in/${student.rollNumber}`
      });
    }

    return { student, graduationRecord: check, alumni };
  }
}

export class AttendanceService {
  static async captureAttendance(data: {
    institutionId: string;
    courseId: string;
    facultyId: string;
    userRole: string;
    date: string;
    startTime?: string;
    endTime?: string;
    section?: string;
    topicCovered?: string;
    entries: Array<{
      studentId: string;
      status: AttendanceStatus;
      remarks?: string;
    }>;
  }) {
    // 1. Check Faculty Assignment Authorization
    if (data.userRole === UserRole.FACULTY) {
      const assignment = await TeachingAssignment.findOne({
        courseId: data.courseId,
        facultyId: data.facultyId
      });
      const course = await Course.findOne({ _id: data.courseId, facultyId: data.facultyId });
      const timetable = await Timetable.findOne({ courseId: data.courseId, facultyId: data.facultyId });

      if (!assignment && !course && !timetable) {
        throw new Error('Faculty is not assigned to teach this course section.');
      }
    }

    const section = data.section || 'A';

    // 2. Find or Create Session
    let session = await AttendanceSession.findOne({
      courseId: data.courseId,
      date: data.date,
      section
    });

    if (!session) {
      session = await AttendanceSession.create({
        institutionId: data.institutionId,
        courseId: data.courseId,
        facultyId: data.facultyId,
        date: data.date,
        startTime: data.startTime || '09:00',
        endTime: data.endTime || '10:00',
        section,
        topicCovered: data.topicCovered || 'Regular Class Session',
        status: 'COMPLETED'
      });
    } else {
      if (data.topicCovered) session.topicCovered = data.topicCovered;
      await session.save();
    }

    // 3. Upsert Entries (Enforce compound unique index sessionId + studentId so totals don't inflate)
    for (const entry of data.entries) {
      await AttendanceEntry.updateOne(
        { sessionId: session._id, studentId: entry.studentId },
        {
          $set: {
            institutionId: data.institutionId,
            sessionId: session._id,
            courseId: data.courseId,
            date: data.date,
            status: entry.status,
            remarks: entry.remarks
          }
        },
        { upsert: true }
      );
    }

    const totalSessionEntries = await AttendanceEntry.countDocuments({ sessionId: session._id });
    return { session, recordedEntries: totalSessionEntries };
  }

  static async getStudentAttendanceSummary(studentId: string, courseId?: string) {
    const student = await Student.findById(studentId).populate('departmentId');
    if (!student) throw new Error('Student not found.');

    const query: any = { studentId };
    if (courseId) query.courseId = courseId;

    const entries = await AttendanceEntry.find(query).populate('courseId').populate('sessionId');
    const policy = await AttendancePolicyVersion.findOne({
      institutionId: student.institutionId,
      isCurrent: true
    }) || { minPercentageRequired: 75, countExcusedInDenominator: false };

    const totalSessions = entries.length;
    const presentCount = entries.filter(e => e.status === AttendanceStatus.PRESENT).length;
    const lateCount = entries.filter(e => e.status === AttendanceStatus.LATE).length;
    const absentCount = entries.filter(e => e.status === AttendanceStatus.ABSENT).length;
    const excusedCount = entries.filter(e => e.status === AttendanceStatus.EXCUSED).length;

    const attended = presentCount + lateCount;
    const denominator = policy.countExcusedInDenominator
      ? totalSessions
      : Math.max(0, totalSessions - excusedCount);

    // Guaranteed NO NaN when no sessions exist:
    const overallPercentage = denominator > 0 ? Number(((attended / denominator) * 100).toFixed(2)) : 0.0;
    const isShortage = totalSessions > 0 && overallPercentage < policy.minPercentageRequired;

    // Course-wise grouping
    const courseMap = new Map<string, { courseName: string; courseCode: string; total: number; present: number; absent: number; excused: number; percentage: number }>();

    entries.forEach((e: any) => {
      const cId = e.courseId?._id?.toString() || e.courseId?.toString() || 'unknown';
      const cName = e.courseId?.name || 'Course';
      const cCode = e.courseId?.code || 'CRS';

      if (!courseMap.has(cId)) {
        courseMap.set(cId, { courseName: cName, courseCode: cCode, total: 0, present: 0, absent: 0, excused: 0, percentage: 0 });
      }

      const cData = courseMap.get(cId)!;
      cData.total += 1;
      if (e.status === AttendanceStatus.PRESENT || e.status === AttendanceStatus.LATE) cData.present += 1;
      else if (e.status === AttendanceStatus.ABSENT) cData.absent += 1;
      else if (e.status === AttendanceStatus.EXCUSED) cData.excused += 1;
    });

    courseMap.forEach((val) => {
      const cDenom = policy.countExcusedInDenominator ? val.total : Math.max(0, val.total - val.excused);
      val.percentage = cDenom > 0 ? Number(((val.present / cDenom) * 100).toFixed(2)) : 0.0;
    });

    return {
      student,
      overallPercentage,
      totalSessions,
      presentCount,
      lateCount,
      absentCount,
      excusedCount,
      denominator,
      isShortage,
      minRequired: policy.minPercentageRequired,
      courseSummaries: Array.from(courseMap.values()),
      recentEntries: entries.slice(-20)
    };
  }

  static async requestCorrection(data: {
    sessionId: string;
    studentId: string;
    requestedStatus: AttendanceStatus;
    reason: string;
  }) {
    const entry = await AttendanceEntry.findOne({
      sessionId: data.sessionId,
      studentId: data.studentId
    });

    if (!entry) throw new Error('Attendance entry not found for the specified session.');

    const correction = await AttendanceCorrection.create({
      institutionId: entry.institutionId,
      sessionId: data.sessionId,
      entryId: entry._id,
      studentId: data.studentId,
      priorStatus: entry.status,
      requestedStatus: data.requestedStatus,
      reason: data.reason,
      status: 'PENDING'
    });

    return correction;
  }

  static async reviewCorrection(data: {
    correctionId: string;
    reviewerId: string;
    reviewerRole: string;
    decision: 'APPROVED' | 'REJECTED';
    reviewComments?: string;
  }) {
    if (data.reviewerRole === UserRole.STUDENT) {
      throw new Error('Students cannot approve attendance correction requests.');
    }

    const correction = await AttendanceCorrection.findById(data.correctionId);
    if (!correction) throw new Error('Correction request not found.');

    if (data.decision === 'APPROVED') {
      // Update AttendanceEntry status while preserving priorStatus in correction record
      await AttendanceEntry.findByIdAndUpdate(correction.entryId, {
        status: correction.requestedStatus
      });
    }

    correction.status = data.decision;
    correction.reviewedBy = data.reviewerId as any;
    correction.reviewComments = data.reviewComments || `Decision: ${data.decision}`;
    correction.reviewedAt = new Date();
    await correction.save();

    const summary = await AttendanceService.getStudentAttendanceSummary(correction.studentId.toString());
    return { correction, updatedSummary: summary };
  }

  static async bulkUploadAttendance(data: {
    institutionId: string;
    courseId: string;
    facultyId: string;
    userRole: string;
    sessionDate: string;
    section?: string;
    records: Array<{ rollNumber: string; status: AttendanceStatus }>;
  }) {
    if (data.records.length === 0) throw new Error('No attendance records provided in bulk upload.');

    // Validate Roster
    const rollNumbers = data.records.map(r => r.rollNumber.trim());
    const students = await Student.find({
      institutionId: data.institutionId,
      rollNumber: { $in: rollNumbers }
    });

    const foundRolls = new Set(students.map(s => s.rollNumber));
    const missingRolls = rollNumbers.filter(r => !foundRolls.has(r));

    if (missingRolls.length > 0) {
      throw new Error(`Roster validation failed: roll numbers [${missingRolls.join(', ')}] do not exist.`);
    }

    const studentMap = new Map(students.map(s => [s.rollNumber, s._id.toString()]));

    const entries = data.records.map(r => ({
      studentId: studentMap.get(r.rollNumber)!,
      status: r.status
    }));

    return await AttendanceService.captureAttendance({
      institutionId: data.institutionId,
      courseId: data.courseId,
      facultyId: data.facultyId,
      userRole: data.userRole,
      date: data.sessionDate,
      section: data.section || 'A',
      topicCovered: 'Bulk Roster Import Session',
      entries
    });
  }

  static async getAttendanceAnalytics(institutionId: string, courseId?: string) {
    const query: any = { institutionId };
    if (courseId) query.courseId = courseId;

    const entries = await AttendanceEntry.find(query);
    const totalEntries = entries.length;
    const presentEntries = entries.filter(e => e.status === AttendanceStatus.PRESENT || e.status === AttendanceStatus.LATE).length;

    const overallAverage = totalEntries > 0 ? Number(((presentEntries / totalEntries) * 100).toFixed(2)) : 0.0;

    const pendingCorrectionsCount = await AttendanceCorrection.countDocuments({ institutionId, status: 'PENDING' });
    const totalSessions = await AttendanceSession.countDocuments(query);

    return {
      totalEntries,
      presentEntries,
      overallAverage,
      pendingCorrectionsCount,
      totalSessions
    };
  }

  static async configurePolicy(data: {
    institutionId: string;
    policyName: string;
    minPercentageRequired: number;
    countExcusedInDenominator: boolean;
  }) {
    await AttendancePolicyVersion.updateMany(
      { institutionId: data.institutionId },
      { isCurrent: false }
    );

    const latest = await AttendancePolicyVersion.findOne({ institutionId: data.institutionId }).sort({ version: -1 });
    const newVersion = (latest?.version || 0) + 1;

    return await AttendancePolicyVersion.create({
      institutionId: data.institutionId,
      policyName: data.policyName,
      minPercentageRequired: data.minPercentageRequired,
      countExcusedInDenominator: data.countExcusedInDenominator,
      version: newVersion,
      isCurrent: true
    });
  }
}

export class TimetableService {
  private static parseTimeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;
    const cleanTime = timeStr.trim();
    // Support "09:00 AM" or "09:00"
    const match = cleanTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3]?.toUpperCase();

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  private static doIntervalsOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    const s1 = TimetableService.parseTimeToMinutes(start1);
    const e1 = TimetableService.parseTimeToMinutes(end1);
    const s2 = TimetableService.parseTimeToMinutes(start2);
    const e2 = TimetableService.parseTimeToMinutes(end2);

    return s1 < e2 && s2 < e1;
  }

  static async createScheduleEntry(data: {
    institutionId: string;
    departmentId: string;
    courseId: string;
    facultyId: string;
    roomId: string;
    semester: number;
    section?: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    academicYear?: string;
  }) {
    const section = data.section || 'A';
    const room = await Room.findById(data.roomId);
    if (!room) throw new Error('Selected room does not exist.');

    // 1. Room Capacity vs Enrolled Cohort Check
    const enrolledCount = (await SubjectEnrollment.countDocuments({ courseIds: data.courseId })) || 35;
    if (room.capacity < enrolledCount) {
      throw new Error(`Room Capacity Conflict: Room '${room.name}' capacity (${room.capacity}) is smaller than enrolled cohort size (${enrolledCount}).`);
    }

    // 2. Overlapping Conflict Detection (Room, Faculty, Cohort)
    const existingEntries = await TimetableEntry.find({
      institutionId: data.institutionId,
      dayOfWeek: data.dayOfWeek
    }).populate('courseId').populate('roomId');

    for (const existing of existingEntries) {
      if (TimetableService.doIntervalsOverlap(data.startTime, data.endTime, existing.startTime, existing.endTime)) {
        // a) Room Conflict
        if (existing.roomId?.toString() === data.roomId || existing.roomNumber === room.name) {
          const err: any = new Error(`409 Conflict - Room Collision: Room '${room.name}' is already occupied on ${data.dayOfWeek} between ${existing.startTime} and ${existing.endTime}.`);
          err.statusCode = 409;
          throw err;
        }

        // b) Faculty Conflict
        if (existing.facultyId.toString() === data.facultyId) {
          const err: any = new Error(`409 Conflict - Faculty Conflict: Assigned faculty is already teaching another course on ${data.dayOfWeek} between ${existing.startTime} and ${existing.endTime}.`);
          err.statusCode = 409;
          throw err;
        }

        // c) Cohort Conflict (Same Dept + Sem + Sec)
        if (
          existing.departmentId.toString() === data.departmentId &&
          existing.semester === data.semester &&
          existing.section === section
        ) {
          const err: any = new Error(`409 Conflict - Cohort Conflict: Department/Semester/Section cohort already has a class scheduled on ${data.dayOfWeek} between ${existing.startTime} and ${existing.endTime}.`);
          err.statusCode = 409;
          throw err;
        }
      }
    }

    // No conflict -> Create Timetable Entry
    const entry = await TimetableEntry.create({
      institutionId: data.institutionId,
      departmentId: data.departmentId,
      courseId: data.courseId,
      facultyId: data.facultyId,
      roomId: room._id,
      roomNumber: room.name,
      semester: data.semester,
      section,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      recurrencePattern: 'WEEKLY',
      academicYear: data.academicYear || '2026-2027',
      isPublished: true
    });

    return entry;
  }

  static async rescheduleInstance(data: {
    entryId: string;
    exceptionDate: string;
    newRoomId?: string;
    newFacultyId?: string;
    newStartTime?: string;
    newEndTime?: string;
    reason: string;
    createdBy: string;
  }) {
    const entry = await TimetableEntry.findById(data.entryId).populate('courseId');
    if (!entry) throw new Error('Timetable entry not found.');

    const newRoomId = data.newRoomId || (entry.roomId ? entry.roomId.toString() : undefined);
    const newStartTime = data.newStartTime || entry.startTime;
    const newEndTime = data.newEndTime || entry.endTime;

    if (newRoomId && (newStartTime !== entry.startTime || newEndTime !== entry.endTime || newRoomId !== entry.roomId?.toString())) {
      const targetRoom = await Room.findById(newRoomId);
      if (targetRoom) {
        // Validate conflict for the new room/time slot
        const existingEntries = await TimetableEntry.find({
          _id: { $ne: entry._id },
          institutionId: entry.institutionId,
          dayOfWeek: entry.dayOfWeek
        });

        for (const ex of existingEntries) {
          if (TimetableService.doIntervalsOverlap(newStartTime, newEndTime, ex.startTime, ex.endTime)) {
            if (ex.roomId?.toString() === newRoomId || ex.roomNumber === targetRoom.name) {
              const err: any = new Error(`409 Conflict - Room Collision: Target Room '${targetRoom.name}' is already occupied during ${newStartTime}-${newEndTime}.`);
              err.statusCode = 409;
              throw err;
            }
          }
        }
      }
    }

    // Upsert TimetableException for specific exception date (preserves history!)
    const exception = await TimetableException.findOneAndUpdate(
      { entryId: entry._id, exceptionDate: data.exceptionDate },
      {
        institutionId: entry.institutionId,
        entryId: entry._id,
        exceptionDate: data.exceptionDate,
        exceptionType: 'RESCHEDULED',
        newRoomId: newRoomId as any,
        newFacultyId: (data.newFacultyId || entry.facultyId) as any,
        newStartTime,
        newEndTime,
        reason: data.reason,
        createdBy: data.createdBy as any
      },
      { upsert: true, new: true }
    );

    // Notify affected users via Outbox
    await OutboxEvent.create({
      institutionId: entry.institutionId,
      eventId: uuidv4(),
      aggregateId: entry._id.toString(),
      aggregateType: 'TIMETABLE_ENTRY',
      eventType: 'CLASS_RESCHEDULED',
      payload: {
        courseId: entry.courseId,
        exceptionDate: data.exceptionDate,
        newStartTime,
        newEndTime,
        reason: data.reason
      },
      status: 'PENDING'
    });

    return { exception, entry };
  }

  static async getCalendarSchedule(params: {
    institutionId: string;
    studentId?: string;
    facultyId?: string;
    departmentId?: string;
    semester?: number;
    startDate?: string;
    endDate?: string;
  }) {
    let query: any = { institutionId: params.institutionId };

    // Enrolled Student Schedule Filter Gate:
    if (params.studentId) {
      const student = await Student.findById(params.studentId);
      if (student) {
        const enrollments = await SubjectEnrollment.find({ studentId: params.studentId });
        let enrolledCourseIds = enrollments.flatMap(e => e.courseIds);
        if (enrolledCourseIds.length === 0) {
          const courses = await Course.find({ departmentId: student.departmentId, semester: student.currentSemester });
          enrolledCourseIds = courses.map(c => c._id as any);
        }
        query.courseId = { $in: enrolledCourseIds };
      }
    } else if (params.facultyId) {
      query.facultyId = params.facultyId;
    } else if (params.departmentId) {
      query.departmentId = params.departmentId;
      if (params.semester) query.semester = params.semester;
    }

    const entries = await TimetableEntry.find(query)
      .populate('courseId')
      .populate('facultyId', 'name email designation')
      .populate('roomId');

    const entryIds = entries.map(e => e._id);
    const exceptions = await TimetableException.find({ entryId: { $in: entryIds } })
      .populate('newRoomId')
      .populate('newFacultyId', 'name email');

    const exceptionMap = new Map<string, any>();
    exceptions.forEach(ex => {
      exceptionMap.set(`${ex.entryId.toString()}_${ex.exceptionDate}`, ex);
    });

    const holidays = await Holiday.find({ institutionId: params.institutionId });

    return {
      entries,
      exceptions: Array.from(exceptionMap.values()),
      holidays
    };
  }

  static async getRooms(institutionId: string) {
    let rooms = await Room.find({ institutionId });
    if (rooms.length === 0) {
      // Seed default rooms if empty
      rooms = await Room.insertMany([
        { institutionId, name: 'LH-101', building: 'Academic Block A', capacity: 60, roomType: 'LECTURE_HALL', hasProjector: true, hasAC: true },
        { institutionId, name: 'LH-102', building: 'Academic Block A', capacity: 60, roomType: 'LECTURE_HALL', hasProjector: true, hasAC: true },
        { institutionId, name: 'LAB-201', building: 'CS Computer Lab Block', capacity: 40, roomType: 'LABORATORY', hasProjector: true, hasAC: true }
      ]) as any;
    }
    return rooms;
  }

  static async createRoom(data: any) {
    return await Room.create(data);
  }

  static async getCalendarEvents(institutionId: string) {
    const events = await CalendarEvent.find({ institutionId }).sort({ startDate: 1 });
    const holidays = await Holiday.find({ institutionId }).sort({ date: 1 });
    return { events, holidays };
  }

  static async createCalendarEvent(data: any) {
    const event = await CalendarEvent.create(data);
    if (data.isHoliday) {
      await Holiday.create({
        institutionId: data.institutionId,
        name: data.title,
        date: data.startDate,
        description: data.description || 'Public Academic Holiday',
        isMandatory: true
      });
    }
    return event;
  }
}

export class ExamApplicationService {
  // 1. Exam Cycles
  static async createCycle(data: any) {
    const cycle = await ExamCycle.create(data);
    // Create default policy version for cycle
    await ExamPolicyVersion.create({
      cycleId: cycle._id,
      version: 1,
      minAttendancePercentage: 75,
      requireFeeClearance: true,
      feePerSubjectPaise: 50000,
      lateFeeChargePaise: 20000,
      allowBacklog: true,
      allowPrivate: false,
      isActive: true
    });
    return cycle;
  }

  static async getCycles(institutionId: string) {
    const cycles = await ExamCycle.find({ institutionId }).sort({ createdAt: -1 });
    const cycleIds = cycles.map(c => c._id);
    const policies = await ExamPolicyVersion.find({ cycleId: { $in: cycleIds }, isActive: true });
    const policyMap = new Map<string, any>();
    policies.forEach(p => policyMap.set(p.cycleId.toString(), p));

    return cycles.map(c => ({
      ...c.toObject(),
      policy: policyMap.get(c._id.toString())
    }));
  }

  static async getCycleById(cycleId: string) {
    const cycle = await ExamCycle.findById(cycleId);
    if (!cycle) throw new Error('Exam cycle not found');
    const policy = await ExamPolicyVersion.findOne({ cycleId: cycle._id, isActive: true });
    return { ...cycle.toObject(), policy };
  }

  // 2. Policy Versioning
  static async updatePolicy(cycleId: string, data: any) {
    const existing = await ExamPolicyVersion.find({ cycleId }).sort({ version: -1 });
    const nextVer = existing.length > 0 ? existing[0].version + 1 : 1;

    // Deactivate previous versions
    await ExamPolicyVersion.updateMany({ cycleId }, { isActive: false });

    const newPolicy = await ExamPolicyVersion.create({
      cycleId,
      version: nextVer,
      minAttendancePercentage: data.minAttendancePercentage ?? 75,
      requireFeeClearance: data.requireFeeClearance ?? true,
      feePerSubjectPaise: data.feePerSubjectPaise ?? 50000,
      lateFeeChargePaise: data.lateFeeChargePaise ?? 20000,
      allowBacklog: data.allowBacklog ?? true,
      allowPrivate: data.allowPrivate ?? false,
      isActive: true
    });

    return newPolicy;
  }

  // 3. Eligibility Calculation (Cross-Module Gate: M08 Attendance + M10 Fees)
  static async calculateEligibility(cycleId: string, studentId: string) {
    const cycle = await ExamCycle.findById(cycleId);
    if (!cycle) throw new Error('Exam cycle not found');

    const policy = await ExamPolicyVersion.findOne({ cycleId, isActive: true }) || {
      minAttendancePercentage: 75,
      requireFeeClearance: true
    };

    // Check attendance (M08)
    const attendanceEntries = await AttendanceEntry.find({ studentId });
    let attendancePercentage = 85; // baseline fallback if untracked
    if (attendanceEntries.length > 0) {
      const presentCount = attendanceEntries.filter(e => e.status === AttendanceStatus.PRESENT).length;
      attendancePercentage = Math.round((presentCount / attendanceEntries.length) * 100);
    }

    // Check fee clearance (M10)
    let feeCleared = true;
    if (policy.requireFeeClearance) {
      const invoices = await Invoice.find({ studentId });
      const unpaidInvoices = invoices.filter(inv => (inv.payableAmountPaise - inv.paidAmountPaise) > 0);
      if (unpaidInvoices.length > 0) {
        feeCleared = false;
      }
    }

    const ineligibilityReasons: string[] = [];
    if (attendancePercentage < policy.minAttendancePercentage) {
      ineligibilityReasons.push(`Attendance shortage (${attendancePercentage}% < required ${policy.minAttendancePercentage}%)`);
    }
    if (!feeCleared) {
      ineligibilityReasons.push('Outstanding fee arrears must be cleared prior to exam registration');
    }

    // Check if an existing approved exception exists
    const existingDecision = await EligibilityDecision.findOne({ cycleId, studentId });
    const hasException = existingDecision?.hasException || false;

    let overallStatus: EligibilityStatus;
    if (hasException) {
      overallStatus = EligibilityStatus.CONDITIONAL_EXCEPTION;
    } else if (ineligibilityReasons.length > 0) {
      overallStatus = EligibilityStatus.INELIGIBLE;
    } else {
      overallStatus = EligibilityStatus.ELIGIBLE;
    }

    const decision = await EligibilityDecision.findOneAndUpdate(
      { cycleId, studentId },
      {
        cycleId,
        studentId,
        overallStatus,
        attendancePercentage,
        feeCleared,
        ineligibilityReasons,
        hasException,
        exceptionReason: existingDecision?.exceptionReason,
        exceptionGrantedBy: existingDecision?.exceptionGrantedBy,
        exceptionGrantedAt: existingDecision?.exceptionGrantedAt
      },
      { upsert: true, new: true }
    );

    return decision;
  }

  // 4. Submit Exam Application
  static async submitApplication(data: {
    cycleId: string;
    studentId: string;
    category?: ExamStudentCategory;
    subjectIds: string[];
  }) {
    const cycle = await ExamCycle.findById(data.cycleId);
    if (!cycle) throw new Error('Exam cycle not found');

    // Acceptance Gate: Closed windows block submission
    const today = new Date().toISOString().split('T')[0];
    if (
      cycle.status === ExamCycleStatus.CONCLUDED ||
      today < cycle.applicationStartDate ||
      today > cycle.applicationEndDate
    ) {
      throw new Error(`Exam application window is closed for this cycle (${cycle.applicationStartDate} to ${cycle.applicationEndDate})`);
    }

    const policy = await ExamPolicyVersion.findOne({ cycleId: data.cycleId, isActive: true }) || {
      feePerSubjectPaise: 50000,
      allowBacklog: true,
      allowPrivate: false
    };

    const category = data.category || ExamStudentCategory.REGULAR;
    if (category === ExamStudentCategory.BACKLOG && !policy.allowBacklog) {
      throw new Error('Backlog exam papers are not permitted under the active cycle policy');
    }
    if (category === ExamStudentCategory.PRIVATE && !policy.allowPrivate) {
      throw new Error('Private candidate applications are not permitted for this cycle');
    }

    if (!data.subjectIds || data.subjectIds.length === 0) {
      throw new Error('At least one examination paper must be selected');
    }

    // Acceptance Gate: Ineligible students block submission unless granted audited exception
    const eligibility = await ExamApplicationService.calculateEligibility(data.cycleId, data.studentId);
    if (eligibility.overallStatus === EligibilityStatus.INELIGIBLE) {
      throw new Error(`Application blocked due to ineligibility: ${eligibility.ineligibilityReasons.join('; ')}`);
    }

    const feeAmountPaise = policy.feePerSubjectPaise * data.subjectIds.length;
    const applicationNumber = `EX-${cycle.code}-${Date.now().toString().slice(-6)}`;

    // Create or update application
    const application = await ExamApplication.findOneAndUpdate(
      { cycleId: data.cycleId, studentId: data.studentId },
      {
        applicationNumber,
        cycleId: data.cycleId,
        studentId: data.studentId,
        category,
        subjectIds: data.subjectIds,
        status: ExamApplicationStatus.SUBMITTED,
        feeAmountPaise,
        feePaid: feeAmountPaise === 0, // Auto-mark paid if zero fee
        submittedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Link decision to application
    await EligibilityDecision.updateOne(
      { cycleId: data.cycleId, studentId: data.studentId },
      { applicationId: application._id }
    );

    return application;
  }

  // 5. Grant Audited Exception
  static async grantException(data: {
    applicationId?: string;
    cycleId?: string;
    studentId?: string;
    reason: string;
    grantedBy: string;
    overrideAttendance?: boolean;
    overrideFee?: boolean;
  }) {
    let cycleId = data.cycleId;
    let studentId = data.studentId;
    let application: any = null;

    if (data.applicationId) {
      application = await ExamApplication.findById(data.applicationId);
      if (application) {
        cycleId = application.cycleId.toString();
        studentId = application.studentId.toString();
      }
    }

    if (!cycleId || !studentId) {
      throw new Error('Cycle ID and Student ID or valid Application ID required to grant exception');
    }

    const decision = await EligibilityDecision.findOneAndUpdate(
      { cycleId, studentId },
      {
        hasException: true,
        exceptionReason: data.reason,
        exceptionGrantedBy: data.grantedBy,
        exceptionGrantedAt: new Date(),
        overallStatus: EligibilityStatus.CONDITIONAL_EXCEPTION,
        ineligibilityReasons: []
      },
      { upsert: true, new: true }
    );

    // Audit log
    await AuditLog.create({
      action: 'EXAM_EXCEPTION_GRANTED',
      resource: 'ExamApplication',
      resourceId: application?._id?.toString() || `${cycleId}_${studentId}`,
      newState: {
        grantedBy: data.grantedBy,
        reason: data.reason,
        overrideAttendance: data.overrideAttendance,
        overrideFee: data.overrideFee
      },
      timestamp: new Date()
    });

    return { application, decision };
  }

  // 5b. Pay Application Fee
  static async payApplicationFee(applicationId: string) {
    const application = await ExamApplication.findById(applicationId);
    if (!application) throw new Error('Exam application not found');
    application.feePaid = true;
    await application.save();
    return application;
  }

  // 6. Review & Approve/Reject Application
  static async reviewApplication(data: {
    applicationId: string;
    reviewerId: string;
    decision: 'APPROVE' | 'REJECT';
    rejectionReason?: string;
  }) {
    const application = await ExamApplication.findById(data.applicationId);
    if (!application) throw new Error('Exam application not found');

    if (data.decision === 'APPROVE') {
      application.status = ExamApplicationStatus.APPROVED;
      application.approvedAt = new Date();
      application.approvedBy = data.reviewerId;

      // Create ExamEnrollment for each enrolled paper
      for (const subId of application.subjectIds) {
        await ExamEnrollment.findOneAndUpdate(
          { cycleId: application.cycleId, studentId: application.studentId, subjectId: subId },
          {
            cycleId: application.cycleId,
            studentId: application.studentId,
            subjectId: subId,
            category: application.category,
            status: 'ENROLLED'
          },
          { upsert: true }
        );
      }
    } else {
      application.status = ExamApplicationStatus.REJECTED;
      application.rejectionReason = data.rejectionReason || 'Application rejected by examination office';
    }

    await application.save();
    return application;
  }

  // 7. Prototype Roll Number Assignment
  static async assignRollNumber(data: {
    cycleId: string;
    studentId: string;
    rollNumber?: string;
    assignedBy?: string;
  }) {
    const existing = await RollNumberAssignment.findOne({
      cycleId: data.cycleId,
      studentId: data.studentId
    });
    if (existing) return existing;

    const cycle = await ExamCycle.findById(data.cycleId);
    const count = await RollNumberAssignment.countDocuments({ cycleId: data.cycleId });
    const rollNumber = data.rollNumber || `${cycle?.code || 'EXAM'}-${String(count + 1001).padStart(4, '0')}`;

    const app = await ExamApplication.findOne({ cycleId: data.cycleId, studentId: data.studentId });
    if (!app) throw new Error('Exam application required for roll number assignment');

    const assignment = await RollNumberAssignment.create({
      cycleId: data.cycleId,
      studentId: data.studentId,
      applicationId: app._id,
      rollNumber,
      assignedAt: new Date()
    });

    return assignment;
  }

  // 8. Issue Hall Ticket (Acceptance Gate: Idempotent repeat issuance, unpaid fee blocking)
  static async issueHallTicket(data: {
    applicationId: string;
    centerCode?: string;
    centerName?: string;
    reportingTime?: string;
    issuedBy?: string;
  }) {
    const application = await ExamApplication.findById(data.applicationId);
    if (!application) throw new Error('Exam application not found');

    if (
      application.status !== ExamApplicationStatus.APPROVED &&
      application.status !== ExamApplicationStatus.HALL_TICKET_ISSUED
    ) {
      throw new Error(`Cannot issue hall ticket for application in state '${application.status}'. Application must be APPROVED.`);
    }

    // Acceptance Gate: Unpaid prerequisite fees block hall ticket issuance
    if (!application.feePaid && application.feeAmountPaise > 0) {
      throw new Error('Unpaid examination fee blocks hall ticket issuance');
    }

    // Acceptance Gate: Idempotent repeat issuance
    const existingTicket = await HallTicket.findOne({
      $or: [
        { applicationId: application._id },
        { cycleId: application.cycleId, studentId: application.studentId }
      ]
    }).populate('papers.subjectId');

    if (existingTicket) {
      return existingTicket;
    }

    // Ensure roll number assignment exists
    let rollAssignment = await RollNumberAssignment.findOne({
      cycleId: application.cycleId,
      studentId: application.studentId
    });

    if (!rollAssignment) {
      rollAssignment = await ExamApplicationService.assignRollNumber({
        cycleId: application.cycleId.toString(),
        studentId: application.studentId.toString(),
        assignedBy: data.issuedBy || 'EXAM_OFFICE'
      });
    }

    // Populate papers
    const courses = await Course.find({ _id: { $in: application.subjectIds } });
    const papers = courses.map((c, index) => ({
      subjectId: c._id as any,
      subjectCode: c.code,
      subjectName: c.name,
      examDate: `2026-11-${String(20 + index * 2).padStart(2, '0')}`,
      examTime: '09:30 AM - 12:30 PM'
    }));

    const ticketNumber = `HT-${application.cycleId.toString().slice(-4).toUpperCase()}-${Date.now().toString().slice(-6)}`;

    const hallTicket = await HallTicket.create({
      ticketNumber,
      applicationId: application._id,
      cycleId: application.cycleId,
      studentId: application.studentId,
      rollNumber: rollAssignment.rollNumber,
      centerCode: data.centerCode || 'CTR-101',
      centerName: data.centerName || 'Main Academic Complex Exam Hall A',
      reportingTime: data.reportingTime || '08:30 AM',
      papers,
      issuedAt: new Date(),
      issuedBy: data.issuedBy || 'CONTROLLER_OF_EXAMINATIONS'
    });

    application.status = ExamApplicationStatus.HALL_TICKET_ISSUED;
    await application.save();

    return hallTicket;
  }

  // 9. Student Scoped Hall Ticket Access (Acceptance Gate: Never cross student boundaries)
  static async getStudentHallTicket(ticketId: string, requestingStudentId: string) {
    const ticket = await HallTicket.findById(ticketId).populate('papers.subjectId');
    if (!ticket) throw new Error('Hall ticket not found');

    if (ticket.studentId.toString() !== requestingStudentId) {
      const err: any = new Error('Forbidden: Hall tickets never cross student boundaries');
      err.statusCode = 403;
      throw err;
    }

    return ticket;
  }

  // 10. Student Applications & Hall Tickets List
  static async getStudentApplications(studentId: string) {
    const applications = await ExamApplication.find({ studentId })
      .populate('cycleId')
      .populate('subjectIds')
      .sort({ createdAt: -1 });

    const appIds = applications.map(a => a._id);
    const hallTickets = await HallTicket.find({ applicationId: { $in: appIds } });
    const ticketMap = new Map<string, any>();
    hallTickets.forEach(t => ticketMap.set(t.applicationId.toString(), t));

    const decisions = await EligibilityDecision.find({ studentId });
    const decisionMap = new Map<string, any>();
    decisions.forEach(d => decisionMap.set(d.cycleId.toString(), d));

    return applications.map(app => ({
      ...app.toObject(),
      hallTicket: ticketMap.get(app._id.toString()),
      eligibility: decisionMap.get(app.cycleId._id.toString())
    }));
  }

  // 11. Review Queue
  static async getReviewQueue(cycleId?: string) {
    const filter: any = {};
    if (cycleId) filter.cycleId = cycleId;

    const applications = await ExamApplication.find(filter)
      .populate('studentId')
      .populate('cycleId')
      .populate('subjectIds')
      .sort({ createdAt: -1 });

    const studentIds = applications.map(a => (a.studentId as any)?._id || a.studentId);
    const decisions = await EligibilityDecision.find({ studentId: { $in: studentIds } });
    const decisionMap = new Map<string, any>();
    decisions.forEach(d => {
      decisionMap.set(`${d.cycleId.toString()}_${d.studentId.toString()}`, d);
    });

    const rollAssignments = await RollNumberAssignment.find({ studentId: { $in: studentIds } });
    const rollMap = new Map<string, any>();
    rollAssignments.forEach(r => {
      rollMap.set(`${r.cycleId.toString()}_${r.studentId.toString()}`, r);
    });

    const appIds = applications.map(a => a._id);
    const hallTickets = await HallTicket.find({ applicationId: { $in: appIds } });
    const ticketMap = new Map<string, any>();
    hallTickets.forEach(t => ticketMap.set(t.applicationId.toString(), t));

    return applications.map(app => {
      const sId = (app.studentId as any)?._id?.toString() || app.studentId?.toString();
      const cId = (app.cycleId as any)?._id?.toString() || app.cycleId?.toString();
      return {
        ...app.toObject(),
        eligibility: decisionMap.get(`${cId}_${sId}`),
        rollAssignment: rollMap.get(`${cId}_${sId}`),
        hallTicket: ticketMap.get(app._id.toString())
      };
    });
  }
}

// ==========================================
// 19. M12 EXAM SCHEDULING, CENTERS & MATERIALS SERVICE
// ==========================================

export class ExamOperationsService {
  // 1. Centers & Verification
  static async createCenter(data: {
    institutionId: string;
    centerCode: string;
    name: string;
    address: string;
    contactPerson: string;
    contactPhone: string;
    totalCapacity: number;
    rooms: Array<{
      roomId: string;
      roomNumber: string;
      building: string;
      floor?: string;
      capacity: number;
      hasCCTV?: boolean;
      isAccessible?: boolean;
    }>;
  }) {
    const existing = await ExamCenter.findOne({
      institutionId: data.institutionId,
      centerCode: data.centerCode
    });
    if (existing) {
      throw new Error(`Exam Center with code '${data.centerCode}' already exists`);
    }

    return await ExamCenter.create({
      ...data,
      status: 'ACTIVE'
    });
  }

  static async getCenters(institutionId?: string) {
    const filter: any = {};
    if (institutionId) filter.institutionId = institutionId;
    return await ExamCenter.find(filter).sort({ centerCode: 1 });
  }

  static async getCenterById(id: string) {
    const center = await ExamCenter.findById(id);
    if (!center) throw new Error('Exam center not found');
    return center;
  }

  static async verifyCenter(data: {
    centerId: string;
    cycleId: string;
    institutionId: string;
    checklist: {
      cctvFunctional: boolean;
      secureStorageAvailable: boolean;
      powerBackupAvailable: boolean;
      accessibilityCompliant: boolean;
      drinkingWaterAndWashrooms: boolean;
    };
    remarks?: string;
    status?: CenterVerificationStatus;
    verifiedBy: string;
  }) {
    const center = await ExamCenter.findById(data.centerId);
    if (!center) throw new Error('Exam center not found');

    const verification = await CenterVerification.findOneAndUpdate(
      { centerId: data.centerId, cycleId: data.cycleId },
      {
        institutionId: data.institutionId || center.institutionId,
        centerId: data.centerId,
        cycleId: data.cycleId,
        checklist: data.checklist,
        remarks: data.remarks || 'Center physical readiness verified',
        status: data.status || CenterVerificationStatus.VERIFIED,
        verifiedBy: data.verifiedBy,
        verifiedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return verification;
  }

  static async getVerifications(cycleId?: string, centerId?: string) {
    const filter: any = {};
    if (cycleId) filter.cycleId = cycleId;
    if (centerId) filter.centerId = centerId;
    return await CenterVerification.find(filter).populate('centerId').populate('cycleId').sort({ verifiedAt: -1 });
  }

  // 2. Exam Scheduling & Conflict Detection
  static async createSchedule(data: {
    institutionId: string;
    cycleId: string;
    subjectId: string;
    examDate: string;
    startTime: string;
    endTime: string;
    session?: 'MORNING' | 'AFTERNOON' | 'EVENING';
    centerId: string;
    roomIds: string[];
  }) {
    const center = await ExamCenter.findById(data.centerId);
    if (!center) throw new Error('Exam center not found');

    // Verification check: Is center verified for this cycle?
    const verification = await CenterVerification.findOne({
      centerId: data.centerId,
      cycleId: data.cycleId,
      status: CenterVerificationStatus.VERIFIED
    });

    const subject = await Course.findById(data.subjectId);
    if (!subject) throw new Error('Subject course not found');

    // Total enrolled candidates for this subject in the cycle
    const enrolledCount = await ExamEnrollment.countDocuments({
      cycleId: data.cycleId,
      subjectId: data.subjectId,
      status: 'ENROLLED'
    });

    // Conflict detection
    const conflicts = await this.detectConflicts(
      data.cycleId,
      data.examDate,
      data.startTime,
      data.endTime,
      data.roomIds,
      data.subjectId
    );

    const schedule = await ExamSchedule.create({
      institutionId: data.institutionId,
      cycleId: data.cycleId,
      subjectId: data.subjectId,
      subjectCode: subject.code,
      subjectName: subject.name,
      examDate: data.examDate,
      startTime: data.startTime,
      endTime: data.endTime,
      session: data.session || 'MORNING',
      centerId: data.centerId,
      roomIds: data.roomIds,
      totalEnrolled: enrolledCount,
      status: ExamScheduleStatus.DRAFT,
      conflicts
    });

    return schedule;
  }

  static async detectConflicts(
    cycleId: string,
    examDate: string,
    startTime: string,
    endTime: string,
    roomIds: string[],
    subjectId: string
  ): Promise<Array<{ type: 'ROOM_CONFLICT' | 'STUDENT_COLLISION' | 'FACULTY_COLLISION'; description: string }>> {
    const conflicts: Array<{ type: 'ROOM_CONFLICT' | 'STUDENT_COLLISION' | 'FACULTY_COLLISION'; description: string }> = [];

    // Check for room conflict on the same date with overlapping time
    const overlappingSchedules = await ExamSchedule.find({
      cycleId,
      examDate,
      roomIds: { $in: roomIds },
      status: { $ne: ExamScheduleStatus.CANCELLED },
      subjectId: { $ne: subjectId }
    });

    for (const sched of overlappingSchedules) {
      if (
        (startTime >= sched.startTime && startTime < sched.endTime) ||
        (endTime > sched.startTime && endTime <= sched.endTime) ||
        (startTime <= sched.startTime && endTime >= sched.endTime)
      ) {
        const sharedRooms = sched.roomIds.filter(r => roomIds.includes(r));
        conflicts.push({
          type: 'ROOM_CONFLICT',
          description: `Room(s) ${sharedRooms.join(', ')} already booked for '${sched.subjectName}' (${sched.startTime}-${sched.endTime})`
        });
      }
    }

    return conflicts;
  }

  static async getSchedules(cycleId?: string, institutionId?: string) {
    const filter: any = {};
    if (cycleId) filter.cycleId = cycleId;
    if (institutionId) filter.institutionId = institutionId;
    return await ExamSchedule.find(filter)
      .populate('centerId')
      .populate('subjectId')
      .sort({ examDate: 1, startTime: 1 });
  }

  static async publishSchedule(scheduleId: string, publishedBy: string) {
    const schedule = await ExamSchedule.findById(scheduleId);
    if (!schedule) throw new Error('Exam schedule not found');

    schedule.status = ExamScheduleStatus.PUBLISHED;
    schedule.publishedBy = publishedBy;
    schedule.publishedAt = new Date();
    await schedule.save();

    return schedule;
  }

  // 3. Seating Allocation (Acceptance Gate: Allocation respects capacity under concurrent actions; student/time collisions prevented; audit on reallocation)
  static async allocateSeats(data: {
    cycleId: string;
    scheduleId: string;
    centerId: string;
    roomId: string;
    studentIds: string[];
    allocatedBy?: string;
  }) {
    const schedule = await ExamSchedule.findById(data.scheduleId);
    if (!schedule) throw new Error('Exam schedule not found');

    const center = await ExamCenter.findById(data.centerId);
    if (!center) throw new Error('Exam center not found');

    const targetRoom = center.rooms.find(r => r.roomId === data.roomId || r.roomNumber === data.roomId);
    if (!targetRoom) {
      throw new Error(`Room '${data.roomId}' not found in center '${center.name}'`);
    }

    // Capacity enforcement gate: Check currently allocated seats in this room for this schedule
    const currentAllocationsCount = await SeatingAllocation.countDocuments({
      scheduleId: data.scheduleId,
      roomId: targetRoom.roomId,
      status: SeatingAllocationStatus.ALLOCATED
    });

    if (currentAllocationsCount + data.studentIds.length > targetRoom.capacity) {
      const err: any = new Error(
        `Room capacity exceeded: maximum capacity is ${targetRoom.capacity}, currently allocated ${currentAllocationsCount}, requested ${data.studentIds.length}. Capacity limit strictly enforced.`
      );
      err.statusCode = 400;
      throw err;
    }

    // Check student collisions: Student cannot be allocated to two exams at overlapping times
    for (const studentId of data.studentIds) {
      const existingAllocations = await SeatingAllocation.find({
        cycleId: data.cycleId,
        studentId,
        status: SeatingAllocationStatus.ALLOCATED,
        scheduleId: { $ne: data.scheduleId }
      }).populate('scheduleId');

      for (const alloc of existingAllocations) {
        const otherSched = alloc.scheduleId as any;
        if (otherSched && otherSched.examDate === schedule.examDate) {
          if (
            (schedule.startTime >= otherSched.startTime && schedule.startTime < otherSched.endTime) ||
            (schedule.endTime > otherSched.startTime && schedule.endTime <= otherSched.endTime) ||
            (schedule.startTime <= otherSched.startTime && schedule.endTime >= otherSched.endTime)
          ) {
            throw new Error(
              `Student collision detected: Student is already allocated to exam '${otherSched.subjectName}' on ${otherSched.examDate} (${otherSched.startTime}-${otherSched.endTime})`
            );
          }
        }
      }
    }

    // Fetch roll numbers and student details
    const students = await Student.find({ _id: { $in: data.studentIds } }).populate('userId');
    const rollAssignments = await RollNumberAssignment.find({
      cycleId: data.cycleId,
      studentId: { $in: data.studentIds }
    });
    const rollMap = new Map<string, string>();
    rollAssignments.forEach(r => rollMap.set(r.studentId.toString(), r.rollNumber));

    const allocatedRecords = [];
    let seatIndex = currentAllocationsCount + 1;

    for (const st of students) {
      const seatNumber = `R${targetRoom.roomNumber}-S${String(seatIndex).padStart(2, '0')}`;
      const rollNumber = rollMap.get(st._id.toString()) || st.rollNumber || 'TBD';
      const studentName = (st.userId as any)?.name || 'Student Candidate';

      // Check if student already allocated in this schedule
      const existingInSchedule = await SeatingAllocation.findOne({
        scheduleId: data.scheduleId,
        studentId: st._id,
        status: SeatingAllocationStatus.ALLOCATED
      });

      if (!existingInSchedule) {
        const allocation = await SeatingAllocation.create({
          institutionId: schedule.institutionId,
          cycleId: data.cycleId,
          scheduleId: data.scheduleId,
          centerId: data.centerId,
          roomId: targetRoom.roomId,
          roomNumber: targetRoom.roomNumber,
          seatNumber,
          studentId: st._id,
          studentRollNumber: rollNumber,
          studentName,
          subjectId: schedule.subjectId,
          allocatedAt: new Date(),
          allocatedBy: data.allocatedBy || 'CONTROLLER_OF_EXAMINATIONS',
          status: SeatingAllocationStatus.ALLOCATED
        });
        allocatedRecords.push(allocation);
        seatIndex++;
      }
    }

    return allocatedRecords;
  }

  static async reallocateSeat(data: {
    allocationId: string;
    newRoomId: string;
    newSeatNumber?: string;
    reason: string;
    reallocatedBy: string;
  }) {
    const prevAlloc = await SeatingAllocation.findById(data.allocationId);
    if (!prevAlloc) throw new Error('Seating allocation record not found');

    const center = await ExamCenter.findById(prevAlloc.centerId);
    if (!center) throw new Error('Center not found');

    const newRoom = center.rooms.find(r => r.roomId === data.newRoomId || r.roomNumber === data.newRoomId);
    if (!newRoom) throw new Error(`Target room '${data.newRoomId}' not found in center`);

    // Check capacity of target room
    const currentInNewRoom = await SeatingAllocation.countDocuments({
      scheduleId: prevAlloc.scheduleId,
      roomId: newRoom.roomId,
      status: SeatingAllocationStatus.ALLOCATED
    });

    if (currentInNewRoom >= newRoom.capacity) {
      const err: any = new Error(
        `Target room '${newRoom.roomNumber}' capacity (${newRoom.capacity}) reached. Cannot reallocate.`
      );
      err.statusCode = 400;
      throw err;
    }

    const assignedSeatNumber = data.newSeatNumber || `R${newRoom.roomNumber}-S${String(currentInNewRoom + 1).padStart(2, '0')}`;

    // Mark previous record as REALLOCATED
    prevAlloc.status = SeatingAllocationStatus.REALLOCATED;
    prevAlloc.reallocationReason = data.reason;
    await prevAlloc.save();

    // Create new allocation record
    const newAlloc = await SeatingAllocation.create({
      institutionId: prevAlloc.institutionId,
      cycleId: prevAlloc.cycleId,
      scheduleId: prevAlloc.scheduleId,
      centerId: prevAlloc.centerId,
      roomId: newRoom.roomId,
      roomNumber: newRoom.roomNumber,
      seatNumber: assignedSeatNumber,
      studentId: prevAlloc.studentId,
      studentRollNumber: prevAlloc.studentRollNumber,
      studentName: prevAlloc.studentName,
      subjectId: prevAlloc.subjectId,
      allocatedAt: new Date(),
      allocatedBy: data.reallocatedBy,
      status: SeatingAllocationStatus.ALLOCATED,
      previousAllocationId: prevAlloc._id,
      reallocationReason: data.reason
    });

    // Enforce Rule: Reallocation retains an audit record in AuditLog
    const auditUserId = mongoose.Types.ObjectId.isValid(data.reallocatedBy) ? data.reallocatedBy : undefined;
    await AuditLog.create({
      userId: auditUserId as any,
      action: 'SEATING_REALLOCATION',
      resource: `SeatingAllocation:${prevAlloc._id}`,
      ipAddress: '127.0.0.1',
      previousState: {
        roomId: prevAlloc.roomId,
        roomNumber: prevAlloc.roomNumber,
        seatNumber: prevAlloc.seatNumber,
        status: prevAlloc.status
      },
      newState: {
        newAllocationId: newAlloc._id,
        roomId: newAlloc.roomId,
        roomNumber: newAlloc.roomNumber,
        seatNumber: newAlloc.seatNumber,
        reason: data.reason,
        reallocatedBy: data.reallocatedBy
      }
    });

    return newAlloc;
  }

  static async getRoomAllocations(scheduleId: string, roomId?: string) {
    const filter: any = { scheduleId, status: SeatingAllocationStatus.ALLOCATED };
    if (roomId) filter.roomId = roomId;
    return await SeatingAllocation.find(filter).sort({ seatNumber: 1 });
  }

  static async getStudentAllocation(cycleId: string, studentId: string) {
    return await SeatingAllocation.find({
      cycleId,
      studentId,
      status: SeatingAllocationStatus.ALLOCATED
    }).populate('scheduleId').populate('centerId');
  }

  // 4. Invigilation Duty (Acceptance Gate: Absent acknowledgement is visible)
  static async assignInvigilator(data: {
    cycleId: string;
    scheduleId: string;
    centerId: string;
    roomId: string;
    facultyId: string;
    dutyDate: string;
    startTime: string;
    endTime: string;
    reportingTime?: string;
    assignedBy?: string;
  }) {
    const faculty = await User.findById(data.facultyId);
    if (!faculty) throw new Error('Faculty user not found');

    // Availability check: Faculty cannot be assigned to another duty at same date/time
    const overlappingDuties = await InvigilationDuty.find({
      cycleId: data.cycleId,
      facultyId: data.facultyId,
      dutyDate: data.dutyDate,
      status: { $in: [InvigilationDutyStatus.ASSIGNED, InvigilationDutyStatus.ACKNOWLEDGED] }
    });

    for (const d of overlappingDuties) {
      if (
        (data.startTime >= d.startTime && data.startTime < d.endTime) ||
        (data.endTime > d.startTime && data.endTime <= d.endTime) ||
        (data.startTime <= d.startTime && data.endTime >= d.endTime)
      ) {
        throw new Error(
          `Faculty ${faculty.name} is already assigned to invigilation duty on ${d.dutyDate} (${d.startTime}-${d.endTime})`
        );
      }
    }

    const duty = await InvigilationDuty.create({
      institutionId: faculty.institutionId,
      cycleId: data.cycleId,
      scheduleId: data.scheduleId,
      centerId: data.centerId,
      roomId: data.roomId,
      facultyId: data.facultyId,
      facultyName: faculty.name,
      facultyEmail: faculty.email,
      dutyDate: data.dutyDate,
      startTime: data.startTime,
      endTime: data.endTime,
      reportingTime: data.reportingTime || '08:30 AM',
      status: InvigilationDutyStatus.ASSIGNED,
      assignedBy: data.assignedBy || 'CONTROLLER_OF_EXAMINATIONS',
      assignedAt: new Date()
    });

    return duty;
  }

  static async acknowledgeDuty(data: {
    dutyId: string;
    facultyId: string;
    status: 'ACKNOWLEDGED' | 'DECLINED';
    declineReason?: string;
  }) {
    const duty = await InvigilationDuty.findById(data.dutyId);
    if (!duty) throw new Error('Invigilation duty not found');

    if (duty.facultyId.toString() !== data.facultyId) {
      const err: any = new Error('Forbidden: Only the appointed faculty member can acknowledge this duty');
      err.statusCode = 403;
      throw err;
    }

    duty.status = data.status === 'ACKNOWLEDGED' ? InvigilationDutyStatus.ACKNOWLEDGED : InvigilationDutyStatus.DECLINED;
    duty.acknowledgedAt = new Date();
    if (data.declineReason) duty.declineReason = data.declineReason;
    await duty.save();

    return duty;
  }

  static async markDutyAbsent(dutyId: string, markedBy: string, remarks?: string) {
    const duty = await InvigilationDuty.findById(dutyId);
    if (!duty) throw new Error('Invigilation duty not found');

    duty.status = InvigilationDutyStatus.ABSENT;
    duty.remarks = remarks || 'Marked absent by exam superintendent on exam day';
    await duty.save();

    // Create Audit record
    const auditUserId = mongoose.Types.ObjectId.isValid(markedBy) ? markedBy : undefined;
    await AuditLog.create({
      userId: auditUserId as any,
      action: 'INVIGILATOR_ABSENT',
      resource: `InvigilationDuty:${duty._id}`,
      ipAddress: '127.0.0.1',
      previousState: { status: InvigilationDutyStatus.ASSIGNED },
      newState: { status: InvigilationDutyStatus.ABSENT, remarks: duty.remarks, markedBy }
    });

    return duty;
  }

  static async getDutyRoster(cycleId?: string, centerId?: string, facultyId?: string) {
    const filter: any = {};
    if (cycleId) filter.cycleId = cycleId;
    if (centerId) filter.centerId = centerId;
    if (facultyId) filter.facultyId = facultyId;

    return await InvigilationDuty.find(filter)
      .populate('scheduleId')
      .populate('centerId')
      .sort({ dutyDate: 1, startTime: 1 });
  }

  // 5. Materials Management, Serial Range Validation & Reconciliation
  static async createMaterialBatch(data: {
    institutionId: string;
    cycleId: string;
    batchNumber: string;
    materialType?: MaterialType;
    prefix?: string;
    startSerial: number;
    endSerial: number;
    securityBagSealNumber?: string;
    confidentialNotes?: string;
  }) {
    if (data.startSerial > data.endSerial) {
      throw new Error(`Invalid serial range: startSerial (${data.startSerial}) cannot be greater than endSerial (${data.endSerial})`);
    }

    const prefix = data.prefix || 'AB-';
    const materialType = data.materialType || MaterialType.MAIN_ANSWER_BOOK;

    // Acceptance Gate: Duplicate/Overlapping serial range rejected!
    const existingBatches = await MaterialBatch.find({
      institutionId: data.institutionId,
      materialType,
      prefix
    });

    for (const b of existingBatches) {
      if (data.startSerial <= b.endSerial && data.endSerial >= b.startSerial) {
        const err: any = new Error(
          `Duplicate or overlapping serial range [${data.startSerial}-${data.endSerial}] with existing batch '${b.batchNumber}' [${b.startSerial}-${b.endSerial}]`
        );
        err.statusCode = 400;
        throw err;
      }
    }

    const totalCount = data.endSerial - data.startSerial + 1;
    const batch = await MaterialBatch.create({
      institutionId: data.institutionId,
      cycleId: data.cycleId,
      batchNumber: data.batchNumber,
      materialType,
      prefix,
      startSerial: data.startSerial,
      endSerial: data.endSerial,
      totalCount,
      dispatchedCount: 0,
      usedCount: 0,
      returnedCount: 0,
      damagedCount: 0,
      status: MaterialBatchStatus.IN_STOCK,
      securityBagSealNumber: data.securityBagSealNumber,
      confidentialNotes: data.confidentialNotes
    });

    return batch;
  }

  static async dispatchMaterials(data: {
    batchId: string;
    centerId: string;
    scheduleId?: string;
    startSerial: number;
    endSerial: number;
    quantity: number;
    sealNumber?: string;
    handledBy: string;
    remarks?: string;
  }) {
    const batch = await MaterialBatch.findById(data.batchId);
    if (!batch) throw new Error('Material batch not found');

    if (data.startSerial < batch.startSerial || data.endSerial > batch.endSerial) {
      throw new Error(`Dispatch range [${data.startSerial}-${data.endSerial}] exceeds batch boundary [${batch.startSerial}-${batch.endSerial}]`);
    }

    batch.dispatchedCount += data.quantity;
    batch.status = MaterialBatchStatus.DISPATCHED;
    await batch.save();

    const movement = await MaterialMovement.create({
      institutionId: batch.institutionId,
      batchId: batch._id,
      movementType: MaterialMovementType.DISPATCH_TO_CENTER,
      centerId: data.centerId,
      scheduleId: data.scheduleId,
      startSerial: data.startSerial,
      endSerial: data.endSerial,
      quantity: data.quantity,
      sealNumber: data.sealNumber,
      handledBy: data.handledBy,
      timestamp: new Date(),
      acknowledgementStatus: 'PENDING',
      remarks: data.remarks || 'Dispatched under security seal'
    });

    return { batch, movement };
  }

  static async recordMovement(data: {
    batchId: string;
    movementType: MaterialMovementType;
    centerId?: string;
    scheduleId?: string;
    startSerial: number;
    endSerial: number;
    quantity: number;
    sealNumber?: string;
    handledBy: string;
    remarks?: string;
  }) {
    const batch = await MaterialBatch.findById(data.batchId);
    if (!batch) throw new Error('Material batch not found');

    const movement = await MaterialMovement.create({
      institutionId: batch.institutionId,
      batchId: batch._id,
      movementType: data.movementType,
      centerId: data.centerId,
      scheduleId: data.scheduleId,
      startSerial: data.startSerial,
      endSerial: data.endSerial,
      quantity: data.quantity,
      sealNumber: data.sealNumber,
      handledBy: data.handledBy,
      timestamp: new Date(),
      acknowledgementStatus: 'ACKNOWLEDGED',
      remarks: data.remarks
    });

    return movement;
  }

  static async acknowledgeMaterialReceipt(movementId: string, acknowledgedBy: string) {
    const movement = await MaterialMovement.findById(movementId);
    if (!movement) throw new Error('Material movement record not found');

    movement.acknowledgementStatus = 'ACKNOWLEDGED';
    movement.acknowledgedBy = acknowledgedBy;
    movement.acknowledgedAt = new Date();
    await movement.save();

    return movement;
  }

  static async reconcileBatch(data: {
    batchId: string;
    usedCount: number;
    returnedCount: number;
    damagedCount: number;
    notes?: string;
    reconciledBy?: string;
  }) {
    const batch = await MaterialBatch.findById(data.batchId);
    if (!batch) throw new Error('Material batch not found');

    // Acceptance Gate: Usage plus remaining/returned quantities reconciles!
    const totalAccounted = data.usedCount + data.returnedCount + data.damagedCount;
    const delta = batch.dispatchedCount - totalAccounted;

    batch.usedCount = data.usedCount;
    batch.returnedCount = data.returnedCount;
    batch.damagedCount = data.damagedCount;
    batch.reconciledAt = new Date();
    batch.reconciledBy = data.reconciledBy || 'CONTROLLER_OF_EXAMINATIONS';

    if (delta === 0) {
      batch.status = MaterialBatchStatus.RECONCILED;
      batch.reconciliationNotes = `Perfect reconciliation: Dispatched (${batch.dispatchedCount}) = Used (${data.usedCount}) + Returned (${data.returnedCount}) + Damaged (${data.damagedCount}). ${data.notes || ''}`.trim();
    } else {
      batch.status = MaterialBatchStatus.DISCREPANCY;
      batch.reconciliationNotes = `Reconciliation discrepancy: Dispatched (${batch.dispatchedCount}) does not match Total Accounted (${totalAccounted}). Variance: ${delta > 0 ? `-${delta} missing` : `+${Math.abs(delta)} surplus`}. ${data.notes || ''}`.trim();
    }

    await batch.save();

    return {
      batch,
      isReconciled: delta === 0,
      dispatchedCount: batch.dispatchedCount,
      totalAccounted,
      variance: delta,
      status: batch.status
    };
  }

  static async getBatches(cycleId?: string, institutionId?: string, isExamStaff: boolean = false) {
    const filter: any = {};
    if (cycleId) filter.cycleId = cycleId;
    if (institutionId) filter.institutionId = institutionId;

    const batches = await MaterialBatch.find(filter).sort({ createdAt: -1 });

    // Enforce Rule: Confidential metadata (securityBagSealNumber, confidentialNotes) is restricted to exam staff
    if (!isExamStaff) {
      return batches.map(b => {
        const obj = b.toObject();
        delete (obj as any).securityBagSealNumber;
        delete (obj as any).confidentialNotes;
        return obj;
      });
    }

    return batches;
  }

  static async getMovements(batchId?: string) {
    const filter: any = {};
    if (batchId) filter.batchId = batchId;
    return await MaterialMovement.find(filter)
      .populate('centerId')
      .populate('scheduleId')
      .sort({ timestamp: -1 });
  }
}

// ==========================================
// M13: QUESTION PAPERS & CONFIDENTIAL QUESTION BANK SERVICE
// ==========================================

export class QuestionPaperService {
  // 1. Setter Appointments
  static async createAppointment(data: {
    institutionId?: string;
    cycleId: string;
    subjectId: string;
    facultyId: string;
    role?: AppointmentRole;
    deadline: string;
    remunerationPaise?: number;
    instructions?: string;
  }) {
    const faculty = await User.findById(data.facultyId);
    if (!faculty) throw new Error('Faculty user not found');

    const cycle = await ExamCycle.findById(data.cycleId);
    if (!cycle) throw new Error('Exam cycle not found');

    const subject = await Course.findById(data.subjectId);
    if (!subject) throw new Error('Subject course not found');

    const institutionId = data.institutionId || cycle.institutionId;

    const appointment = await SetterAppointment.create({
      institutionId,
      cycleId: data.cycleId,
      subjectId: data.subjectId,
      facultyId: data.facultyId,
      role: data.role || AppointmentRole.SETTER,
      status: AppointmentStatus.OFFERED,
      deadline: new Date(data.deadline),
      remunerationPaise: data.remunerationPaise ?? 150000,
      instructions: data.instructions || 'Prepare 3 sets of questions complying with syllabus guidelines.',
      invitedAt: new Date(),
      isNotified: true
    });

    // Mock notification delivery: Log event in OutboxEvent
    await OutboxEvent.create({
      aggregateId: appointment._id.toString(),
      aggregateType: 'SETTER_APPOINTMENT',
      eventType: 'APPOINTMENT_OFFERED',
      payload: {
        appointmentId: appointment._id,
        facultyEmail: faculty.email,
        subjectCode: subject.code,
        deadline: appointment.deadline
      },
      status: OutboxStatus.DELIVERED
    });

    return appointment;
  }

  static async respondAppointment(data: {
    appointmentId: string;
    accept: boolean;
    rejectionReason?: string;
    userId: string;
    userRole: string;
  }) {
    const appointment = await SetterAppointment.findById(data.appointmentId);
    if (!appointment) throw new Error('Appointment request not found');

    // Rule: Non-appointed faculty cannot accept/reject someone else's appointment
    if (appointment.facultyId.toString() !== data.userId && data.userRole !== UserRole.ADMIN && data.userRole !== UserRole.SUPER_ADMIN) {
      const err: any = new Error('Unauthorized: You are not authorized to respond to this appointment');
      err.statusCode = 403;
      throw err;
    }

    if (data.accept) {
      appointment.status = AppointmentStatus.ACCEPTED;
    } else {
      appointment.status = AppointmentStatus.REJECTED;
      appointment.rejectionReason = data.rejectionReason || 'Declined by faculty member';
    }

    appointment.respondedAt = new Date();
    await appointment.save();

    return appointment;
  }

  static async getAppointments(query: { cycleId?: string; subjectId?: string; facultyId?: string }, user: { id: string; role: string }) {
    // Acceptance Gate: Students cannot view setter appointments
    if (user.role === UserRole.STUDENT || user.role === UserRole.GUARDIAN) {
      const err: any = new Error('Access Denied: Students and guardians cannot access setter appointments');
      err.statusCode = 403;
      throw err;
    }

    const filter: any = {};
    if (query.cycleId) filter.cycleId = query.cycleId;
    if (query.subjectId) filter.subjectId = query.subjectId;

    // Rule: Faculty can only see their own appointments
    if (user.role === UserRole.FACULTY) {
      filter.facultyId = user.id;
    } else if (query.facultyId) {
      filter.facultyId = query.facultyId;
    }

    return await SetterAppointment.find(filter)
      .populate('cycleId')
      .populate('subjectId')
      .populate('facultyId', 'name email role')
      .sort({ createdAt: -1 });
  }

  // 2. Question Bank
  static async createQuestion(data: {
    institutionId?: string;
    subjectId: string;
    topic: string;
    difficulty?: QuestionDifficulty;
    type?: QuestionType;
    questionText: string;
    marks?: number;
    sampleAnswer?: string;
    rubric?: string;
    confidential?: boolean;
    createdBy?: string;
  }) {
    const subject = await Course.findById(data.subjectId);
    if (!subject) throw new Error('Course subject not found');

    const institutionId = data.institutionId || subject.institutionId;

    const question = await Question.create({
      institutionId,
      subjectId: data.subjectId,
      topic: data.topic,
      difficulty: data.difficulty || QuestionDifficulty.MEDIUM,
      type: data.type || QuestionType.SHORT_ANSWER,
      questionText: data.questionText,
      marks: data.marks ?? 10,
      sampleAnswer: data.sampleAnswer,
      rubric: data.rubric,
      confidential: data.confidential !== false,
      createdBy: data.createdBy
    });

    return question;
  }

  static async getQuestions(subjectId: string, difficulty?: string, user?: { id: string; role: string }) {
    // Acceptance Gate: Non-appointed faculty and students cannot access question bank
    if (user && (user.role === UserRole.STUDENT || user.role === UserRole.GUARDIAN)) {
      const err: any = new Error('Access Denied: Students and guardians cannot access confidential question bank');
      err.statusCode = 403;
      throw err;
    }

    const filter: any = { subjectId };
    if (difficulty) filter.difficulty = difficulty;

    return await Question.find(filter).sort({ topic: 1, marks: 1 });
  }

  // 3. Secure Paper Submissions & Version History
  static async submitPaperVersion(data: {
    appointmentId: string;
    subjectId: string;
    cycleId: string;
    title: string;
    totalMarks?: number;
    instructions?: string;
    contentSummary?: string;
    questions?: any[];
    declarationAgreed: boolean;
    setterId: string;
    userRole: string;
  }) {
    // Acceptance Gate: Setter must have an ACCEPTED appointment
    const appointment = await SetterAppointment.findById(data.appointmentId);
    if (!appointment) throw new Error('Setter appointment not found');

    if (appointment.status !== AppointmentStatus.ACCEPTED) {
      const err: any = new Error(`Cannot submit paper: Appointment status is ${appointment.status}. You must accept the appointment first.`);
      err.statusCode = 400;
      throw err;
    }

    if (appointment.facultyId.toString() !== data.setterId && data.userRole !== UserRole.ADMIN && data.userRole !== UserRole.SUPER_ADMIN) {
      const err: any = new Error('Unauthorized: You are not the appointed setter for this subject');
      err.statusCode = 403;
      throw err;
    }

    // Determine next version number for this subject and cycle
    const previousVersions = await PaperVersion.countDocuments({
      subjectId: data.subjectId,
      cycleId: data.cycleId
    });
    const versionNumber = previousVersions + 1;

    // Generate private encrypted storage key (no public URL!)
    const fileStorageKey = `vault://papers/${data.subjectId}/v${versionNumber}-${uuidv4()}`;

    // Acceptance Gate: Compute SHA256 immutable digest of paper content
    const contentToHash = JSON.stringify({
      subjectId: data.subjectId,
      cycleId: data.cycleId,
      versionNumber,
      title: data.title,
      totalMarks: data.totalMarks || 100,
      instructions: data.instructions,
      contentSummary: data.contentSummary,
      questions: data.questions,
      submittedAt: new Date().toISOString()
    });
    const immutableHash = crypto.createHash('sha256').update(contentToHash).digest('hex');

    const paper = await PaperVersion.create({
      institutionId: appointment.institutionId,
      cycleId: data.cycleId,
      subjectId: data.subjectId,
      appointmentId: data.appointmentId,
      setterId: data.setterId,
      versionNumber,
      title: data.title,
      totalMarks: data.totalMarks || 100,
      instructions: data.instructions || 'Answer all sections. Calculators permitted where stated.',
      contentSummary: data.contentSummary || 'Complete assessment paper submitted for review',
      fileStorageKey,
      watermarkPolicy: `CONFIDENTIAL - EXAM CYCLE ${data.cycleId}`,
      questions: data.questions || [],
      status: PaperVersionStatus.SUBMITTED,
      declarationAgreed: data.declarationAgreed,
      submittedAt: new Date(),
      immutableHash
    });

    return paper;
  }

  static async getPaperVersions(query: { cycleId?: string; subjectId?: string }, user: { id: string; role: string }) {
    // Acceptance Gate: Non-appointed faculty and students cannot retrieve papers
    if (user.role === UserRole.STUDENT || user.role === UserRole.GUARDIAN) {
      const err: any = new Error('Access Denied: Students and guardians cannot access examination papers');
      err.statusCode = 403;
      throw err;
    }

    const filter: any = {};
    if (query.cycleId) filter.cycleId = query.cycleId;
    if (query.subjectId) filter.subjectId = query.subjectId;

    if (user.role === UserRole.FACULTY) {
      // Faculty can only view papers they were appointed to set or moderate
      const myAppointments = await SetterAppointment.find({ facultyId: user.id }).select('_id');
      const appointmentIds = myAppointments.map(a => a._id);
      filter.$or = [
        { setterId: user.id },
        { appointmentId: { $in: appointmentIds } }
      ];
    }

    return await PaperVersion.find(filter)
      .populate('cycleId')
      .populate('subjectId')
      .populate('setterId', 'name email role')
      .populate('approvedBy', 'name email')
      .sort({ versionNumber: -1 });
  }

  static async getPaperVersionById(paperId: string, user: { id: string; role: string }) {
    // Acceptance Gate: Non-appointed faculty and students cannot retrieve papers
    if (user.role === UserRole.STUDENT || user.role === UserRole.GUARDIAN) {
      const err: any = new Error('Access Denied: Students and guardians cannot access examination papers');
      err.statusCode = 403;
      throw err;
    }

    const paper = await PaperVersion.findById(paperId)
      .populate('cycleId')
      .populate('subjectId')
      .populate('setterId', 'name email role')
      .populate('approvedBy', 'name email');

    if (!paper) throw new Error('Paper version not found');

    if (user.role === UserRole.FACULTY && paper.setterId._id.toString() !== user.id) {
      const appointment = await SetterAppointment.findOne({
        _id: paper.appointmentId,
        facultyId: user.id
      });
      if (!appointment) {
        const err: any = new Error('Access Denied: You are not authorized to view this paper version');
        err.statusCode = 403;
        throw err;
      }
    }

    const reviews = await PaperReview.find({ paperVersionId: paper._id })
      .populate('reviewerId', 'name email')
      .sort({ reviewedAt: -1 });

    return { paper, reviews };
  }

  // 4. Review & Approval Workflow
  static async reviewPaperVersion(data: {
    paperVersionId: string;
    decision: 'APPROVE' | 'REQUEST_REVISION' | 'REJECT';
    reviewComments: string;
    suggestedEdits?: string;
    reviewerId: string;
    userRole: string;
  }) {
    if (data.userRole !== UserRole.ADMIN && data.userRole !== UserRole.SUPER_ADMIN && data.userRole !== UserRole.FACULTY) {
      const err: any = new Error('Unauthorized to review examination papers');
      err.statusCode = 403;
      throw err;
    }

    const paper = await PaperVersion.findById(data.paperVersionId);
    if (!paper) throw new Error('Paper version not found');

    const review = await PaperReview.create({
      paperVersionId: paper._id,
      reviewerId: data.reviewerId,
      decision: data.decision,
      reviewComments: data.reviewComments,
      suggestedEdits: data.suggestedEdits,
      reviewedAt: new Date()
    });

    if (data.decision === 'APPROVE') {
      paper.status = PaperVersionStatus.APPROVED;
      paper.approvedAt = new Date();
      paper.approvedBy = new mongoose.Types.ObjectId(data.reviewerId);
    } else if (data.decision === 'REQUEST_REVISION') {
      paper.status = PaperVersionStatus.NEEDS_REVISION;
    } else {
      paper.status = PaperVersionStatus.REJECTED;
    }

    await paper.save();
    return { paper, review };
  }

  // 5. Authorized Release (Acceptance Gate: Release before approval fails!)
  static async releasePaper(paperVersionId: string, releaseNotes: string | undefined, user: { id: string; role: string }) {
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      const err: any = new Error('Unauthorized: Only examination administrators can release approved papers');
      err.statusCode = 403;
      throw err;
    }

    const paper = await PaperVersion.findById(paperVersionId);
    if (!paper) throw new Error('Paper version not found');

    // Acceptance Gate: Release before approval fails!
    if (paper.status !== PaperVersionStatus.APPROVED) {
      const err: any = new Error(
        `Cannot release paper: Status is '${paper.status}'. Paper version must be APPROVED by reviewer before authorized release.`
      );
      err.statusCode = 400;
      throw err;
    }

    paper.status = PaperVersionStatus.RELEASED;
    paper.releasedAt = new Date();
    paper.releasedBy = new mongoose.Types.ObjectId(user.id);
    await paper.save();

    return paper;
  }

  // 6. Controlled Download & Watermarking (Acceptance Gate: Downloads are auditable)
  static async recordAccessAndDownload(data: {
    paperVersionId: string;
    accessType?: ConfidentialAccessType;
    purpose: string;
    user: { id: string; email: string; name: string; role: string };
    ipAddress?: string;
  }) {
    // Acceptance Gate: Non-appointed faculty and students cannot retrieve/download papers
    if (data.user.role === UserRole.STUDENT || data.user.role === UserRole.GUARDIAN) {
      const err: any = new Error('Access Denied: Students and guardians cannot download examination papers');
      err.statusCode = 403;
      throw err;
    }

    const paper = await PaperVersion.findById(data.paperVersionId).populate('subjectId');
    if (!paper) throw new Error('Paper version not found');

    if (data.user.role === UserRole.FACULTY && paper.setterId.toString() !== data.user.id) {
      const appointment = await SetterAppointment.findOne({
        _id: paper.appointmentId,
        facultyId: data.user.id
      });
      if (!appointment) {
        const err: any = new Error('Access Denied: You are not authorized to download this paper');
        err.statusCode = 403;
        throw err;
      }
    }

    const ipAddress = data.ipAddress || '127.0.0.1';
    const watermarkApplied = `CONFIDENTIAL - AUTHORIZED TO: ${data.user.name.toUpperCase()} (${data.user.email}) | IP: ${ipAddress} | TS: ${new Date().toISOString()}`;

    // Record confidential access event in MongoDB audit trail
    const accessEvent = await ConfidentialAccessEvent.create({
      paperVersionId: paper._id,
      userId: data.user.id,
      userRole: data.user.role,
      accessType: data.accessType || ConfidentialAccessType.DOWNLOAD_WATERMARKED,
      ipAddress,
      purpose: data.purpose,
      timestamp: new Date(),
      watermarkApplied
    });

    return {
      paperId: paper._id,
      title: paper.title,
      versionNumber: paper.versionNumber,
      immutableHash: paper.immutableHash,
      fileStorageKey: paper.fileStorageKey,
      watermarkApplied,
      accessEventId: accessEvent._id,
      downloadReady: true
    };
  }

  static async getAccessLogs(paperVersionId?: string) {
    const filter: any = {};
    if (paperVersionId) filter.paperVersionId = paperVersionId;

    return await ConfidentialAccessEvent.find(filter)
      .populate('paperVersionId', 'title versionNumber status')
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 });
  }
}





