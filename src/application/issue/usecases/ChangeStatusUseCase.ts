import { ChangeStatusCommand } from '../commands/ChangeStatusCommand';
import { IIssueRepository } from '../../../domain/issue/IIssueRepository';
import { IUserRepository } from '../../../domain/user/IUserRepository';
import { IssueDTO } from '../dto/IssueDTO';

export class ChangeStatusUseCase {
  constructor(
    private issueRepository: IIssueRepository,
    private userRepository: IUserRepository,
  ) {}

  async execute(command: ChangeStatusCommand): Promise<IssueDTO> {
    const issue = await this.issueRepository.findById(command.issueId);
    if (!issue) {
      throw new Error(`Issue not found: ${command.issueId}`);
    }

    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new Error(`User not found: ${command.userId}`);
    }

    issue.changeStatus(command.newStatus, user);
    await this.issueRepository.save(issue);

    return IssueDTO.fromDomain(issue);
  }
} 