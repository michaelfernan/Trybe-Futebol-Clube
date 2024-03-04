import chai from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../app';

chai.use(chaiHttp);
const { expect } = chai;

describe('GET /teams/:id', () => {
  it('deve retornar um time específico', async () => {
    const res = await chai.request(app).get('/teams/1');
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('id');
    expect(res.body).to.have.property('teamName');
  });

  it('deve retornar 404 para um time inexistente', async () => {
    const res = await chai.request(app).get('/teams/9999');
    expect(res).to.have.status(404);
  });
});
