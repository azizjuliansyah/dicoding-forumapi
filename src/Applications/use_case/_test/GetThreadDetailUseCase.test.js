import { vi, describe, it, expect } from 'vitest';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import CommentLikeRepository from '../../../Domains/likes/CommentLikeRepository.js';
import GetThreadDetailUseCase from '../GetThreadDetailUseCase.js';

describe('GetThreadDetailUseCase', () => {
  it('should orchestrating the get thread detail action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const mockThread = {
      id: threadId,
      title: 'abc',
      body: 'abc',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };
    /* eslint-disable camelcase */
    const mockComments = [
      {
        id: 'comment-1',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah comment',
        is_delete: false,
      },
      {
        id: 'comment-2',
        username: 'dicoding',
        date: '2021-08-08T07:26:21.338Z',
        content: 'sebuah comment',
        is_delete: true,
      },
    ];
    const mockReplies = [
      {
        id: 'reply-1',
        username: 'johndoe',
        date: '2021-08-08T07:59:48.766Z',
        content: 'sebuah balasan',
        is_delete: true,
      },
      {
        id: 'reply-2',
        username: 'dicoding',
        date: '2021-08-08T08:07:01.522Z',
        content: 'sebuah balasan',
        is_delete: false,
      },
    ];
    const mockLikeCounts = [
      { comment_id: 'comment-1', like_count: 2 },
    ];
    /* eslint-enable camelcase */

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = vi.fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = vi.fn()
      .mockImplementation(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByCommentId = vi.fn()
      .mockImplementation(() => Promise.resolve(mockReplies));
    mockCommentLikeRepository.getLikeCountsByThreadId = vi.fn()
      .mockImplementation(() => Promise.resolve(mockLikeCounts));

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(threadDetail).toStrictEqual({
      id: threadId,
      title: 'abc',
      body: 'abc',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-1',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah comment',
          likeCount: 2,
          replies: [
            {
              id: 'reply-1',
              username: 'johndoe',
              date: '2021-08-08T07:59:48.766Z',
              content: '**balasan telah dihapus**',
            },
            {
              id: 'reply-2',
              username: 'dicoding',
              date: '2021-08-08T08:07:01.522Z',
              content: 'sebuah balasan',
            },
          ],
        },
        {
          id: 'comment-2',
          username: 'dicoding',
          date: '2021-08-08T07:26:21.338Z',
          content: '**komentar telah dihapus**',
          likeCount: 0,
          replies: [
            {
              id: 'reply-1',
              username: 'johndoe',
              date: '2021-08-08T07:59:48.766Z',
              content: '**balasan telah dihapus**',
            },
            {
              id: 'reply-2',
              username: 'dicoding',
              date: '2021-08-08T08:07:01.522Z',
              content: 'sebuah balasan',
            },
          ],
        },
      ],
    });

    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith('comment-1');
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith('comment-2');
    expect(mockCommentLikeRepository.getLikeCountsByThreadId).toBeCalledWith(threadId);
  });
});
