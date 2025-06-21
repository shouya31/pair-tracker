import { StringLengthError } from './ValidationError';

describe('ValidationError', () => {
  describe('StringLengthError', () => {
    test('最小値と最大値の両方が指定されている場合のメッセージ', () => {
      const error = new StringLengthError('テスト', 'test', 1, 10);
      expect(error.message).toBe('テストの検証に失敗しました: 1文字以上10文字以下で入力してください（現在: 4文字）');
    });

    test('最小値のみが指定されている場合のメッセージ', () => {
      const error = new StringLengthError('テスト', 'test', 5);
      expect(error.message).toBe('テストの検証に失敗しました: 5文字以上で入力してください（現在: 4文字）');
    });

    test('最大値のみが指定されている場合のメッセージ', () => {
      const error = new StringLengthError('テスト', 'test', undefined, 3);
      expect(error.message).toBe('テストの検証に失敗しました: 3文字以下で入力してください（現在: 4文字）');
    });

    test('最小値も最大値も指定されていない場合のメッセージ', () => {
      const error = new StringLengthError('テスト', 'test');
      expect(error.message).toBe('テストの検証に失敗しました: 文字数が不正です');
    });
  });
}); 