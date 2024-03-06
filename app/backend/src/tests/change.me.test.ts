import * as sinon from 'sinon';
import * as chai from 'chai';
import * as bcrypt from 'bcryptjs';
// @ts-ignore
import chaiHttp = require('chai-http');
import * as jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { app } from '../app';
import User from '../database/models/User';
import LoginService from '../services/LoginService';
import TeamService from '../services/TeamService';
import TokenManager from '../utils/TokenManager';
import Team from '../database/models/Team';
import { NextFunction } from 'express';
import validateLogin from '../middlewares/validation';

chai.use(chaiHttp);
const { expect } = chai;
describe('LoginController', () => {
  describe('login', () => {
    let authenticateStub: sinon.SinonStub;
    let generateTokenStub: sinon.SinonStub;

    beforeEach(() => {
      authenticateStub = sinon.stub(LoginService, 'authenticate');
      generateTokenStub = sinon.stub(LoginService, 'generateToken');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('deve retornar um token para credenciais válidas', async () => {
      const fakeUser: Partial<User> = { 
        id: 1,
        username: 'user',
        email: 'user@example.com'
        
      };
      const fakeToken = 'token123';

      authenticateStub.resolves(fakeUser as User);
      generateTokenStub.returns(fakeToken);

      const res = await chai.request(app)
        .post('/login')
        .send({ email: 'user@example.com', password: 'password123' });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('token');
      expect(res.body.token).to.equal(fakeToken);
    });

    it('deve retornar erro para credenciais inválidas', async () => {
      authenticateStub.resolves(null);

      const res = await chai.request(app)
        .post('/login')
        .send({ email: 'wrong@example.com', password: 'wrongpassword' });

      expect(res).to.have.status(401);
      expect(res.body).to.have.property('message');
      expect(res.body.message).to.equal('Invalid email or password');
    });
  });
});

describe('TeamController', () => {
  describe('getAll', () => {
    let getAllTeamsStub: sinon.SinonStub;

    beforeEach(() => {
      getAllTeamsStub = sinon.stub(TeamService, 'getAllTeams');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('deve retornar todos os times', async () => {
      const fakeTeams = [{ id: 1, name: 'Team 1' }, { id: 2, name: 'Team 2' }];
      getAllTeamsStub.resolves(fakeTeams);

      const res = await chai.request(app)
        .get('/teams'); 

      expect(res).to.have.status(200);
      expect(res.body).to.deep.equal(fakeTeams);
    });

    it('deve lidar com erro interno do servidor', async () => {
      getAllTeamsStub.rejects(new Error('Erro de banco de dados'));

      const res = await chai.request(app)
        .get('/teams'); 

      expect(res).to.have.status(500);
      expect(res.body).to.have.property('message', 'Internal server error');
    });
  });

  describe('getById', () => {
    let getTeamByIdStub: sinon.SinonStub;

    beforeEach(() => {
      getTeamByIdStub = sinon.stub(TeamService, 'getTeamById');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('deve retornar um time específico para um ID válido', async () => {
      const fakeTeam = { id: 1, name: 'Team 1' };
      getTeamByIdStub.withArgs(1).resolves(fakeTeam);

      const res = await chai.request(app)
        .get('/teams/1'); 

      expect(res).to.have.status(200);
      expect(res.body).to.deep.equal(fakeTeam);
    });

    it('deve retornar erro para um ID de time inexistente', async () => {
      getTeamByIdStub.withArgs(999).resolves(null);

      const res = await chai.request(app)
        .get('/teams/999'); 

      expect(res).to.have.status(404);
      expect(res.body).to.have.property('message', 'Team not found');
    });
  });
});


describe('LoginService', () => {
  describe('authenticate', () => {
    it('deve autenticar um usuário com credenciais corretas', async () => {
      const email = 'user@example.com';
      const password = 'password123';
      const hashedPassword = bcrypt.hashSync(password, 10);
      const user = { id: 1, email, password: hashedPassword } as User;

      const findOneStub = sinon.stub(User, 'findOne');
      findOneStub.resolves(user);

      const authenticatedUser = await LoginService.authenticate(email, password);

      expect(authenticatedUser).to.deep.equal(user);
      expect(findOneStub.calledOnceWithExactly({ where: { email } })).to.be.true;

      findOneStub.restore();
    });

    it('deve retornar null para credenciais incorretas', async () => {
      const email = 'user@example.com';
      const password = 'password123';
      const hashedPassword = bcrypt.hashSync(password, 10);
      const user = { id: 1, email, password: hashedPassword } as User;


      const findOneStub = sinon.stub(User, 'findOne');
      findOneStub.resolves(null);

      const authenticatedUser = await LoginService.authenticate(email, password);

      expect(authenticatedUser).to.be.null;
      expect(findOneStub.calledOnceWithExactly({ where: { email } })).to.be.true;

      findOneStub.restore();
    });
  });

  describe('generateToken', () => {
    it('deve gerar um token JWT para um usuário', () => {
      const user = { id: 1, role: 'user', email: 'user@example.com' } as User;
      const token = 'generatedToken';

      const generateTokenStub = sinon.stub(TokenManager, 'generateToken');
      generateTokenStub.returns(token);

      const generatedToken = LoginService.generateToken(user);

      expect(generatedToken).to.equal(token);
      expect(generateTokenStub.calledOnceWithExactly({ id: user.id, role: user.role, email: user.email })).to.be.true;

      generateTokenStub.restore(); 
    });
  });
});


describe('TeamService', () => {
  describe('getAllTeams', () => {
    it('deve retornar todos os times cadastrados', async () => {
      const fakeTeams = [{ id: 1, teamName: 'Team 1' }, { id: 2, teamName: 'Team 2' }];
      const findAllStub = sinon.stub(Team, 'findAll');
      findAllStub.resolves(fakeTeams as any); 

      const teams = await TeamService.getAllTeams();

      expect(teams).to.deep.equal(fakeTeams);
      expect(findAllStub.calledOnce).to.be.true;

      findAllStub.restore(); 
    });

    it('deve lidar com erros ao buscar os times cadastrados', async () => {
      const errorMessage = 'Erro ao buscar times';
      const findAllStub = sinon.stub(Team, 'findAll');
      findAllStub.rejects(new Error(errorMessage));

      try {
        await TeamService.getAllTeams();
      } catch (error) {
        expect(findAllStub.calledOnce).to.be.true;
      }

      findAllStub.restore(); 
    });
  });

  describe('getTeamById', () => {
    it('deve retornar o time correspondente ao ID fornecido', async () => {
      const teamId = 1;
      const fakeTeam = { id: teamId, teamName: 'Team 1' };
      const findByPkStub = sinon.stub(Team, 'findByPk');
      findByPkStub.resolves(fakeTeam as any); 

      const team = await TeamService.getTeamById(teamId);

      expect(team).to.deep.equal(fakeTeam);
      expect(findByPkStub.calledOnceWithExactly(teamId)).to.be.true;

      findByPkStub.restore();
    });

    it('deve retornar null se o time correspondente ao ID não for encontrado', async () => {
      const teamId = 999;
      const findByPkStub = sinon.stub(Team, 'findByPk');
      findByPkStub.resolves(null);

      const team = await TeamService.getTeamById(teamId);

      expect(team).to.be.null;
      expect(findByPkStub.calledOnceWithExactly(teamId)).to.be.true;

      findByPkStub.restore(); 
    });
  });
});

describe('TokenManager', () => {
  describe('generateToken', () => {
    it('deve gerar um token JWT válido', () => {
      const payload = { id: 1, role: 'user', email: 'user@example.com' };
      const token = TokenManager.generateToken(payload);
      expect(token).to.be.a('string');
  
      const decodedPayload = jwt.decode(token) as { [key: string]: any };
    
      delete decodedPayload.exp;
      delete decodedPayload.iat;
      
      expect(decodedPayload).to.deep.equal(payload);
    });

    it('deve expirar após 1 hora', () => {
      const payload = { id: 1, role: 'user', email: 'user@example.com' };
      const token = TokenManager.generateToken(payload);

      const decodedPayload = jwt.decode(token) as { [key: string]: any };
      const now = Math.floor(Date.now() / 1000);
      const expiration = decodedPayload.exp;

      expect(expiration).to.be.a('number');
      expect(expiration - now).to.be.within(3595, 3600); 
    });
  });
});

describe('validateLogin middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonSpy;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    } as Partial<Response>;
    next = sinon.spy();
  });

  it('deve retornar status 400 se o email ou a senha estiverem ausentes', () => {
    validateLogin(req as Request, res as Response, next as NextFunction);
    expect((res.status as sinon.SinonStub).calledWith(400)).to.be.true;
    expect((res.json as sinon.SinonSpy).calledWith({ message: 'All fields must be filled' })).to.be.true; // Corrigido
    expect(next.called).to.be.false;
  });

  it('deve retornar status 401 se o email for inválido ou a senha for muito curta', () => {
    req.body!.email = 'invalidemail';
    req.body!.password = 'short';
    
    validateLogin(req as Request, res as Response, next as NextFunction);
    expect((res.status as sinon.SinonStub).calledWith(401)).to.be.true; 
    expect((res.json as sinon.SinonSpy).calledWith({ message: 'Invalid email or password' })).to.be.true; // Corrigido
    expect(next.called).to.be.false;
  });

  it('deve chamar a função next se o email e a senha estiverem presentes e válidos', () => {
    req.body!.email = 'user@example.com';
    req.body!.password = 'strongpassword';

    validateLogin(req as Request, res as Response, next as NextFunction);
    expect((res.status as sinon.SinonStub).called).to.be.false;
    expect((res.json as sinon.SinonSpy).called).to.be.false;
    expect(next.calledOnce).to.be.true;
  });
});
