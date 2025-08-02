import {
  createUser,
  rebuildUser,
  getUserId,
  getUserNameVO,
  getUserEmail,
  getUserStatus,
  equalsUser,
} from './User';
import { UserStatus } from './enums/UserStatus';
import { isOk, isErr } from '../shared/Result';

describe('User', () => {
  describe('createUser', () => {
    describe('正常系', () => {
      test('nameとemailが有効な場合、statusがUserStatus.EnrolledのUserが生成される', () => {
        const result = createUser('test user', 'test@example.com');

        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(getUserNameVO(result.value)).toBe('test user');
          expect(getUserEmail(result.value)).toBe('test@example.com');
          expect(getUserStatus(result.value)).toBe(UserStatus.Enrolled);
        }
      });
    });

    describe('異常系', () => {
      test('nameが空文字の場合、「ユーザー名の入力が必須です」のエラーが返される', () => {
        const result = createUser('', 'test@example.com');

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe('ユーザー名の入力が必須です');
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });

      test('nameが空白文字のみの場合、「ユーザー名の入力が必須です」のエラーが返される', () => {
        const result = createUser('   ', 'test@example.com');

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe('ユーザー名の入力が必須です');
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });

      test('emailが不正な場合、「無効なメールアドレスの形式です」のエラーが返される', () => {
        const result = createUser('test user', 'invalid-email');

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe('無効なメールアドレスの形式です: invalid-email');
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });

      test('nameとemailの両方が不正な場合、「ユーザー名の入力が必須です」のエラーが返される', () => {
        const result = createUser('', 'invalid-email');

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe('ユーザー名の入力が必須です');
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });
    });
  });

  describe('rebuildUser', () => {
    describe('正常系', () => {
      test('有効な値でUserを再構築できる', () => {
        const result = rebuildUser('test-id', 'test user', 'test@example.com', UserStatus.Enrolled);

        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(getUserId(result.value)).toBe('test-id');
          expect(getUserNameVO(result.value)).toBe('test user');
          expect(getUserEmail(result.value)).toBe('test@example.com');
          expect(getUserStatus(result.value)).toBe(UserStatus.Enrolled);
        }
      });
    });

    describe('異常系', () => {
      test('nameが空文字の場合、「ユーザー名の入力が必須です」のエラーが返される', () => {
        const result = rebuildUser('test-id', '', 'test@example.com', UserStatus.Enrolled);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe('ユーザー名の入力が必須です');
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });

      test('emailが不正な場合、「無効なメールアドレスの形式です」のエラーが返される', () => {
        const result = rebuildUser('test-id', 'test user', 'invalid-email', UserStatus.Enrolled);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe('無効なメールアドレスの形式です: invalid-email');
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });

      test('nameとemailの両方が不正な場合、「ユーザー名の入力が必須です」のエラーが返される', () => {
        const result = rebuildUser('test-id', '', 'invalid-email', UserStatus.Enrolled);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.message).toBe('ユーザー名の入力が必須です');
          expect(result.error.code).toBe('VALIDATION_ERROR');
        }
      });
    });
  });

  describe('equalsUser', () => {
    test('同じuserIdのUser同士を比較するとtrueを返す', () => {
      const result1 = createUser('user1', 'user1@example.com');
      const result2 = createUser('user2', 'user2@example.com');

      expect(isOk(result1)).toBe(true);
      expect(isOk(result2)).toBe(true);

      if (isOk(result1) && isOk(result2)) {
        // 同じuserIdを設定
        const user1 = { ...result1.value, userId: 'same-id' };
        const user2 = { ...result2.value, userId: 'same-id' };

        expect(equalsUser(user1, user2)).toBe(true);
      }
    });

    test('異なるuserIdのUser同士を比較するとfalseを返す', () => {
      const result1 = createUser('user1', 'user1@example.com');
      const result2 = createUser('user2', 'user2@example.com');

      expect(isOk(result1)).toBe(true);
      expect(isOk(result2)).toBe(true);

      if (isOk(result1) && isOk(result2)) {
        expect(equalsUser(result1.value, result2.value)).toBe(false);
      }
    });
  });
});