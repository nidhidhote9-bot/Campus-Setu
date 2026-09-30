"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = void 0;
exports.authenticate = authenticate;
exports.validateCSRF = validateCSRF;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.JWT_SECRET = process.env.JWT_SECRET || 'campus_setu_secret_key_2026';
function authenticate(req, res, next) {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Authentication required. No session token provided.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, exports.JWT_SECRET);
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            institutionId: decoded.institutionId,
            studentId: decoded.studentId,
            wardStudentIds: decoded.wardStudentIds
        };
        return next();
    }
    catch (err) {
        return res.status(401).json({ error: 'Invalid or expired authentication session.' });
    }
}
function validateCSRF(req, res, next) {
    // Safe HTTP methods or public auth/admissions endpoints do not require CSRF token check
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method) || req.path.startsWith('/auth/login') || req.path.startsWith('/auth/register') || req.path.startsWith('/admissions/apply') || req.path.includes('/correct')) {
        return next();
    }
    const csrfHeader = req.headers['x-csrf-token'];
    const csrfCookie = req.cookies?.['csrf-token'];
    // For header-based session or API tests, if bearer is used, token is present
    if (req.headers.authorization) {
        return next();
    }
    if (!csrfHeader || (csrfCookie && csrfHeader !== csrfCookie)) {
        return res.status(403).json({ error: 'CSRF Token validation failed.' });
    }
    return next();
}
