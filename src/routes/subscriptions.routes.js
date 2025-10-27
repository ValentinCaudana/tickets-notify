import { Router } from 'express';
import { listSubscriptions, createSubscription } from '../controllers/subscriptions.controller.js';

const subscriptionsRoutes = Router();

subscriptionsRoutes.get('/', listSubscriptions);
subscriptionsRoutes.post('/', createSubscription);

export default subscriptionsRoutes;
