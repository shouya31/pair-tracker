import { PairName } from './PairName';
import { PairNameValidationError } from '../errors/PairNameValidationError';

describe('PairName', () => {
  describe('正常系', () => {
    // A-Zまでの全ての大文字アルファベットが有効なペア名として使用できることを確認
    const validChars = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); // A-Z
    test.each(validChars)('ペア名%sを作成できる', (char) => {
      const pairName = new PairName(char);
      expect(pairName.getValue()).toBe(char);
    });

    test('同じ値のペア名同士を比較するとtrueを返す', () => {
      const name1 = new PairName('A');
      const name2 = new PairName('A');
      expect(name1.equals(name2)).toBe(true);
    });

    test('異なる値のペア名同士を比較するとfalseを返す', () => {
      const name1 = new PairName('A');
      const name2 = new PairName('B');
      expect(name1.equals(name2)).toBe(false);
    });
  });

  describe('異常系', () => {
    test('空文字列の場合はエラーとなる', () => {
      expect(() => new PairName('')).toThrow(PairNameValidationError);
      expect(() => new PairName('')).toThrow('ペア名は1文字である必要があります');
    });

    test('2文字以上の文字列の場合はエラーとなる', () => {
      expect(() => new PairName('AA')).toThrow(PairNameValidationError);
      expect(() => new PairName('AA')).toThrow('ペア名は1文字である必要があります');
    });

    test('小文字のアルファベットの場合はエラーとなる', () => {
      expect(() => new PairName('a')).toThrow(PairNameValidationError);
      expect(() => new PairName('a')).toThrow('ペア名は大文字のアルファベット1文字である必要があります');
    });

    test('数字の場合はエラーとなる', () => {
      expect(() => new PairName('1')).toThrow(PairNameValidationError);
      expect(() => new PairName('1')).toThrow('ペア名は大文字のアルファベット1文字である必要があります');
    });

    test('特殊文字の場合はエラーとなる', () => {
      expect(() => new PairName('@')).toThrow(PairNameValidationError);
      expect(() => new PairName('@')).toThrow('ペア名は大文字のアルファベット1文字である必要があります');
    });

    test('日本語文字の場合はエラーとなる', () => {
      expect(() => new PairName('あ')).toThrow(PairNameValidationError);
      expect(() => new PairName('あ')).toThrow('ペア名は大文字のアルファベット1文字である必要があります');
    });
  });
});