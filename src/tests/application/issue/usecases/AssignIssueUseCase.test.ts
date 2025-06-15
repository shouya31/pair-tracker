import { AssignIssueUseCase } from '../../../../application/issue/usecases/AssignIssueUseCase';
import { AssignIssueCommand } from '../../../../application/issue/commands/AssignIssueCommand';
import { MockIssueRepository } from '../../../mocks/MockIssueRepository';
import { MockUserRepository } from '../../../mocks/MockUserRepository';
import { User } from '../../../../domain/user/User';
import { Email } from '../../../../domain/shared/Email';
import { Issue } from '../../../../domain/issue/Issue';
import { IssueTitle } from '../../../../domain/issue/vo/IssueTitle';
import { UserStatus } from '../../../../domain/user/enums/UserStatus';

describe('AssignIssueUseCase', () => {
  let issueRepository: MockIssueRepository;
  let userRepository: MockUserRepository;
  let useCase: AssignIssueUseCase;

  beforeEach(() => {
    issueRepository = new MockIssueRepository();
    userRepository = new MockUserRepository();
    useCase = new AssignIssueUseCase(issueRepository, userRepository);
  });

  const setupIssueAndUsers = async () => {
    const creator = User.create('creator-id', Email.create('creator@example.com'));
    const assignee = User.create('assignee-id', Email.create('assignee@example.com'));
    await Promise.all([
      userRepository.save(creator),
      userRepository.save(assignee),
    ]);

    const issue = Issue.create('issue-id', IssueTitle.create('Test Issue'), creator);
    await issueRepository.save(issue);

    return { issue, creator, assignee };
  };

  it('should assign an issue to an enrolled user', async () => {
    const { issue, assignee } = await setupIssueAndUsers();
    const command = new AssignIssueCommand(issue.getId(), assignee.getId());
    const result = await useCase.execute(command);

    expect(result.assignee).toBe(assignee.getId());

    const savedIssue = await issueRepository.findById(issue.getId());
    expect(savedIssue?.getAssignee()?.getId()).toBe(assignee.getId());
  });

  it('should not assign an issue to a non-existent user', async () => {
    const { issue } = await setupIssueAndUsers();
    const command = new AssignIssueCommand(issue.getId(), 'non-existent-id');

    await expect(useCase.execute(command))
      .rejects
      .toThrow('Assignee not found: non-existent-id');
  });

  it('should not assign a non-existent issue', async () => {
    const { assignee } = await setupIssueAndUsers();
    const command = new AssignIssueCommand('non-existent-id', assignee.getId());

    await expect(useCase.execute(command))
      .rejects
      .toThrow('Issue not found: non-existent-id');
  });

  it('should not assign an issue to a non-enrolled user', async () => {
    const { issue } = await setupIssueAndUsers();
    const suspendedUser = User.create(
      'suspended-id',
      Email.create('suspended@example.com'),
      UserStatus.Suspended
    );
    await userRepository.save(suspendedUser);

    const command = new AssignIssueCommand(issue.getId(), suspendedUser.getId());

    await expect(useCase.execute(command))
      .rejects
      .toThrow('Only enrolled users can be assigned to issues');
  });

  it('should unassign an issue when assignee is null', async () => {
    const { issue, assignee } = await setupIssueAndUsers();
    issue.assign(assignee);
    await issueRepository.save(issue);

    const command = new AssignIssueCommand(issue.getId(), null);
    const result = await useCase.execute(command);

    expect(result.assignee).toBeNull();

    const savedIssue = await issueRepository.findById(issue.getId());
    expect(savedIssue?.getAssignee()).toBeUndefined();
  });
}); 