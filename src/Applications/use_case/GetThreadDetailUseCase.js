class GetThreadDetailUseCase {
  constructor({
    threadRepository, commentRepository, replyRepository, commentLikeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const likeCounts = await this._commentLikeRepository.getLikeCountsByThreadId(threadId);

    const commentsWithReplies = await Promise.all(comments.map(async (comment) => {
      const replies = await this._replyRepository.getRepliesByCommentId(comment.id);

      const processedReplies = replies.map((reply) => ({
        id: reply.id,
        content: reply.is_delete ? '**balasan telah dihapus**' : reply.content,
        date: reply.date,
        username: reply.username,
      }));

      const likeCount = likeCounts.find((lc) => lc.comment_id === comment.id)?.like_count || 0;

      return {
        id: comment.id,
        username: comment.username,
        date: comment.date,
        content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
        likeCount,
        replies: processedReplies,
      };
    }));

    return {
      ...thread,
      comments: commentsWithReplies,
    };
  }
}

export default GetThreadDetailUseCase;
