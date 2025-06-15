import { IRepository } from '../shared/interfaces/IRepository';
import { Issue } from './Issue';
import { IssueStatus } from './IssueStatus';

export interface IIssueRepository extends IRepository<Issue, string> {
  findByStatus(status: IssueStatus): Promise<Issue[]>;
  findByAssignee(userId: string): Promise<Issue[]>;
  findByCreator(userId: string): Promise<Issue[]>;
} 