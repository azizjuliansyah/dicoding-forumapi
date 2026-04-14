import express from 'express';
import authenticationMiddleware from '../../middleware/authentication.js';

const createCommentsRouter = (handler, container) => {
  const router = express.Router();

  router.post('/:threadId/comments', authenticationMiddleware(container), handler.postCommentHandler);
  router.delete('/:threadId/comments/:commentId', authenticationMiddleware(container), handler.deleteCommentHandler);

  return router;
};

export default createCommentsRouter;
