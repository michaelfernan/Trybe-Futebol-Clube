import Team from '../database/models/Team';

class TeamService {
  public async getAllTeams(): Promise<{ id: number; teamName: string }[]> {
    try {
      const teams = await Team.findAll();

      return teams.map((team) => ({
        id: team.id,
        teamName: team.team_name,
      }));
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  }

  public async getTeamById(id: number): Promise<{ id: number; teamName: string } | null> {
    const team = await Team.findByPk(id);
    if (!team) {
      return null;
    }
    return { id: team.id, teamName: team.team_name };
  }
}

export default new TeamService();
