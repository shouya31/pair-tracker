import { CreateIssueUseCase } from '../../application/issue/CreateIssueUseCase';
import { AssignIssueUseCase } from '../../application/issue/AssignIssueUseCase';
import { IssueStatus } from '../../domain/issue/IssueStatus';

export class IssueController {
  constructor(
    private readonly createIssueUseCase: CreateIssueUseCase,
    private readonly assignIssueUseCase: AssignIssueUseCase
  ) {}

  async createIssue(req: CreateIssueRequest): Promise<CreateIssueResponse> {
    try {
      const issue = await this.createIssueUseCase.execute(req.title, req.creatorId);
      return {
        issueId: issue.issueId,
        title: issue.title.toString(),
        status: issue.status,
        creatorId: issue.creator.userId,
        assigneeId: issue.assignee?.userId || null
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create issue: ${error.message}`);
      }
      throw new Error('Failed to create issue: Unknown error');
    }
  }

  async assignIssue(req: AssignIssueRequest): Promise<void> {
    try {
      await this.assignIssueUseCase.execute(req.issueId, req.assigneeId);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to assign issue: ${error.message}`);
      }
      throw new Error('Failed to assign issue: Unknown error');
    }
  }
}

interface CreateIssueRequest {
  title: string;
  creatorId: string;
}

interface CreateIssueResponse {
  issueId: string;
  title: string;
  status: IssueStatus;
  creatorId: string;
  assigneeId: string | null;
}

interface AssignIssueRequest {
  issueId: string;
  assigneeId: string;
} 