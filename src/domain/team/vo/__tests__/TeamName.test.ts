import { TeamName } from '../TeamName';

describe('TeamName', () => {
  describe('正常系', () => {
    test('3文字以下のチーム名を作成できる', () => {
      const cases = ['A', 'AB', 'ABC'];
      cases.forEach(value => {
        expect(() => new TeamName(value)).not.toThrow();
        expect(new TeamName(value).getValue()).toBe(value);
      });
    });

    test('同じ値を持つTeamNameは等価である', () => {
      const name1 = new TeamName('ABC');
      const name2 = new TeamName('ABC');
      expect(name1.equals(name2)).toBe(true);
    });

    test('異なる値を持つTeamNameは等価でない', () => {
      const name1 = new TeamName('ABC');
      const name2 = new TeamName('XYZ');
      expect(name1.equals(name2)).toBe(false);
    });
  });

  describe('異常系', () => {
    test('4文字以上のチーム名は作成できない', () => {
      expect(() => new TeamName('ABCD')).toThrow('チーム名は3文字以下である必要があります');
    });

    test('空文字のチーム名は作成できない', () => {
      expect(() => new TeamName('')).toThrow('チーム名は必須です');
    });

    test('nullのチーム名は作成できない', () => {
      expect(() => new TeamName(null as unknown as string)).toThrow('チーム名は必須です');
    });
  });
});