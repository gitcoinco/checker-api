import { Router } from 'express';
import evaluationRoutes from '@/routes/evaluationRoutes';
import poolRoutes from '@/routes/poolRoutes';
import passportRoutes from '@/routes/passportValidationRoutes';

const router = Router();

router.use('/evaluate', evaluationRoutes);
router.use('/pools', poolRoutes);
router.use('/passport', passportRoutes);

export default router;
