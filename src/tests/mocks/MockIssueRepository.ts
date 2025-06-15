import { IIssueRepository } from '../../domain/issue/IIssueRepository';
import { Issue } from '../../domain/issue/Issue';

export class MockIssueRepository implements IIssueRepository {
  private issues: Issue[] = [];

  async save(issue: Issue): Promise<void> {
    const index = this.issues.findIndex(i => i.getId() === issue.getId());
    if (index !== -1) {
      this.issues[index] = issue;
    } else {
      this.issues.push(issue);
    }
  }

  async findById(id: string): Promise<Issue | null> {
    return this.issues.find(i => i.getId() === id) || null;
  }

  async findByCreatorId(creatorId: string): Promise<Issue[]> {
    return this.issues.filter(i => i.getCreator().getId() === creatorId);
  }

  async findByAssigneeId(assigneeId: string): Promise<Issue[]> {
    return this.issues.filter(i => i.getAssignee()?.getId() === assigneeId);
  }

  async findAll(): Promise<Issue[]> {
    return [...this.issues];
  }

  async delete(id: string): Promise<void> {
    this.issues = this.issues.filter(i => i.getId() !== id);
  }

  // テスト用のヘルパーメソッド
  clear(): void {
    this.issues = [];
  }
} 