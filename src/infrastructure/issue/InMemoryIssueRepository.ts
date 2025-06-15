import { Issue } from '../../domain/issue/Issue';
import { IssueStatus } from '../../domain/issue/IssueStatus';
import { IIssueRepository } from '../../domain/issue/IIssueRepository';

export class InMemoryIssueRepository implements IIssueRepository {
  private issues: Map<string, Issue> = new Map();

  async save(issue: Issue): Promise<Issue> {
    this.issues.set(issue.issueId, issue);
    return issue;
  }

  async findById(id: string): Promise<Issue | null> {
    return this.issues.get(id) || null;
  }

  async findAll(): Promise<Issue[]> {
    return Array.from(this.issues.values());
  }

  async delete(id: string): Promise<void> {
    this.issues.delete(id);
  }

  async findByStatus(status: IssueStatus): Promise<Issue[]> {
    return Array.from(this.issues.values())
      .filter(issue => issue.status === status);
  }

  async findByAssignee(userId: string): Promise<Issue[]> {
    return Array.from(this.issues.values())
      .filter(issue => issue.assignee?.userId === userId);
  }

  async findByCreator(userId: string): Promise<Issue[]> {
    return Array.from(this.issues.values())
      .filter(issue => issue.creator.userId === userId);
  }
} 