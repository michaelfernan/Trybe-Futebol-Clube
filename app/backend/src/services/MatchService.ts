import { FindOptions } from 'sequelize';
import Match from '../database/models/Matches';
import Team from '../database/models/Team';

class MatchService {
  private matchModel: typeof Match;
  constructor() {
    this.matchModel = Match;
  }

  private static buildQueryOptions(inProgress?: string): FindOptions {
    const teamInclude = (teamAs: string) => ({
      model: Team, as: teamAs, attributes: ['teamName'],
    });

    const options: FindOptions = {
      attributes: [
        'id', 'homeTeamId', 'homeTeamGoals',
        'awayTeamId', 'awayTeamGoals', 'inProgress',
      ],
      include: [teamInclude('homeTeam'), teamInclude('awayTeam')],
    };

    if (inProgress !== undefined) {
      options.where = { inProgress: inProgress === 'true' };
    }

    return options;
  }

  public async getMatches(inProgress?: string): Promise<Match[]> {
    try {
      const options = MatchService.buildQueryOptions(inProgress);
      const matches = await this.matchModel.findAll(options);
      return matches;
    } catch (error) {
      console.error('Error fetching matches:', error);
      throw error;
    }
  }
}

export default new MatchService();
