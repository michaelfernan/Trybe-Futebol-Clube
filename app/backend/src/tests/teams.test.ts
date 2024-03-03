import * as chai from 'chai';
import { app } from '../app';
import chaiHttp from 'chai-http';

chai.use(chaiHttp);
const { expect } = chai;

describe('/teams endpoint', () => {
  it('should return all teams', async () => {
    const res = await chai.request(app).get('/teams');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });
});
