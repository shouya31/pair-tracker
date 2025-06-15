import { IIssueRepository } from '../../domain/issue/IIssueRepository';
import { Issue } from '../../domain/issue/Issue';
import { IssueTitle } from '../../domain/issue/vo/IssueTitle';
import { IssueStatus } from '../../domain/issue/enums/IssueStatus';
import { User } from '../../domain/user/User';
import { Email } from '../../domain/shared/Email';
import { UserStatus } from '../../domain/user/enums/UserStatus';
import prisma from '../prisma/client';

export class IssueRepositoryPrisma implements IIssueRepository {
  async save(issue: Issue): Promise<void> {
    await prisma.issue.upsert({
      where: { id: issue.getId() },
      update: {
        title: issue.getTitle().getValue(),
        status: issue.getStatus(),
        assigneeId: issue.getAssignee()?.getId(),
      },
      create: {
        id: issue.getId(),
        title: issue.getTitle().getValue(),
        status: issue.getStatus(),
        creatorId: issue.getCreator().getId(),
        assigneeId: issue.getAssignee()?.getId(),
      },
    });
  }

  async findById(id: string): Promise<Issue | null> {
    const issueData = await prisma.issue.findUnique({
      where: { id },
      include: {
        creator: true,
        assignee: true,
      },
    });

    if (!issueData) return null;

    const creator = User.create(
      issueData.creator.id,
      Email.create(issueData.creator.email),
      issueData.creator.status as UserStatus,
    );

    let assignee: User | undefined;
    if (issueData.assignee) {
      assignee = User.create(
        issueData.assignee.id,
        Email.create(issueData.assignee.email),
        issueData.assignee.status as UserStatus,
      );
    }

    const issue = Issue.create(
      issueData.id,
      IssueTitle.create(issueData.title),
      creator,
      issueData.status as IssueStatus,
    );

    if (assignee) {
      issue.assign(assignee);
    }

    return issue;
  }

  async findByCreatorId(creatorId: string): Promise<Issue[]> {
    const issues = await prisma.issue.findMany({
      where: { creatorId },
      include: {
        creator: true,
        assignee: true,
      },
    });

    return Promise.all(issues.map(issue => this.reconstructIssue(issue)));
  }

  async findByAssigneeId(assigneeId: string): Promise<Issue[]> {
    const issues = await prisma.issue.findMany({
      where: { assigneeId },
      include: {
        creator: true,
        assignee: true,
      },
    });

    return Promise.all(issues.map(issue => this.reconstructIssue(issue)));
  }

  async findAll(): Promise<Issue[]> {
    const issues = await prisma.issue.findMany({
      include: {
        creator: true,
        assignee: true,
      },
    });

    return Promise.all(issues.map(issue => this.reconstructIssue(issue)));
  }

  async delete(id: string): Promise<void> {
    await prisma.issue.delete({
      where: { id },
    });
  }

  private async reconstructIssue(issueData: any): Promise<Issue> {
    const creator = User.create(
      issueData.creator.id,
      Email.create(issueData.creator.email),
      issueData.creator.status as UserStatus,
    );

    const issue = Issue.create(
      issueData.id,
      IssueTitle.create(issueData.title),
      creator,
      issueData.status as IssueStatus,
    );

    if (issueData.assignee) {
      const assignee = User.create(
        issueData.assignee.id,
        Email.create(issueData.assignee.email),
        issueData.assignee.status as UserStatus,
      );
      issue.assign(assignee);
    }

    return issue;
  }
} 