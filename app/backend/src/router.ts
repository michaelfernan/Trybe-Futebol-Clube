import { Router } from 'express';
import TeamController from './controllers/TeamController';
import LoginController from './controllers/LoginController';
import authMiddleware from './middlewares/authMiddleware';
import validateLogin from './middlewares/validation';
import RoleController from './controllers/RoleController';
import MatchController from './controllers/MatchController';
import LeaderboardController from './controllers/LeaderboardController';

const router = Router();

router.get('/teams', TeamController.getAll);
router.get('/teams/:id', TeamController.getById);

router.post('/login', validateLogin, LoginController.login);
router.get('/login/role', authMiddleware, RoleController.getRole);

router.get('/matches', MatchController.getAll);
router.patch('/matches/:id/finish', authMiddleware, MatchController.finishMatch);
router.patch('/matches/:id', authMiddleware, MatchController.updateMatch);
router.post('/matches', authMiddleware, MatchController.createMatch);

router.get('/leaderboard/home', LeaderboardController.getHomeLeaderboard);
router.get('/leaderboard/away', LeaderboardController.getAwayLeaderboard);

export default router;
