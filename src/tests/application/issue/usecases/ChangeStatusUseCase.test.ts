import { ChangeStatusUseCase } from '../../../../application/issue/usecases/ChangeStatusUseCase';
import { ChangeStatusCommand } from '../../../../application/issue/commands/ChangeStatusCommand';
import { MockIssueRepository } from '../../../mocks/MockIssueRepository';
import { MockUserRepository } from '../../../mocks/MockUserRepository';
import { User } from '../../../../domain/user/User';
import { Email } from '../../../../domain/shared/Email';
import { Issue } from '../../../../domain/issue/Issue';
import { IssueTitle } from '../../../../domain/issue/vo/IssueTitle';
import { IssueStatus } from '../../../../domain/issue/enums/IssueStatus';

describe('ChangeStatusUseCase', () => {
  let issueRepository: MockIssueRepository;
  let userRepository: MockUserRepository;
  let useCase: ChangeStatusUseCase;

  beforeEach(() => {
    issueRepository = new MockIssueRepository();
    userRepository = new MockUserRepository();
    useCase = new ChangeStatusUseCase(issueRepository, userRepository);
  });

  const setupIssueAndUsers = async () => {
    const creator = User.create('creator-id', Email.create('creator@example.com'));
    const assignee = User.create('assignee-id', Email.create('assignee@example.com'));
    await Promise.all([
      userRepository.save(creator),
      userRepository.save(assignee),
    ]);

    const issue = Issue.create('issue-id', IssueTitle.create('Test Issue'), creator);
    issue.assign(assignee);
    await issueRepository.save(issue);

    return { issue, creator, assignee };
  };

  it('should change status when requested by assignee', async () => {
    const { issue, assignee } = await setupIssueAndUsers();
    const command = new ChangeStatusCommand(
      issue.getId(),
      IssueStatus.InReview,
      assignee.getId(),
    );
    const result = await useCase.execute(command);

    expect(result.status).toBe(IssueStatus.InReview);

    const savedIssue = await issueRepository.findById(issue.getId());
    expect(savedIssue?.getStatus()).toBe(IssueStatus.InReview);
  });

  it('should not change status when requested by non-assignee', async () => {
    const { issue } = await setupIssueAndUsers();
    const otherUser = User.create('other-id', Email.create('other@example.com'));
    await userRepository.save(otherUser);

    const command = new ChangeStatusCommand(
      issue.getId(),
      IssueStatus.InReview,
      otherUser.getId(),
    );

    await expect(useCase.execute(command))
      .rejects
      .toThrow('Only the assigned user can change the status');
  });

  it('should not change status of non-existent issue', async () => {
    const { assignee } = await setupIssueAndUsers();
    const command = new ChangeStatusCommand(
      'non-existent-id',
      IssueStatus.InReview,
      assignee.getId(),
    );

    await expect(useCase.execute(command))
      .rejects
      .toThrow('Issue not found: non-existent-id');
  });

  it('should not change status when user not found', async () => {
    const { issue } = await setupIssueAndUsers();
    const command = new ChangeStatusCommand(
      issue.getId(),
      IssueStatus.InReview,
      'non-existent-id',
    );

    await expect(useCase.execute(command))
      .rejects
      .toThrow('User not found: non-existent-id');
  });
}); 