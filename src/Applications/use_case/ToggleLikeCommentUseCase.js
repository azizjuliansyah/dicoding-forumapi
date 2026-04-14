class ToggleLikeCommentUseCase {
  constructor({ threadRepository, commentRepository, commentLikeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(userId, threadId, commentId) {
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId);

    const isLiked = await this._commentLikeRepository.checkLikeStatus(commentId, userId);

    if (isLiked) {
      await this._commentLikeRepository.removeLike(commentId, userId);
    } else {
      await this._commentLikeRepository.addLike(commentId, userId);
    }
  }
}

export default ToggleLikeCommentUseCase;
