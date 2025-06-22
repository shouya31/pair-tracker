import { RegisterUserUseCase } from './RegisterUserUseCase';
import { IUserRepository } from '../../../domain/user/IUserRepository';
import { User } from '../../../domain/user/User';
import { EmailValidationError } from '../../../domain/shared/errors/EmailValidationError';
import { UserNameValidationError } from '../../../domain/user/errors/UserNameValidationError';
import { UserDTO } from '../dto/UserDTO';

describe('RegisterUserUseCase', () => {
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let registerUserUseCase: RegisterUserUseCase;
  const validName = 'テストユーザー';
  const validEmail = 'test@example.com';

  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };
    registerUserUseCase = new RegisterUserUseCase(mockUserRepository);
  });

  describe('execute', () => {
    test('正常系：ユーザーが正しく登録される', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue();

      const result = await registerUserUseCase.execute(validName, validEmail);

      expect(result).toBeInstanceOf(UserDTO);
      expect(result.name).toBe(validName);
      expect(result.email).toBe(validEmail);

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.any(User)
      );

      const savedUser = mockUserRepository.save.mock.calls[0][0] as User;
      expect(savedUser.getName()).toBe(validName);
      expect(savedUser.getEmail()).toBe(validEmail);
    });

    test('重複するメールアドレスが存在する場合、エラーがスローされる', async () => {
      const existingUser = User.create('既存ユーザー', validEmail);
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(registerUserUseCase.execute(validName, validEmail))
        .rejects
        .toThrow('このメールアドレスは既に登録されています');

      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    test('無効なメールアドレスの場合、ドメインのバリデーションエラーがスローされる', async () => {
      const invalidEmail = 'invalid-email';
      await expect(registerUserUseCase.execute(validName, invalidEmail))
        .rejects
        .toThrowError(EmailValidationError.invalid(invalidEmail));

      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    test('空の名前の場合、ドメインのバリデーションエラーがスローされる', async () => {
      const emptyName = '';
      await expect(registerUserUseCase.execute(emptyName, validEmail))
        .rejects
        .toThrowError(new UserNameValidationError('名前を入力してください', '名前', undefined));
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });
});