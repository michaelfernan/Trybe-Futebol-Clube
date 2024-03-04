import chai from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../app';

chai.use(chaiHttp);
const { expect } = chai;

describe('GET /teams', () => {
  it('deve retornar todos os times', async () => {
    const res = await chai.request(app).get('/teams');
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
  });
});
