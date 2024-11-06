import { Router } from 'express';
import poolRoutes from './poolRoutes';
import reviewRoutes from './reviewRoutes';

const router = Router();

router.use('/pools', poolRoutes);
router.use('/review', reviewRoutes);

export default router;
