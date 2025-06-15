import { PairLabel } from '../PairLabel';

describe('PairLabel', () => {
  describe('constructor', () => {
    it('A-Zの1文字を受け入れる', () => {
      const validLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      validLabels.forEach(label => {
        const pairLabel = new PairLabel(label);
        expect(pairLabel.toString()).toBe(label);
      });
    });

    it('空のラベルを拒否する', () => {
      expect(() => new PairLabel('')).toThrow('Pair label must be a single character from A to Z');
    });

    it('小文字のラベルを拒否する', () => {
      expect(() => new PairLabel('a')).toThrow('Pair label must be a single character from A to Z');
    });

    it('複数文字のラベルを拒否する', () => {
      expect(() => new PairLabel('AB')).toThrow('Pair label must be a single character from A to Z');
    });

    it('数字や特殊文字を拒否する', () => {
      const invalidLabels = ['1', '@', '#', ' '];
      invalidLabels.forEach(label => {
        expect(() => new PairLabel(label)).toThrow('Pair label must be a single character from A to Z');
      });
    });
  });

  describe('equals', () => {
    it('同じ値のPairLabelオブジェクトが等しいと判定される', () => {
      const label1 = new PairLabel('A');
      const label2 = new PairLabel('A');
      expect(label1.equals(label2)).toBe(true);
    });

    it('異なる値のPairLabelオブジェクトが等しくないと判定される', () => {
      const label1 = new PairLabel('A');
      const label2 = new PairLabel('B');
      expect(label1.equals(label2)).toBe(false);
    });
  });
}); 