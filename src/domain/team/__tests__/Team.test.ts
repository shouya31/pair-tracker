import { Team } from '../Team';
import { TeamName } from '../TeamName';
import { Pair } from '../Pair';
import { PairLabel } from '../PairLabel';
import { User } from '../../user/User';
import { Email } from '../../shared/Email';
import { UserStatus } from '../../user/User';

describe('Team', () => {
  const member1 = new User(new Email('member1@example.com'));
  const member2 = new User(new Email('member2@example.com'));
  const member3 = new User(new Email('member3@example.com'));
  const member4 = new User(new Email('member4@example.com'));
  const inactiveUser = new User(new Email('inactive@example.com'), UserStatus.Suspended);

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