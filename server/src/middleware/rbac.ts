import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { UserRole } from '@shared/index';

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated.' });
    }

    if (req.user.role === UserRole.SUPER_ADMIN || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      error: `Access Denied: Role '${req.user.role}' is not authorized for this resource.`
    });
  };
}

export function enforceScope(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthenticated.' });
  }

  // SuperAdmin has global scope
  if (req.user.role === UserRole.SUPER_ADMIN) {
    return next();
  }

  // Check student self-scope if studentId param is present
  const targetStudentId = req.params.studentId || req.body.studentId || req.query.studentId;

  if (req.user.role === UserRole.STUDENT && targetStudentId) {
    if (req.user.studentId !== targetStudentId) {
      return res.status(403).json({ error: 'Forbidden: Students can only access their own records.' });
    }
  }

  // Check guardian ward-scope if targetStudentId is present
  if (req.user.role === UserRole.GUARDIAN && targetStudentId) {
    const wardIds = req.user.wardStudentIds || [];
    if (!wardIds.includes(targetStudentId.toString())) {
      return res.status(403).json({ error: 'Forbidden: Guardians can only access their assigned wards.' });
    }
  }

  return next();
}
