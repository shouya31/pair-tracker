import { Team } from './Team';
import { TeamName } from './TeamName';
import { Pair } from './Pair';
import { PairLabel } from './PairLabel';
import { User } from '../user/User';
import { Email } from '../shared/Email';
import { UserStatus } from '../user/User';

describe('TeamName', () => {
  it('有効なチーム名を受け入れる', () => {
    expect(() => new TeamName('ABC')).not.toThrow();
    expect(() => new TeamName('A')).not.toThrow();
  });

  it('3文字を超えるチーム名を拒否する', () => {
    expect(() => new TeamName('ABCD')).toThrow('Team name must be 1-3 characters');
  });

  it('空のチーム名を拒否する', () => {
    expect(() => new TeamName('')).toThrow('Team name must be 1-3 characters');
  });
});

describe('PairLabel', () => {
  it('有効なペアラベルを受け入れる', () => {
    expect(() => new PairLabel('A')).not.toThrow();
    expect(() => new PairLabel('Z')).not.toThrow();
  });

  it('無効なペアラベルを拒否する', () => {
    expect(() => new PairLabel('')).toThrow('Pair label must be a single character from A to Z');
    expect(() => new PairLabel('a')).toThrow('Pair label must be a single character from A to Z');
    expect(() => new PairLabel('AA')).toThrow('Pair label must be a single character from A to Z');
  });
});

describe('Pair', () => {
  const member1 = new User(new Email('member1@example.com'));
  const member2 = new User(new Email('member2@example.com'));
  const member3 = new User(new Email('member3@example.com'));
  const inactiveUser = new User(new Email('inactive@example.com'), UserStatus.Suspended);

  it('2名のメンバーで作成できる', () => {
    expect(() => new Pair(new PairLabel('A'), [member1, member2])).not.toThrow();
  });

  it('3名のメンバーで作成できる', () => {
    expect(() => new Pair(new PairLabel('A'), [member1, member2, member3])).not.toThrow();
  });

  it('1名以下のメンバーを拒否する', () => {
    expect(() => new Pair(new PairLabel('A'), [member1])).toThrow('Pair must have 2-3 members');
  });

  it('4名以上のメンバーを拒否する', () => {
    expect(() => new Pair(new PairLabel('A'), [member1, member2, member3, member1]))
      .toThrow('Pair must have 2-3 members');
  });

  it('非アクティブなメンバーを拒否する', () => {
    expect(() => new Pair(new PairLabel('A'), [member1, inactiveUser]))
      .toThrow('All pair members must be active');
  });
});

describe('Team', () => {
  let member1: User;
  let member2: User;
  let member3: User;
  let member4: User;
  let inactiveUser: User;

  beforeEach(() => {
    member1 = new User(new Email('member1@example.com'));
    member2 = new User(new Email('member2@example.com'));
    member3 = new User(new Email('member3@example.com'));
    member4 = new User(new Email('member4@example.com'));
    inactiveUser = new User(new Email('inactive@example.com'), UserStatus.Suspended);
  });

  describe('constructor', () => {
    it('3名以上のアクティブメンバーで作成できる', () => {
      const team = new Team(new TeamName('ABC'), [member1, member2, member3]);
      expect(team.members).toHaveLength(3);
      expect(team.members).toContainEqual(member1);
      expect(team.members).toContainEqual(member2);
      expect(team.members).toContainEqual(member3);
    });

    it('2名以下のメンバーを拒否する', () => {
      expect(() => new Team(new TeamName('ABC'), [member1, member2]))
        .toThrow('Team must have at least 3 members');
      expect(() => new Team(new TeamName('ABC'), [member1]))
        .toThrow('Team must have at least 3 members');
      expect(() => new Team(new TeamName('ABC'), []))
        .toThrow('Team must have at least 3 members');
    });

    it('非アクティブなメンバーを含むチームを拒否する', () => {
      expect(() => new Team(new TeamName('ABC'), [member1, member2, inactiveUser]))
        .toThrow('All team members must be active');
    });
  });

  describe('addPair', () => {
    let team: Team;

    beforeEach(() => {
      team = new Team(new TeamName('ABC'), [member1, member2, member3, member4]);
    });

    it('チームのメンバーで構成されたペアを追加できる', () => {
      const pair = new Pair(new PairLabel('A'), [member1, member2]);
      team.addPair(pair);
      expect(team.pairs).toHaveLength(1);
      expect(team.pairs[0]).toBe(pair);
    });

    it('チームに所属していないメンバーを含むペアを拒否する', () => {
      const outsider = new User(new Email('outsider@example.com'));
      const pair = new Pair(new PairLabel('A'), [member1, outsider]);
      expect(() => team.addPair(pair))
        .toThrow('All pair members must belong to the team');
    });
  });

  describe('hasMember', () => {
    const team = new Team(new TeamName('ABC'), [member1, member2, member3]);

    it('所属メンバーのIDを含む場合trueを返す', () => {
      expect(team.hasMember(member1.userId)).toBe(true);
      expect(team.hasMember(member2.userId)).toBe(true);
      expect(team.hasMember(member3.userId)).toBe(true);
    });

    it('所属していないメンバーのIDの場合falseを返す', () => {
      expect(team.hasMember(member4.userId)).toBe(false);
      expect(team.hasMember('non-existent-id')).toBe(false);
    });
  });
}); 