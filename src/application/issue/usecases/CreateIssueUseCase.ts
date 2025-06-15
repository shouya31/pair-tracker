import { v4 as uuidv4 } from 'uuid';
import { CreateIssueCommand } from '../commands/CreateIssueCommand';
import { IIssueRepository } from '../../../domain/issue/IIssueRepository';
import { IUserRepository } from '../../../domain/user/IUserRepository';
import { Issue } from '../../../domain/issue/Issue';
import { IssueTitle } from '../../../domain/issue/vo/IssueTitle';
import { IssueDTO } from '../dto/IssueDTO';

export class CreateIssueUseCase {
  constructor(
    private readonly issueRepository: IIssueRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: CreateIssueCommand): Promise<IssueDTO> {
    const creator = await this.userRepository.findById(command.creatorId);
    if (!creator) {
      throw new Error('Creator not found');
    }

    const title = IssueTitle.create(command.title);
    const issue = Issue.create(uuidv4(), title, creator);

    await this.issueRepository.save(issue);

    return IssueDTO.fromDomain(issue);
  }
} 