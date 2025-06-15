import { CreateIssueUseCase } from '../../../../application/issue/usecases/CreateIssueUseCase';
import { CreateIssueCommand } from '../../../../application/issue/commands/CreateIssueCommand';
import { MockIssueRepository } from '../../../mocks/MockIssueRepository';
import { MockUserRepository } from '../../../mocks/MockUserRepository';
import { User } from '../../../../domain/user/User';
import { Email } from '../../../../domain/shared/Email';
import { IssueStatus } from '../../../../domain/issue/enums/IssueStatus';
import { UserStatus } from '../../../../domain/user/enums/UserStatus';

describe('CreateIssueUseCase', () => {
  let issueRepository: MockIssueRepository;
  let userRepository: MockUserRepository;
  let useCase: CreateIssueUseCase;

  beforeEach(() => {
    issueRepository = new MockIssueRepository();
    userRepository = new MockUserRepository();
    useCase = new CreateIssueUseCase(issueRepository, userRepository);
  });

  const setupCreator = async () => {
    const creator = User.create('creator-id', Email.create('creator@example.com'));
    await userRepository.save(creator);
    return creator.getId();
  };

  it('should create an issue with valid parameters', async () => {
    const creatorId = await setupCreator();
    const command = new CreateIssueCommand('Test Issue', creatorId);
    const result = await useCase.execute(command);

    expect(result.title).toBe('Test Issue');
    expect(result.status).toBe(IssueStatus.Unstarted);
    expect(result.creator).toBe(creatorId);
    expect(result.assignee).toBeNull();

    const savedIssue = await issueRepository.findById(result.id);
    expect(savedIssue).not.toBeNull();
    expect(savedIssue?.getTitle().getValue()).toBe('Test Issue');
    expect(savedIssue?.getStatus()).toBe(IssueStatus.Unstarted);
    expect(savedIssue?.getCreator().getId()).toBe(creatorId);
    expect(savedIssue?.getAssignee()).toBeUndefined();
  });

  it('should not create an issue with non-existent creator', async () => {
    const command = new CreateIssueCommand('Test Issue', 'non-existent-id');

    await expect(useCase.execute(command))
      .rejects
      .toThrow('Creator not found: non-existent-id');
  });

  it('should not create an issue with non-enrolled creator', async () => {
    const creator = User.create(
      'creator-id',
      Email.create('creator@example.com'),
      UserStatus.Suspended
    );
    await userRepository.save(creator);

    const command = new CreateIssueCommand('Test Issue', creator.getId());

    await expect(useCase.execute(command))
      .rejects
      .toThrow('Creator is not enrolled');
  });

  it('should not create an issue with invalid title', async () => {
    const creatorId = await setupCreator();
    const command = new CreateIssueCommand('', creatorId);

    await expect(useCase.execute(command))
      .rejects
      .toThrow('Issue title must be between 1 and 20 characters');
  });
}); 