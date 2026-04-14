import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';

describe('/threads path', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and added thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'abc',
        body: 'abc',
      };
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
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedThread).toBeDefined();
    });

    it('should response 401 when missing authentication', async () => {
      // Arrange
      const requestPayload = {
        title: 'abc',
        body: 'abc',
      };
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .post('/threads')
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'abc',
      };
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
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 'abc',
        body: 123,
      };
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
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
    });
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and added comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'abc',
      };
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
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedComment).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {};
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
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 when success deleted comment', async () => {
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
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should response 403 when user is not the owner of the comment', async () => {
      // Arrange
      const app = await createServer(container);

      // Register and Login user 1
      await request(app).post('/users').send({
        username: 'user1',
        password: 'password',
        fullname: 'User One',
      });
      const loginResponse1 = await request(app).post('/authentications').send({
        username: 'user1',
        password: 'password',
      });
      const { accessToken: accessToken1 } = loginResponse1.body.data;

      // Register and Login user 2
      await request(app).post('/users').send({
        username: 'user2',
        password: 'password',
        fullname: 'User Two',
      });
      const loginResponse2 = await request(app).post('/authentications').send({
        username: 'user2',
        password: 'password',
      });
      const { accessToken: accessToken2 } = loginResponse2.body.data;

      // User 1 create thread and comment
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken1}`)
        .send({ title: 'thread title', body: 'thread body' });
      const { id: threadId } = threadResponse.body.data.addedThread;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send({ content: 'comment content' });
      const { id: commentId } = commentResponse.body.data.addedComment;

      // Action: User 2 try to delete User 1's comment
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken2}`);

      // Assert
      expect(response.status).toEqual(403);
    });

    it('should response 404 when comment does not exist', async () => {
      // Arrange
      const app = await createServer(container);

      // Register and Login
      await request(app).post('/users').send({
        username: 'user3',
        password: 'password',
        fullname: 'User Three',
      });
      const loginResponse = await request(app).post('/authentications').send({
        username: 'user3',
        password: 'password',
      });
      const { accessToken } = loginResponse.body.data;

      // Create thread
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'thread title', body: 'thread body' });
      const { id: threadId } = threadResponse.body.data.addedThread;

      // Action: Delete non-existent comment
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/comment-999`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(404);
    });
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and added reply', async () => {
      // Arrange
      const requestPayload = {
        content: 'abc',
      };
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
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedReply).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {};
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
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 when success deleted reply', async () => {
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

      // Create Reply
      const replyResponse = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'abc' });
      const { id: replyId } = replyResponse.body.data.addedReply;

      // Action
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should response 403 when user is not the owner of the reply', async () => {
      // Arrange
      const app = await createServer(container);

      // Register and Login user 1
      await request(app).post('/users').send({
        username: 'user4',
        password: 'password',
        fullname: 'User Four',
      });
      const loginResponse1 = await request(app).post('/authentications').send({
        username: 'user4',
        password: 'password',
      });
      const { accessToken: accessToken1 } = loginResponse1.body.data;

      // Register and Login user 2
      await request(app).post('/users').send({
        username: 'user5',
        password: 'password',
        fullname: 'User Five',
      });
      const loginResponse2 = await request(app).post('/authentications').send({
        username: 'user5',
        password: 'password',
      });
      const { accessToken: accessToken2 } = loginResponse2.body.data;

      // User 1 create thread, comment, and reply
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken1}`)
        .send({ title: 'title', body: 'body' });
      const { id: threadId } = threadResponse.body.data.addedThread;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send({ content: 'content' });
      const { id: commentId } = commentResponse.body.data.addedComment;

      const replyResponse = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send({ content: 'content' });
      const { id: replyId } = replyResponse.body.data.addedReply;

      // Action: User 2 try to delete User 1's reply
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', `Bearer ${accessToken2}`);

      // Assert
      expect(response.status).toEqual(403);
    });

    it('should response 404 when reply does not exist', async () => {
      // Arrange
      const app = await createServer(container);

      // Register and Login
      await request(app).post('/users').send({
        username: 'user6',
        password: 'password',
        fullname: 'User Six',
      });
      const loginResponse = await request(app).post('/authentications').send({
        username: 'user6',
        password: 'password',
      });
      const { accessToken } = loginResponse.body.data;

      // Create thread and comment
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'title', body: 'body' });
      const { id: threadId } = threadResponse.body.data.addedThread;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'content' });
      const { id: commentId } = commentResponse.body.data.addedComment;

      // Action: Delete non-existent reply
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/reply-999`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(404);
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and thread detail', async () => {
      // Arrange
      const app = await createServer(container);

      // Setup data
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
      await CommentsTableTestHelper.addComment({ id: 'comment-1', threadId: 'thread-1', owner: 'user-1' });
      await RepliesTableTestHelper.addReply({ id: 'reply-1', commentId: 'comment-1', owner: 'user-1' });

      // Action
      const response = await request(app).get('/threads/thread-1');

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.thread).toBeDefined();
      expect(response.body.data.thread.comments).toHaveLength(1);
      expect(response.body.data.thread.comments[0].replies).toHaveLength(1);
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app).get('/threads/thread-999');

      // Assert
      expect(response.status).toEqual(404);
    });
  });
});
