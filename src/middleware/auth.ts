import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, AuthUser } from '../types';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { UserRole } from '@prisma/client';

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;

    req.user = decoded;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};

export const authorize = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    // Role hierarchy mapping
    const roleLevels: Record<UserRole, number> = {
      OPERATOR: 1,
      AUDIT_MANAGER: 2,
      AUDIT_APPROVER: 3,
      TENANT_ADMIN: 4,
    };

    const userRoleLevel = roleLevels[req.user.role];
    const hasPermission = roles.some(role => userRoleLevel >= roleLevels[role]);

    if (!hasPermission) {
      return next(new ForbiddenError(`Requires one of roles: ${roles.join(', ')}`));
    }

    next();
  };
};