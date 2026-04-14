import LikesHandler from './handler.js';
import createLikesRouter from './routes.js';

const likesPlugin = (container) => {
  const likesHandler = new LikesHandler(container);
  return createLikesRouter(likesHandler, container);
};

export default likesPlugin;
