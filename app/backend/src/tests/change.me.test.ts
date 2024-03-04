import * as sinon from 'sinon';
import * as chai from 'chai';
// @ts-ignore
import chaiHttp = require('chai-http');

import { app } from '../app';
import Example from '../database/models/ExampleModel';

import { Response } from 'superagent';
import Team from '../database/models/Team';

chai.use(chaiHttp);

const { expect } = chai;

describe('Testes de integração para os endpoints /teams e /teams/:id', () => {

  describe('GET /teams', () => {
    it('deve retornar uma lista de times', async () => {
      const mockTeams = [
        { id: 1, teamName: 'Time A' },
        { id: 2, teamName: 'Time B' },
      ];

      sinon.stub(Team, 'findAll').resolves(mockTeams as any);

      const response: Response = await chai.request(app).get('/teams');

      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal(mockTeams);

      (Team.findAll as sinon.SinonStub).restore();
    });
  });

  describe('GET /teams/:id', () => {
    it('deve retornar um time específico pelo id', async () => {
      const mockTeam = { id: 1, teamName: 'Time A' };

      sinon.stub(Team, 'findByPk').resolves(mockTeam as any);

      const response: Response = await chai.request(app).get('/teams/1');

      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal(mockTeam);

      (Team.findByPk as sinon.SinonStub).restore();
    });

    it('deve retornar 404 se o time não for encontrado', async () => {
      sinon.stub(Team, 'findByPk').resolves(null);

      const response: Response = await chai.request(app).get('/teams/999');

      expect(response.status).to.equal(404);
      expect(response.body).to.deep.equal({ message: 'Team not found' });

      (Team.findByPk as sinon.SinonStub).restore();
    });

  });

 
});
