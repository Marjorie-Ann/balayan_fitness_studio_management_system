import express from 'express';
import * as trainerController from '../controller/trainerController.js';

const router = express.Router();

router.post('/login', trainerController.login);
router.post('/change-password', trainerController.changePassword);

export default router;