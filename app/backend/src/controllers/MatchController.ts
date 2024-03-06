import { Request, Response } from 'express';
import MatchService from '../services/MatchService';

class MatchController {
  public static async getAll(req: Request, res: Response) {
    try {
      const matches = await MatchService.getAllMatches();
      console.log(matches);
      return res.status(200).json(matches);
    } catch (error) {
      console.error('Error in controller:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default MatchController;
