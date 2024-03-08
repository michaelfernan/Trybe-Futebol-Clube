import * as sinon from 'sinon';
import * as chai from 'chai';
// @ts-ignore
import chaiHttp = require('chai-http');
import { app } from '../app';
import LeaderboardService from '../services/LeaderboardService';
import { MockLeaderboard } from './Mocks';
import MatchService from '../services/MatchService';
import Match from '../database/models/Matches';
import Team from '../database/models/Team';


chai.use(chaiHttp);
const { expect } = chai;

describe('LeaderboardController', () => {
  describe('getHomeLeaderboard', () => {
    let leaderboardStub: sinon.SinonStub;

    beforeEach(() => {
      leaderboardStub = sinon.stub(LeaderboardService, 'getHomeLeaderboard');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('deve retornar a classificação quando o serviço responde com sucesso', async () => {
      const fakeLeaderboard = MockLeaderboard;
      leaderboardStub.resolves(fakeLeaderboard);

      const res = await chai.request(app).get('/leaderboard/home');

      expect(res).to.have.status(200);
      expect(res.body).to.deep.equal(fakeLeaderboard);
    });

    it('deve retornar erro 500 quando o serviço falha', async () => {
      leaderboardStub.rejects(new Error('Erro no servidor'));

      const res = await chai.request(app).get('/leaderboard/home');

      expect(res).to.have.status(500);
      expect(res.body).to.have.property('message', 'Internal server error home');
    });
  });
  describe('getAwayLeaderboard', () => {
    let awayLeaderboardStub: sinon.SinonStub;

    beforeEach(() => {
      awayLeaderboardStub = sinon.stub(LeaderboardService, 'getAwayLeaderboard');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('deve retornar a classificação de jogos fora de casa quando o serviço responde com sucesso', async () => {
      const fakeAwayLeaderboard = MockLeaderboard;
      awayLeaderboardStub.resolves(fakeAwayLeaderboard);

      const res = await chai.request(app).get('/leaderboard/away');

      expect(res).to.have.status(200);
      expect(res.body).to.deep.equal(fakeAwayLeaderboard);
    });

    it('deve retornar erro 500 quando o serviço falha', async () => {
      awayLeaderboardStub.rejects(new Error('Erro no servidor'));

      const res = await chai.request(app).get('/leaderboard/away');

      expect(res).to.have.status(500);
      expect(res.body).to.have.property('message', 'Internal server error');
    });
  });
  describe('getHomeLeaderboard', () => {
    it('deve retornar a classificação quando o serviço responde com sucesso', async () => {
      
      const findAllStub = sinon.stub(Match, 'findAll').resolves([]);
      const protoStub = sinon.stub(LeaderboardService as any, 'getFinishedHomeMatches').resolves([]);
      const result = await LeaderboardService.getHomeLeaderboard();
          expect(protoStub.calledOnce).to.be.true;
          expect(result).to.deep.equal([]);findAllStub.restore();
          protoStub.restore();
    });
  
  }); 
  describe('finishMatch', () => {
    it('deve finalizar um jogo', async () => {
      const fakeMatch = {
        inProgress: true,
        update: sinon.stub().resolves(),
      };
      sinon.stub(Match, 'findByPk').resolves(fakeMatch as any);
  
      await MatchService.finishMatch(1);
  
      expect(fakeMatch.update.calledWith({ inProgress: false })).to.be.true;
      sinon.restore();
    });
  });

  describe('getAllMatches', () => {
  it('deve retornar todos os jogos', async () => {
    const mockMatches = [{ id: 1, homeTeamId: 2, awayTeamId: 3, inProgress: true }];
    sinon.stub(Match, 'findAll').resolves(mockMatches as any);

    const matches = await MatchService.getAllMatches();

    expect(matches).to.deep.equal(mockMatches);
    sinon.restore();
  });
  });
  describe('updateMatch', () => {
  it('deve atualizar um jogo', async () => {
    const fakeMatch = {
      update: sinon.stub().resolves(),
    };
    sinon.stub(Match, 'findByPk').resolves(fakeMatch as any);

    await MatchService.updateMatch(1, 2, 3);

    expect(fakeMatch.update.calledWith({ homeTeamGoals: 2, awayTeamGoals: 3 })).to.be.true;
    sinon.restore();
  });
  });

  describe('createMatch', () => {
  it('deve criar um novo jogo', async () => {
    sinon.stub(Team, 'findByPk').resolves({} as any);
    const createStub = sinon.stub(Match, 'create').resolves();

    await MatchService.createMatch(1, 2, 3, 4);

    expect(createStub.calledOnce).to.be.true;
    sinon.restore();
  });
  });

  describe('getGeneralLeaderboard', () => {
    it('deve retornar a classificação geral', async () => {
      const mockHomeResults = [{ name: 'Time A', totalPoints: 3, totalGames: 1, totalVictories: 1, totalDraws: 0, totalLosses: 0, goalsFavor: 3, goalsOwn: 0, goalsBalance: 3, efficiency: '100.00' }];
      const mockAwayResults = [{ name: 'Time A', totalPoints: 4, totalGames: 2, totalVictories: 1, totalDraws: 1, totalLosses: 0, goalsFavor: 3, goalsOwn: 1, goalsBalance: 2, efficiency: '66.67' }];
  
      sinon.stub(LeaderboardService, 'getHomeLeaderboard').resolves(mockHomeResults as any);
      sinon.stub(LeaderboardService, 'getAwayLeaderboard').resolves(mockAwayResults as any);
  
      const leaderboard = await LeaderboardService.getGeneralLeaderboard();
  
      expect(leaderboard).to.deep.equal([
        {
          name: 'Time A',
          totalPoints: 7,
          totalGames: 3, 
          totalVictories: 2, 
          totalDraws: 1, 
          totalLosses: 0, 
          goalsFavor: 6, 
          goalsOwn: 1, 
          goalsBalance: 5, 
          efficiency: '77.78' 
        }
      ]);
  
      sinon.restore();
    });
  });

});



describe('getAwayLeaderboard', () => {
  beforeEach(() => {
    sinon.restore(); 
  });

  it('deve retornar a classificação do time visitante', async () => {
    const mockAwayMatches = [
      { homeTeamGoals: 1, awayTeamGoals: 1, homeTeam: 'Time D', awayTeam: 'Time A' },
      { homeTeamGoals: 0, awayTeamGoals: 2, homeTeam: 'Time E', awayTeam: 'Time A' }
    ];
    sinon.stub(Match, 'findAll').resolves(mockAwayMatches as any);

    const leaderboard = await LeaderboardService.getAwayLeaderboard();

    expect(leaderboard).to.deep.equal([
      {
        name: 'Time A',
        totalPoints: 4,
        totalGames: 2,
        totalVictories: 1,
        totalDraws: 1,
        totalLosses: 0,
        goalsFavor: 3,
        goalsOwn: 1,
        goalsBalance: 2,
        efficiency: '66.67'
      }
    ]);
  });
});


describe('getHomeLeaderboard', () => {
  beforeEach(() => {
    sinon.restore(); 
  });

  it('deve retornar a classificação do time da casa', async () => {
    const mockHomeMatches = [
      { homeTeamGoals: 2, awayTeamGoals: 1, homeTeam: 'Time A', awayTeam: 'Time B' },
      { homeTeamGoals: 0, awayTeamGoals: 3, homeTeam: 'Time C', awayTeam: 'Time A' }
    ];
    sinon.stub(Match, 'findAll').resolves(mockHomeMatches as any);

    const leaderboard = await LeaderboardService.getHomeLeaderboard();

    expect(leaderboard).to.deep.equal([
      {
        name: 'Time A',
        totalPoints: 3,
        totalGames: 1,
        totalVictories: 1,
        totalDraws: 0,
        totalLosses: 0,
        goalsFavor: 3,
        goalsOwn: 0,
        goalsBalance: 3,
        efficiency: '100.00'
      },
      {
        name: 'Time C',
        totalPoints: 0,
        totalGames: 1,
        totalVictories: 0,
        totalDraws: 0,
        totalLosses: 1,
        goalsFavor: 0,
        goalsOwn: 3,
        goalsBalance: -3,
        efficiency: '0.00'
      }
    ]);
  });
});
