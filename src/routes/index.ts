import { Router } from 'express';
import evaluationRoutes from '@/routes/evaluationRoutes';
import poolRoutes from '@/routes/poolRoutes';
import profileRoutes from '@/routes/profileRoutes';

const router = Router();

router.use('/evaluations', evaluationRoutes);
router.use('/pools', poolRoutes);
router.use('/profiles', profileRoutes);

export default router;
