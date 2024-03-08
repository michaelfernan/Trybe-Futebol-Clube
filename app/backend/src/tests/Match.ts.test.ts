import * as sinon from 'sinon';
import * as chai from 'chai';
// @ts-ignore
import chaiHttp = require('chai-http');
import { app } from '../app';
import MatchService from '../services/MatchService';
import { MockMatch } from './Mocks';

import TokenManager from '../utils/TokenManager';
import User from '../database/models/User';
import Match from '../database/models/Matches';

chai.use(chaiHttp);
const { expect } = chai;

describe('MatchController', () => {
  describe('getAll', () => {
    let getMatchesStub: sinon.SinonStub;
    let getAllMatchesStub: sinon.SinonStub;

    beforeEach(() => {
      getMatchesStub = sinon.stub(MatchService, 'getMatches');
      getAllMatchesStub = sinon.stub(MatchService, 'getAllMatches');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('deve retornar todas as partidas quando não há query inProgress', async () => {
      const fakeMatches = MockMatch
      getAllMatchesStub.resolves(fakeMatches);

      const res = await chai.request(app).get('/matches');

      expect(res).to.have.status(200);
      expect(res.body).to.deep.equal(fakeMatches);
    });

    it('deve retornar partidas baseadas no status inProgress quando a query está presente', async () => {
      const fakeInProgressMatches = MockMatch
      getMatchesStub.withArgs('true').resolves(fakeInProgressMatches);

      const res = await chai.request(app).get('/matches?inProgress=true');

      expect(res).to.have.status(200);
      expect(res.body).to.deep.equal(fakeInProgressMatches);
    });

    it('deve retornar erro 500 quando o serviço falha', async () => {
      getAllMatchesStub.rejects(new Error('Erro no servidor'));

      const res = await chai.request(app).get('/matches');

      expect(res).to.have.status(500);
      expect(res.body).to.have.property('message', 'Internal server error');
    });
  
    it('deve retornar erro 500 quando getMatches falha', async () => {
      const errorMessage = 'Erro no servidor';
      getMatchesStub.withArgs('true').rejects(new Error(errorMessage));
    
      const res = await chai.request(app).get('/matches?inProgress=true');
    
      expect(res).to.have.status(500);
      expect(res.body).to.have.property('message', 'Internal server error');
    });
    });


  describe('updateMatch', () => {
    let updateMatchStub: sinon.SinonStub;
    let token: string;

    beforeEach(() => {
      token = TokenManager.generateToken({ id: 1, role: 'admin', email: 'admin@example.com' });
    });

    beforeEach(() => {
      updateMatchStub = sinon.stub(MatchService, 'updateMatch');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('deve atualizar uma partida com sucesso', async () => {
      const fakeMatchData = {
        id: 1,
        homeTeamGoals: 2,
        awayTeamGoals: 1
      };
      updateMatchStub.resolves(fakeMatchData);

      const res = await chai.request(app).patch('/matches/1')
        .set('Authorization', `Bearer ${token}`) 
        .send({ homeTeamGoals: 2, awayTeamGoals: 1 });

      expect(res).to.have.status(200);
      expect(res.body).to.deep.equal(fakeMatchData);
    });
  });
  
  describe('createMatch', () => {
    let createMatchStub: sinon.SinonStub;
    let token: string;

    beforeEach(() => {
      const payload = { id: 1, role: 'admin', email: 'admin@example.com' };
      token = TokenManager.generateToken(payload);
    });

    beforeEach(() => {
      createMatchStub = sinon.stub(MatchService, 'createMatch');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('deve criar uma partida com sucesso', async () => {
     
      const matchData = {
        homeTeamId: 1,
        awayTeamId: 2,
        homeTeamGoals: 3,
        awayTeamGoals: 1,
      };
      createMatchStub.resolves(matchData);

      const res = await chai.request(app)
        .post('/matches')
        .set('Authorization', `Bearer ${token}`)
        .send(matchData);

      expect(res).to.have.status(201);
      expect(res.body).to.deep.equal(matchData);
    });
    });

  describe('finishMatch', () => {
    let finishMatchStub: sinon.SinonStub;
    let token: string;

    beforeEach(() => {
      const payload = { id: 1, role: 'admin', email: 'admin@example.com' };
      token = TokenManager.generateToken(payload);
    });

    beforeEach(() => {
      finishMatchStub = sinon.stub(MatchService, 'finishMatch');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('deve terminar uma partida com sucesso', async () => {
      finishMatchStub.resolves();

      const res = await chai.request(app)
        .patch('/matches/1/finish')
        .set('Authorization', `Bearer ${token}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('message', 'Finished');
    });

    it('deve retornar erro 400 para partida não encontrada ou não em andamento', async () => {
      const errorMessage = 'Match not found';
      finishMatchStub.rejects(new Error(errorMessage));

      const res = await chai.request(app)
        .patch('/matches/999/finish')
        .set('Authorization', `Bearer ${token}`);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('message', errorMessage);
    });  
    it('deve retornar erro 500 para erro desconhecido', async () => {
      finishMatchStub.rejects({});
    
      const res = await chai.request(app)
        .patch('/matches/1/finish')
        .set('Authorization', `Bearer ${token}`);
    
      expect(res).to.have.status(500);
      expect(res.body).to.have.property('message', 'Unknown error');
    });
    });
});

describe('MatchService', () => {
  describe('getMatches', () => {
    let findStub: sinon.SinonStub;

    beforeEach(() => {
      findStub = sinon.stub(Match, 'findAll');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('deve chamar findAll com opções corretas quando inProgress é true', async () => {
      findStub.resolves([]);

      await MatchService.getMatches('true');
      expect(findStub.calledWith(sinon.match.hasNested('where.inProgress', true))).to.be.true;
    });

    it('deve chamar findAll com opções corretas quando inProgress é false', async () => {
      findStub.resolves([]);

      await MatchService.getMatches('false');
      expect(findStub.calledWith(sinon.match.hasNested('where.inProgress', false))).to.be.true;
    });

    it('deve chamar findAll sem opções de where quando inProgress não é definido', async () => {
      findStub.resolves([]);

      await MatchService.getMatches();
      expect(findStub.calledWith(sinon.match.hasNested('where.inProgress'))).to.be.false;
    });
  
  });

});


describe('MatchService555', () => {
  describe('getAllMatches', () => {
    let findAllStub: sinon.SinonStub;

    beforeEach(() => {
      findAllStub = sinon.stub(Match, 'findAll');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('deve retornar todas as partidas quando não há opções', async () => {
      const fakeMatches = MockMatch
      findAllStub.resolves(fakeMatches);

      const matches = await MatchService.getAllMatches();

      expect(matches).to.deep.equal(fakeMatches);
    });

  

    it('deve lançar um erro quando findAll falhar', async () => {
      const errorMessage = 'Erro ao buscar partidas';
      findAllStub.rejects(new Error(errorMessage));

      try {
        await MatchService.getAllMatches()
        expect.fail('O método deveria lançar um erro');
      } catch (error) {
        expect('O método deveria lançar um erro')
      }
    });
  });


  














  
  
  
  
  









  
});


describe('RoleController', () => {
  let token: string;

  beforeEach(() => {
    const payload = { id: 1, role: 'admin', email: 'admin@example.com' };
    token = TokenManager.generateToken(payload);
  });

  describe('getRole', () => {
   
    let findByPkStub: sinon.SinonStub;

    beforeEach(() => {
      findByPkStub = sinon.stub(User, 'findByPk');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('deve retornar o papel do usuário quando encontrado', async () => {
      const fakeUser = { id: 1, role: 'admin' };
      findByPkStub.withArgs(1).resolves(fakeUser);

      const res = await chai.request(app)
        .get('/login/role')
        .set('Authorization', `Bearer ${token}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('role', 'admin');
    });

    it('deve retornar erro 401 para usuário não encontrado', async () => {
      findByPkStub.withArgs(1).resolves(null);

      const res = await chai.request(app)
        .get('/login/role')
        .set('Authorization', `Bearer ${token}`);

      expect(res).to.have.status(401);
      expect(res.body).to.have.property('message', 'User not found');
    });
  });
});
