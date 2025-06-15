import { AssignIssueCommand } from '../commands/AssignIssueCommand';
import { IIssueRepository } from '../../../domain/issue/IIssueRepository';
import { IUserRepository } from '../../../domain/user/IUserRepository';
import { IssueDTO } from '../dto/IssueDTO';

export class AssignIssueUseCase {
  constructor(
    private issueRepository: IIssueRepository,
    private userRepository: IUserRepository,
  ) {}

  async execute(command: AssignIssueCommand): Promise<IssueDTO> {
    const issue = await this.issueRepository.findById(command.issueId);
    if (!issue) {
      throw new Error(`Issue not found: ${command.issueId}`);
    }

    const assignee = await this.userRepository.findById(command.assigneeId);
    if (!assignee) {
      throw new Error(`Assignee not found: ${command.assigneeId}`);
    }

    issue.assign(assignee);
    await this.issueRepository.save(issue);

    return IssueDTO.fromDomain(issue);
  }
} 