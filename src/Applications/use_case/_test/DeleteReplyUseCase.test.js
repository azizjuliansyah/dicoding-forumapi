import { vi, describe, it, expect } from 'vitest';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import DeleteReplyUseCase from '../DeleteReplyUseCase.js';

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const replyId = 'reply-123';
    const userId = 'user-123';

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability = vi.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = vi.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyAvailability = vi.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwnership = vi.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReply = vi.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action and Assert
    await expect(deleteReplyUseCase.execute(threadId, commentId, replyId, userId))
      .resolves.not.toThrowError();

    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(commentId);
    expect(mockReplyRepository.verifyReplyAvailability).toBeCalledWith(replyId);
    expect(mockReplyRepository.verifyReplyOwnership).toBeCalledWith(replyId, userId);
    expect(mockReplyRepository.deleteReply).toBeCalledWith(replyId);
  });
});
