import { Router, Request, Response } from 'express';
import { database } from '../db/database';

export const dbAdminRouter = Router();

// Get Database Statistics & Table Row Counts
dbAdminRouter.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = database.getStats();
    return res.json({
      success: true,
      database: 'SQLite 3 (WAL mode)',
      ...stats,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Database error' });
  }
});
