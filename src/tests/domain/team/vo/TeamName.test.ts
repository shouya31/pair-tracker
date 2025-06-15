import { TeamName } from '../../../../domain/team/vo/TeamName';

describe('TeamName', () => {
  describe('create', () => {
    it('should create a team name with valid length', () => {
      const name = TeamName.create('T1');
      expect(name.getValue()).toBe('T1');
    });

    it('should create a team name with maximum length', () => {
      const name = TeamName.create('ABC');
      expect(name.getValue()).toBe('ABC');
    });

    it('should throw error for empty name', () => {
      expect(() => TeamName.create(''))
        .toThrow('Team name must be between 1 and 3 characters');
    });

    it('should throw error for too long name', () => {
      expect(() => TeamName.create('TEAM1'))
        .toThrow('Team name must be between 1 and 3 characters');
    });
  });

  describe('equals', () => {
    it('should return true for same name', () => {
      const name1 = TeamName.create('T1');
      const name2 = TeamName.create('T1');
      expect(name1.equals(name2)).toBe(true);
    });

    it('should return false for different name', () => {
      const name1 = TeamName.create('T1');
      const name2 = TeamName.create('T2');
      expect(name1.equals(name2)).toBe(false);
    });
  });
}); 