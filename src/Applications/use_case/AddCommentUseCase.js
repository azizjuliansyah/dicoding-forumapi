import NewComment from '../../Domains/comments/entities/NewComment.js';

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, threadId, userId) {
    const newComment = new NewComment(useCasePayload);
    await this._threadRepository.verifyThreadAvailability(threadId);
    return this._commentRepository.addComment(newComment.content, threadId, userId);
  }
}

export default AddCommentUseCase;
