import { Router, Request, Response } from 'express';
import { store } from '../data/store';
import { UserSubscription } from '../types';

export const subscriptionsRouter = Router();

// Get available subscription plans (Customer & Vendor SaaS)
subscriptionsRouter.get('/plans', (req: Request, res: Response) => {
  const { role } = req.query;
  let plans = store.getPlans();
  if (role) {
    plans = plans.filter(p => p.targetRole === role || (role === 'moving_stall_owner' && p.targetRole === 'vendor') || (role === 'shop_owner' && p.targetRole === 'shop'));
  }
  return res.json({ success: true, plans });
});

// Create new Subscription / Pass purchase
subscriptionsRouter.post('/create', (req: Request, res: Response) => {
  const {
    userId,
    userName,
    userPhone,
    planId,
    paymentMethod,
    selectedSpotId,
    selectedSpotName,
    specialInstructions
  } = req.body;

  if (!userId || !planId) {
    return res.status(400).json({ error: 'userId and planId are required' });
  }

  const plan = store.getPlans().find(p => p.id === planId);
  if (!plan) {
    return res.status(404).json({ error: 'Subscription plan not found' });
  }

  const daysValid = plan.period === 'weekly' ? 7 : plan.period === '15days' ? 15 : 30;
  const now = new Date();
  const expiry = new Date(now.getTime() + daysValid * 24 * 60 * 60 * 1000);

  const newSub: UserSubscription = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    userId,
    userName: userName || 'Food Explorer',
    userPhone: userPhone || '9876543210',
    planId: plan.id,
    planTitle: plan.title,
    targetRole: plan.targetRole,
    amount: plan.price,
    status: 'active',
    startDate: now.toISOString(),
    expiryDate: expiry.toISOString(),
    deliveriesRemaining: plan.deliveriesCount || daysValid,
    paymentMethod: paymentMethod || 'upi_gpay',
    paymentId: `TXN_${Date.now()}_UPI`,
    selectedSpotId: selectedSpotId || (plan.targetRole === 'customer' ? 'spot-cycle-1' : undefined),
    selectedSpotName: selectedSpotName || (plan.targetRole === 'customer' ? 'Muthu Anna Cycle Idli' : undefined),
    specialInstructions: specialInstructions?.trim(),
    qrPassCode: `PASS-${plan.targetRole.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
  };

  const saved = store.createSubscription(newSub);
  return res.status(201).json({
    success: true,
    message: 'Subscription pass activated successfully!',
    subscription: saved
  });
});

// Get User's Active Subscriptions
subscriptionsRouter.get('/my-subscriptions/:userId', (req: Request, res: Response) => {
  const subs = store.getSubscriptionsByUserId(req.params.userId);
  return res.json({ success: true, count: subs.length, subscriptions: subs });
});

// Get Vendor's Subscribers List
subscriptionsRouter.get('/vendor-subscribers/:vendorId', (req: Request, res: Response) => {
  const subs = store.getSubscriptionsByVendorId(req.params.vendorId);
  return res.json({ success: true, count: subs.length, subscribers: subs });
});

// Update Subscription Status (Pause / Resume / Cancel)
subscriptionsRouter.patch('/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  if (!status || !['active', 'paused', 'expired'].includes(status)) {
    return res.status(400).json({ error: 'Valid status is required (active, paused, expired)' });
  }

  const updated = store.updateSubscriptionStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Subscription not found' });
  }

  return res.json({
    success: true,
    message: `Subscription ${status === 'paused' ? 'paused' : status === 'active' ? 'resumed' : 'cancelled'} successfully`,
    subscription: updated
  });
});
