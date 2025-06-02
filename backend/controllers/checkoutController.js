import Stripe from 'stripe';
import Medicine from '../models/MedicineSchema.js'; 
import User from "../models/UserSchema.js";

let stripe = null;

export const createCheckoutSession = async (req, res) => {
  console.log("→ [CheckoutController] Request received:", {
    method: req.method,
    path: req.path,
    headers: {
      'content-type': req.headers['content-type'],
      'authorization': req.headers['authorization'] ? 'Bearer [REDACTED]' : 'None'
    }
  });
  console.log("→ [CheckoutController] Request body:", JSON.stringify(req.body, null, 2));

  const { cartItems, userId: bodyUserId } = req.body;
  const tokenUserId = req.userId; 
  
  console.log(`→ [CheckoutController] User IDs - From token: ${tokenUserId}, From body: ${bodyUserId}`);

  const userIdToUse = tokenUserId || bodyUserId;

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart items are required.' });
  }

  if (!userIdToUse) {
    return res.status(400).json({ success: false, message: 'User identification is required.' });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.error('❌ STRIPE_SECRET_KEY is missing or empty in environment variables');
    return res.status(500).json({ success: false, message: 'Payment configuration error.' });
  }

  if (!stripe) {
    try {
      stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
      console.log('✅ Stripe initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Stripe:', error.message);
      return res.status(500).json({ success: false, message: 'Payment initialization failed.' });
    }
  }

  try {
    console.log(`→ [CheckoutController] Looking up user ID: ${userIdToUse}`);
    const user = await User.findById(userIdToUse);
    if (!user) {
      console.error(`❌ [CheckoutController] User not found with ID: ${userIdToUse}`);
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    console.log(`→ [CheckoutController] Found user: ${user.email}`);

    console.log("→ [CheckoutController] Processing cart items for checkout:", JSON.stringify(cartItems, null, 2));

    let line_items = [];
    

    for (const item of cartItems) {
      if (!item.medicineId || !item.name || item.price == null || item.quantity == null) {
        console.error('Invalid cart item structure:', item);
        return res.status(400).json({
            success: false,
            message: `Invalid item in cart. Essential details missing for item starting with ID: ${item.medicineId || 'N/A'}`
        });
      }

      line_items.push({
        price_data: {
          currency: process.env.CURRENCY || 'huf',
          product_data: {
            name: item.name, 
            metadata: { medicineId: item.medicineId } 
          },
          unit_amount: item.price * 100, 
        },
        quantity: item.quantity,
      });
    }

    

    if (line_items.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No valid items to checkout.',
        });
    }

    const clientUrl = process.env.CLIENT_SITE_URL || 'http://localhost:3000'; // Default to React app port

    console.log(`→ [CheckoutController] Creating Stripe session with ${line_items.length} items, client URL: ${clientUrl}`);
    
    const sessionParams = {
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      success_url: `${clientUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/cart`, 
      customer_email: user.email, 
      client_reference_id: userIdToUse, 
      metadata: {
        userId: userIdToUse,
        cartItems: JSON.stringify(cartItems.map(ci => ({ medicineId: ci.medicineId || ci._id || ci.id, quantity: ci.quantity })))
      }
    };
    
    console.log(`→ [CheckoutController] Using success_url: ${sessionParams.success_url}`);
    console.log(`→ [CheckoutController] Using cancel_url: ${sessionParams.cancel_url}`);
    
    console.log('→ [CheckoutController] Session params:', JSON.stringify(sessionParams, (key, value) => {
      // Mask email for privacy in logs
      if (key === 'customer_email') return value ? '[REDACTED_EMAIL]' : value;
      return value;
    }, 2));
    
    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log(`→ [CheckoutController] Stripe session created successfully: ${session.id}`);
    res.status(200).json({ success: true, sessionId: session.id, sessionUrl: session.url });

  } catch (error) {
    console.error('❌ [CheckoutController] Stripe Session Creation Error:', error);
    
    if (error.type) {
      console.error(`❌ [CheckoutController] Stripe error type: ${error.type}`);
      console.error(`❌ [CheckoutController] Stripe error code: ${error.code || 'N/A'}`);
      console.error(`❌ [CheckoutController] Stripe error param: ${error.param || 'N/A'}`);
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create checkout session.', 
      error: error.message,
      errorType: error.type || null,
      errorCode: error.code || null
    });
  }
}; 