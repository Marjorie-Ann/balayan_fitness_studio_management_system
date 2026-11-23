import express from 'express';
import * as trainerController from '../controller/trainerController.js';

const router = express.Router();

router.post('/login', trainerController.login);

export default router;