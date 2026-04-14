import CommentLikesTableTestHelper from '../../../../tests/CommentLikesTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import pool from '../../database/postgres/pool.js';
import CommentLikeRepositoryPostgres from '../CommentLikeRepositoryPostgres.js';
import { describe, it, expect, afterEach, afterAll } from 'vitest';

describe('CommentLikeRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addLike function', () => {
    it('should persist like correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'user-1' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
      await CommentsTableTestHelper.addComment({ id: 'comment-1', threadId: 'thread-1', owner: 'user-1' });
      const fakeIdGenerator = () => '123';
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentLikeRepositoryPostgres.addLike('comment-1', 'user-1');

      // Assert
      const likes = await CommentLikesTableTestHelper.findLike('comment-1', 'user-1');
      expect(likes).toHaveLength(1);
    });
  });

  describe('removeLike function', () => {
    it('should remove like correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-2', username: 'user-2' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-2', owner: 'user-2' });
      await CommentsTableTestHelper.addComment({ id: 'comment-2', threadId: 'thread-2', owner: 'user-2' });
      await CommentLikesTableTestHelper.addLike({ id: 'like-2', commentId: 'comment-2', userId: 'user-2' });
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action
      await commentLikeRepositoryPostgres.removeLike('comment-2', 'user-2');

      // Assert
      const likes = await CommentLikesTableTestHelper.findLike('comment-2', 'user-2');
      expect(likes).toHaveLength(0);
    });
  });

  describe('checkLikeStatus function', () => {
    it('should return true when like exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-3', username: 'user-3' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-3', owner: 'user-3' });
      await CommentsTableTestHelper.addComment({ id: 'comment-3', threadId: 'thread-3', owner: 'user-3' });
      await CommentLikesTableTestHelper.addLike({ id: 'like-3', commentId: 'comment-3', userId: 'user-3' });
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action & Assert
      const isLiked = await commentLikeRepositoryPostgres.checkLikeStatus('comment-3', 'user-3');
      expect(isLiked).toBe(true);
    });

    it('should return false when like does not exist', async () => {
      // Arrange
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action & Assert
      const isLiked = await commentLikeRepositoryPostgres.checkLikeStatus('comment-99', 'user-99');
      expect(isLiked).toBe(false);
    });
  });

  describe('getLikeCountByCommentId function', () => {
    it('should return 0 when no likes exist', async () => {
      // Arrange
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action
      const likeCount = await commentLikeRepositoryPostgres.getLikeCountByCommentId('comment-1');

      // Assert
      expect(likeCount).toBe(0);
    });

    it('should return correct like count when likes exist', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-6', username: 'user-6' });
      await UsersTableTestHelper.addUser({ id: 'user-7', username: 'user-7' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-6', owner: 'user-6' });
      await CommentsTableTestHelper.addComment({ id: 'comment-6', threadId: 'thread-6', owner: 'user-6' });
      await CommentLikesTableTestHelper.addLike({ id: 'like-7', commentId: 'comment-6', userId: 'user-6' });
      await CommentLikesTableTestHelper.addLike({ id: 'like-8', commentId: 'comment-6', userId: 'user-7' });
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action
      const likeCount = await commentLikeRepositoryPostgres.getLikeCountByCommentId('comment-6');

      // Assert
      expect(likeCount).toBe(2);
    });
  });

  describe('getLikeCountsByThreadId function', () => {
    it('should return like counts for each comment in thread', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-4', username: 'user-4' });
      await UsersTableTestHelper.addUser({ id: 'user-5', username: 'user-5' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-4', owner: 'user-4' });
      await CommentsTableTestHelper.addComment({ id: 'comment-4', threadId: 'thread-4', owner: 'user-4' });
      await CommentsTableTestHelper.addComment({ id: 'comment-5', threadId: 'thread-4', owner: 'user-4' });
      
      await CommentLikesTableTestHelper.addLike({ id: 'like-4', commentId: 'comment-4', userId: 'user-4' });
      await CommentLikesTableTestHelper.addLike({ id: 'like-5', commentId: 'comment-4', userId: 'user-5' });
      await CommentLikesTableTestHelper.addLike({ id: 'like-6', commentId: 'comment-5', userId: 'user-4' });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action
      const likeCounts = await commentLikeRepositoryPostgres.getLikeCountsByThreadId('thread-4');

      // Assert
      expect(likeCounts).toHaveLength(2);
      const comment1Likes = likeCounts.find((lc) => lc.comment_id === 'comment-4');
      const comment2Likes = likeCounts.find((lc) => lc.comment_id === 'comment-5');
      
      expect(parseInt(comment1Likes.like_count, 10)).toBe(2);
      expect(parseInt(comment2Likes.like_count, 10)).toBe(1);
    });
  });
});
