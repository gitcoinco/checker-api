import { Router } from 'express';
import poolRoutes from './poolRoutes';

const router = Router();

router.use('/pools', poolRoutes);

export default router;
