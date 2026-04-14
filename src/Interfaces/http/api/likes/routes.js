import express from 'express';
import authenticationMiddleware from '../../middleware/authentication.js';

const createLikesRouter = (handler, container) => {
  const router = express.Router();

  router.put('/:threadId/comments/:commentId/likes', authenticationMiddleware(container), handler.putLikeHandler);

  return router;
};

export default createLikesRouter;
