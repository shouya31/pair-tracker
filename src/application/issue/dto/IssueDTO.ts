import { Issue } from '../../../domain/issue/Issue';
import { IssueStatus } from '../../../domain/issue/enums/IssueStatus';
import { UserDTO } from '../../user/dto/UserDTO';

export class IssueDTO {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly status: IssueStatus,
    public readonly creator: UserDTO,
    public readonly assignee?: UserDTO,
  ) {}

  static fromDomain(issue: Issue): IssueDTO {
    return new IssueDTO(
      issue.getId(),
      issue.getTitle().getValue(),
      issue.getStatus(),
      UserDTO.fromDomain(issue.getCreator()),
      issue.getAssignee() ? UserDTO.fromDomain(issue.getAssignee()!) : undefined,
    );
  }
} 