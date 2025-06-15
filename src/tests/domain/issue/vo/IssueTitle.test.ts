import { IssueTitle } from '../../../../domain/issue/vo/IssueTitle';

describe('IssueTitle', () => {
  describe('create', () => {
    it('should create an issue title with valid length', () => {
      const title = IssueTitle.create('Test Issue');
      expect(title.getValue()).toBe('Test Issue');
    });

    it('should create an issue title with maximum length', () => {
      const title = IssueTitle.create('A'.repeat(20));
      expect(title.getValue()).toBe('A'.repeat(20));
    });

    it('should throw error for empty title', () => {
      expect(() => IssueTitle.create(''))
        .toThrow('Issue title must be between 1 and 20 characters');
    });

    it('should throw error for too long title', () => {
      expect(() => IssueTitle.create('A'.repeat(21)))
        .toThrow('Issue title must be between 1 and 20 characters');
    });
  });

  describe('equals', () => {
    it('should return true for same title', () => {
      const title1 = IssueTitle.create('Test Issue');
      const title2 = IssueTitle.create('Test Issue');
      expect(title1.equals(title2)).toBe(true);
    });

    it('should return false for different title', () => {
      const title1 = IssueTitle.create('Test Issue 1');
      const title2 = IssueTitle.create('Test Issue 2');
      expect(title1.equals(title2)).toBe(false);
    });
  });
}); 