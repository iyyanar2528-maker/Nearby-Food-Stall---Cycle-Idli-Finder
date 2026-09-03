import { Router, Request, Response } from 'express';
import { store } from '../data/store';
import { FoodSpot } from '../types';

export const spotsRouter = Router();

// Get all food spots with optional filters
spotsRouter.get('/', (req: Request, res: Response) => {
  let spots = store.getAllSpots();
  const { region, stallType, maxDistance, maxPrice, search } = req.query;

  if (region && region !== 'all') {
    spots = spots.filter(s => s.stateRegion === region);
  }

  if (stallType && stallType !== 'all') {
    spots = spots.filter(s => s.stallType === stallType);
  }

  if (maxDistance) {
    const d = Number(maxDistance);
    if (!isNaN(d)) {
      spots = spots.filter(s => s.distanceMeters <= d);
    }
  }

  if (maxPrice) {
    const p = Number(maxPrice);
    if (!isNaN(p)) {
      spots = spots.filter(s => s.topDeal.price <= p);
    }
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    spots = spots.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        (s.nameTa && s.nameTa.toLowerCase().includes(q)) ||
        (s.nameHi && s.nameHi.toLowerCase().includes(q)) ||
        s.cityArea.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.menu.some(m => m.name.toLowerCase().includes(q))
    );
  }

  return res.json({ success: true, count: spots.length, spots });
});

// Get Spot by ID
spotsRouter.get('/:id', (req: Request, res: Response) => {
  const spot = store.getSpotById(req.params.id);
  if (!spot) {
    return res.status(404).json({ error: 'Food spot not found' });
  }
  return res.json({ success: true, spot });
});

// Create new Spot (Vendor / Shop Registration)
spotsRouter.post('/', (req: Request, res: Response) => {
  const spotData: FoodSpot = req.body;
  if (!spotData.name || !spotData.category) {
    return res.status(400).json({ error: 'Spot name and category are required' });
  }

  const newSpot: FoodSpot = {
    ...spotData,
    id: spotData.id || `spot_custom_${Date.now()}`,
    rating: spotData.rating || 5.0,
    reviewCount: spotData.reviewCount || 1,
    isOpenNow: spotData.isOpenNow !== undefined ? spotData.isOpenNow : true,
    distanceMeters: spotData.distanceMeters || 100,
    walkingTimeSeconds: spotData.walkingTimeSeconds || 80,
    stepsCount: spotData.stepsCount || 130,
    bearingDegrees: spotData.bearingDegrees || 0,
    menu: spotData.menu || [],
    photos: spotData.photos || [spotData.image || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc']
  };

  const saved = store.saveSpot(newSpot);
  return res.status(201).json({ success: true, spot: saved });
});

// Update Spot Location & Motion State
spotsRouter.patch('/:id/location', (req: Request, res: Response) => {
  const { distanceMeters, isMoving, speedKmh } = req.body;
  const updated = store.updateSpotLocation(
    req.params.id,
    Number(distanceMeters) || 75,
    Boolean(isMoving),
    speedKmh !== undefined ? Number(speedKmh) : undefined
  );

  if (!updated) {
    return res.status(404).json({ error: 'Spot not found' });
  }

  return res.json({
    success: true,
    message: 'Spot location updated live',
    spot: updated
  });
});

// Update Spot Stock Count
spotsRouter.patch('/:id/stock', (req: Request, res: Response) => {
  const { stock } = req.body;
  if (!stock || typeof stock !== 'object') {
    return res.status(400).json({ error: 'Stock object required' });
  }

  const updated = store.updateSpotStock(req.params.id, stock);
  if (!updated) {
    return res.status(404).json({ error: 'Spot not found' });
  }

  return res.json({
    success: true,
    message: 'Stock updated successfully',
    spot: updated
  });
});

// Update Spot Menu Items
spotsRouter.put('/:id/menu', (req: Request, res: Response) => {
  const { menu } = req.body;
  const spot = store.getSpotById(req.params.id);
  if (!spot) {
    return res.status(404).json({ error: 'Spot not found' });
  }

  spot.menu = menu;
  store.saveSpot(spot);

  return res.json({
    success: true,
    message: 'Menu updated successfully',
    spot
  });
});
