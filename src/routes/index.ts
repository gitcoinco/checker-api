import { Router } from 'express';
import poolRoutes from './poolRoutes';
import evaluateRoutes from './evaluateRoutes';

const router = Router();

router.use('/pools', poolRoutes);
router.use('/evaluate', evaluateRoutes);

export default router;
