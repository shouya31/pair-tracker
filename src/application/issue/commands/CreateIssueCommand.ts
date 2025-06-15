export class CreateIssueCommand {
  constructor(
    public readonly title: string,
    public readonly creatorId: string,
  ) {}
}