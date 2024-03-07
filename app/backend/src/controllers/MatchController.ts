import { Request, Response } from 'express';
import MatchService from '../services/MatchService';

class MatchController {
  public static async getAll(req: Request, res: Response) {
    try {
      const { inProgress } = req.query;

      let matches;
      if (inProgress !== undefined) {
        matches = await MatchService.getMatches(inProgress as string);
      } else {
        matches = await MatchService.getAllMatches();
      }

      console.log(matches);
      return res.status(200).json(matches);
    } catch (error) {
      console.error('Error in controller:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async finishMatch(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await MatchService.finishMatch(parseInt(id, 10));
      return res.status(200).json({ message: 'Finished' });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Match not found' || error.message === 'Match is not in progress') {
          return res.status(400).json({ message: error.message });
        }
        console.error('Error finishing match:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
      }
      return res.status(500).json({ message: 'Unknown error' });
    }
  }

  public static async updateMatch(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { homeTeamGoals, awayTeamGoals } = req.body;

      const updatedMatch = await MatchService
        .updateMatch(parseInt(id, 10), homeTeamGoals, awayTeamGoals);
      return res.status(200).json(updatedMatch);
    } catch (error) {
      console.error('Error in updatedMatch', error);
    }
  }

  public static async createMatch(req: Request, res: Response) {
    try {
      const { homeTeamId, awayTeamId, homeTeamGoals, awayTeamGoals } = req.body;

      const newMatch = await MatchService
        .createMatch(homeTeamId, awayTeamId, homeTeamGoals, awayTeamGoals);
      return res.status(201).json(newMatch);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'It is not possible to create a match with two equal teams') {
          return res.status(422).json({ message: error.message });
        }
        if (error.message === 'There is no team with such id!') {
          return res.status(404).json({ message: error.message });
        }
      }
    }
  }
}

export default MatchController;
