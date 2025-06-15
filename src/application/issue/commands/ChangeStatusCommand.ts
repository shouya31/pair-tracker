import { IssueStatus } from '../../../domain/issue/enums/IssueStatus';

export class ChangeStatusCommand {
  constructor(
    public readonly issueId: string,
    public readonly userId: string,
    public readonly newStatus: IssueStatus,
  ) {}
} 