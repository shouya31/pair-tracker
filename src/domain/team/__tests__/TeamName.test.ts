import { TeamName } from '../TeamName';

describe('TeamName', () => {
  describe('constructor', () => {
    it('1-3文字のチーム名を受け入れる', () => {
      const validNames = ['A', 'AB', 'ABC'];
      validNames.forEach(name => {
        const teamName = new TeamName(name);
        expect(teamName.toString()).toBe(name);
      });
    });

    it('空のチーム名を拒否する', () => {
      expect(() => new TeamName('')).toThrow('Team name must be 1-3 characters');
    });

    it('3文字を超えるチーム名を拒否する', () => {
      expect(() => new TeamName('ABCD')).toThrow('Team name must be 1-3 characters');
    });
  });

  describe('equals', () => {
    it('同じ値のTeamNameオブジェクトが等しいと判定される', () => {
      const name1 = new TeamName('ABC');
      const name2 = new TeamName('ABC');
      expect(name1.equals(name2)).toBe(true);
    });

    it('異なる値のTeamNameオブジェクトが等しくないと判定される', () => {
      const name1 = new TeamName('ABC');
      const name2 = new TeamName('XYZ');
      expect(name1.equals(name2)).toBe(false);
    });
  });
}); 