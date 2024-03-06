import * as sinon from 'sinon';
import * as chai from 'chai';

// @ts-ignore
import chaiHttp = require('chai-http');
import * as jwt from 'jsonwebtoken';

import authMiddleware from '../middlewares/authMiddleware';
import errorMiddleware from '../middlewares/errorMiddleware';
import ICustomError from '../Interfaces/ICustomError';

chai.use(chaiHttp);
const { expect } = chai;

describe('authMiddleware', () => {
  it('deve retornar status 401 e uma mensagem de erro se o token não for encontrado', () => {
    const req = { headers: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
    const next = sinon.spy();

    authMiddleware(req as any, res as any, next as any);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith({ message: 'Token not found' })).to.be.true;
    expect(next.called).to.be.false;
  });

  it('deve retornar status 401 e uma mensagem de erro se o token não for válido', () => {
    const req = { headers: { authorization: 'Bearer invalidToken' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
    const next = sinon.spy();

    authMiddleware(req as any, res as any, next as any);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith({ message: 'Token must be a valid token' })).to.be.true;
    expect(next.called).to.be.false;
  });

});


describe('errorMiddleware', () => {

    it('deve retornar o status e a mensagem de erro fornecidos', () => {
      const error: ICustomError = {
          statusCode: 404, message: 'Not found',
          name: ''
      };
      const req = {} as any;
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() } as any;
      const next = sinon.spy();
  
      errorMiddleware(error, req, res, next);
  
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: 'Not found' })).to.be.true;
      expect(next.called).to.be.false;
    });
  
    it('deve retornar status 500 e uma mensagem de erro padrão se nenhuma mensagem de erro for fornecida', () => {
      const error: ICustomError = {
          statusCode: 500, message: 'Something went wrong',
          name: ''
      };
      const req = {} as any;
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() } as any;
      const next = sinon.spy();
  
      errorMiddleware(error, req, res, next);
  
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ message: 'Something went wrong' })).to.be.true;
      expect(next.called).to.be.false;
    });
  });

  