import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@shared/index';
import { Student } from '../models/models';

export const JWT_SECRET = process.env.JWT_SECRET || 'campus_setu_secret_key_2026';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
    institutionId?: string;
    studentId?: string;
    wardStudentIds?: string[];
  };
  csrfToken?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No session token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      institutionId: decoded.institutionId,
      studentId: decoded.studentId,
      wardStudentIds: decoded.wardStudentIds
    };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication session.' });
  }
}

export function validateCSRF(req: AuthRequest, res: Response, next: NextFunction) {
  // Safe HTTP methods or public auth/admissions endpoints do not require CSRF token check
  if (
    ['GET', 'HEAD', 'OPTIONS'].includes(req.method) ||
    req.path.startsWith('/auth/login') ||
    req.path.startsWith('/auth/register') ||
    req.path.startsWith('/admissions/apply') ||
    req.path.includes('/correct') ||
    req.path.includes('/mobile/deep-links/validate') ||
    req.path.includes('/mobile/offline/attempt-write')
  ) {
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
