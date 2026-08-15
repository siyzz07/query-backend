import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Invoice } from '../models/Invoice';

export async function getMyInvoices(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const invoices = await Invoice.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(invoices);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
