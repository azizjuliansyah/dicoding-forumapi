import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js';
import CommentLikesTableTestHelper from '../../../../tests/CommentLikesTableTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';

describe('/threads/{threadId}/comments/{commentId}/likes path', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 200 and toggle like', async () => {
      // Arrange
      const app = await createServer(container);

      // Register and Login
      await request(app).post('/users').send({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });
      const loginResponse = await request(app).post('/authentications').send({
        username: 'dicoding',
        password: 'secret_password',
      });
      const { accessToken } = loginResponse.body.data;

      // Create Thread
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'abc', body: 'abc' });
      const { id: threadId } = threadResponse.body.data.addedThread;

      // Create Comment
      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'abc' });
      const { id: commentId } = commentResponse.body.data.addedComment;

      // Action
      const response = await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should response 401 when missing authentication', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .put('/threads/thread-1/comments/comment-1/likes');

      // Assert
      expect(response.status).toEqual(401);
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const app = await createServer(container);

      // Register and Login
      await request(app).post('/users').send({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });
      const loginResponse = await request(app).post('/authentications').send({
        username: 'dicoding',
        password: 'secret_password',
      });
      const { accessToken } = loginResponse.body.data;

      // Action
      const response = await request(app)
        .put('/threads/thread-999/comments/comment-1/likes')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(404);
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      const app = await createServer(container);

      // Register and Login
      await request(app).post('/users').send({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });
      const loginResponse = await request(app).post('/authentications').send({
        username: 'dicoding',
        password: 'secret_password',
      });
      const { accessToken } = loginResponse.body.data;

      // Create Thread
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'abc', body: 'abc' });
      const { id: threadId } = threadResponse.body.data.addedThread;

      // Action
      const response = await request(app)
        .put(`/threads/${threadId}/comments/comment-999/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(404);
    });
  });
});
