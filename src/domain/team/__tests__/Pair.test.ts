import { Pair } from '../Pair';
import { PairLabel } from '../PairLabel';
import { User } from '../../user/User';
import { Email } from '../../shared/Email';
import { UserStatus } from '../../user/User';

describe('Pair', () => {
  const member1 = new User(new Email('member1@example.com'));
  const member2 = new User(new Email('member2@example.com'));
  const member3 = new User(new Email('member3@example.com'));
  const inactiveUser = new User(new Email('inactive@example.com'), UserStatus.Suspended);

  describe('constructor', () => {
    it('2名のアクティブメンバーで作成できる', () => {
      const pair = new Pair(new PairLabel('A'), [member1, member2]);
      expect(pair.members).toHaveLength(2);
      expect(pair.members).toContainEqual(member1);
      expect(pair.members).toContainEqual(member2);
    });

    it('3名のアクティブメンバーで作成できる', () => {
      const pair = new Pair(new PairLabel('A'), [member1, member2, member3]);
      expect(pair.members).toHaveLength(3);
      expect(pair.members).toContainEqual(member1);
      expect(pair.members).toContainEqual(member2);
      expect(pair.members).toContainEqual(member3);
    });

    it('1名以下のメンバーを拒否する', () => {
      expect(() => new Pair(new PairLabel('A'), [member1]))
        .toThrow('Pair must have 2-3 members');
      expect(() => new Pair(new PairLabel('A'), []))
        .toThrow('Pair must have 2-3 members');
    });

    it('4名以上のメンバーを拒否する', () => {
      expect(() => new Pair(new PairLabel('A'), [member1, member2, member3, member1]))
        .toThrow('Pair must have 2-3 members');
    });

    it('非アクティブなメンバーを含むペアを拒否する', () => {
      expect(() => new Pair(new PairLabel('A'), [member1, inactiveUser]))
        .toThrow('All pair members must be active');
    });
  });

  describe('hasMember', () => {
    const pair = new Pair(new PairLabel('A'), [member1, member2]);

    it('所属メンバーのIDを含む場合trueを返す', () => {
      expect(pair.hasMember(member1.userId)).toBe(true);
      expect(pair.hasMember(member2.userId)).toBe(true);
    });

    it('所属していないメンバーのIDの場合falseを返す', () => {
      expect(pair.hasMember(member3.userId)).toBe(false);
      expect(pair.hasMember('non-existent-id')).toBe(false);
    });
  });
}); 