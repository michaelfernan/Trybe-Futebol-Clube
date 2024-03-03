import * as sinon from 'sinon';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import { app } from '../app';
import Team from '../database/models/Team';

chai.use(chaiHttp);
const { expect } = chai;

describe('Endpoint /teams', () => {
  /**
   * Teste para verificar se todos os times são retornados
   */
  it('GET /teams - Deve retornar todos os times', async () => {
    const res = await chai.request(app).get('/teams');
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
  });

  /**
   * Teste para verificar o retorno de um time específico pelo ID
   */
  describe('GET /teams/:id', () => {
    it('Deve retornar um time específico', async () => {
      const res = await chai.request(app).get('/teams/1');
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('teamName');
    });

    it('Deve retornar 404 para um time inexistente', async () => {
      const res = await chai.request(app).get('/teams/9999');
      expect(res).to.have.status(404);
    });
  });
});
