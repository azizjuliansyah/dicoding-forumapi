import NewThread from '../../Domains/threads/entities/NewThread.js';

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, userId) {
    const newThread = new NewThread(useCasePayload);
    return this._threadRepository.addThread({
      title: newThread.title,
      body: newThread.body,
      owner: userId,
    });
  }
}

export default AddThreadUseCase;
