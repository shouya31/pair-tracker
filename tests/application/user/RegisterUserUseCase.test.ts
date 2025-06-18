import { IUserRepository } from '../../../src/domain/user/IUserRepository';
import { User } from '../../../src/domain/user/User';
import { RegisterUserUseCase } from '../../../src/application/user/usecases/RegisterUserUseCase';
import { Email } from '../../../src/domain/shared/Email';

describe('RegisterUserUseCase', () => {
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let registerUserUseCase: RegisterUserUseCase;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };

    registerUserUseCase = new RegisterUserUseCase(mockUserRepository);
  });

  describe('execute', () => {
    const validName = 'テストユーザー';
    const validEmail = 'test@example.com';

    test('重複するメールアドレスが存在しない場合、ユーザーが正常に登録される', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue();

      await registerUserUseCase.execute(validName, validEmail);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        expect.any(Email)
      );
      expect(mockUserRepository.findByEmail.mock.calls[0][0].getValue()).toBe(validEmail);
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
        .toThrow('無効なメールアドレスです');

      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    test('空の名前の場合、ドメインのバリデーションエラーがスローされる', async () => {
      const emptyName = '';
      await expect(registerUserUseCase.execute(emptyName, validEmail))
        .rejects
        .toThrow('名前を入力してください');

      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });
});