import express from 'express';
import authenticationMiddleware from '../../middleware/authentication.js';

const createThreadsRouter = (handler, container) => {
  const router = express.Router();

  router.post('/', authenticationMiddleware(container), handler.postThreadHandler);
  router.get('/:threadId', handler.getThreadByIdHandler);

  return router;
};

export default createThreadsRouter;
