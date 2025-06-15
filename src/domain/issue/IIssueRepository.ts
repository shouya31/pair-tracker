import { Issue } from './Issue';

export interface IIssueRepository {
  save(issue: Issue): Promise<void>;
  findById(id: string): Promise<Issue | null>;
  findByCreatorId(creatorId: string): Promise<Issue[]>;
  findByAssigneeId(assigneeId: string): Promise<Issue[]>;
  findAll(): Promise<Issue[]>;
  delete(id: string): Promise<void>;
} 