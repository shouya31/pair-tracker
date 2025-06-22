import { TeamName } from './TeamName';
import { TeamNameLengthError, TeamNameRequiredError } from '../errors/TeamValidationError';

describe('TeamName', () => {
  describe('正常系', () => {
    test('3文字以下のチーム名は作成できる', () => {
      const cases = [
        { input: 'A', expected: 'A' },
        { input: 'AB', expected: 'AB' },
        { input: 'ABC', expected: 'ABC' },
      ];

      cases.forEach(({ input, expected }) => {
        expect(TeamName.create(input).getValue()).toBe(expected);
      });
    });

    test('前後の空白は自動的に削除される', () => {
      const cases = [
        { input: ' ABC', expected: 'ABC' },
        { input: 'ABC ', expected: 'ABC' },
        { input: ' ABC ', expected: 'ABC' },
      ];

      cases.forEach(({ input, expected }) => {
        expect(TeamName.create(input).getValue()).toBe(expected);
      });
    });

    test('同じ値を持つTeamNameは等価である', () => {
      const name1 = TeamName.create('ABC');
      const name2 = TeamName.create('ABC');
      expect(name1.equals(name2)).toBe(true);
    });

    test('異なる値を持つTeamNameは等価でない', () => {
      const name1 = TeamName.create('ABC');
      const name2 = TeamName.create('XYZ');
      expect(name1.equals(name2)).toBe(false);
    });

    test('空白を含む値でも、トリム後の値で等価性が判定される', () => {
      const name1 = TeamName.create('ABC');
      const name2 = TeamName.create(' ABC ');
      expect(name1.equals(name2)).toBe(true);
    });
  });

  describe('異常系', () => {
    test('4文字以上のチーム名は作成できない', () => {
      expect(() => TeamName.create('ABCD')).toThrow(TeamNameLengthError);
      expect(() => TeamName.create('ABCD')).toThrow('チーム名の検証に失敗しました: 3文字以下で入力してください（現在: 4文字）');
    });

    test('空文字のチーム名は作成できない', () => {
      expect(() => TeamName.create('')).toThrow(TeamNameRequiredError);
      expect(() => TeamName.create('')).toThrow('チーム名の検証に失敗しました: この項目は必須です');
    });

    test('空白のみのチーム名は作成できない', () => {
      const whitespaceOnlyCases = [' ', '   ', '\t', '\n', ' \n \t '];
      whitespaceOnlyCases.forEach(value => {
        expect(() => TeamName.create(value)).toThrow(TeamNameRequiredError);
        expect(() => TeamName.create(value)).toThrow('チーム名の検証に失敗しました: この項目は必須です');
      });
    });

    test('nullのチーム名は作成できない', () => {
      expect(() => TeamName.create(null as unknown as string)).toThrow(TeamNameRequiredError);
      expect(() => TeamName.create(null as unknown as string)).toThrow('チーム名の検証に失敗しました: この項目は必須です');
    });

    test('undefinedのチーム名は作成できない', () => {
      expect(() => TeamName.create(undefined as unknown as string)).toThrow(TeamNameRequiredError);
      expect(() => TeamName.create(undefined as unknown as string)).toThrow('チーム名の検証に失敗しました: この項目は必須です');
    });
  });
});