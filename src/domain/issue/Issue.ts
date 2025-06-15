import { Entity } from '../shared/Entity';
import { IssueTitle } from './vo/IssueTitle';
import { User } from '../user/User';
import { IssueStatus } from './IssueStatus';

export class Issue extends Entity {
  private constructor(
    id: string,
    private title: IssueTitle,
    private status: IssueStatus,
    private creator: User,
    private assignee?: User,
  ) {
    super(id);
  }

  static create(title: IssueTitle, creator: User): Issue {
    if (!creator.isEnrolled()) {
      throw new Error('Creator must be enrolled');
    }
    return new Issue(
      crypto.randomUUID(),
      title,
      IssueStatus.UNSTARTED,
      creator,
    );
  }

  static reconstruct(
    id: string,
    title: IssueTitle,
    status: IssueStatus,
    creator: User,
    assignee?: User,
  ): Issue {
    return new Issue(id, title, status, creator, assignee);
  }

  getTitle(): IssueTitle {
    return this.title;
  }

  getStatus(): IssueStatus {
    return this.status;
  }

  getCreator(): User {
    return this.creator;
  }

  getAssignee(): User | undefined {
    return this.assignee;
  }

  assign(user: User): void {
    if (!user.isEnrolled()) {
      throw new Error('Only enrolled users can be assigned to issues');
    }
    this.assignee = user;
  }

  unassign(): void {
    this.assignee = undefined;
  }

  changeStatus(newStatus: IssueStatus, user: User): void {
    if (!this.assignee || !this.assignee.equals(user)) {
      throw new Error('Only the assigned user can change the status');
    }
    this.status = newStatus;
  }
}