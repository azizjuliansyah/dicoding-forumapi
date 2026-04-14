import { describe, it, expect, vi } from 'vitest';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import CommentLikeRepository from '../../../Domains/likes/CommentLikeRepository.js';
import ToggleLikeCommentUseCase from '../ToggleLikeCommentUseCase.js';

describe('ToggleLikeCommentUseCase', () => {
  it('should orchestrate the add like action correctly', async () => {
    // Arrange
    const userId = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    mockThreadRepository.verifyThreadAvailability = vi.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = vi.fn(() => Promise.resolve());
    mockCommentLikeRepository.checkLikeStatus = vi.fn(() => Promise.resolve(false));
    mockCommentLikeRepository.addLike = vi.fn(() => Promise.resolve());

    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action
    await toggleLikeCommentUseCase.execute(userId, threadId, commentId);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentAvailability).toHaveBeenCalledWith(commentId);
    expect(mockCommentLikeRepository.checkLikeStatus).toHaveBeenCalledWith(commentId, userId);
    expect(mockCommentLikeRepository.addLike).toHaveBeenCalledWith(commentId, userId);
  });

  it('should orchestrate the remove like action correctly', async () => {
    // Arrange
    const userId = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    mockThreadRepository.verifyThreadAvailability = vi.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = vi.fn(() => Promise.resolve());
    mockCommentLikeRepository.checkLikeStatus = vi.fn(() => Promise.resolve(true));
    mockCommentLikeRepository.removeLike = vi.fn(() => Promise.resolve());

    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action
    await toggleLikeCommentUseCase.execute(userId, threadId, commentId);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentAvailability).toHaveBeenCalledWith(commentId);
    expect(mockCommentLikeRepository.checkLikeStatus).toHaveBeenCalledWith(commentId, userId);
    expect(mockCommentLikeRepository.removeLike).toHaveBeenCalledWith(commentId, userId);
  });
});
