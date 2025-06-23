import { RegisterUserUseCase } from './RegisterUserUseCase';
import { IUserRepository } from '../../../domain/user/IUserRepository';
import { User } from '../../../domain/user/User';
import { UserValidationError } from '../../../domain/user/errors/UserValidationError';
import { UserDomainError } from '../../../domain/user/errors/UserDomainError';
import { UserDTO } from '../dto/UserDTO';

describe('RegisterUserUseCase', () => {
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findByEmail: jest.fn().mockResolvedValue(null),
      findById: jest.fn().mockResolvedValue(null),
      findByIds: jest.fn().mockResolvedValue([]),
      findAll: jest.fn().mockResolvedValue([]),
    } as jest.Mocked<IUserRepository>;
    useCase = new RegisterUserUseCase(mockUserRepository);
  });

  test('有効な値でユーザーを登録できる', async () => {
    const name = 'test user';
    const email = 'test@example.com';
    mockUserRepository.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute(name, email);

    expect(result).toBeInstanceOf(UserDTO);
    expect(result.name).toBe(name);
    expect(result.email).toBe(email);
    expect(mockUserRepository.save).toHaveBeenCalled();
  });

  test('名前が空文字の場合はエラーになる', async () => {
    const name = '';
    const email = 'test@example.com';

    await expect(useCase.execute(name, email)).rejects.toThrow(UserValidationError);
    await expect(useCase.execute(name, email)).rejects.toThrow('名前の検証に失敗しました: この項目は必須です');
  });

  test('名前が空白文字のみの場合はエラーになる', async () => {
    const name = '   ';
    const email = 'test@example.com';

    await expect(useCase.execute(name, email)).rejects.toThrow(UserValidationError);
    await expect(useCase.execute(name, email)).rejects.toThrow('名前の検証に失敗しました: この項目は必須です');
  });

  test('メールアドレスが無効な場合はエラーになる', async () => {
    const name = 'test user';
    const email = 'invalid-email';

    await expect(useCase.execute(name, email)).rejects.toThrow(UserValidationError);
    await expect(useCase.execute(name, email)).rejects.toThrow('メールアドレスの検証に失敗しました: 無効なメールアドレスです: invalid-email');
  });

  test('既に登録済みのメールアドレスの場合はエラーになる', async () => {
    const name = 'test user';
    const email = 'test@example.com';
    const existingUser = User.create('existing user', email);
    mockUserRepository.findByEmail.mockImplementation(async () => existingUser);

    await expect(useCase.execute(name, email)).rejects.toThrow(UserDomainError);
    await expect(useCase.execute(name, email)).rejects.toThrow(`このメールアドレスは既に使用されています: ${email}`);
  });
});