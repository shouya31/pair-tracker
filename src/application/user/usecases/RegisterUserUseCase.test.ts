import { RegisterUserUseCase } from './RegisterUserUseCase';
import { IUserRepository } from '../../../domain/user/IUserRepository';
import { createUser, getUserNameVO, getUserEmail } from '../../../domain/user/User';
import { isOk, isErr } from '../../../domain/shared/Result';

describe('RegisterUserUseCase', () => {
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn().mockResolvedValue({ _tag: 'Ok', value: undefined }),
      findByEmail: jest.fn().mockResolvedValue(null),
      findById: jest.fn().mockResolvedValue(null),
      findByIds: jest.fn().mockResolvedValue([]),
      findAll: jest.fn().mockResolvedValue([]),
    } as jest.Mocked<IUserRepository>;
  });

  test('有効な値でユーザーを登録できる', async () => {
    const name = 'test user';
    const email = 'test@example.com';
    mockUserRepository.findByEmail.mockResolvedValue(null);

    const result = await RegisterUserUseCase(name, email, mockUserRepository);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(getUserNameVO(result.value)).toBe(name);
      expect(getUserEmail(result.value)).toBe(email);
      expect(mockUserRepository.save).toHaveBeenCalled();
    }
  });

  test('名前が空文字の場合は「ユーザー名の入力が必須です」のエラーが返される', async () => {
    const name = '';
    const email = 'test@example.com';

    const result = await RegisterUserUseCase(name, email, mockUserRepository);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.message).toBe('ユーザー名の入力が必須です');
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
  });

  test('名前が空白文字のみの場合は「ユーザー名の入力が必須です」のエラーが返される', async () => {
    const name = '   ';
    const email = 'test@example.com';

    const result = await RegisterUserUseCase(name, email, mockUserRepository);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.message).toBe('ユーザー名の入力が必須です');
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
  });

  test('メールアドレスが無効な場合は「無効なメールアドレスの形式です」のエラーが返される', async () => {
    const name = 'test user';
    const email = 'invalid-email';

    const result = await RegisterUserUseCase(name, email, mockUserRepository);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.message).toBe('無効なメールアドレスの形式です: invalid-email');
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
  });

  test('メールアドレスが空欄の場合は「メールアドレスの入力が必須です」のエラーが返される', async () => {
    const name = 'test user';
    const email = '';

    const result = await RegisterUserUseCase(name, email, mockUserRepository);
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.message).toBe('メールアドレスの入力が必須です');
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
  });

  test('既に登録済みのメールアドレスの場合は「メールアドレスは既に使用されています」のエラーが返される', async () => {
    const name = 'test user';
    const email = 'test@example.com';

    // 既存ユーザーを作成
    const existingUserResult = createUser('existing user', email);
    if (isOk(existingUserResult)) {
      mockUserRepository.findByEmail.mockResolvedValue(existingUserResult.value);
    }

    const result = await RegisterUserUseCase(name, email, mockUserRepository);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.message).toBe('メールアドレス test@example.com は既に使用されています');
      expect(result.error.code).toBe('ALREADY_EXISTS');
    }
  });

  test('リポジトリの保存に失敗した場合はエラーになる', async () => {
    const name = 'test user';
    const email = 'test@example.com';
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.save.mockResolvedValue({
      _tag: 'Err',
      error: { message: 'データベースエラー', code: 'SYSTEM_ERROR' }
    });

    const result = await RegisterUserUseCase(name, email, mockUserRepository);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.message).toBe('データベースエラー');
      expect(result.error.code).toBe('SYSTEM_ERROR');
    }
  });
});