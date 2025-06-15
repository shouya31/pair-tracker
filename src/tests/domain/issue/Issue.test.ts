import { Issue } from '../../../domain/issue/Issue';
import { IssueTitle } from '../../../domain/issue/vo/IssueTitle';
import { User } from '../../../domain/user/User';
import { Email } from '../../../domain/shared/Email';
import { UserStatus } from '../../../domain/user/UserStatus';
import { IssueStatus } from '../../../domain/issue/IssueStatus';

describe('Issue', () => {
  const validTitle = IssueTitle.create('Test Issue');

  const createUser = (id: string, email: string, status: UserStatus = UserStatus.ENROLLED): User => {
    return User.reconstruct(id, Email.create(email), status);
  };

  describe('create', () => {
    it('should create an issue with valid parameters', () => {
      const creator = createUser('user-1', 'user1@example.com');
      const issue = Issue.create(validTitle, creator);
      expect(issue.getTitle().getValue()).toBe('Test Issue');
      expect(issue.getStatus()).toBe(IssueStatus.UNSTARTED);
      expect(issue.getCreator().equals(creator)).toBe(true);
      expect(issue.getAssignee()).toBeUndefined();
    });

    it('should not create an issue with non-enrolled creator', () => {
      const creator = createUser('user-1', 'user1@example.com', UserStatus.SUSPENDED);
      expect(() => Issue.create(validTitle, creator))
        .toThrow('Creator must be enrolled');
    });
  });

  describe('assign', () => {
    let issue: Issue;
    let creator: User;

    beforeEach(() => {
      creator = createUser('creator', 'creator@example.com');
      issue = Issue.create(validTitle, creator);
    });

    it('should assign an enrolled user', () => {
      const assignee = createUser('assignee', 'assignee@example.com');
      issue.assign(assignee);
      expect(issue.getAssignee()?.equals(assignee)).toBe(true);
    });

    it('should not assign a non-enrolled user', () => {
      const assignee = createUser('assignee', 'assignee@example.com', UserStatus.SUSPENDED);
      expect(() => issue.assign(assignee))
        .toThrow('Only enrolled users can be assigned to issues');
    });
  });

  describe('unassign', () => {
    let issue: Issue;
    let creator: User;
    let assignee: User;

    beforeEach(() => {
      creator = createUser('creator', 'creator@example.com');
      assignee = createUser('assignee', 'assignee@example.com');
      issue = Issue.create(validTitle, creator);
      issue.assign(assignee);
    });

    it('should unassign the current assignee', () => {
      issue.unassign();
      expect(issue.getAssignee()).toBeUndefined();
    });
  });

  describe('changeStatus', () => {
    let issue: Issue;
    let creator: User;
    let assignee: User;

    beforeEach(() => {
      creator = createUser('creator', 'creator@example.com');
      assignee = createUser('assignee', 'assignee@example.com');
      issue = Issue.create(validTitle, creator);
      issue.assign(assignee);
    });

    it('should change status when requested by assignee', () => {
      issue.changeStatus(IssueStatus.IN_REVIEW, assignee);
      expect(issue.getStatus()).toBe(IssueStatus.IN_REVIEW);
    });

    it('should not change status when requested by non-assignee', () => {
      const otherUser = createUser('other', 'other@example.com');
      expect(() => issue.changeStatus(IssueStatus.IN_REVIEW, otherUser))
        .toThrow('Only the assigned user can change the status');
    });

    it('should not change status when no assignee exists', () => {
      issue.unassign();
      expect(() => issue.changeStatus(IssueStatus.IN_REVIEW, assignee))
        .toThrow('Only the assigned user can change the status');
    });
  });
}); 