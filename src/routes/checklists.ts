import { Router } from 'express';
import * as controller from '../controllers/checklistController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.post(
  '/', 
  authorize([UserRole.AUDIT_MANAGER]), 
  controller.createChecklist
);

router.get(
  '/', 
  authorize([UserRole.OPERATOR]), 
  controller.getChecklists
);

router.get(
  '/:id', 
  authorize([UserRole.OPERATOR]), 
  controller.getChecklist
);

router.delete(
  '/:id', 
  authorize([UserRole.TENANT_ADMIN]), 
  controller.deleteChecklist
);

router.post(
  '/:id/clone', 
  authorize([UserRole.AUDIT_MANAGER]), 
  controller.cloneChecklist
);

export default router;