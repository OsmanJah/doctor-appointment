import express from 'express';
import { createCheckoutSession } from '../controllers/checkoutController.js';
// Import authentication middleware if you want to restrict checkout to logged-in users
import { authenticate, restrict } from '../auth/verifyToken.js'; 

const router = express.Router();

// POST route to create a checkout session
// Add authenticate middleware if needed: router.post('/create-session', authenticate, createCheckoutSession);
router.post('/create-session', authenticate, restrict(["patient"]), createCheckoutSession);

export default router; 