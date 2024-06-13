import type { NextApiRequest, NextApiResponse } from 'next';
import { getSurveys } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const surveys = await getSurveys();
    res.status(200).json(surveys);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
