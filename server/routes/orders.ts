import { Router, Request, Response } from 'express';
import { store } from '../data/store';
import { CustomerOrder } from '../types';

export const ordersRouter = Router();

// Get Orders for customer or spot
ordersRouter.get('/', (req: Request, res: Response) => {
  const { customerId, spotId } = req.query;
  let orders = store.getAllOrders();

  if (customerId && typeof customerId === 'string') {
    orders = store.getOrdersByCustomerId(customerId);
  } else if (spotId && typeof spotId === 'string') {
    orders = store.getOrdersBySpotId(spotId);
  }

  return res.json({ success: true, count: orders.length, orders });
});

// Place new Order
ordersRouter.post('/', (req: Request, res: Response) => {
  const { customerId, customerName, customerPhone, spotId, spotName, items, totalAmount, paymentMethod, deliveryNotes, isSubscriptionDelivery } = req.body;

  if (!spotId || !items || !items.length) {
    return res.status(400).json({ error: 'spotId and items are required' });
  }

  const orderNum = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder: CustomerOrder = {
    id: `ord_${Date.now()}`,
    orderNumber: orderNum,
    customerId: customerId || 'guest_user',
    customerName: customerName || 'Customer',
    customerPhone: customerPhone || '9876543210',
    spotId,
    spotName: spotName || 'Local Street Stall',
    items,
    totalAmount: Number(totalAmount) || 50,
    paymentMethod: paymentMethod || 'UPI (GPay)',
    status: 'preparing',
    isSubscriptionDelivery: Boolean(isSubscriptionDelivery),
    createdAt: new Date().toISOString(),
    deliveryNotes: deliveryNotes?.trim()
  };

  const saved = store.createOrder(newOrder);
  return res.status(201).json({
    success: true,
    message: `Order #${orderNum} placed successfully!`,
    order: saved
  });
});

// Update Order Status
ordersRouter.patch('/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'status is required' });
  }

  const updated = store.updateOrderStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }

  return res.json({
    success: true,
    message: `Order marked as ${status}`,
    order: updated
  });
});
