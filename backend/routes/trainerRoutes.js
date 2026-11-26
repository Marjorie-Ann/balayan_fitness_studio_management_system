import express from 'express';
import * as trainerController from '../controller/trainerController.js';

const router = express.Router();

router.post('/login', trainerController.login);
router.post('/change-password', trainerController.changePassword);
router.get('/notifications/:userId', trainerController.getNotifications);
router.put('/notifications/:userId/read', trainerController.markAllRead);

export default router;