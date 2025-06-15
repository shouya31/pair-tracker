import { IssueRepositoryPrisma } from '../../../infrastructure/repositories/IssueRepositoryPrisma';
import { Issue } from '../../../domain/issue/Issue';
import { IssueTitle } from '../../../domain/issue/vo/IssueTitle';
import { IssueStatus } from '../../../domain/issue/enums/IssueStatus';
import { User } from '../../../domain/user/User';
import { Email } from '../../../domain/shared/Email';
import prisma from '../../../infrastructure/prisma/client';

describe('IssueRepositoryPrisma', () => {
  let repository: IssueRepositoryPrisma;

  beforeEach(async () => {
    repository = new IssueRepositoryPrisma();
    await prisma.issue.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const createIssue = () => {
    const creator = User.create('creator-id', Email.create('creator@example.com'));
    const assignee = User.create('assignee-id', Email.create('assignee@example.com'));
    const issue = Issue.create('issue-id', IssueTitle.create('Test Issue'), creator);
    issue.assign(assignee);
    return { issue, creator, assignee };
  };

  describe('save', () => {
    it('should save a new issue', async () => {
      const { issue } = createIssue();
      await repository.save(issue);

      const found = await prisma.issue.findUnique({
        where: { id: issue.getId() },
      });

      expect(found).not.toBeNull();
      expect(found?.title).toBe('Test Issue');
      expect(found?.status).toBe('UNSTARTED');
      expect(found?.creatorId).toBe('creator-id');
      expect(found?.assigneeId).toBe('assignee-id');
    });

    it('should update an existing issue', async () => {
      const { issue, assignee } = createIssue();
      await repository.save(issue);

      issue.changeStatus(IssueStatus.InReview, assignee);
      await repository.save(issue);

      const found = await prisma.issue.findUnique({
        where: { id: issue.getId() },
      });

      expect(found?.status).toBe('IN_REVIEW');
    });
  });

  describe('findById', () => {
    it('should find an issue by id', async () => {
      const { issue } = createIssue();
      await repository.save(issue);

      const found = await repository.findById(issue.getId());

      expect(found).not.toBeNull();
      expect(found?.getId()).toBe(issue.getId());
      expect(found?.getTitle().getValue()).toBe('Test Issue');
      expect(found?.getStatus()).toBe(IssueStatus.Unstarted);
      expect(found?.getCreator().getId()).toBe('creator-id');
      expect(found?.getAssignee()?.getId()).toBe('assignee-id');
    });

    it('should return null for non-existent id', async () => {
      const found = await repository.findById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('findByCreatorId', () => {
    it('should find issues by creator id', async () => {
      const { issue, creator } = createIssue();
      await repository.save(issue);

      const found = await repository.findByCreatorId(creator.getId());

      expect(found).toHaveLength(1);
      expect(found[0].getId()).toBe(issue.getId());
      expect(found[0].getCreator().getId()).toBe(creator.getId());
    });

    it('should return empty array for non-existent creator id', async () => {
      const found = await repository.findByCreatorId('non-existent-id');
      expect(found).toHaveLength(0);
    });
  });

  describe('findByAssigneeId', () => {
    it('should find issues by assignee id', async () => {
      const { issue, assignee } = createIssue();
      await repository.save(issue);

      const found = await repository.findByAssigneeId(assignee.getId());

      expect(found).toHaveLength(1);
      expect(found[0].getId()).toBe(issue.getId());
      expect(found[0].getAssignee()?.getId()).toBe(assignee.getId());
    });

    it('should return empty array for non-existent assignee id', async () => {
      const found = await repository.findByAssigneeId('non-existent-id');
      expect(found).toHaveLength(0);
    });
  });

  describe('findAll', () => {
    it('should find all issues', async () => {
      const { issue: issue1 } = createIssue();
      const { issue: issue2 } = createIssue();
      issue2.unassign(); // 2つ目の課題は担当者なし

      await Promise.all([
        repository.save(issue1),
        repository.save(issue2),
      ]);

      const found = await repository.findAll();

      expect(found).toHaveLength(2);
      expect(found.map(i => i.getId())).toContain(issue1.getId());
      expect(found.map(i => i.getId())).toContain(issue2.getId());
    });

    it('should return empty array when no issues exist', async () => {
      const found = await repository.findAll();
      expect(found).toHaveLength(0);
    });
  });

  describe('delete', () => {
    it('should delete an issue', async () => {
      const { issue } = createIssue();
      await repository.save(issue);

      await repository.delete(issue.getId());

      const found = await prisma.issue.findUnique({
        where: { id: issue.getId() },
      });
      expect(found).toBeNull();
    });

    it('should not throw error when deleting non-existent issue', async () => {
      await expect(repository.delete('non-existent-id'))
        .resolves
        .not.toThrow();
    });
  });
}); 