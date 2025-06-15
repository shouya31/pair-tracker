import { Issue } from './Issue';
import { IssueTitle } from './IssueTitle';
import { IssueStatus } from './IssueStatus';
import { User } from '../user/User';
import { Email } from '../shared/Email';

describe('IssueTitle', () => {
  it('有効なタイトルを受け入れる', () => {
    expect(() => new IssueTitle('Valid Title')).not.toThrow();
    expect(() => new IssueTitle('A')).not.toThrow();
    expect(() => new IssueTitle('Twenty Chars Title!!')).not.toThrow();
  });

  it('空のタイトルを拒否する', () => {
    expect(() => new IssueTitle('')).toThrow('Issue title must be 1-20 characters');
  });

  it('20文字を超えるタイトルを拒否する', () => {
    expect(() => new IssueTitle('This is a very long title that exceeds twenty characters'))
      .toThrow('Issue title must be 1-20 characters');
  });
});

describe('Issue', () => {
  const creator = new User(new Email('creator@example.com'));
  const assignee = new User(new Email('assignee@example.com'));
  const title = new IssueTitle('Test Issue');

  it('作成時にUnstartedステータスで初期化される', () => {
    const issue = new Issue(title, creator);
    expect(issue.status).toBe(IssueStatus.Unstarted);
  });

  it('作成者が設定される', () => {
    const issue = new Issue(title, creator);
    expect(issue.creator.userId).toBe(creator.userId);
  });

  it('担当者を割り当てることができる', () => {
    const issue = new Issue(title, creator);
    issue.assign(assignee);
    expect(issue.assignee?.userId).toBe(assignee.userId);
  });

  describe('ステータス更新', () => {
    let issue: Issue;

    beforeEach(() => {
      issue = new Issue(title, creator);
      issue.assign(assignee);
    });

    it('担当者がステータスを更新できる', () => {
      expect(() => issue.updateStatus(IssueStatus.InReview, assignee)).not.toThrow();
      expect(issue.status).toBe(IssueStatus.InReview);
    });

    it('担当者以外のユーザーはステータスを更新できない', () => {
      const otherUser = new User(new Email('other@example.com'));
      expect(() => issue.updateStatus(IssueStatus.InReview, otherUser))
        .toThrow('Only the assignee can update the status');
    });

    it('担当者が設定されていない場合、ステータスを更新できない', () => {
      const unassignedIssue = new Issue(title, creator);
      expect(() => unassignedIssue.updateStatus(IssueStatus.InReview, assignee))
        .toThrow('Only the assignee can update the status');
    });
  });
}); 