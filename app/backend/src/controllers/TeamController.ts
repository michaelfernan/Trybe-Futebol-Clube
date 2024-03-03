import { Request, Response } from 'express';
import TeamService from '../services/TeamService';

class TeamController {
  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const teams = await TeamService.getAllTeams();
      return res.status(200).json(teams);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async getById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const team = await TeamService.getTeamById(Number(id));
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    return res.status(200).json(team);
  }
}

export default new TeamController();
