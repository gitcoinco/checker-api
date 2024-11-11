import { Router } from 'express';
import evaluationRoutes from '@/routes/evaluationRoutes';
import poolRoutes from '@/routes/poolRoutes';

const router = Router();

router.use('/evaluations', evaluationRoutes);
router.use('/pools', poolRoutes); // TODO: should we remove this ?

export default router;
