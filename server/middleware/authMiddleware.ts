import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { getFallbackDb, getDbStatus } from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'zenova_super_secret_fallback_key_2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'superadmin';
  };
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const user = await User.findById(decoded.id);
      if (!user) {
        res.status(401).json({ success: false, message: 'User not found' });
        return;
      }
      req.user = { id: user.id, email: user.email, role: user.role };
    } else {
      const db = getFallbackDb();
      const user = db.users?.find(u => u.id === decoded.id);
      if (!user) {
        res.status(401).json({ success: false, message: 'User not found' });
        return;
      }
      req.user = { id: user.id, email: user.email, role: user.role };
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'superadmin') {
    res.status(403).json({ success: false, message: 'Forbidden: Superadmin privileges required' });
    return;
  }
  next();
};
