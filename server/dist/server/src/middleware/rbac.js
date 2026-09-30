"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
exports.enforceScope = enforceScope;
const index_1 = require("@shared/index");
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthenticated.' });
        }
        if (req.user.role === index_1.UserRole.SUPER_ADMIN || allowedRoles.includes(req.user.role)) {
            return next();
        }
        return res.status(403).json({
            error: `Access Denied: Role '${req.user.role}' is not authorized for this resource.`
        });
    };
}
function enforceScope(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthenticated.' });
    }
    // SuperAdmin has global scope
    if (req.user.role === index_1.UserRole.SUPER_ADMIN) {
        return next();
    }
    // Check student self-scope if studentId param is present
    const targetStudentId = req.params.studentId || req.body.studentId || req.query.studentId;
    if (req.user.role === index_1.UserRole.STUDENT && targetStudentId) {
        if (req.user.studentId !== targetStudentId) {
            return res.status(403).json({ error: 'Forbidden: Students can only access their own records.' });
        }
    }
    // Check guardian ward-scope if targetStudentId is present
    if (req.user.role === index_1.UserRole.GUARDIAN && targetStudentId) {
        const wardIds = req.user.wardStudentIds || [];
        if (!wardIds.includes(targetStudentId.toString())) {
            return res.status(403).json({ error: 'Forbidden: Guardians can only access their assigned wards.' });
        }
    }
    return next();
}
