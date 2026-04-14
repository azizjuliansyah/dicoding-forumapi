import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';
import AuthenticationError from '../../../Commons/exceptions/AuthenticationError.js';

const authenticationMiddleware = (container) => async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new AuthenticationError('Missing authentication');
    }

    const token = authorization.replace('Bearer ', '');
    const tokenManager = container.getInstance(AuthenticationTokenManager.name);

    await tokenManager.verifyAccessToken(token);
    const payload = await tokenManager.decodePayload(token);
    req.auth = payload;
    next();
  } catch (error) {
    next(error);
  }
};

export default authenticationMiddleware;
