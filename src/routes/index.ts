import { Router } from 'express';
import destinations from './destinations';
import destination from './destination';
import seed from './seed';
const router = Router();

router.use('/destination', destination);
router.use('/destinations', destinations);
router.use('/seed', seed);

export default router;