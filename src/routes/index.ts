import { Router } from 'express';
import evaluationRoutes from '@/routes/evaluationRoutes';
import poolRoutes from '@/routes/poolRoutes';

const router = Router();

router.use('/evaluate', evaluationRoutes);
router.use('/pools', poolRoutes);

export default router;
