import { Router } from 'express';
import TeamController from './controllers/TeamController';
import LoginController from './controllers/LoginController';
import authMiddleware from './middlewares/authMiddleware';
import validateLogin from './middlewares/validation';
import RoleController from './controllers/RoleController';

const router = Router();

router.get('/teams', TeamController.getAll);
router.get('/teams/:id', TeamController.getById);
router.post('/login', validateLogin, LoginController.login);
router.get('/login/role', authMiddleware, RoleController.getRole);

export default router;
