export class AssignIssueCommand {
  constructor(
    public readonly issueId: string,
    public readonly assigneeId: string,
  ) {}
} 