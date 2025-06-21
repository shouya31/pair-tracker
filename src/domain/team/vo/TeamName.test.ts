import { TeamName } from './TeamName';
import { TeamNameLengthError, TeamNameRequiredError } from '../errors/TeamValidationError';

describe('TeamName', () => {
  describe('正常系', () => {
    test('3文字以下のチーム名を作成できる', () => {
      const cases = ['A', 'AB', 'ABC'];
      cases.forEach(value => {
        expect(() => new TeamName(value)).not.toThrow();
        expect(new TeamName(value).getValue()).toBe(value);
      });
    });

    test('前後の空白は自動的に削除される', () => {
      const cases = [
        { input: ' ABC ', expected: 'ABC' },
        { input: '  A  ', expected: 'A' },
        { input: '\tAB\n', expected: 'AB' },
      ];

      cases.forEach(({ input, expected }) => {
        expect(new TeamName(input).getValue()).toBe(expected);
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

    test('空白を含む値でも、トリム後の値で等価性が判定される', () => {
      const name1 = new TeamName('ABC');
      const name2 = new TeamName(' ABC ');
      expect(name1.equals(name2)).toBe(true);
    });
  });

  describe('異常系', () => {
    test('4文字以上のチーム名は作成できない', () => {
      expect(() => new TeamName('ABCD')).toThrow(TeamNameLengthError);
      expect(() => new TeamName('ABCD')).toThrow('チーム名の検証に失敗しました: 3文字以下で入力してください（現在: 4文字）');
    });

    test('空文字のチーム名は作成できない', () => {
      expect(() => new TeamName('')).toThrow(TeamNameRequiredError);
      expect(() => new TeamName('')).toThrow('チーム名の検証に失敗しました: この項目は必須です');
    });

    test('空白のみのチーム名は作成できない', () => {
      const whitespaceOnlyCases = [' ', '   ', '\t', '\n', ' \n \t '];
      whitespaceOnlyCases.forEach(value => {
        expect(() => new TeamName(value)).toThrow(TeamNameRequiredError);
        expect(() => new TeamName(value)).toThrow('チーム名の検証に失敗しました: この項目は必須です');
      });
    });

    test('nullのチーム名は作成できない', () => {
      expect(() => new TeamName(null as unknown as string)).toThrow(TeamNameRequiredError);
      expect(() => new TeamName(null as unknown as string)).toThrow('チーム名の検証に失敗しました: この項目は必須です');
    });

    test('undefinedのチーム名は作成できない', () => {
      expect(() => new TeamName(undefined as unknown as string)).toThrow(TeamNameRequiredError);
      expect(() => new TeamName(undefined as unknown as string)).toThrow('チーム名の検証に失敗しました: この項目は必須です');
    });
  });
});