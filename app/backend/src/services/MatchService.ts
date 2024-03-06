import Match from '../database/models/Matches';
import Team from '../database/models/Team';

class MatchService {
  private matchModel: typeof Match;

  constructor() {
    this.matchModel = Match;
  }

  public static buildQueryOptions() {
    return {
      attributes: ['id',
        'homeTeamId', 'homeTeamGoals', 'awayTeamId', 'awayTeamGoals', 'inProgress'],
      include: [
        {
          model: Team,
          as: 'homeTeam',
          attributes: ['teamName'],
        },
        {
          model: Team,
          as: 'awayTeam',
          attributes: ['teamName'],
        },
      ],
    };
  }

  public async getAllMatches(): Promise<Match[]> {
    try {
      const options = MatchService.buildQueryOptions();
      const matches = await this.matchModel.findAll(options);
      return matches;
    } catch (error) {
      console.error('Error fetching matches:', error);
      throw error;
    }
  }
}

export default new MatchService();
