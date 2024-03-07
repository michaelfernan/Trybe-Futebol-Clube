import { Request, Response } from 'express';
import LeaderboardService from '../services/LeaderboardService';

class LeaderboardController {
  public static async getHomeLeaderboard(req: Request, res: Response) {
    try {
      const leaderboard = await LeaderboardService.getHomeLeaderboard();
      return res.status(200).json(leaderboard);
    } catch (error) {
      console.error('Error in LeaderboardController:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default LeaderboardController;
