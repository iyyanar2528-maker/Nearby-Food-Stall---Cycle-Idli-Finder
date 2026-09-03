import { Router, Request, Response } from 'express';
import { store } from '../data/store';

export const broadcastRouter = Router();

// Get all active moving cycle broadcasts
broadcastRouter.get('/moving-cycles', (req: Request, res: Response) => {
  const broadcasts = store.getMovingCycleBroadcasts();
  return res.json({
    success: true,
    count: broadcasts.length,
    broadcasts
  });
});

// Broadcast live location & moving radar ping
broadcastRouter.post('/live-location', (req: Request, res: Response) => {
  const { spotId, distanceMeters, isMoving, speedKmh } = req.body;
  if (!spotId) {
    return res.status(400).json({ error: 'spotId is required' });
  }

  const updatedSpot = store.updateSpotLocation(
    spotId,
    Number(distanceMeters) || 75,
    isMoving !== undefined ? Boolean(isMoving) : true,
    speedKmh !== undefined ? Number(speedKmh) : 6
  );

  if (!updatedSpot) {
    return res.status(404).json({ error: 'Stall not found' });
  }

  return res.json({
    success: true,
    message: 'Live GPS location radar broadcasted to nearby customers',
    spot: updatedSpot
  });
});

// Trigger Horn / Bell Proximity Alert to foodies within 150m
broadcastRouter.post('/trigger-bell', (req: Request, res: Response) => {
  const { spotId } = req.body;
  if (!spotId) {
    return res.status(400).json({ error: 'spotId is required' });
  }

  const result = store.triggerBellPing(spotId);
  return res.json(result);
});
