import express from 'express';
import * as trainerController from '../controller/trainerController.js';

const router = express.Router();

router.post('/login', trainerController.login);
router.post('/change-password', trainerController.changePassword);
router.get('/notifications/:userId', trainerController.getNotifications);
router.put('/notifications/:userId/read', trainerController.markAllRead);
router.get('/appointments/:userId', trainerController.getAppointments);
router.put('/appointments/:appointmentId', trainerController.updateAppointment);
router.get('/availability/:userId', trainerController.getAvailability);
router.post('/availability/:userId', trainerController.postAvailability);
router.delete('/availability/:availabilityId', trainerController.deleteAvailability);
router.get('/all-trainers', trainerController.getAllTrainers);

// Fitness Progress (Trainer write/manage, Client read-only)
router.get('/my-clients/:userId', trainerController.getTrainerClients);
router.get('/fitness-progress/:userId', trainerController.getFitnessProgress);
router.post('/fitness-progress/:userId', trainerController.postFitnessProgress);
router.delete('/fitness-progress/:progressId', trainerController.deleteFitnessProgress);
router.get('/client-progress/:userId', trainerController.getClientFitnessProgress);

export default router; 