import { RegisterUserUseCase } from './RegisterUserUseCase';
import { IUserRepository } from '../../../domain/user/IUserRepository';
import { User } from '../../../domain/user/User';
import { EmailValidationError } from '../../../domain/shared/errors/EmailValidationError';
import { UserNameValidationError } from '../../../domain/user/errors/UserNameValidationError';

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

      await expect(registerUserUseCase.execute(validName, validEmail))
        .resolves
        .not.toThrow();

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
        .toThrow(EmailValidationError);
      await expect(registerUserUseCase.execute(validName, invalidEmail))
        .rejects
        .toThrow('メールアドレスの検証に失敗しました: 無効なメールアドレスです: invalid-email');

      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    test('空の名前の場合、ドメインのバリデーションエラーがスローされる', async () => {
      const emptyName = '';
      await expect(registerUserUseCase.execute(emptyName, validEmail))
        .rejects
        .toThrow(UserNameValidationError);
      await expect(registerUserUseCase.execute(emptyName, validEmail))
        .rejects
        .toThrow('名前の検証に失敗しました: 名前を入力してください');

      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });
});