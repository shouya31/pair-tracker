import { PairLabel } from '../../../../domain/team/vo/PairLabel';

describe('PairLabel', () => {
  describe('create', () => {
    it('should create a pair label with uppercase letter', () => {
      const label = PairLabel.create('A');
      expect(label.getValue()).toBe('A');
    });

    it('should convert lowercase to uppercase', () => {
      const label = PairLabel.create('b');
      expect(label.getValue()).toBe('B');
    });

    it('should throw error for empty label', () => {
      expect(() => PairLabel.create(''))
        .toThrow('Pair label must be a single uppercase letter A-Z');
    });

    it('should throw error for multiple characters', () => {
      expect(() => PairLabel.create('AB'))
        .toThrow('Pair label must be a single uppercase letter A-Z');
    });

    it('should throw error for non-letter character', () => {
      expect(() => PairLabel.create('1'))
        .toThrow('Pair label must be a single uppercase letter A-Z');
      expect(() => PairLabel.create('!'))
        .toThrow('Pair label must be a single uppercase letter A-Z');
    });
  });

  describe('equals', () => {
    it('should return true for same label', () => {
      const label1 = PairLabel.create('A');
      const label2 = PairLabel.create('A');
      expect(label1.equals(label2)).toBe(true);
    });

    it('should return true for same label with different case', () => {
      const label1 = PairLabel.create('A');
      const label2 = PairLabel.create('a');
      expect(label1.equals(label2)).toBe(true);
    });

    it('should return false for different label', () => {
      const label1 = PairLabel.create('A');
      const label2 = PairLabel.create('B');
      expect(label1.equals(label2)).toBe(false);
    });
  });
}); 