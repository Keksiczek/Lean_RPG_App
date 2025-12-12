import { Router } from 'express';
import checklistRoutes from './checklists';
// Import other routes...

const router = Router();

router.use('/audits/checklist-templates', checklistRoutes);
// Mount other routes...

export default router;