import { Router } from 'express';
import TeamController from './controllers/TeamController';

const teamsRouter = Router();

teamsRouter.get('/', TeamController.getAll);
teamsRouter.get('/:id', TeamController.getById);

export default teamsRouter;
