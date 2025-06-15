import { IIssueRepository } from '../../domain/issue/IIssueRepository';
import { IUserRepository } from '../../domain/user/IUserRepository';

export class AssignIssueUseCase {
  constructor(
    private readonly issueRepository: IIssueRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(issueId: string, assigneeId: string): Promise<void> {
    // 課題の存在チェック
    const issue = await this.issueRepository.findById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    // 担当者の存在チェック
    const assignee = await this.userRepository.findById(assigneeId);
    if (!assignee) {
      throw new Error('Assignee not found');
    }

    // 担当者が非アクティブな場合は拒否
    if (!assignee.isActive()) {
      throw new Error('Cannot assign issue to inactive user');
    }

    // 課題の割り当てと保存
    issue.assign(assignee);
    await this.issueRepository.save(issue);
  }
} 