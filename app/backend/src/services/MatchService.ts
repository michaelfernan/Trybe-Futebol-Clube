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
      attributes: ['id',
        'homeTeamId', 'homeTeamGoals', 'awayTeamId', 'awayTeamGoals', 'inProgress'],
      include: [teamInclude('homeTeam'), teamInclude('awayTeam')],
    };

    if (inProgress !== undefined) {
      options.where = { inProgress: inProgress === 'true' };
    }

    return options;
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

  public async finishMatch(id: number): Promise<Match> {
    const match = await this.matchModel.findByPk(id, {
      include: [
        { model: Team, as: 'homeTeam', attributes: ['teamName'] },
        { model: Team, as: 'awayTeam', attributes: ['teamName'] },
      ],
    });

    if (!match) {
      throw new Error('Match not found');
    }

    if (!match.inProgress) {
      throw new Error('Match is not in progress');
    }

    await match.update({ inProgress: false });

    return match;
  }

  public async updateMatch(
    id: number,
    homeTeamGoals: number,
    awayTeamGoals: number,
  ): Promise<Match> {
    const match = await this.matchModel.findByPk(id);
    if (!match) {
      throw new Error('Match not found');
    }

    await match.update({ homeTeamGoals, awayTeamGoals });
    return match;
  }

  public async createMatch(
    homeTeamId: number,
    awayTeamId: number,
    homeTeamGoals: number,
    awayTeamGoals: number,
  ): Promise<Match> {
    if (homeTeamId === awayTeamId) {
      throw new Error('It is not possible to create a match with two equal teams');
    }

    const homeTeamExists = await Team.findByPk(homeTeamId);
    const awayTeamExists = await Team.findByPk(awayTeamId);

    if (!homeTeamExists || !awayTeamExists) {
      throw new Error('There is no team with such id!');
    }

    const newMatch = await this.matchModel.create({
      homeTeamId, awayTeamId, homeTeamGoals, awayTeamGoals, inProgress: true,
    });

    return newMatch;
  }
}

export default new MatchService();
