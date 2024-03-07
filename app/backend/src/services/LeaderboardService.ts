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

  public static async getAwayLeaderboard(): Promise<TeamResult[]> {
    const matches = await this.getFinishedAwayMatches();
    const results = this.aggregateAwayResults(matches);

    return results.sort(this.compareTeams);
  }

  private static async getFinishedAwayMatches(): Promise<Match[]> {
    return Match.findAll({
      where: { inProgress: false },
      include: [{ model: Team, as: 'awayTeam', attributes: ['teamName'] }],
    });
  }

  private static aggregateAwayResults(matches: Match[]): TeamResult[] {
    const results: { [key: string]: TeamResult } = {};

    matches.forEach((match) => {
      const awayTeamMatch = match as Match & { awayTeam: Team };
      const awayTeamName = awayTeamMatch.awayTeam.teamName;

      if (!results[awayTeamName]) {
        results[awayTeamName] = this.initializeTeamResult(awayTeamName);
      }
      const updatedResult = this.updateAwayTeamResults(results[awayTeamName], match);
      results[awayTeamName] = updatedResult;
    });

    return Object.values(results);
  }

  private static updateAwayTeamResults(teamResult: TeamResult, match: Match): TeamResult {
    const updatedResult = { ...teamResult };

    updatedResult.totalGames += 1;
    updatedResult.goalsFavor += match.awayTeamGoals;
    updatedResult.goalsOwn += match.homeTeamGoals;
    if (match.awayTeamGoals > match.homeTeamGoals) {
      updatedResult.totalPoints += 3;
      updatedResult.totalVictories += 1;
    } else if (match.awayTeamGoals === match.homeTeamGoals) {
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

  private static compareTeams(a: TeamResult, b: TeamResult): number {
    if (a.totalPoints !== b.totalPoints) return b.totalPoints - a.totalPoints;

    if (a.totalVictories !== b.totalVictories) return b.totalVictories - a.totalVictories;

    if (a.goalsBalance !== b.goalsBalance) return b.goalsBalance - a.goalsBalance;

    return b.goalsFavor - a.goalsFavor;
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

    if (match.homeTeamGoals > match.awayTeamGoals) {
      updatedResult.totalPoints += 3;
      updatedResult.totalVictories += 1;
    } else if (match.homeTeamGoals === match.awayTeamGoals) {
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

  public static async getGeneralLeaderboard(): Promise<TeamResult[]> {
    const homeResults = await this.getHomeLeaderboard();
    const awayResults = await this.getAwayLeaderboard();

    const combinedResults = { ...this.combineResults(homeResults, awayResults) };

    return Object.values(combinedResults).sort(this.compareTeams);
  }

  private static combineResults(
    homeResults: TeamResult[],
    awayResults: TeamResult[],
  ): { [key: string]: TeamResult } {
    const combined: { [key: string]: TeamResult } = {};

    homeResults.forEach((result) => {
      combined[result.name] = { ...result };
    });

    awayResults.forEach((awayResult) => {
      if (combined[awayResult.name]) {
        combined[awayResult.name] = this.mergeTeamResults(combined[awayResult.name], awayResult);
      } else {
        combined[awayResult.name] = { ...awayResult };
      }
    });

    return combined;
  }

  private static mergeTeamResults(homeResult: TeamResult, awayResult: TeamResult): TeamResult {
    return {
      name: homeResult.name,
      totalPoints: homeResult.totalPoints + awayResult.totalPoints,
      totalGames: homeResult.totalGames + awayResult.totalGames,
      totalVictories: homeResult.totalVictories + awayResult.totalVictories,
      totalDraws: homeResult.totalDraws + awayResult.totalDraws,
      totalLosses: homeResult.totalLosses + awayResult.totalLosses,
      goalsFavor: homeResult.goalsFavor + awayResult.goalsFavor,
      goalsOwn: homeResult.goalsOwn + awayResult.goalsOwn,
      goalsBalance: homeResult.goalsBalance + awayResult.goalsBalance,
      efficiency: (
        ((homeResult.totalPoints + awayResult.totalPoints)
        / ((homeResult.totalGames + awayResult.totalGames) * 3)) * 100
      ).toFixed(2),

    };
  }
}

export default LeaderboardService;
