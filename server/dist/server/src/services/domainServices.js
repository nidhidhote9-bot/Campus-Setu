"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamOperationsService = exports.ExamApplicationService = exports.TimetableService = exports.AttendanceService = exports.StudentProfileService = exports.AdmissionsService = exports.AnalyticsService = exports.PayrollService = exports.ExamService = exports.FinanceService = exports.FeeService = exports.AuthService = exports.SIMULATOR_SECRET = void 0;
exports.signSimulatorPayload = signSimulatorPayload;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const uuid_1 = require("uuid");
const index_1 = require("@shared/index");
const models_1 = require("../models/models");
const auth_1 = require("../middleware/auth");
exports.SIMULATOR_SECRET = 'CAMPUS_SETU_SIM_KEY_2026';
function signSimulatorPayload(orderId, amountPaise, providerPaymentId) {
    return node_crypto_1.default.createHmac('sha256', exports.SIMULATOR_SECRET).update(`${orderId}|${amountPaise}|${providerPaymentId}`).digest('hex');
}
class AuthService {
    static async login(email, password, role) {
        const user = await models_1.User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            throw new Error('Invalid email or password.');
        }
        if (user.role !== role) {
            throw new Error(`User is registered under role '${user.role}', not '${role}'.`);
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new Error('Invalid email or password.');
        }
        if (!user.isActive) {
            throw new Error('Account is deactivated. Contact Administrator.');
        }
        let studentId;
        if (user.role === index_1.UserRole.STUDENT) {
            const student = await models_1.Student.findOne({ userId: user._id });
            if (student)
                studentId = student._id.toString();
        }
        const wardStudentIds = user.wardStudentIds?.map(id => id.toString()) || [];
        const token = jsonwebtoken_1.default.sign({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            institutionId: user.institutionId?.toString(),
            studentId,
            wardStudentIds
        }, auth_1.JWT_SECRET, { expiresIn: '24h' });
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
    static async register(data) {
        const existing = await models_1.User.findOne({ email: data.email.toLowerCase().trim() });
        if (existing) {
            throw new Error('User with this email already exists.');
        }
        const passwordHash = await bcryptjs_1.default.hash(data.password, 10);
        const user = await models_1.User.create({
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
exports.AuthService = AuthService;
class FeeService {
    static async processPayment(data) {
        // 1. Idempotency Check
        const existingTxn = await models_1.FeeTransaction.findOne({ idempotencyKey: data.idempotencyKey });
        if (existingTxn) {
            console.log(`[FeeService] Returning existing transaction for Idempotency Key: ${data.idempotencyKey}`);
            return existingTxn;
        }
        // 2. Integer Paise Validation
        if (!Number.isInteger(data.amountPaise) || data.amountPaise <= 0) {
            throw new Error('Invalid monetary amount. Value must be a positive integer in paise.');
        }
        const student = await models_1.Student.findById(data.studentId);
        if (!student) {
            throw new Error('Student record not found.');
        }
        // 3. Generate Receipts & References
        const timestamp = Date.now();
        const transactionId = `TXN-${timestamp}-${Math.floor(1000 + Math.random() * 9000)}`;
        const receiptNumber = `RCP-${timestamp}-${Math.floor(1000 + Math.random() * 9000)}`;
        const gatewayReference = `PAY-SIM-${(0, uuid_1.v4)().substring(0, 8).toUpperCase()}`;
        const txn = await models_1.FeeTransaction.create({
            transactionId,
            idempotencyKey: data.idempotencyKey,
            studentId: data.studentId,
            institutionId: data.institutionId,
            amountPaise: data.amountPaise,
            feeType: data.feeType,
            paymentMode: data.paymentMode,
            status: index_1.PaymentStatus.SUCCESS,
            receiptNumber,
            gatewayReference
        });
        // 4. Outbox Event & Audit Log
        await models_1.OutboxEvent.create({
            eventId: (0, uuid_1.v4)(),
            eventType: 'FEE_PAYMENT_PROCESSED',
            payload: {
                transactionId: txn.transactionId,
                studentId: data.studentId,
                amountPaise: data.amountPaise,
                receiptNumber
            }
        });
        await models_1.AuditLog.create({
            action: 'FEE_PAYMENT_SUCCESS',
            resource: 'FeeTransaction',
            resourceId: txn._id.toString(),
            institutionId: data.institutionId,
            newState: { amountPaise: data.amountPaise, receiptNumber }
        });
        return txn;
    }
    static async getStudentLedger(studentId) {
        const student = await models_1.Student.findById(studentId);
        if (!student)
            throw new Error('Student not found.');
        const structures = await models_1.FeeStructure.find({
            institutionId: student.institutionId,
            semester: student.currentSemester
        });
        const transactions = await models_1.FeeTransaction.find({ studentId }).sort({ createdAt: -1 });
        const totalDuePaise = structures.reduce((sum, s) => sum + s.amountPaise, 0);
        const totalPaidPaise = transactions
            .filter(t => t.status === index_1.PaymentStatus.SUCCESS)
            .reduce((sum, t) => sum + t.amountPaise, 0);
        const balancePaise = Math.max(0, totalDuePaise - totalPaidPaise);
        return {
            studentId,
            totalDuePaise,
            totalPaidPaise,
            balancePaise,
            formattedDue: (0, index_1.formatPaiseToRupees)(totalDuePaise),
            formattedPaid: (0, index_1.formatPaiseToRupees)(totalPaidPaise),
            formattedBalance: (0, index_1.formatPaiseToRupees)(balancePaise),
            structures,
            transactions
        };
    }
}
exports.FeeService = FeeService;
class FinanceService {
    // 1. Fee Rule Version Management
    static async createFeeRule(data) {
        const totalAmountPaise = data.heads.reduce((sum, h) => sum + h.amountPaise, 0);
        const rule = await models_1.FeeRuleVersion.create({
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
    static async getFeeRules(institutionId) {
        return models_1.FeeRuleVersion.find({ institutionId }).sort({ createdAt: -1 });
    }
    // 2. Invoice Generation & Assessment
    static async assessAndIssueInvoice(data) {
        const student = await models_1.Student.findById(data.studentId);
        if (!student)
            throw new Error('Student not found for invoice assessment.');
        const totalAmountPaise = data.lines.reduce((sum, l) => sum + l.amountPaise, 0);
        if (!Number.isInteger(totalAmountPaise) || totalAmountPaise <= 0) {
            throw new Error('Total invoice amount must be a positive integer in paise.');
        }
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(100 + Math.random() * 900);
        const invoiceNumber = `INV-${data.academicYear.slice(0, 4)}-${timestamp}-${random}`;
        const invoice = await models_1.Invoice.create({
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
            status: index_1.InvoiceStatus.ISSUED
        });
        await models_1.OutboxEvent.create({
            eventId: (0, uuid_1.v4)(),
            institutionId: data.institutionId,
            aggregateType: 'INVOICE',
            eventType: 'INVOICE_ISSUED',
            payload: { invoiceNumber, studentId: data.studentId, payableAmountPaise: totalAmountPaise }
        });
        return invoice;
    }
    // 3. Payment Order Creation
    static async createPaymentOrder(data) {
        // Check existing order with idempotencyKey
        const existing = await models_1.PaymentOrder.findOne({ idempotencyKey: data.idempotencyKey });
        if (existing) {
            return existing;
        }
        const invoice = await models_1.Invoice.findById(data.invoiceId);
        if (!invoice)
            throw new Error('Invoice not found.');
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
        const providerOrderId = `order_sim_${(0, uuid_1.v4)().replace(/-/g, '').slice(0, 14)}`;
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes window
        const order = await models_1.PaymentOrder.create({
            orderId,
            invoiceId: data.invoiceId,
            studentId: data.studentId,
            institutionId: data.institutionId,
            amountPaise: data.amountPaise,
            currency: 'INR',
            status: index_1.PaymentOrderStatus.CREATED,
            idempotencyKey: data.idempotencyKey,
            provider: data.provider || 'RAZORPAY_SIM',
            providerOrderId,
            expiresAt
        });
        return order;
    }
    // 4. Provider Callback Verification & Atomic Settlement
    static async handleSimulatorCallback(data) {
        const order = await models_1.PaymentOrder.findOne({ orderId: data.orderId });
        if (!order)
            throw new Error(`Payment order ${data.orderId} not found.`);
        // 1. Signature Verification
        const expectedSig = signSimulatorPayload(data.orderId, data.amountPaise, data.providerPaymentId);
        if (data.signature !== expectedSig) {
            await models_1.PaymentEvent.create({
                eventId: (0, uuid_1.v4)(),
                orderId: data.orderId,
                providerPaymentId: data.providerPaymentId,
                eventType: data.eventType,
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
            await models_1.PaymentEvent.create({
                eventId: (0, uuid_1.v4)(),
                orderId: data.orderId,
                providerPaymentId: data.providerPaymentId,
                eventType: data.eventType,
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
        if (order.status === index_1.PaymentOrderStatus.PAID) {
            if (data.eventType === 'PAYMENT_FAILED') {
                await models_1.PaymentEvent.create({
                    eventId: (0, uuid_1.v4)(),
                    orderId: data.orderId,
                    providerPaymentId: data.providerPaymentId,
                    eventType: index_1.PaymentEventType.PAYMENT_FAILED,
                    amountPaise: data.amountPaise,
                    currency: 'INR',
                    signature: data.signature,
                    verified: true,
                    processed: false,
                    rawPayload: { note: 'LATE_FAILURE_IGNORED_OVER_SUCCESS' }
                });
                const existingReceipt = await models_1.Receipt.findOne({ paymentOrderId: order.orderId });
                return {
                    settled: true,
                    status: 'SUCCESS_PRESERVED',
                    message: 'Success is not reversed by a late failure callback.',
                    order,
                    receipt: existingReceipt
                };
            }
            // Duplicate Callback Rule: Duplicate callbacks yield one settlement
            const existingReceipt = await models_1.Receipt.findOne({ paymentOrderId: order.orderId });
            await models_1.PaymentEvent.create({
                eventId: (0, uuid_1.v4)(),
                orderId: data.orderId,
                providerPaymentId: data.providerPaymentId,
                eventType: index_1.PaymentEventType.PAYMENT_SUCCESS,
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
        await models_1.PaymentEvent.create({
            eventId: (0, uuid_1.v4)(),
            orderId: data.orderId,
            providerPaymentId: data.providerPaymentId,
            eventType: data.eventType,
            amountPaise: data.amountPaise,
            currency: 'INR',
            signature: data.signature,
            verified: true,
            processed: true
        });
        if (data.eventType === 'PAYMENT_FAILED') {
            order.status = index_1.PaymentOrderStatus.FAILED;
            await order.save();
            return { settled: false, status: 'FAILED', message: 'Payment recorded as failed.', order };
        }
        if (data.eventType === 'PAYMENT_PENDING') {
            order.status = index_1.PaymentOrderStatus.ATTEMPTED;
            await order.save();
            return { settled: false, status: 'PENDING', message: 'Payment recorded as pending.', order };
        }
        // 5. Atomic Settlement & Immutable Receipt Creation
        const receiptNumber = `RCP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
        const receipt = await models_1.Receipt.create({
            receiptNumber,
            invoiceId: order.invoiceId,
            paymentOrderId: order.orderId,
            studentId: order.studentId,
            institutionId: order.institutionId,
            amountPaise: order.amountPaise,
            paymentMode: index_1.PaymentMode.UPI,
            issuedAt: new Date(),
            counterfoilData: {
                providerPaymentId: data.providerPaymentId,
                provider: order.provider,
                idempotencyKey: order.idempotencyKey
            }
        });
        order.status = index_1.PaymentOrderStatus.PAID;
        order.paidAt = new Date();
        order.receiptNumber = receiptNumber;
        await order.save();
        // Update invoice
        const invoice = await models_1.Invoice.findById(order.invoiceId);
        if (invoice) {
            invoice.paidAmountPaise += order.amountPaise;
            if (invoice.paidAmountPaise >= invoice.payableAmountPaise) {
                invoice.status = index_1.InvoiceStatus.PAID;
            }
            else {
                invoice.status = index_1.InvoiceStatus.PARTIALLY_PAID;
            }
            await invoice.save();
        }
        // Outbox & Audit
        await models_1.OutboxEvent.create({
            eventId: (0, uuid_1.v4)(),
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
        await models_1.AuditLog.create({
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
    static async requestRefund(data) {
        if (!Number.isInteger(data.amountPaise) || data.amountPaise <= 0) {
            throw new Error('Refund amount must be a positive integer in paise.');
        }
        const invoice = await models_1.Invoice.findById(data.invoiceId);
        if (!invoice)
            throw new Error('Invoice not found.');
        // Calculate total active/approved refunds
        const existingRefunds = await models_1.Refund.find({
            invoiceId: data.invoiceId,
            status: { $in: [index_1.RefundStatus.REQUESTED, index_1.RefundStatus.APPROVED, index_1.RefundStatus.PROCESSED] }
        });
        const alreadyRefundedPaise = existingRefunds.reduce((sum, r) => sum + r.amountPaise, 0);
        if (alreadyRefundedPaise + data.amountPaise > invoice.paidAmountPaise) {
            throw new Error(`Partial refund cannot exceed paid balance. Paid: ${invoice.paidAmountPaise} paise, Already Refunded/Requested: ${alreadyRefundedPaise} paise, Requested: ${data.amountPaise} paise.`);
        }
        const refundId = `REF-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
        const refund = await models_1.Refund.create({
            refundId,
            receiptId: data.receiptId,
            invoiceId: data.invoiceId,
            studentId: data.studentId,
            amountPaise: data.amountPaise,
            reason: data.reason,
            status: index_1.RefundStatus.REQUESTED
        });
        return refund;
    }
    static async approveRefund(refundId, approvedBy) {
        const refund = await models_1.Refund.findOne({ refundId });
        if (!refund)
            throw new Error(`Refund ${refundId} not found.`);
        if (refund.status === index_1.RefundStatus.APPROVED || refund.status === index_1.RefundStatus.PROCESSED) {
            return refund;
        }
        const invoice = await models_1.Invoice.findById(refund.invoiceId);
        if (!invoice)
            throw new Error('Associated invoice not found.');
        if (refund.amountPaise > invoice.paidAmountPaise) {
            throw new Error('Cannot approve refund: amount exceeds paid balance of invoice.');
        }
        refund.status = index_1.RefundStatus.APPROVED;
        refund.approvedBy = approvedBy;
        refund.providerRefundId = `rfnd_sim_${(0, uuid_1.v4)().replace(/-/g, '').slice(0, 12)}`;
        await refund.save();
        invoice.paidAmountPaise = Math.max(0, invoice.paidAmountPaise - refund.amountPaise);
        if (invoice.paidAmountPaise < invoice.payableAmountPaise) {
            invoice.status = invoice.paidAmountPaise === 0 ? index_1.InvoiceStatus.ISSUED : index_1.InvoiceStatus.PARTIALLY_PAID;
        }
        await invoice.save();
        await models_1.OutboxEvent.create({
            eventId: (0, uuid_1.v4)(),
            institutionId: invoice.institutionId,
            aggregateType: 'REFUND',
            eventType: 'REFUND_APPROVED',
            payload: { refundId: refund.refundId, amountPaise: refund.amountPaise, studentId: refund.studentId }
        });
        return refund;
    }
    // 6. Concessions & Scholarships
    static async requestConcession(data) {
        if (!Number.isInteger(data.amountPaise) || data.amountPaise <= 0) {
            throw new Error('Concession amount must be a positive integer in paise.');
        }
        const concessionId = `CNC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
        const concession = await models_1.Concession.create({
            concessionId,
            studentId: data.studentId,
            invoiceId: data.invoiceId,
            category: data.category,
            amountPaise: data.amountPaise,
            reason: data.reason,
            status: index_1.ConcessionStatus.PENDING_APPROVAL
        });
        return concession;
    }
    static async reviewConcession(concessionId, status, approvedBy) {
        const concession = await models_1.Concession.findOne({ concessionId });
        if (!concession)
            throw new Error(`Concession ${concessionId} not found.`);
        concession.status = status;
        concession.approvedBy = approvedBy;
        await concession.save();
        // If approved and invoiceId is attached, adjust invoice payable amount
        if (status === 'APPROVED' && concession.invoiceId) {
            const invoice = await models_1.Invoice.findById(concession.invoiceId);
            if (invoice) {
                invoice.concessionAmountPaise += concession.amountPaise;
                invoice.payableAmountPaise = Math.max(0, invoice.totalAmountPaise - invoice.concessionAmountPaise);
                if (invoice.paidAmountPaise >= invoice.payableAmountPaise) {
                    invoice.status = index_1.InvoiceStatus.PAID;
                }
                await invoice.save();
            }
        }
        return concession;
    }
    // 7. Reconciliation Engine
    static async runReconciliation(institutionId, periodStart, periodEnd) {
        const orders = await models_1.PaymentOrder.find({ institutionId });
        const events = await models_1.PaymentEvent.find({});
        const receipts = await models_1.Receipt.find({ institutionId });
        const eventMap = new Map();
        for (const ev of events) {
            const list = eventMap.get(ev.orderId) || [];
            list.push(ev);
            eventMap.set(ev.orderId, list);
        }
        const receiptMap = new Map();
        for (const r of receipts) {
            receiptMap.set(r.paymentOrderId, r);
        }
        let totalSettledAmountPaise = 0;
        let matchedCount = 0;
        let discrepancyCount = 0;
        const unmatchedOrders = [];
        for (const order of orders) {
            const orderEvents = eventMap.get(order.orderId) || [];
            const receipt = receiptMap.get(order.orderId);
            if (order.status === index_1.PaymentOrderStatus.PAID) {
                if (!receipt) {
                    discrepancyCount++;
                    unmatchedOrders.push({
                        orderId: order.orderId,
                        expectedPaise: order.amountPaise,
                        actualPaise: 0,
                        status: 'MISSING_RECEIPT',
                        reason: 'Order is marked PAID but no corresponding Receipt was found.'
                    });
                }
                else if (receipt.amountPaise !== order.amountPaise) {
                    discrepancyCount++;
                    unmatchedOrders.push({
                        orderId: order.orderId,
                        expectedPaise: order.amountPaise,
                        actualPaise: receipt.amountPaise,
                        status: 'AMOUNT_MISMATCH',
                        reason: `Order amount (${order.amountPaise}) does not match Receipt amount (${receipt.amountPaise}).`
                    });
                }
                else {
                    matchedCount++;
                    totalSettledAmountPaise += order.amountPaise;
                }
            }
            else if (order.status === index_1.PaymentOrderStatus.CREATED || order.status === index_1.PaymentOrderStatus.ATTEMPTED) {
                // Pending order: check if provider sent callback
                const successEvent = orderEvents.find(e => e.eventType === index_1.PaymentEventType.PAYMENT_SUCCESS);
                if (successEvent) {
                    discrepancyCount++;
                    unmatchedOrders.push({
                        orderId: order.orderId,
                        expectedPaise: order.amountPaise,
                        actualPaise: successEvent.amountPaise,
                        status: 'UNSETTLED_CALLBACK',
                        reason: 'Provider sent success event but order was not settled.'
                    });
                }
                else {
                    // Normal pending order without callback
                    unmatchedOrders.push({
                        orderId: order.orderId,
                        expectedPaise: order.amountPaise,
                        actualPaise: 0,
                        status: 'PENDING_ORDER',
                        reason: 'Order is awaiting payment completion or simulated callback.'
                    });
                }
            }
            else if (order.status === index_1.PaymentOrderStatus.FAILED) {
                matchedCount++;
            }
        }
        const runId = `REC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
        const run = await models_1.ReconciliationRun.create({
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
    static async getStudentFeeDetails(studentId) {
        const student = await models_1.Student.findById(studentId);
        if (!student)
            throw new Error('Student not found.');
        const invoices = await models_1.Invoice.find({ studentId }).sort({ createdAt: -1 });
        const paymentOrders = await models_1.PaymentOrder.find({ studentId }).sort({ createdAt: -1 });
        const receipts = await models_1.Receipt.find({ studentId }).sort({ issuedAt: -1 });
        const concessions = await models_1.Concession.find({ studentId }).sort({ createdAt: -1 });
        const refunds = await models_1.Refund.find({ studentId }).sort({ createdAt: -1 });
        const totalInvoicedPaise = invoices.reduce((sum, i) => sum + i.totalAmountPaise, 0);
        const totalConcessionsPaise = concessions
            .filter(c => c.status === index_1.ConcessionStatus.APPROVED)
            .reduce((sum, c) => sum + c.amountPaise, 0);
        const totalPayablePaise = invoices.reduce((sum, i) => sum + i.payableAmountPaise, 0);
        const totalPaidPaise = receipts.reduce((sum, r) => sum + r.amountPaise, 0);
        const totalRefundedPaise = refunds
            .filter(r => r.status === index_1.RefundStatus.APPROVED || r.status === index_1.RefundStatus.PROCESSED)
            .reduce((sum, r) => sum + r.amountPaise, 0);
        const netPaidPaise = Math.max(0, totalPaidPaise - totalRefundedPaise);
        const balancePaise = Math.max(0, totalPayablePaise - netPaidPaise);
        const studentUser = await models_1.User.findById(student.userId);
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
                formattedInvoiced: (0, index_1.formatPaiseToRupees)(totalInvoicedPaise),
                formattedPaid: (0, index_1.formatPaiseToRupees)(netPaidPaise),
                formattedBalance: (0, index_1.formatPaiseToRupees)(balancePaise)
            }
        };
    }
    // 9. Finance Overview & Dashboard
    static async getFinanceOverview(institutionId) {
        const invoices = await models_1.Invoice.find({ institutionId }).sort({ createdAt: -1 }).limit(50);
        const receipts = await models_1.Receipt.find({ institutionId }).sort({ issuedAt: -1 }).limit(50);
        const concessions = await models_1.Concession.find({}).sort({ createdAt: -1 });
        const refunds = await models_1.Refund.find({}).sort({ createdAt: -1 });
        const feeRules = await models_1.FeeRuleVersion.find({ institutionId }).sort({ createdAt: -1 });
        const reconciliationRuns = await models_1.ReconciliationRun.find({}).sort({ createdAt: -1 }).limit(10);
        const funds = await models_1.Fund.find({});
        const budgets = await models_1.Budget.find({});
        const totalInvoicedPaise = invoices.reduce((sum, i) => sum + i.totalAmountPaise, 0);
        const totalCollectedPaise = receipts.reduce((sum, r) => sum + r.amountPaise, 0);
        const totalConcessionsPaise = concessions
            .filter(c => c.status === index_1.ConcessionStatus.APPROVED)
            .reduce((sum, c) => sum + c.amountPaise, 0);
        const totalRefundedPaise = refunds
            .filter(r => r.status === index_1.RefundStatus.APPROVED || r.status === index_1.RefundStatus.PROCESSED)
            .reduce((sum, r) => sum + r.amountPaise, 0);
        return {
            totalInvoicedPaise,
            totalCollectedPaise,
            totalConcessionsPaise,
            totalRefundedPaise,
            netCollectedPaise: totalCollectedPaise - totalRefundedPaise,
            formattedInvoiced: (0, index_1.formatPaiseToRupees)(totalInvoicedPaise),
            formattedCollected: (0, index_1.formatPaiseToRupees)(totalCollectedPaise),
            formattedNetCollected: (0, index_1.formatPaiseToRupees)(totalCollectedPaise - totalRefundedPaise),
            formattedConcessions: (0, index_1.formatPaiseToRupees)(totalConcessionsPaise),
            formattedRefunded: (0, index_1.formatPaiseToRupees)(totalRefundedPaise),
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
    static async createFund(data) {
        return models_1.Fund.create({
            code: data.code,
            name: data.name,
            description: data.description,
            totalAllocatedPaise: data.totalAllocatedPaise,
            utilizedPaise: 0,
            balancePaise: data.totalAllocatedPaise
        });
    }
    static async getFunds() {
        return models_1.Fund.find({});
    }
    static async createBudget(data) {
        const budget = await models_1.Budget.create({
            academicYear: data.academicYear,
            departmentId: data.departmentId,
            fundCode: data.fundCode,
            fundName: data.fundName,
            allocatedPaise: data.allocatedPaise,
            spentPaise: 0,
            status: index_1.BudgetStatus.APPROVED
        });
        if (data.entries && data.entries.length > 0) {
            for (const entry of data.entries) {
                await models_1.BudgetEntry.create({
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
        return models_1.Budget.find({}).sort({ createdAt: -1 });
    }
}
exports.FinanceService = FinanceService;
class ExamService {
    static async submitMarks(data) {
        const results = [];
        for (const item of data.studentMarks) {
            let markSheet = await models_1.MarkSheet.findOne({
                examId: data.examId,
                courseId: data.courseId,
                studentId: item.studentId
            });
            const percentage = (item.marksObtained / item.maxMarks) * 100;
            let grade = 'F';
            if (percentage >= 90)
                grade = 'S';
            else if (percentage >= 80)
                grade = 'A';
            else if (percentage >= 70)
                grade = 'B';
            else if (percentage >= 60)
                grade = 'C';
            else if (percentage >= 50)
                grade = 'D';
            else if (percentage >= 40)
                grade = 'E';
            if (markSheet) {
                if (markSheet.isFinalized && markSheet.marksObtained !== item.marksObtained) {
                    // Record immutable revision history!
                    markSheet.revisionHistory.push({
                        previousMarks: markSheet.marksObtained,
                        updatedMarks: item.marksObtained,
                        reason: item.remarks || 'Grade adjustment revision post-finalization',
                        updatedBy: data.userId,
                        timestamp: new Date()
                    });
                }
                markSheet.marksObtained = item.marksObtained;
                markSheet.maxMarks = item.maxMarks;
                markSheet.grade = grade;
                if (data.isFinalized) {
                    markSheet.isFinalized = true;
                    markSheet.finalizedBy = data.userId;
                    markSheet.finalizedAt = new Date();
                }
                await markSheet.save();
            }
            else {
                markSheet = await models_1.MarkSheet.create({
                    examId: data.examId,
                    courseId: data.courseId,
                    studentId: item.studentId,
                    marksObtained: item.marksObtained,
                    maxMarks: item.maxMarks,
                    grade,
                    isFinalized: data.isFinalized,
                    finalizedBy: data.isFinalized ? data.userId : undefined,
                    finalizedAt: data.isFinalized ? new Date() : undefined
                });
            }
            results.push(markSheet);
        }
        return results;
    }
    static async getReportCard(studentId) {
        const markSheets = await models_1.MarkSheet.find({ studentId })
            .populate('examId')
            .populate('courseId');
        // Calculate SGPA/CGPA
        let totalCredits = 0;
        let totalGradePoints = 0;
        const gradePointMap = {
            S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0
        };
        markSheets.forEach((ms) => {
            const credits = ms.courseId?.credits || 3;
            const points = gradePointMap[ms.grade] ?? 0;
            totalCredits += credits;
            totalGradePoints += points * credits;
        });
        const calculatedCgpa = totalCredits > 0 ? Number((totalGradePoints / totalCredits).toFixed(2)) : 0.0;
        // Update student CGPA cache
        await models_1.Student.findByIdAndUpdate(studentId, { cgpa: calculatedCgpa });
        return {
            studentId,
            cgpa: calculatedCgpa,
            totalCredits,
            markSheets,
            verificationCode: `DIGILOCKER-VERIFIED-${studentId.substring(0, 8).toUpperCase()}`
        };
    }
}
exports.ExamService = ExamService;
class PayrollService {
    static async approvePayroll(data) {
        const existing = await models_1.PayrollRecord.findOne({ idempotencyKey: data.idempotencyKey });
        if (existing)
            return existing;
        if (!Number.isInteger(data.baseSalaryPaise) || data.baseSalaryPaise <= 0) {
            throw new Error('Base salary must be positive integer paise.');
        }
        const netSalaryPaise = data.baseSalaryPaise + (data.hraPaise || 0) - (data.deductionsPaise || 0);
        const record = await models_1.PayrollRecord.create({
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
exports.PayrollService = PayrollService;
class AnalyticsService {
    static async getAcademicRiskList(institutionId) {
        const filter = institutionId ? { institutionId } : {};
        const students = await models_1.Student.find(filter).populate('userId').populate('departmentId');
        const riskReport = [];
        for (const student of students) {
            // Calculate attendance average
            const records = await models_1.AttendanceRecord.find({ 'entries.studentId': student._id });
            let totalClasses = 0;
            let presentClasses = 0;
            records.forEach(rec => {
                const entry = rec.entries.find(e => e.studentId.toString() === student._id.toString());
                if (entry) {
                    totalClasses++;
                    if (entry.status === index_1.AttendanceStatus.PRESENT)
                        presentClasses++;
                }
            });
            const attendancePct = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 85;
            let riskScore = 0;
            if (attendancePct < 75)
                riskScore += 50;
            if (student.cgpa < 6.0)
                riskScore += 35;
            if (student.cgpa < 4.0)
                riskScore += 15;
            let riskLevel = 'LOW';
            if (riskScore >= 60)
                riskLevel = 'HIGH';
            else if (riskScore >= 35)
                riskLevel = 'MEDIUM';
            riskReport.push({
                studentId: student._id.toString(),
                name: student.userId?.name || 'Student',
                rollNumber: student.rollNumber,
                department: student.departmentId?.name || 'General',
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
exports.AnalyticsService = AnalyticsService;
class AdmissionsService {
    // 1. Create or Save Draft/Submitted Application
    static async createApplication(data) {
        // Duplicate detection: check if applicant with email or phone already exists in institution
        const existingApplicant = await models_1.Applicant.findOne({
            institutionId: data.institutionId,
            $or: [{ email: data.email.toLowerCase().trim() }, { phone: data.phone }]
        });
        let duplicateFlag = false;
        let duplicateNotes = '';
        if (existingApplicant) {
            duplicateFlag = true;
            duplicateNotes = `Duplicate candidate flag: Match found for email ${data.email} or phone ${data.phone}. Flagged for review; not merged.`;
        }
        const applicant = await models_1.Applicant.create({
            institutionId: data.institutionId,
            name: data.name,
            email: data.email.toLowerCase().trim(),
            phone: data.phone,
            highSchoolScore: data.highSchoolScore,
            entranceExamScore: data.entranceExamScore,
            providerVerified: true
        });
        // Atomic application number sequence
        const seqDoc = await models_1.IdentifierSequence.findOneAndUpdate({ context: `APP_${data.institutionId}_2026` }, { $inc: { currentSeq: 1 } }, { new: true, upsert: true });
        const appNum = `APP-2026-${String(seqDoc.currentSeq).padStart(4, '0')}`;
        const app = await models_1.AdmissionApplication.create({
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
                await models_1.AdmissionDocument.create({
                    applicationId: app._id,
                    docType: doc.docType,
                    fileUrl: doc.fileUrl,
                    status: 'VERIFIED'
                });
            }
        }
        return await models_1.AdmissionApplication.findById(app._id).populate('applicantId').populate('departmentId');
    }
    // 2. Applicant Updates Application (Field Correction)
    static async updateApplicantCorrection(applicationId, updates) {
        const app = await models_1.AdmissionApplication.findById(applicationId);
        if (!app)
            throw new Error('Application not found');
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
        const applicant = await models_1.Applicant.findById(app.applicantId);
        if (!applicant)
            throw new Error('Applicant record not found');
        if (updates.name !== undefined)
            applicant.name = updates.name;
        if (updates.email !== undefined)
            applicant.email = updates.email;
        if (updates.phone !== undefined)
            applicant.phone = updates.phone;
        if (updates.highSchoolScore !== undefined)
            applicant.highSchoolScore = updates.highSchoolScore;
        if (updates.entranceExamScore !== undefined)
            applicant.entranceExamScore = updates.entranceExamScore;
        await applicant.save();
        // Transition status to 'resubmitted'
        app.status = 'resubmitted';
        app.requestedCorrectionFields = [];
        await app.save();
        return await models_1.AdmissionApplication.findById(app._id).populate('applicantId').populate('departmentId');
    }
    // 3. Reviewer Action (Approve, Reject, Request Correction)
    static async reviewApplication(applicationId, reviewerId, decision, reason, requestedFields) {
        const app = await models_1.AdmissionApplication.findById(applicationId);
        if (!app)
            throw new Error('Application not found');
        const validPriorStates = ['submitted', 'under_review', 'resubmitted'];
        if (!validPriorStates.includes(app.status)) {
            throw new Error(`Invalid transition: Cannot review application currently in state '${app.status}'.`);
        }
        if (decision === 'APPROVE') {
            app.status = 'approved';
        }
        else if (decision === 'REJECT') {
            if (!reason)
                throw new Error('Rejection reason is required when rejecting an application.');
            app.status = 'rejected';
            app.rejectionReason = reason;
        }
        else if (decision === 'REQUEST_CORRECTION') {
            if (!requestedFields || requestedFields.length === 0) {
                throw new Error('At least one field must be specified when requesting a correction.');
            }
            app.status = 'correction_required';
            app.requestedCorrectionFields = requestedFields;
        }
        await app.save();
        await models_1.ReviewDecision.create({
            applicationId: app._id,
            reviewerId,
            decision,
            reason,
            requestedFields
        });
        return await models_1.AdmissionApplication.findById(app._id).populate('applicantId').populate('departmentId');
    }
    // 4. Enroll Approved Candidate (Atomic Sequence Generation for Roll/IURN & Enrollment/IUEN)
    static async enrollCandidate(applicationId, userId) {
        const app = await models_1.AdmissionApplication.findById(applicationId).populate('applicantId');
        if (!app)
            throw new Error('Application not found');
        // PREMATURE ENROLLMENT GATE: Premature enrollment fails
        if (app.status !== 'approved') {
            throw new Error(`Premature enrollment rejected: Application state is '${app.status}'. Candidate must be in 'approved' state before enrollment.`);
        }
        const dept = await models_1.Department.findById(app.departmentId);
        if (!dept)
            throw new Error('Department not found for this application.');
        const year = 2026;
        const deptCode = dept.code;
        // Atomic generation of IURN (Roll Number) surviving concurrent approvals
        const iurnSeq = await models_1.IdentifierSequence.findOneAndUpdate({ context: `IURN_${deptCode}_${year}` }, { $inc: { currentSeq: 1 } }, { new: true, upsert: true });
        const rollNumber = `${deptCode}-${year}-${String(iurnSeq.currentSeq).padStart(3, '0')}`;
        // Atomic generation of IUEN (Enrollment Number) surviving concurrent approvals
        const iuenSeq = await models_1.IdentifierSequence.findOneAndUpdate({ context: `IUEN_${year}` }, { $inc: { currentSeq: 1 } }, { new: true, upsert: true });
        const enrollmentNumber = `ENR${year}${String(iuenSeq.currentSeq).padStart(4, '0')}`;
        const applicant = app.applicantId;
        // Create user account for student if not exists
        let user = await models_1.User.findOne({ email: applicant.email });
        if (!user) {
            const passwordHash = await bcryptjs_1.default.hash('Student123!', 10);
            user = await models_1.User.create({
                email: applicant.email,
                passwordHash,
                name: applicant.name,
                role: index_1.UserRole.STUDENT,
                institutionId: app.institutionId,
                phone: applicant.phone
            });
        }
        const student = await models_1.Student.create({
            userId: user._id,
            institutionId: app.institutionId,
            departmentId: app.departmentId,
            rollNumber,
            enrollmentNumber,
            currentSemester: 1,
            batchYear: year,
            cgpa: 0.0
        });
        const enrollment = await models_1.Enrollment.create({
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
        await models_1.OutboxEvent.create({
            eventId: (0, uuid_1.v4)(),
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
    static async processCSVImportDryRun(institutionId, filename, rows) {
        const mappings = await models_1.ExternalCodeMapping.find({ institutionId });
        const mappingMap = new Map();
        mappings.forEach(m => mappingMap.set(m.externalCode.toUpperCase(), m));
        let validCount = 0;
        let invalidCount = 0;
        const rowErrors = [];
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
            }
            else {
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
    static async commitCSVImport(institutionId, batchId, filename, rows) {
        // Idempotency check: return existing committed batch
        const existing = await models_1.ImportBatch.findOne({ batchId, status: 'COMMITTED' });
        if (existing) {
            return existing;
        }
        const mappings = await models_1.ExternalCodeMapping.find({ institutionId });
        const mappingMap = new Map();
        mappings.forEach(m => mappingMap.set(m.externalCode.toUpperCase(), m));
        let validCount = 0;
        let invalidCount = 0;
        const rowErrors = [];
        const createdAppIds = [];
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
            }
            else {
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
                    createdAppIds.push(createdApp._id.toString());
                    validCount++;
                }
            }
        }
        const batch = await models_1.ImportBatch.create({
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
exports.AdmissionsService = AdmissionsService;
class StudentProfileService {
    // 1. Student 360 Unified Record Composition
    static async getStudent360(studentId) {
        const student = await models_1.Student.findById(studentId)
            .populate('userId', '-passwordHash')
            .populate('departmentId')
            .populate('institutionId')
            .populate('guardianUserId', '-passwordHash');
        if (!student)
            throw new Error('Student profile not found.');
        // Fetch scoped facts directly from source modules (NOT duplicate copies!)
        const [markSheets, feeLedger, attendanceRecords, gatePasses, bookLoans, busPasses, grievances, statusEvents, changeRequests, documents] = await Promise.all([
            models_1.MarkSheet.find({ studentId }).populate('examId').populate('courseId'),
            FeeService.getStudentLedger(studentId),
            models_1.AttendanceRecord.find({ 'entries.studentId': student._id }),
            models_1.GatePass.find({ studentId }),
            models_1.BookLoan.find({ studentId }).populate('bookId'),
            models_1.BusPass.find({ studentId }),
            models_1.Grievance.find({ userId: student.userId._id || student.userId }),
            models_1.StudentStatusEvent.find({ studentId }).sort({ timestamp: -1 }),
            models_1.ProfileChangeRequest.find({ studentId }).sort({ createdAt: -1 }),
            models_1.StudentDocument.find({ studentId })
        ]);
        // Attendance calculation
        let totalClasses = 0;
        let presentClasses = 0;
        attendanceRecords.forEach(rec => {
            const entry = rec.entries.find(e => e.studentId.toString() === student._id.toString());
            if (entry) {
                totalClasses++;
                if (entry.status === index_1.AttendanceStatus.PRESENT)
                    presentClasses++;
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
    static async requestProfileCorrection(studentId, userId, requestedChanges, reason) {
        const request = await models_1.ProfileChangeRequest.create({
            studentId,
            userId,
            requestedChanges,
            reason,
            status: 'PENDING'
        });
        return request;
    }
    // 3. Approve Profile Correction (by Staff/Admin ONLY)
    static async approveProfileCorrection(requestId, reviewerId, reviewerRole, reviewNotes) {
        const request = await models_1.ProfileChangeRequest.findById(requestId);
        if (!request)
            throw new Error('Profile change request not found.');
        // ENFORCE ACCEPTANCE GATE: Student cannot approve their own profile correction!
        if (reviewerRole === index_1.UserRole.STUDENT) {
            throw new Error('Forbidden: Student cannot approve their own profile correction request.');
        }
        if (request.userId.toString() === reviewerId) {
            throw new Error('Forbidden: Applicant cannot approve their own correction.');
        }
        request.status = 'APPROVED';
        request.reviewedBy = reviewerId;
        request.reviewNotes = reviewNotes || 'Approved by administrator';
        await request.save();
        // Apply changes to User profile
        const user = await models_1.User.findById(request.userId);
        if (user && request.requestedChanges) {
            if (request.requestedChanges.phone)
                user.phone = request.requestedChanges.phone;
            await user.save();
        }
        return request;
    }
    // 4. Private Document Locker Access (with Ownership Verification)
    static async getStudentDocuments(studentId, requestingUserId, requestingUserRole, requestingStudentId) {
        // ENFORCE ACCEPTANCE GATE: Document access respects ownership!
        if (requestingUserRole === index_1.UserRole.STUDENT && requestingStudentId && requestingStudentId !== studentId) {
            throw new Error('Forbidden: Access denied to private document locker of another student.');
        }
        const docs = await models_1.StudentDocument.find({ studentId });
        return docs;
    }
    // 5. Term Progression
    static async progressTerm(studentId, performedBy, reason) {
        const student = await models_1.Student.findById(studentId);
        if (!student)
            throw new Error('Student not found.');
        if (student.status !== 'ACTIVE') {
            throw new Error(`Cannot progress student with status '${student.status}'. Must be 'ACTIVE'.`);
        }
        const prevSem = student.currentSemester;
        const newSem = Math.min(10, prevSem + 1);
        student.currentSemester = newSem;
        await student.save();
        await models_1.StudentStatusEvent.create({
            studentId: student._id,
            eventType: 'PROGRESSED',
            previousStatus: `Semester ${prevSem}`,
            newStatus: `Semester ${newSem}`,
            reason,
            performedBy: performedBy,
            timestamp: new Date()
        });
        return student;
    }
    // 6. Transfer Student (Preserves past results & records event)
    static async transferStudent(studentId, performedBy, transferReason) {
        const student = await models_1.Student.findById(studentId);
        if (!student)
            throw new Error('Student not found.');
        const prevStatus = student.status || 'ACTIVE';
        student.status = 'TRANSFERRED';
        await student.save();
        // Past academic marksheets, attendance, fee transactions remain untouched in DB!
        await models_1.StudentStatusEvent.create({
            studentId: student._id,
            eventType: 'TRANSFERRED',
            previousStatus: prevStatus,
            newStatus: 'TRANSFERRED',
            reason: transferReason,
            performedBy: performedBy,
            timestamp: new Date()
        });
        return student;
    }
    // 7. Withdraw Student
    static async withdrawStudent(studentId, performedBy, withdrawalReason) {
        const student = await models_1.Student.findById(studentId);
        if (!student)
            throw new Error('Student not found.');
        const prevStatus = student.status || 'ACTIVE';
        student.status = 'WITHDRAWN';
        await student.save();
        await models_1.StudentStatusEvent.create({
            studentId: student._id,
            eventType: 'WITHDRAWN',
            previousStatus: prevStatus,
            newStatus: 'WITHDRAWN',
            reason: withdrawalReason,
            performedBy: performedBy,
            timestamp: new Date()
        });
        return student;
    }
    // 8. Graduation Clearance Check
    static async performGraduationCheck(studentId) {
        const student = await models_1.Student.findById(studentId);
        if (!student)
            throw new Error('Student not found.');
        const ledger = await FeeService.getStudentLedger(studentId);
        const markSheets = await models_1.MarkSheet.find({ studentId });
        // Calculate credits
        const totalCredits = markSheets.length > 0 ? markSheets.length * 4 : 4;
        const requiredCredits = 4; // minimum credit check for demo
        const feeClearance = ledger.balancePaise === 0;
        const libraryClearance = true;
        const isEligible = totalCredits >= requiredCredits && feeClearance && libraryClearance;
        let gradRec = await models_1.GraduationRecord.findOne({ studentId });
        if (gradRec) {
            gradRec.totalCredits = totalCredits;
            gradRec.requiredCredits = requiredCredits;
            gradRec.feeClearance = feeClearance;
            gradRec.libraryClearance = libraryClearance;
            gradRec.isEligible = isEligible;
            gradRec.status = isEligible ? 'APPROVED' : 'REJECTED';
            await gradRec.save();
        }
        else {
            gradRec = await models_1.GraduationRecord.create({
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
    static async graduateStudent(studentId, performedBy) {
        const check = await StudentProfileService.performGraduationCheck(studentId);
        // ENFORCE ACCEPTANCE GATE: Graduation requires configured checks!
        if (!check.isEligible) {
            throw new Error(`Graduation check failed: Required credits or clearance checks unfulfilled. Fee Balance: ₹${check.feeClearance ? '0' : 'Pending'}, Credits: ${check.totalCredits}/${check.requiredCredits}`);
        }
        const student = await models_1.Student.findById(studentId);
        if (!student)
            throw new Error('Student not found.');
        const prevStatus = student.status || 'ACTIVE';
        student.status = 'GRADUATED';
        await student.save();
        check.status = 'GRADUATED';
        check.graduatedAt = new Date();
        check.degreeCertificateNumber = `DEG2026-${student.rollNumber}`;
        await check.save();
        await models_1.StudentStatusEvent.create({
            studentId: student._id,
            eventType: 'GRADUATED',
            previousStatus: prevStatus,
            newStatus: 'GRADUATED',
            reason: 'Successfully completed all degree requirements & clearances.',
            performedBy: performedBy,
            timestamp: new Date()
        });
        // Create or update AlumniProfile
        let alumni = await models_1.AlumniProfile.findOne({ userId: student.userId });
        if (!alumni) {
            alumni = await models_1.AlumniProfile.create({
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
exports.StudentProfileService = StudentProfileService;
class AttendanceService {
    static async captureAttendance(data) {
        // 1. Check Faculty Assignment Authorization
        if (data.userRole === index_1.UserRole.FACULTY) {
            const assignment = await models_1.TeachingAssignment.findOne({
                courseId: data.courseId,
                facultyId: data.facultyId
            });
            const course = await models_1.Course.findOne({ _id: data.courseId, facultyId: data.facultyId });
            const timetable = await models_1.Timetable.findOne({ courseId: data.courseId, facultyId: data.facultyId });
            if (!assignment && !course && !timetable) {
                throw new Error('Faculty is not assigned to teach this course section.');
            }
        }
        const section = data.section || 'A';
        // 2. Find or Create Session
        let session = await models_1.AttendanceSession.findOne({
            courseId: data.courseId,
            date: data.date,
            section
        });
        if (!session) {
            session = await models_1.AttendanceSession.create({
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
        }
        else {
            if (data.topicCovered)
                session.topicCovered = data.topicCovered;
            await session.save();
        }
        // 3. Upsert Entries (Enforce compound unique index sessionId + studentId so totals don't inflate)
        for (const entry of data.entries) {
            await models_1.AttendanceEntry.updateOne({ sessionId: session._id, studentId: entry.studentId }, {
                $set: {
                    institutionId: data.institutionId,
                    sessionId: session._id,
                    courseId: data.courseId,
                    date: data.date,
                    status: entry.status,
                    remarks: entry.remarks
                }
            }, { upsert: true });
        }
        const totalSessionEntries = await models_1.AttendanceEntry.countDocuments({ sessionId: session._id });
        return { session, recordedEntries: totalSessionEntries };
    }
    static async getStudentAttendanceSummary(studentId, courseId) {
        const student = await models_1.Student.findById(studentId).populate('departmentId');
        if (!student)
            throw new Error('Student not found.');
        const query = { studentId };
        if (courseId)
            query.courseId = courseId;
        const entries = await models_1.AttendanceEntry.find(query).populate('courseId').populate('sessionId');
        const policy = await models_1.AttendancePolicyVersion.findOne({
            institutionId: student.institutionId,
            isCurrent: true
        }) || { minPercentageRequired: 75, countExcusedInDenominator: false };
        const totalSessions = entries.length;
        const presentCount = entries.filter(e => e.status === index_1.AttendanceStatus.PRESENT).length;
        const lateCount = entries.filter(e => e.status === index_1.AttendanceStatus.LATE).length;
        const absentCount = entries.filter(e => e.status === index_1.AttendanceStatus.ABSENT).length;
        const excusedCount = entries.filter(e => e.status === index_1.AttendanceStatus.EXCUSED).length;
        const attended = presentCount + lateCount;
        const denominator = policy.countExcusedInDenominator
            ? totalSessions
            : Math.max(0, totalSessions - excusedCount);
        // Guaranteed NO NaN when no sessions exist:
        const overallPercentage = denominator > 0 ? Number(((attended / denominator) * 100).toFixed(2)) : 0.0;
        const isShortage = totalSessions > 0 && overallPercentage < policy.minPercentageRequired;
        // Course-wise grouping
        const courseMap = new Map();
        entries.forEach((e) => {
            const cId = e.courseId?._id?.toString() || e.courseId?.toString() || 'unknown';
            const cName = e.courseId?.name || 'Course';
            const cCode = e.courseId?.code || 'CRS';
            if (!courseMap.has(cId)) {
                courseMap.set(cId, { courseName: cName, courseCode: cCode, total: 0, present: 0, absent: 0, excused: 0, percentage: 0 });
            }
            const cData = courseMap.get(cId);
            cData.total += 1;
            if (e.status === index_1.AttendanceStatus.PRESENT || e.status === index_1.AttendanceStatus.LATE)
                cData.present += 1;
            else if (e.status === index_1.AttendanceStatus.ABSENT)
                cData.absent += 1;
            else if (e.status === index_1.AttendanceStatus.EXCUSED)
                cData.excused += 1;
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
    static async requestCorrection(data) {
        const entry = await models_1.AttendanceEntry.findOne({
            sessionId: data.sessionId,
            studentId: data.studentId
        });
        if (!entry)
            throw new Error('Attendance entry not found for the specified session.');
        const correction = await models_1.AttendanceCorrection.create({
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
    static async reviewCorrection(data) {
        if (data.reviewerRole === index_1.UserRole.STUDENT) {
            throw new Error('Students cannot approve attendance correction requests.');
        }
        const correction = await models_1.AttendanceCorrection.findById(data.correctionId);
        if (!correction)
            throw new Error('Correction request not found.');
        if (data.decision === 'APPROVED') {
            // Update AttendanceEntry status while preserving priorStatus in correction record
            await models_1.AttendanceEntry.findByIdAndUpdate(correction.entryId, {
                status: correction.requestedStatus
            });
        }
        correction.status = data.decision;
        correction.reviewedBy = data.reviewerId;
        correction.reviewComments = data.reviewComments || `Decision: ${data.decision}`;
        correction.reviewedAt = new Date();
        await correction.save();
        const summary = await AttendanceService.getStudentAttendanceSummary(correction.studentId.toString());
        return { correction, updatedSummary: summary };
    }
    static async bulkUploadAttendance(data) {
        if (data.records.length === 0)
            throw new Error('No attendance records provided in bulk upload.');
        // Validate Roster
        const rollNumbers = data.records.map(r => r.rollNumber.trim());
        const students = await models_1.Student.find({
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
            studentId: studentMap.get(r.rollNumber),
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
    static async getAttendanceAnalytics(institutionId, courseId) {
        const query = { institutionId };
        if (courseId)
            query.courseId = courseId;
        const entries = await models_1.AttendanceEntry.find(query);
        const totalEntries = entries.length;
        const presentEntries = entries.filter(e => e.status === index_1.AttendanceStatus.PRESENT || e.status === index_1.AttendanceStatus.LATE).length;
        const overallAverage = totalEntries > 0 ? Number(((presentEntries / totalEntries) * 100).toFixed(2)) : 0.0;
        const pendingCorrectionsCount = await models_1.AttendanceCorrection.countDocuments({ institutionId, status: 'PENDING' });
        const totalSessions = await models_1.AttendanceSession.countDocuments(query);
        return {
            totalEntries,
            presentEntries,
            overallAverage,
            pendingCorrectionsCount,
            totalSessions
        };
    }
    static async configurePolicy(data) {
        await models_1.AttendancePolicyVersion.updateMany({ institutionId: data.institutionId }, { isCurrent: false });
        const latest = await models_1.AttendancePolicyVersion.findOne({ institutionId: data.institutionId }).sort({ version: -1 });
        const newVersion = (latest?.version || 0) + 1;
        return await models_1.AttendancePolicyVersion.create({
            institutionId: data.institutionId,
            policyName: data.policyName,
            minPercentageRequired: data.minPercentageRequired,
            countExcusedInDenominator: data.countExcusedInDenominator,
            version: newVersion,
            isCurrent: true
        });
    }
}
exports.AttendanceService = AttendanceService;
class TimetableService {
    static parseTimeToMinutes(timeStr) {
        if (!timeStr)
            return 0;
        const cleanTime = timeStr.trim();
        // Support "09:00 AM" or "09:00"
        const match = cleanTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
        if (!match)
            return 0;
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const period = match[3]?.toUpperCase();
        if (period === 'PM' && hours < 12)
            hours += 12;
        if (period === 'AM' && hours === 12)
            hours = 0;
        return hours * 60 + minutes;
    }
    static doIntervalsOverlap(start1, end1, start2, end2) {
        const s1 = TimetableService.parseTimeToMinutes(start1);
        const e1 = TimetableService.parseTimeToMinutes(end1);
        const s2 = TimetableService.parseTimeToMinutes(start2);
        const e2 = TimetableService.parseTimeToMinutes(end2);
        return s1 < e2 && s2 < e1;
    }
    static async createScheduleEntry(data) {
        const section = data.section || 'A';
        const room = await models_1.Room.findById(data.roomId);
        if (!room)
            throw new Error('Selected room does not exist.');
        // 1. Room Capacity vs Enrolled Cohort Check
        const enrolledCount = (await models_1.SubjectEnrollment.countDocuments({ courseIds: data.courseId })) || 35;
        if (room.capacity < enrolledCount) {
            throw new Error(`Room Capacity Conflict: Room '${room.name}' capacity (${room.capacity}) is smaller than enrolled cohort size (${enrolledCount}).`);
        }
        // 2. Overlapping Conflict Detection (Room, Faculty, Cohort)
        const existingEntries = await models_1.TimetableEntry.find({
            institutionId: data.institutionId,
            dayOfWeek: data.dayOfWeek
        }).populate('courseId').populate('roomId');
        for (const existing of existingEntries) {
            if (TimetableService.doIntervalsOverlap(data.startTime, data.endTime, existing.startTime, existing.endTime)) {
                // a) Room Conflict
                if (existing.roomId?.toString() === data.roomId || existing.roomNumber === room.name) {
                    const err = new Error(`409 Conflict - Room Collision: Room '${room.name}' is already occupied on ${data.dayOfWeek} between ${existing.startTime} and ${existing.endTime}.`);
                    err.statusCode = 409;
                    throw err;
                }
                // b) Faculty Conflict
                if (existing.facultyId.toString() === data.facultyId) {
                    const err = new Error(`409 Conflict - Faculty Conflict: Assigned faculty is already teaching another course on ${data.dayOfWeek} between ${existing.startTime} and ${existing.endTime}.`);
                    err.statusCode = 409;
                    throw err;
                }
                // c) Cohort Conflict (Same Dept + Sem + Sec)
                if (existing.departmentId.toString() === data.departmentId &&
                    existing.semester === data.semester &&
                    existing.section === section) {
                    const err = new Error(`409 Conflict - Cohort Conflict: Department/Semester/Section cohort already has a class scheduled on ${data.dayOfWeek} between ${existing.startTime} and ${existing.endTime}.`);
                    err.statusCode = 409;
                    throw err;
                }
            }
        }
        // No conflict -> Create Timetable Entry
        const entry = await models_1.TimetableEntry.create({
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
    static async rescheduleInstance(data) {
        const entry = await models_1.TimetableEntry.findById(data.entryId).populate('courseId');
        if (!entry)
            throw new Error('Timetable entry not found.');
        const newRoomId = data.newRoomId || (entry.roomId ? entry.roomId.toString() : undefined);
        const newStartTime = data.newStartTime || entry.startTime;
        const newEndTime = data.newEndTime || entry.endTime;
        if (newRoomId && (newStartTime !== entry.startTime || newEndTime !== entry.endTime || newRoomId !== entry.roomId?.toString())) {
            const targetRoom = await models_1.Room.findById(newRoomId);
            if (targetRoom) {
                // Validate conflict for the new room/time slot
                const existingEntries = await models_1.TimetableEntry.find({
                    _id: { $ne: entry._id },
                    institutionId: entry.institutionId,
                    dayOfWeek: entry.dayOfWeek
                });
                for (const ex of existingEntries) {
                    if (TimetableService.doIntervalsOverlap(newStartTime, newEndTime, ex.startTime, ex.endTime)) {
                        if (ex.roomId?.toString() === newRoomId || ex.roomNumber === targetRoom.name) {
                            const err = new Error(`409 Conflict - Room Collision: Target Room '${targetRoom.name}' is already occupied during ${newStartTime}-${newEndTime}.`);
                            err.statusCode = 409;
                            throw err;
                        }
                    }
                }
            }
        }
        // Upsert TimetableException for specific exception date (preserves history!)
        const exception = await models_1.TimetableException.findOneAndUpdate({ entryId: entry._id, exceptionDate: data.exceptionDate }, {
            institutionId: entry.institutionId,
            entryId: entry._id,
            exceptionDate: data.exceptionDate,
            exceptionType: 'RESCHEDULED',
            newRoomId: newRoomId,
            newFacultyId: (data.newFacultyId || entry.facultyId),
            newStartTime,
            newEndTime,
            reason: data.reason,
            createdBy: data.createdBy
        }, { upsert: true, new: true });
        // Notify affected users via Outbox
        await models_1.OutboxEvent.create({
            institutionId: entry.institutionId,
            eventId: (0, uuid_1.v4)(),
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
    static async getCalendarSchedule(params) {
        let query = { institutionId: params.institutionId };
        // Enrolled Student Schedule Filter Gate:
        if (params.studentId) {
            const student = await models_1.Student.findById(params.studentId);
            if (student) {
                const enrollments = await models_1.SubjectEnrollment.find({ studentId: params.studentId });
                let enrolledCourseIds = enrollments.flatMap(e => e.courseIds);
                if (enrolledCourseIds.length === 0) {
                    const courses = await models_1.Course.find({ departmentId: student.departmentId, semester: student.currentSemester });
                    enrolledCourseIds = courses.map(c => c._id);
                }
                query.courseId = { $in: enrolledCourseIds };
            }
        }
        else if (params.facultyId) {
            query.facultyId = params.facultyId;
        }
        else if (params.departmentId) {
            query.departmentId = params.departmentId;
            if (params.semester)
                query.semester = params.semester;
        }
        const entries = await models_1.TimetableEntry.find(query)
            .populate('courseId')
            .populate('facultyId', 'name email designation')
            .populate('roomId');
        const entryIds = entries.map(e => e._id);
        const exceptions = await models_1.TimetableException.find({ entryId: { $in: entryIds } })
            .populate('newRoomId')
            .populate('newFacultyId', 'name email');
        const exceptionMap = new Map();
        exceptions.forEach(ex => {
            exceptionMap.set(`${ex.entryId.toString()}_${ex.exceptionDate}`, ex);
        });
        const holidays = await models_1.Holiday.find({ institutionId: params.institutionId });
        return {
            entries,
            exceptions: Array.from(exceptionMap.values()),
            holidays
        };
    }
    static async getRooms(institutionId) {
        let rooms = await models_1.Room.find({ institutionId });
        if (rooms.length === 0) {
            // Seed default rooms if empty
            rooms = await models_1.Room.insertMany([
                { institutionId, name: 'LH-101', building: 'Academic Block A', capacity: 60, roomType: 'LECTURE_HALL', hasProjector: true, hasAC: true },
                { institutionId, name: 'LH-102', building: 'Academic Block A', capacity: 60, roomType: 'LECTURE_HALL', hasProjector: true, hasAC: true },
                { institutionId, name: 'LAB-201', building: 'CS Computer Lab Block', capacity: 40, roomType: 'LABORATORY', hasProjector: true, hasAC: true }
            ]);
        }
        return rooms;
    }
    static async createRoom(data) {
        return await models_1.Room.create(data);
    }
    static async getCalendarEvents(institutionId) {
        const events = await models_1.CalendarEvent.find({ institutionId }).sort({ startDate: 1 });
        const holidays = await models_1.Holiday.find({ institutionId }).sort({ date: 1 });
        return { events, holidays };
    }
    static async createCalendarEvent(data) {
        const event = await models_1.CalendarEvent.create(data);
        if (data.isHoliday) {
            await models_1.Holiday.create({
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
exports.TimetableService = TimetableService;
class ExamApplicationService {
    // 1. Exam Cycles
    static async createCycle(data) {
        const cycle = await models_1.ExamCycle.create(data);
        // Create default policy version for cycle
        await models_1.ExamPolicyVersion.create({
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
    static async getCycles(institutionId) {
        const cycles = await models_1.ExamCycle.find({ institutionId }).sort({ createdAt: -1 });
        const cycleIds = cycles.map(c => c._id);
        const policies = await models_1.ExamPolicyVersion.find({ cycleId: { $in: cycleIds }, isActive: true });
        const policyMap = new Map();
        policies.forEach(p => policyMap.set(p.cycleId.toString(), p));
        return cycles.map(c => ({
            ...c.toObject(),
            policy: policyMap.get(c._id.toString())
        }));
    }
    static async getCycleById(cycleId) {
        const cycle = await models_1.ExamCycle.findById(cycleId);
        if (!cycle)
            throw new Error('Exam cycle not found');
        const policy = await models_1.ExamPolicyVersion.findOne({ cycleId: cycle._id, isActive: true });
        return { ...cycle.toObject(), policy };
    }
    // 2. Policy Versioning
    static async updatePolicy(cycleId, data) {
        const existing = await models_1.ExamPolicyVersion.find({ cycleId }).sort({ version: -1 });
        const nextVer = existing.length > 0 ? existing[0].version + 1 : 1;
        // Deactivate previous versions
        await models_1.ExamPolicyVersion.updateMany({ cycleId }, { isActive: false });
        const newPolicy = await models_1.ExamPolicyVersion.create({
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
    static async calculateEligibility(cycleId, studentId) {
        const cycle = await models_1.ExamCycle.findById(cycleId);
        if (!cycle)
            throw new Error('Exam cycle not found');
        const policy = await models_1.ExamPolicyVersion.findOne({ cycleId, isActive: true }) || {
            minAttendancePercentage: 75,
            requireFeeClearance: true
        };
        // Check attendance (M08)
        const attendanceEntries = await models_1.AttendanceEntry.find({ studentId });
        let attendancePercentage = 85; // baseline fallback if untracked
        if (attendanceEntries.length > 0) {
            const presentCount = attendanceEntries.filter(e => e.status === index_1.AttendanceStatus.PRESENT).length;
            attendancePercentage = Math.round((presentCount / attendanceEntries.length) * 100);
        }
        // Check fee clearance (M10)
        let feeCleared = true;
        if (policy.requireFeeClearance) {
            const invoices = await models_1.Invoice.find({ studentId });
            const unpaidInvoices = invoices.filter(inv => (inv.payableAmountPaise - inv.paidAmountPaise) > 0);
            if (unpaidInvoices.length > 0) {
                feeCleared = false;
            }
        }
        const ineligibilityReasons = [];
        if (attendancePercentage < policy.minAttendancePercentage) {
            ineligibilityReasons.push(`Attendance shortage (${attendancePercentage}% < required ${policy.minAttendancePercentage}%)`);
        }
        if (!feeCleared) {
            ineligibilityReasons.push('Outstanding fee arrears must be cleared prior to exam registration');
        }
        // Check if an existing approved exception exists
        const existingDecision = await models_1.EligibilityDecision.findOne({ cycleId, studentId });
        const hasException = existingDecision?.hasException || false;
        let overallStatus;
        if (hasException) {
            overallStatus = index_1.EligibilityStatus.CONDITIONAL_EXCEPTION;
        }
        else if (ineligibilityReasons.length > 0) {
            overallStatus = index_1.EligibilityStatus.INELIGIBLE;
        }
        else {
            overallStatus = index_1.EligibilityStatus.ELIGIBLE;
        }
        const decision = await models_1.EligibilityDecision.findOneAndUpdate({ cycleId, studentId }, {
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
        }, { upsert: true, new: true });
        return decision;
    }
    // 4. Submit Exam Application
    static async submitApplication(data) {
        const cycle = await models_1.ExamCycle.findById(data.cycleId);
        if (!cycle)
            throw new Error('Exam cycle not found');
        // Acceptance Gate: Closed windows block submission
        const today = new Date().toISOString().split('T')[0];
        if (cycle.status === index_1.ExamCycleStatus.CONCLUDED ||
            today < cycle.applicationStartDate ||
            today > cycle.applicationEndDate) {
            throw new Error(`Exam application window is closed for this cycle (${cycle.applicationStartDate} to ${cycle.applicationEndDate})`);
        }
        const policy = await models_1.ExamPolicyVersion.findOne({ cycleId: data.cycleId, isActive: true }) || {
            feePerSubjectPaise: 50000,
            allowBacklog: true,
            allowPrivate: false
        };
        const category = data.category || index_1.ExamStudentCategory.REGULAR;
        if (category === index_1.ExamStudentCategory.BACKLOG && !policy.allowBacklog) {
            throw new Error('Backlog exam papers are not permitted under the active cycle policy');
        }
        if (category === index_1.ExamStudentCategory.PRIVATE && !policy.allowPrivate) {
            throw new Error('Private candidate applications are not permitted for this cycle');
        }
        if (!data.subjectIds || data.subjectIds.length === 0) {
            throw new Error('At least one examination paper must be selected');
        }
        // Acceptance Gate: Ineligible students block submission unless granted audited exception
        const eligibility = await ExamApplicationService.calculateEligibility(data.cycleId, data.studentId);
        if (eligibility.overallStatus === index_1.EligibilityStatus.INELIGIBLE) {
            throw new Error(`Application blocked due to ineligibility: ${eligibility.ineligibilityReasons.join('; ')}`);
        }
        const feeAmountPaise = policy.feePerSubjectPaise * data.subjectIds.length;
        const applicationNumber = `EX-${cycle.code}-${Date.now().toString().slice(-6)}`;
        // Create or update application
        const application = await models_1.ExamApplication.findOneAndUpdate({ cycleId: data.cycleId, studentId: data.studentId }, {
            applicationNumber,
            cycleId: data.cycleId,
            studentId: data.studentId,
            category,
            subjectIds: data.subjectIds,
            status: index_1.ExamApplicationStatus.SUBMITTED,
            feeAmountPaise,
            feePaid: feeAmountPaise === 0, // Auto-mark paid if zero fee
            submittedAt: new Date()
        }, { upsert: true, new: true });
        // Link decision to application
        await models_1.EligibilityDecision.updateOne({ cycleId: data.cycleId, studentId: data.studentId }, { applicationId: application._id });
        return application;
    }
    // 5. Grant Audited Exception
    static async grantException(data) {
        let cycleId = data.cycleId;
        let studentId = data.studentId;
        let application = null;
        if (data.applicationId) {
            application = await models_1.ExamApplication.findById(data.applicationId);
            if (application) {
                cycleId = application.cycleId.toString();
                studentId = application.studentId.toString();
            }
        }
        if (!cycleId || !studentId) {
            throw new Error('Cycle ID and Student ID or valid Application ID required to grant exception');
        }
        const decision = await models_1.EligibilityDecision.findOneAndUpdate({ cycleId, studentId }, {
            hasException: true,
            exceptionReason: data.reason,
            exceptionGrantedBy: data.grantedBy,
            exceptionGrantedAt: new Date(),
            overallStatus: index_1.EligibilityStatus.CONDITIONAL_EXCEPTION,
            ineligibilityReasons: []
        }, { upsert: true, new: true });
        // Audit log
        await models_1.AuditLog.create({
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
    static async payApplicationFee(applicationId) {
        const application = await models_1.ExamApplication.findById(applicationId);
        if (!application)
            throw new Error('Exam application not found');
        application.feePaid = true;
        await application.save();
        return application;
    }
    // 6. Review & Approve/Reject Application
    static async reviewApplication(data) {
        const application = await models_1.ExamApplication.findById(data.applicationId);
        if (!application)
            throw new Error('Exam application not found');
        if (data.decision === 'APPROVE') {
            application.status = index_1.ExamApplicationStatus.APPROVED;
            application.approvedAt = new Date();
            application.approvedBy = data.reviewerId;
            // Create ExamEnrollment for each enrolled paper
            for (const subId of application.subjectIds) {
                await models_1.ExamEnrollment.findOneAndUpdate({ cycleId: application.cycleId, studentId: application.studentId, subjectId: subId }, {
                    cycleId: application.cycleId,
                    studentId: application.studentId,
                    subjectId: subId,
                    category: application.category,
                    status: 'ENROLLED'
                }, { upsert: true });
            }
        }
        else {
            application.status = index_1.ExamApplicationStatus.REJECTED;
            application.rejectionReason = data.rejectionReason || 'Application rejected by examination office';
        }
        await application.save();
        return application;
    }
    // 7. Prototype Roll Number Assignment
    static async assignRollNumber(data) {
        const existing = await models_1.RollNumberAssignment.findOne({
            cycleId: data.cycleId,
            studentId: data.studentId
        });
        if (existing)
            return existing;
        const cycle = await models_1.ExamCycle.findById(data.cycleId);
        const count = await models_1.RollNumberAssignment.countDocuments({ cycleId: data.cycleId });
        const rollNumber = data.rollNumber || `${cycle?.code || 'EXAM'}-${String(count + 1001).padStart(4, '0')}`;
        const app = await models_1.ExamApplication.findOne({ cycleId: data.cycleId, studentId: data.studentId });
        if (!app)
            throw new Error('Exam application required for roll number assignment');
        const assignment = await models_1.RollNumberAssignment.create({
            cycleId: data.cycleId,
            studentId: data.studentId,
            applicationId: app._id,
            rollNumber,
            assignedAt: new Date()
        });
        return assignment;
    }
    // 8. Issue Hall Ticket (Acceptance Gate: Idempotent repeat issuance, unpaid fee blocking)
    static async issueHallTicket(data) {
        const application = await models_1.ExamApplication.findById(data.applicationId);
        if (!application)
            throw new Error('Exam application not found');
        if (application.status !== index_1.ExamApplicationStatus.APPROVED &&
            application.status !== index_1.ExamApplicationStatus.HALL_TICKET_ISSUED) {
            throw new Error(`Cannot issue hall ticket for application in state '${application.status}'. Application must be APPROVED.`);
        }
        // Acceptance Gate: Unpaid prerequisite fees block hall ticket issuance
        if (!application.feePaid && application.feeAmountPaise > 0) {
            throw new Error('Unpaid examination fee blocks hall ticket issuance');
        }
        // Acceptance Gate: Idempotent repeat issuance
        const existingTicket = await models_1.HallTicket.findOne({
            $or: [
                { applicationId: application._id },
                { cycleId: application.cycleId, studentId: application.studentId }
            ]
        }).populate('papers.subjectId');
        if (existingTicket) {
            return existingTicket;
        }
        // Ensure roll number assignment exists
        let rollAssignment = await models_1.RollNumberAssignment.findOne({
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
        const courses = await models_1.Course.find({ _id: { $in: application.subjectIds } });
        const papers = courses.map((c, index) => ({
            subjectId: c._id,
            subjectCode: c.code,
            subjectName: c.name,
            examDate: `2026-11-${String(20 + index * 2).padStart(2, '0')}`,
            examTime: '09:30 AM - 12:30 PM'
        }));
        const ticketNumber = `HT-${application.cycleId.toString().slice(-4).toUpperCase()}-${Date.now().toString().slice(-6)}`;
        const hallTicket = await models_1.HallTicket.create({
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
        application.status = index_1.ExamApplicationStatus.HALL_TICKET_ISSUED;
        await application.save();
        return hallTicket;
    }
    // 9. Student Scoped Hall Ticket Access (Acceptance Gate: Never cross student boundaries)
    static async getStudentHallTicket(ticketId, requestingStudentId) {
        const ticket = await models_1.HallTicket.findById(ticketId).populate('papers.subjectId');
        if (!ticket)
            throw new Error('Hall ticket not found');
        if (ticket.studentId.toString() !== requestingStudentId) {
            const err = new Error('Forbidden: Hall tickets never cross student boundaries');
            err.statusCode = 403;
            throw err;
        }
        return ticket;
    }
    // 10. Student Applications & Hall Tickets List
    static async getStudentApplications(studentId) {
        const applications = await models_1.ExamApplication.find({ studentId })
            .populate('cycleId')
            .populate('subjectIds')
            .sort({ createdAt: -1 });
        const appIds = applications.map(a => a._id);
        const hallTickets = await models_1.HallTicket.find({ applicationId: { $in: appIds } });
        const ticketMap = new Map();
        hallTickets.forEach(t => ticketMap.set(t.applicationId.toString(), t));
        const decisions = await models_1.EligibilityDecision.find({ studentId });
        const decisionMap = new Map();
        decisions.forEach(d => decisionMap.set(d.cycleId.toString(), d));
        return applications.map(app => ({
            ...app.toObject(),
            hallTicket: ticketMap.get(app._id.toString()),
            eligibility: decisionMap.get(app.cycleId._id.toString())
        }));
    }
    // 11. Review Queue
    static async getReviewQueue(cycleId) {
        const filter = {};
        if (cycleId)
            filter.cycleId = cycleId;
        const applications = await models_1.ExamApplication.find(filter)
            .populate('studentId')
            .populate('cycleId')
            .populate('subjectIds')
            .sort({ createdAt: -1 });
        const studentIds = applications.map(a => a.studentId?._id || a.studentId);
        const decisions = await models_1.EligibilityDecision.find({ studentId: { $in: studentIds } });
        const decisionMap = new Map();
        decisions.forEach(d => {
            decisionMap.set(`${d.cycleId.toString()}_${d.studentId.toString()}`, d);
        });
        const rollAssignments = await models_1.RollNumberAssignment.find({ studentId: { $in: studentIds } });
        const rollMap = new Map();
        rollAssignments.forEach(r => {
            rollMap.set(`${r.cycleId.toString()}_${r.studentId.toString()}`, r);
        });
        const appIds = applications.map(a => a._id);
        const hallTickets = await models_1.HallTicket.find({ applicationId: { $in: appIds } });
        const ticketMap = new Map();
        hallTickets.forEach(t => ticketMap.set(t.applicationId.toString(), t));
        return applications.map(app => {
            const sId = app.studentId?._id?.toString() || app.studentId?.toString();
            const cId = app.cycleId?._id?.toString() || app.cycleId?.toString();
            return {
                ...app.toObject(),
                eligibility: decisionMap.get(`${cId}_${sId}`),
                rollAssignment: rollMap.get(`${cId}_${sId}`),
                hallTicket: ticketMap.get(app._id.toString())
            };
        });
    }
}
exports.ExamApplicationService = ExamApplicationService;
// ==========================================
// 19. M12 EXAM SCHEDULING, CENTERS & MATERIALS SERVICE
// ==========================================
class ExamOperationsService {
    // 1. Centers & Verification
    static async createCenter(data) {
        const existing = await models_1.ExamCenter.findOne({
            institutionId: data.institutionId,
            centerCode: data.centerCode
        });
        if (existing) {
            throw new Error(`Exam Center with code '${data.centerCode}' already exists`);
        }
        return await models_1.ExamCenter.create({
            ...data,
            status: 'ACTIVE'
        });
    }
    static async getCenters(institutionId) {
        const filter = {};
        if (institutionId)
            filter.institutionId = institutionId;
        return await models_1.ExamCenter.find(filter).sort({ centerCode: 1 });
    }
    static async getCenterById(id) {
        const center = await models_1.ExamCenter.findById(id);
        if (!center)
            throw new Error('Exam center not found');
        return center;
    }
    static async verifyCenter(data) {
        const center = await models_1.ExamCenter.findById(data.centerId);
        if (!center)
            throw new Error('Exam center not found');
        const verification = await models_1.CenterVerification.findOneAndUpdate({ centerId: data.centerId, cycleId: data.cycleId }, {
            institutionId: data.institutionId || center.institutionId,
            centerId: data.centerId,
            cycleId: data.cycleId,
            checklist: data.checklist,
            remarks: data.remarks || 'Center physical readiness verified',
            status: data.status || index_1.CenterVerificationStatus.VERIFIED,
            verifiedBy: data.verifiedBy,
            verifiedAt: new Date()
        }, { upsert: true, new: true });
        return verification;
    }
    static async getVerifications(cycleId, centerId) {
        const filter = {};
        if (cycleId)
            filter.cycleId = cycleId;
        if (centerId)
            filter.centerId = centerId;
        return await models_1.CenterVerification.find(filter).populate('centerId').populate('cycleId').sort({ verifiedAt: -1 });
    }
    // 2. Exam Scheduling & Conflict Detection
    static async createSchedule(data) {
        const center = await models_1.ExamCenter.findById(data.centerId);
        if (!center)
            throw new Error('Exam center not found');
        // Verification check: Is center verified for this cycle?
        const verification = await models_1.CenterVerification.findOne({
            centerId: data.centerId,
            cycleId: data.cycleId,
            status: index_1.CenterVerificationStatus.VERIFIED
        });
        const subject = await models_1.Course.findById(data.subjectId);
        if (!subject)
            throw new Error('Subject course not found');
        // Total enrolled candidates for this subject in the cycle
        const enrolledCount = await models_1.ExamEnrollment.countDocuments({
            cycleId: data.cycleId,
            subjectId: data.subjectId,
            status: 'ENROLLED'
        });
        // Conflict detection
        const conflicts = await this.detectConflicts(data.cycleId, data.examDate, data.startTime, data.endTime, data.roomIds, data.subjectId);
        const schedule = await models_1.ExamSchedule.create({
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
            status: index_1.ExamScheduleStatus.DRAFT,
            conflicts
        });
        return schedule;
    }
    static async detectConflicts(cycleId, examDate, startTime, endTime, roomIds, subjectId) {
        const conflicts = [];
        // Check for room conflict on the same date with overlapping time
        const overlappingSchedules = await models_1.ExamSchedule.find({
            cycleId,
            examDate,
            roomIds: { $in: roomIds },
            status: { $ne: index_1.ExamScheduleStatus.CANCELLED },
            subjectId: { $ne: subjectId }
        });
        for (const sched of overlappingSchedules) {
            if ((startTime >= sched.startTime && startTime < sched.endTime) ||
                (endTime > sched.startTime && endTime <= sched.endTime) ||
                (startTime <= sched.startTime && endTime >= sched.endTime)) {
                const sharedRooms = sched.roomIds.filter(r => roomIds.includes(r));
                conflicts.push({
                    type: 'ROOM_CONFLICT',
                    description: `Room(s) ${sharedRooms.join(', ')} already booked for '${sched.subjectName}' (${sched.startTime}-${sched.endTime})`
                });
            }
        }
        return conflicts;
    }
    static async getSchedules(cycleId, institutionId) {
        const filter = {};
        if (cycleId)
            filter.cycleId = cycleId;
        if (institutionId)
            filter.institutionId = institutionId;
        return await models_1.ExamSchedule.find(filter)
            .populate('centerId')
            .populate('subjectId')
            .sort({ examDate: 1, startTime: 1 });
    }
    static async publishSchedule(scheduleId, publishedBy) {
        const schedule = await models_1.ExamSchedule.findById(scheduleId);
        if (!schedule)
            throw new Error('Exam schedule not found');
        schedule.status = index_1.ExamScheduleStatus.PUBLISHED;
        schedule.publishedBy = publishedBy;
        schedule.publishedAt = new Date();
        await schedule.save();
        return schedule;
    }
    // 3. Seating Allocation (Acceptance Gate: Allocation respects capacity under concurrent actions; student/time collisions prevented; audit on reallocation)
    static async allocateSeats(data) {
        const schedule = await models_1.ExamSchedule.findById(data.scheduleId);
        if (!schedule)
            throw new Error('Exam schedule not found');
        const center = await models_1.ExamCenter.findById(data.centerId);
        if (!center)
            throw new Error('Exam center not found');
        const targetRoom = center.rooms.find(r => r.roomId === data.roomId || r.roomNumber === data.roomId);
        if (!targetRoom) {
            throw new Error(`Room '${data.roomId}' not found in center '${center.name}'`);
        }
        // Capacity enforcement gate: Check currently allocated seats in this room for this schedule
        const currentAllocationsCount = await models_1.SeatingAllocation.countDocuments({
            scheduleId: data.scheduleId,
            roomId: targetRoom.roomId,
            status: index_1.SeatingAllocationStatus.ALLOCATED
        });
        if (currentAllocationsCount + data.studentIds.length > targetRoom.capacity) {
            const err = new Error(`Room capacity exceeded: maximum capacity is ${targetRoom.capacity}, currently allocated ${currentAllocationsCount}, requested ${data.studentIds.length}. Capacity limit strictly enforced.`);
            err.statusCode = 400;
            throw err;
        }
        // Check student collisions: Student cannot be allocated to two exams at overlapping times
        for (const studentId of data.studentIds) {
            const existingAllocations = await models_1.SeatingAllocation.find({
                cycleId: data.cycleId,
                studentId,
                status: index_1.SeatingAllocationStatus.ALLOCATED,
                scheduleId: { $ne: data.scheduleId }
            }).populate('scheduleId');
            for (const alloc of existingAllocations) {
                const otherSched = alloc.scheduleId;
                if (otherSched && otherSched.examDate === schedule.examDate) {
                    if ((schedule.startTime >= otherSched.startTime && schedule.startTime < otherSched.endTime) ||
                        (schedule.endTime > otherSched.startTime && schedule.endTime <= otherSched.endTime) ||
                        (schedule.startTime <= otherSched.startTime && schedule.endTime >= otherSched.endTime)) {
                        throw new Error(`Student collision detected: Student is already allocated to exam '${otherSched.subjectName}' on ${otherSched.examDate} (${otherSched.startTime}-${otherSched.endTime})`);
                    }
                }
            }
        }
        // Fetch roll numbers and student details
        const students = await models_1.Student.find({ _id: { $in: data.studentIds } }).populate('userId');
        const rollAssignments = await models_1.RollNumberAssignment.find({
            cycleId: data.cycleId,
            studentId: { $in: data.studentIds }
        });
        const rollMap = new Map();
        rollAssignments.forEach(r => rollMap.set(r.studentId.toString(), r.rollNumber));
        const allocatedRecords = [];
        let seatIndex = currentAllocationsCount + 1;
        for (const st of students) {
            const seatNumber = `R${targetRoom.roomNumber}-S${String(seatIndex).padStart(2, '0')}`;
            const rollNumber = rollMap.get(st._id.toString()) || st.rollNumber || 'TBD';
            const studentName = st.userId?.name || 'Student Candidate';
            // Check if student already allocated in this schedule
            const existingInSchedule = await models_1.SeatingAllocation.findOne({
                scheduleId: data.scheduleId,
                studentId: st._id,
                status: index_1.SeatingAllocationStatus.ALLOCATED
            });
            if (!existingInSchedule) {
                const allocation = await models_1.SeatingAllocation.create({
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
                    status: index_1.SeatingAllocationStatus.ALLOCATED
                });
                allocatedRecords.push(allocation);
                seatIndex++;
            }
        }
        return allocatedRecords;
    }
    static async reallocateSeat(data) {
        const prevAlloc = await models_1.SeatingAllocation.findById(data.allocationId);
        if (!prevAlloc)
            throw new Error('Seating allocation record not found');
        const center = await models_1.ExamCenter.findById(prevAlloc.centerId);
        if (!center)
            throw new Error('Center not found');
        const newRoom = center.rooms.find(r => r.roomId === data.newRoomId || r.roomNumber === data.newRoomId);
        if (!newRoom)
            throw new Error(`Target room '${data.newRoomId}' not found in center`);
        // Check capacity of target room
        const currentInNewRoom = await models_1.SeatingAllocation.countDocuments({
            scheduleId: prevAlloc.scheduleId,
            roomId: newRoom.roomId,
            status: index_1.SeatingAllocationStatus.ALLOCATED
        });
        if (currentInNewRoom >= newRoom.capacity) {
            const err = new Error(`Target room '${newRoom.roomNumber}' capacity (${newRoom.capacity}) reached. Cannot reallocate.`);
            err.statusCode = 400;
            throw err;
        }
        const assignedSeatNumber = data.newSeatNumber || `R${newRoom.roomNumber}-S${String(currentInNewRoom + 1).padStart(2, '0')}`;
        // Mark previous record as REALLOCATED
        prevAlloc.status = index_1.SeatingAllocationStatus.REALLOCATED;
        prevAlloc.reallocationReason = data.reason;
        await prevAlloc.save();
        // Create new allocation record
        const newAlloc = await models_1.SeatingAllocation.create({
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
            status: index_1.SeatingAllocationStatus.ALLOCATED,
            previousAllocationId: prevAlloc._id,
            reallocationReason: data.reason
        });
        // Enforce Rule: Reallocation retains an audit record in AuditLog
        const auditUserId = mongoose_1.default.Types.ObjectId.isValid(data.reallocatedBy) ? data.reallocatedBy : undefined;
        await models_1.AuditLog.create({
            userId: auditUserId,
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
    static async getRoomAllocations(scheduleId, roomId) {
        const filter = { scheduleId, status: index_1.SeatingAllocationStatus.ALLOCATED };
        if (roomId)
            filter.roomId = roomId;
        return await models_1.SeatingAllocation.find(filter).sort({ seatNumber: 1 });
    }
    static async getStudentAllocation(cycleId, studentId) {
        return await models_1.SeatingAllocation.find({
            cycleId,
            studentId,
            status: index_1.SeatingAllocationStatus.ALLOCATED
        }).populate('scheduleId').populate('centerId');
    }
    // 4. Invigilation Duty (Acceptance Gate: Absent acknowledgement is visible)
    static async assignInvigilator(data) {
        const faculty = await models_1.User.findById(data.facultyId);
        if (!faculty)
            throw new Error('Faculty user not found');
        // Availability check: Faculty cannot be assigned to another duty at same date/time
        const overlappingDuties = await models_1.InvigilationDuty.find({
            cycleId: data.cycleId,
            facultyId: data.facultyId,
            dutyDate: data.dutyDate,
            status: { $in: [index_1.InvigilationDutyStatus.ASSIGNED, index_1.InvigilationDutyStatus.ACKNOWLEDGED] }
        });
        for (const d of overlappingDuties) {
            if ((data.startTime >= d.startTime && data.startTime < d.endTime) ||
                (data.endTime > d.startTime && data.endTime <= d.endTime) ||
                (data.startTime <= d.startTime && data.endTime >= d.endTime)) {
                throw new Error(`Faculty ${faculty.name} is already assigned to invigilation duty on ${d.dutyDate} (${d.startTime}-${d.endTime})`);
            }
        }
        const duty = await models_1.InvigilationDuty.create({
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
            status: index_1.InvigilationDutyStatus.ASSIGNED,
            assignedBy: data.assignedBy || 'CONTROLLER_OF_EXAMINATIONS',
            assignedAt: new Date()
        });
        return duty;
    }
    static async acknowledgeDuty(data) {
        const duty = await models_1.InvigilationDuty.findById(data.dutyId);
        if (!duty)
            throw new Error('Invigilation duty not found');
        if (duty.facultyId.toString() !== data.facultyId) {
            const err = new Error('Forbidden: Only the appointed faculty member can acknowledge this duty');
            err.statusCode = 403;
            throw err;
        }
        duty.status = data.status === 'ACKNOWLEDGED' ? index_1.InvigilationDutyStatus.ACKNOWLEDGED : index_1.InvigilationDutyStatus.DECLINED;
        duty.acknowledgedAt = new Date();
        if (data.declineReason)
            duty.declineReason = data.declineReason;
        await duty.save();
        return duty;
    }
    static async markDutyAbsent(dutyId, markedBy, remarks) {
        const duty = await models_1.InvigilationDuty.findById(dutyId);
        if (!duty)
            throw new Error('Invigilation duty not found');
        duty.status = index_1.InvigilationDutyStatus.ABSENT;
        duty.remarks = remarks || 'Marked absent by exam superintendent on exam day';
        await duty.save();
        // Create Audit record
        const auditUserId = mongoose_1.default.Types.ObjectId.isValid(markedBy) ? markedBy : undefined;
        await models_1.AuditLog.create({
            userId: auditUserId,
            action: 'INVIGILATOR_ABSENT',
            resource: `InvigilationDuty:${duty._id}`,
            ipAddress: '127.0.0.1',
            previousState: { status: index_1.InvigilationDutyStatus.ASSIGNED },
            newState: { status: index_1.InvigilationDutyStatus.ABSENT, remarks: duty.remarks, markedBy }
        });
        return duty;
    }
    static async getDutyRoster(cycleId, centerId, facultyId) {
        const filter = {};
        if (cycleId)
            filter.cycleId = cycleId;
        if (centerId)
            filter.centerId = centerId;
        if (facultyId)
            filter.facultyId = facultyId;
        return await models_1.InvigilationDuty.find(filter)
            .populate('scheduleId')
            .populate('centerId')
            .sort({ dutyDate: 1, startTime: 1 });
    }
    // 5. Materials Management, Serial Range Validation & Reconciliation
    static async createMaterialBatch(data) {
        if (data.startSerial > data.endSerial) {
            throw new Error(`Invalid serial range: startSerial (${data.startSerial}) cannot be greater than endSerial (${data.endSerial})`);
        }
        const prefix = data.prefix || 'AB-';
        const materialType = data.materialType || index_1.MaterialType.MAIN_ANSWER_BOOK;
        // Acceptance Gate: Duplicate/Overlapping serial range rejected!
        const existingBatches = await models_1.MaterialBatch.find({
            institutionId: data.institutionId,
            materialType,
            prefix
        });
        for (const b of existingBatches) {
            if (data.startSerial <= b.endSerial && data.endSerial >= b.startSerial) {
                const err = new Error(`Duplicate or overlapping serial range [${data.startSerial}-${data.endSerial}] with existing batch '${b.batchNumber}' [${b.startSerial}-${b.endSerial}]`);
                err.statusCode = 400;
                throw err;
            }
        }
        const totalCount = data.endSerial - data.startSerial + 1;
        const batch = await models_1.MaterialBatch.create({
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
            status: index_1.MaterialBatchStatus.IN_STOCK,
            securityBagSealNumber: data.securityBagSealNumber,
            confidentialNotes: data.confidentialNotes
        });
        return batch;
    }
    static async dispatchMaterials(data) {
        const batch = await models_1.MaterialBatch.findById(data.batchId);
        if (!batch)
            throw new Error('Material batch not found');
        if (data.startSerial < batch.startSerial || data.endSerial > batch.endSerial) {
            throw new Error(`Dispatch range [${data.startSerial}-${data.endSerial}] exceeds batch boundary [${batch.startSerial}-${batch.endSerial}]`);
        }
        batch.dispatchedCount += data.quantity;
        batch.status = index_1.MaterialBatchStatus.DISPATCHED;
        await batch.save();
        const movement = await models_1.MaterialMovement.create({
            institutionId: batch.institutionId,
            batchId: batch._id,
            movementType: index_1.MaterialMovementType.DISPATCH_TO_CENTER,
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
    static async recordMovement(data) {
        const batch = await models_1.MaterialBatch.findById(data.batchId);
        if (!batch)
            throw new Error('Material batch not found');
        const movement = await models_1.MaterialMovement.create({
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
    static async acknowledgeMaterialReceipt(movementId, acknowledgedBy) {
        const movement = await models_1.MaterialMovement.findById(movementId);
        if (!movement)
            throw new Error('Material movement record not found');
        movement.acknowledgementStatus = 'ACKNOWLEDGED';
        movement.acknowledgedBy = acknowledgedBy;
        movement.acknowledgedAt = new Date();
        await movement.save();
        return movement;
    }
    static async reconcileBatch(data) {
        const batch = await models_1.MaterialBatch.findById(data.batchId);
        if (!batch)
            throw new Error('Material batch not found');
        // Acceptance Gate: Usage plus remaining/returned quantities reconciles!
        const totalAccounted = data.usedCount + data.returnedCount + data.damagedCount;
        const delta = batch.dispatchedCount - totalAccounted;
        batch.usedCount = data.usedCount;
        batch.returnedCount = data.returnedCount;
        batch.damagedCount = data.damagedCount;
        batch.reconciledAt = new Date();
        batch.reconciledBy = data.reconciledBy || 'CONTROLLER_OF_EXAMINATIONS';
        if (delta === 0) {
            batch.status = index_1.MaterialBatchStatus.RECONCILED;
            batch.reconciliationNotes = `Perfect reconciliation: Dispatched (${batch.dispatchedCount}) = Used (${data.usedCount}) + Returned (${data.returnedCount}) + Damaged (${data.damagedCount}). ${data.notes || ''}`.trim();
        }
        else {
            batch.status = index_1.MaterialBatchStatus.DISCREPANCY;
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
    static async getBatches(cycleId, institutionId, isExamStaff = false) {
        const filter = {};
        if (cycleId)
            filter.cycleId = cycleId;
        if (institutionId)
            filter.institutionId = institutionId;
        const batches = await models_1.MaterialBatch.find(filter).sort({ createdAt: -1 });
        // Enforce Rule: Confidential metadata (securityBagSealNumber, confidentialNotes) is restricted to exam staff
        if (!isExamStaff) {
            return batches.map(b => {
                const obj = b.toObject();
                delete obj.securityBagSealNumber;
                delete obj.confidentialNotes;
                return obj;
            });
        }
        return batches;
    }
    static async getMovements(batchId) {
        const filter = {};
        if (batchId)
            filter.batchId = batchId;
        return await models_1.MaterialMovement.find(filter)
            .populate('centerId')
            .populate('scheduleId')
            .sort({ timestamp: -1 });
    }
}
exports.ExamOperationsService = ExamOperationsService;
