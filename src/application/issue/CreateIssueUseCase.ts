import { Issue } from '../../domain/issue/Issue';
import { IssueTitle } from '../../domain/issue/IssueTitle';
import { IIssueRepository } from '../../domain/issue/IIssueRepository';
import { IUserRepository } from '../../domain/user/IUserRepository';

export class CreateIssueUseCase {
  constructor(
    private readonly issueRepository: IIssueRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(title: string, creatorId: string): Promise<Issue> {
    // 作成者の存在チェック
    const creator = await this.userRepository.findById(creatorId);
    if (!creator) {
      throw new Error('Creator not found');
    }

    // 課題の作成と保存
    const issueTitle = new IssueTitle(title);
    const issue = new Issue(issueTitle, creator);
    return this.issueRepository.save(issue);
  }
} 