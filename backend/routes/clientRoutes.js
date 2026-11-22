import * as clientController from '../controller/clientController.js';
import express from 'express';

const clientRoutes = express.Router();

// 2.1.1 Implement client login and logout
clientRoutes.post('/login', clientController.login);
clientRoutes.post('/logout', clientController.logout);


export default clientRoutes;