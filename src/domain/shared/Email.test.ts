import { createEmail, getEmailValue, equalsEmail } from './Email';
import { isOk, isErr } from './Result';

describe('Email', () => {
  describe('create', () => {
    test('有効なメールアドレスでEmailを作成できる', () => {
      const validEmail = 'test@example.com';
      const result = createEmail(validEmail);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(getEmailValue(result.value)).toBe(validEmail);
      }
    });

    describe('異常系 - 入力値の検証', () => {
      test('空文字列でEmailを作成しようとすると「メールアドレスの入力が必須です」のエラーになる', () => {
        const result = createEmail('');

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe('メールアドレスの入力が必須です');
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });

      test('nullでEmailを作成しようとすると「メールアドレスの入力が必須です」のエラーになる', () => {
        const result = createEmail(null as unknown as string);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe('メールアドレスの入力が必須です');
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });

      test('undefinedでEmailを作成しようとすると「メールアドレスの入力が必須です」のエラーになる', () => {
        const result = createEmail(undefined as unknown as string);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe('メールアドレスの入力が必須です');
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });
    });

    describe('異常系 - メールアドレスの構造', () => {
      test('@記号がないメールアドレスで「無効なメールアドレスの形式です」のエラーになる', () => {
        const invalidEmail = 'testexample.com';
        const result = createEmail(invalidEmail);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe(`無効なメールアドレスの形式です: ${invalidEmail}`);
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });

      test('@記号が複数あるメールアドレスで「無効なメールアドレスの形式です」のエラーになる', () => {
        const invalidEmail = 'test@example@com';
        const result = createEmail(invalidEmail);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe(`無効なメールアドレスの形式です: ${invalidEmail}`);
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });

      test('@記号で始まるメールアドレスで「無効なローカルパートです」のエラーになる', () => {
        const invalidEmail = '@example.com';
        const result = createEmail(invalidEmail);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe('無効なローカルパートです: ');
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });

      test('@記号で終わるメールアドレスで「無効なドメインです」のエラーになる', () => {
        const invalidEmail = 'test@';
        const result = createEmail(invalidEmail);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe('無効なドメインです: ');
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });
    });

    describe('異常系 - 長さ制限', () => {
      test('ローカル部が65文字以上のメールアドレスで「無効なメールアドレスの形式です」のエラーになる', () => {
        const longLocalPart = 'a'.repeat(65);
        const invalidEmail = `${longLocalPart}@example.com`;
        const result = createEmail(invalidEmail);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe(`無効なメールアドレスの形式です: ${invalidEmail}`);
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });

      test('ドメイン部が256文字以上のメールアドレスで「無効なメールアドレスの形式です」のエラーになる', () => {
        const longDomain = 'a'.repeat(256);
        const invalidEmail = `test@${longDomain}`;
        const result = createEmail(invalidEmail);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe(`無効なメールアドレスの形式です: ${invalidEmail}`);
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });

      test('全体が255文字以上のメールアドレスで「無効なメールアドレスの形式です」のエラーになる', () => {
        const longLocalPart = 'a'.repeat(64);
        const longDomain = 'a'.repeat(190);
        const invalidEmail = `${longLocalPart}@${longDomain}.com`;
        const result = createEmail(invalidEmail);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe(`無効なメールアドレスの形式です: ${invalidEmail}`);
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });
    });

    describe('異常系 - ローカルパートの検証', () => {
      test('連続するドットがあるローカルパートで「無効なローカルパートです」のエラーになる', () => {
        const invalidEmail = 'test..test@example.com';
        const result = createEmail(invalidEmail);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe('無効なローカルパートです: test..test');
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });

      test('ドットで始まるローカルパートで「無効なローカルパートです」のエラーになる', () => {
        const invalidEmail = '.test@example.com';
        const result = createEmail(invalidEmail);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe('無効なローカルパートです: .test');
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });

      test('ドットで終わるローカルパートで「無効なローカルパートです」のエラーになる', () => {
        const invalidEmail = 'test.@example.com';
        const result = createEmail(invalidEmail);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe('無効なローカルパートです: test.');
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });

      test('無効な文字を含むローカルパートで「無効なローカルパートです」のエラーになる', () => {
        const invalidEmail = 'test<test@example.com';
        const result = createEmail(invalidEmail);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe('無効なローカルパートです: test<test');
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });

      test('スペースを含むローカルパートで「無効なローカルパートです」のエラーになる', () => {
        const invalidEmail = 'test test@example.com';
        const result = createEmail(invalidEmail);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe('無効なローカルパートです: test test');
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });
    });

    describe('異常系 - ドメインの検証', () => {
      test('連続するドットがあるドメインで「無効なドメインです」のエラーになる', () => {
        const invalidEmail = 'test@example..com';
        const result = createEmail(invalidEmail);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe('無効なドメインです: example..com');
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });

      test('ドメインが1つのパートしかない場合で「無効なドメインです」のエラーになる', () => {
        const invalidEmail = 'test@example';
        const result = createEmail(invalidEmail);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe('無効なドメインです: example');
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });

      test('ドメインがハイフンで始まる場合で「無効なドメインです」のエラーになる', () => {
        const invalidEmail = 'test@-example.com';
        const result = createEmail(invalidEmail);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe('無効なドメインです: -example.com');
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });

      test('ドメインがハイフンで終わる場合で「無効なドメインです」のエラーになる', () => {
        const invalidEmail = 'test@example-.com';
        const result = createEmail(invalidEmail);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe('無効なドメインです: example-.com');
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });

      test('空のドメインパートがある場合で「無効なドメインです」のエラーになる', () => {
        const invalidEmail = 'test@example..com';
        const result = createEmail(invalidEmail);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe('無効なドメインです: example..com');
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });

      test('無効な文字を含むドメインで「無効なドメインです」のエラーになる', () => {
        const invalidEmail = 'test@example<.com';
        const result = createEmail(invalidEmail);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe('無効なドメインです: example<.com');
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });
    });
  });

  describe('equals', () => {
    test('同じ値のEmail同士を比較するとtrueを返す', () => {
      const result1 = createEmail('test@example.com');
      const result2 = createEmail('test@example.com');

      expect(isOk(result1)).toBe(true);
      expect(isOk(result2)).toBe(true);

      if (isOk(result1) && isOk(result2)) {
        expect(equalsEmail(result1.value, result2.value)).toBe(true);
      }
    });

    test('異なる値のEmail同士を比較するとfalseを返す', () => {
      const result1 = createEmail('test1@example.com');
      const result2 = createEmail('test2@example.com');

      expect(isOk(result1)).toBe(true);
      expect(isOk(result2)).toBe(true);

      if (isOk(result1) && isOk(result2)) {
        expect(equalsEmail(result1.value, result2.value)).toBe(false);
      }
    });
  });
});