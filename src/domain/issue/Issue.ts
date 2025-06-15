import { v4 as uuidv4 } from 'uuid';
import { User } from '../user/User';
import { IssueTitle } from './IssueTitle';
import { IssueStatus } from './IssueStatus';

export class Issue {
  private readonly _issueId: string;
  private readonly _title: IssueTitle;
  private _status: IssueStatus;
  private readonly _creator: User;
  private _assignee: User | null;

  constructor(title: IssueTitle, creator: User) {
    this._issueId = uuidv4();
    this._title = title;
    this._status = IssueStatus.Unstarted;
    this._creator = creator;
    this._assignee = null;
  }

  get issueId(): string {
    return this._issueId;
  }

  get title(): IssueTitle {
    return this._title;
  }

  get status(): IssueStatus {
    return this._status;
  }

  get creator(): User {
    return this._creator;
  }

  get assignee(): User | null {
    return this._assignee;
  }

  assign(user: User): void {
    this._assignee = user;
  }

  updateStatus(newStatus: IssueStatus, user: User): void {
    if (this._assignee === null || this._assignee.userId !== user.userId) {
      throw new Error('Only the assignee can update the status');
    }
    this._status = newStatus;
  }
} 