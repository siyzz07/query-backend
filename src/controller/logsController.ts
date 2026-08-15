import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Log } from '../models/Log';

export async function getLogs(req: AuthenticatedRequest, res: Response) {
  try {
    const logs = await Log.find().sort({ timestamp: 1 });
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getStats(req: AuthenticatedRequest, res: Response) {
  try {
    res.json({
      activeNodes: '24 Nodes Connected',
      dbHealth: '99.98% Uptime',
      memory: '42.8 GB / 64 GB'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
