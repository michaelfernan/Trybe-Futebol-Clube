import * as sinon from 'sinon';
import * as chai from 'chai';

import * as bcrypt from 'bcryptjs';

// @ts-ignore
import chaiHttp = require('chai-http');

import { app } from '../app';

import { Response as SuperagentResponse } from 'superagent';
import Team from '../database/models/Team';
import LoginService from '../services/LoginService';
import User from '../database/models/User';

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

      const response: SuperagentResponse = await chai.request(app).get('/teams');

      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal(mockTeams);

      (Team.findAll as sinon.SinonStub).restore();
    });
  });

  describe('GET /teams/:id', () => {
    it('deve retornar um time específico pelo id', async () => {
      const mockTeam = { id: 1, teamName: 'Time A' };

      sinon.stub(Team, 'findByPk').resolves(mockTeam as any);

      const response: SuperagentResponse = await chai.request(app).get('/teams/1');

      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal(mockTeam);

      (Team.findByPk as sinon.SinonStub).restore();
    });

    it('deve retornar 404 se o time não for encontrado', async () => {
      sinon.stub(Team, 'findByPk').resolves(null);

      const response: SuperagentResponse = await chai.request(app).get('/teams/999');

      expect(response.status).to.equal(404);
      expect(response.body).to.deep.equal({ message: 'Team not found' });

      (Team.findByPk as sinon.SinonStub).restore();
    });

  });

 
});

describe('POST /login', () => {
  it('deve retornar um token para um login bem-sucedido', async () => {

    sinon.stub(LoginService, 'authenticate').resolves('token_gerado');

    const response: SuperagentResponse = await chai.request(app).post('/login').send({ email: 'user@example.com', password: '123456' });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('token', 'token_gerado');

    (LoginService.authenticate as sinon.SinonStub).restore();
  });

  it('deve retornar 401 para um login inválido', async () => {
    sinon.stub(LoginService, 'authenticate').resolves(null);

    const response: SuperagentResponse = await chai.request(app).post('/login').send({ email: 'invalid@example.com', password: '123456' });

    expect(response.status).to.equal(401);
    expect(response.body).to.deep.equal({ message: 'Invalid email or password' });

    (LoginService.authenticate as sinon.SinonStub).restore();
  });

  it('deve retornar 400 quando email ou senha não são fornecidos', async () => {
    const response: SuperagentResponse = await chai.request(app).post('/login').send({ email: 'user@example.com' });
    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal({ message: 'All fields must be filled' });
  });
});

describe('authenticate()', () => {
  it('deve retornar null se o usuário não for encontrado', async () => {
    // Simula o comportamento do User.findOne para retornar null
    sinon.stub(User, 'findOne').resolves(null);

    const token = await LoginService.authenticate('email@example.com', 'senha123');

    expect(token).to.be.null;

    // Restaura a função original após o teste
    (User.findOne as sinon.SinonStub).restore();
  });

});






