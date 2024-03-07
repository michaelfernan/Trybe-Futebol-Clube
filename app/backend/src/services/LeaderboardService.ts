import Match from '../database/models/Matches';
import Team from '../database/models/Team';

interface TeamResult {
  name: string;
  totalPoints: number;
  totalGames: number;
  totalVictories: number;
  totalDraws: number;
  totalLosses: number;
  goalsFavor: number;
  goalsOwn: number;

  goalsBalance: number;
  efficiency: string;
}

class LeaderboardService {
  public static async getHomeLeaderboard(): Promise<TeamResult[]> {
    const matches = await this.getFinishedHomeMatches();
    const results = this.aggregateHomeResults(matches);

    return (await results).sort(this.compareTeams);
  }

  private static async getFinishedHomeMatches(): Promise<Match[]> {
    return Match.findAll({
      where: { inProgress: false },
      include: [{ model: Team, as: 'homeTeam', attributes: ['teamName'] }],
    });
  }

  private static aggregateHomeResults(matches: Match[]): TeamResult[] {
    const results: { [key: string]: TeamResult } = {};

    matches.forEach((match) => {
      const homeTeamMatch = match as Match & { homeTeam: Team };
      const homeTeamName = homeTeamMatch.homeTeam.teamName;

      if (!results[homeTeamName]) {
        results[homeTeamName] = this.initializeTeamResult(homeTeamName);
      }
      const updatedResult = this.updateTeamResults(results[homeTeamName], match);
      results[homeTeamName] = updatedResult;
    });

    return Object.values(results);
  }

  private static compareTeams(a: TeamResult, b: TeamResult): number {
    if (a.totalPoints !== b.totalPoints) return b.totalPoints - a.totalPoints;
    if (a.totalVictories !== b.totalVictories) return b.totalVictories - a.totalVictories;
    if ((a.goalsFavor - a.goalsOwn) !== (
      b.goalsFavor - b.goalsOwn)) return (b.goalsFavor - b.goalsOwn) - (a.goalsFavor - a.goalsOwn);
    return b.goalsFavor - a.goalsFavor;
  }

  private static async processMatch(match: Match): Promise<TeamResult | null> {
    const homeTeamMatch = match as Match & { homeTeam: Team };
    const homeTeamName = homeTeamMatch.homeTeam.teamName;

    let teamResult = await this.fetchInitialTeamInfo(homeTeamName);
    if (!teamResult) {
      teamResult = this.initializeTeamResult(homeTeamName);
    }

    return this.updateTeamResults(teamResult, homeTeamMatch);
  }

  private static async fetchInitialTeamInfo(teamName: string): Promise<TeamResult | null> {
    const teamInfo = await Team.findOne({
      where: { teamName },
      attributes: ['teamName'],
    });

    if (teamInfo) {
      return this.initializeTeamResult(teamInfo.teamName);
    }
    return null;
  }

  private static initializeTeamResult(teamName: string): TeamResult {
    return {
      name: teamName,
      totalPoints: 0,
      totalGames: 0,
      totalVictories: 0,
      totalDraws: 0,
      totalLosses: 0,
      goalsFavor: 0,
      goalsOwn: 0,
      goalsBalance: 0,
      efficiency: '0.00',
    };
  }

  private static updateTeamResults(teamResult: TeamResult, match: Match): TeamResult {
    const updatedResult = { ...teamResult };

    updatedResult.totalGames += 1;
    updatedResult.goalsFavor += match.homeTeamGoals;
    updatedResult.goalsOwn += match.awayTeamGoals;

    // Atualiza totalPoints e outras estatísticas com base nos resultados do jogo
    if (match.homeTeamGoals > match.awayTeamGoals) { // Vitória do time da casa
      updatedResult.totalPoints += 3;
      updatedResult.totalVictories += 1;
    } else if (match.homeTeamGoals === match.awayTeamGoals) { // Empate
      updatedResult.totalPoints += 1;
      updatedResult.totalDraws += 1;
    } else {
      updatedResult.totalLosses += 1;
    }

    updatedResult.goalsBalance = updatedResult.goalsFavor - updatedResult.goalsOwn;
    updatedResult.efficiency = (
      (updatedResult.totalPoints / (updatedResult.totalGames * 3)) * 100).toFixed(2);

    return updatedResult;
  }
}

export default LeaderboardService;
