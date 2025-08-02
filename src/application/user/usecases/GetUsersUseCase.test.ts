import { createGetUsersUseCase } from './GetUsersUseCase';
import { IUserRepository } from '@/domain/user/IUserRepository';
import { User } from '@/domain/user/User';
import { UserStatus } from '@/domain/user/enums/UserStatus';
import { createUser, rebuildUser } from '@/domain/user/User';
import { isOk } from '@/domain/shared/Result';

describe('GetUsersUseCase', () => {
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      findAll: jest.fn(),
    } as jest.Mocked<IUserRepository>;
  });

  describe('正常系', () => {
    test('ユーザー一覧が正常に取得される', async () => {
      // テスト用のユーザーを作成
      const user1Result = createUser('テストユーザー1', 'test1@example.com');
      const user2Result = createUser('テストユーザー2', 'test2@example.com');

      if (isOk(user1Result) && isOk(user2Result)) {
        const mockUsers: User[] = [user1Result.value, user2Result.value];
        mockUserRepository.findAll.mockResolvedValue(mockUsers);

        const getUsersUseCase = createGetUsersUseCase(mockUserRepository);
        const result = await getUsersUseCase();

        expect(result).toEqual([
          {
            id: user1Result.value.userId,
            name: 'テストユーザー1',
            email: 'test1@example.com',
            status: UserStatus.Enrolled
          },
          {
            id: user2Result.value.userId,
            name: 'テストユーザー2',
            email: 'test2@example.com',
            status: UserStatus.Enrolled
          }
        ]);

        expect(mockUserRepository.findAll).toHaveBeenCalledWith();
      }
    });

    test('ユーザーが存在しない場合、空配列が返される', async () => {
      mockUserRepository.findAll.mockResolvedValue([]);

      const getUsersUseCase = createGetUsersUseCase(mockUserRepository);
      const result = await getUsersUseCase();

      expect(result).toEqual([]);
      expect(mockUserRepository.findAll).toHaveBeenCalledWith();
    });

    test('異なるステータスのユーザーが含まれる場合も正常に取得される', async () => {
      // 異なるステータスのユーザーを作成
      const user1Result = rebuildUser('user-1', 'テストユーザー1', 'test1@example.com', UserStatus.Enrolled);
      const user2Result = rebuildUser('user-2', 'テストユーザー2', 'test2@example.com', UserStatus.Withdrawn);
      const user3Result = rebuildUser('user-3', 'テストユーザー3', 'test3@example.com', UserStatus.Suspended);

      if (isOk(user1Result) && isOk(user2Result) && isOk(user3Result)) {
        const mockUsers: User[] = [user1Result.value, user2Result.value, user3Result.value];
        mockUserRepository.findAll.mockResolvedValue(mockUsers);

        const getUsersUseCase = createGetUsersUseCase(mockUserRepository);
        const result = await getUsersUseCase();

        expect(result).toEqual([
          {
            id: 'user-1',
            name: 'テストユーザー1',
            email: 'test1@example.com',
            status: UserStatus.Enrolled
          },
          {
            id: 'user-2',
            name: 'テストユーザー2',
            email: 'test2@example.com',
            status: UserStatus.Withdrawn
          },
          {
            id: 'user-3',
            name: 'テストユーザー3',
            email: 'test3@example.com',
            status: UserStatus.Suspended
          }
        ]);

        expect(mockUserRepository.findAll).toHaveBeenCalledWith();
      }
    });
  });

  describe('異常系', () => {
    test('リポジトリでエラーが発生した場合、エラーが伝播される', async () => {
      const repositoryError = new Error('データベース接続エラー');
      mockUserRepository.findAll.mockRejectedValue(repositoryError);

      const getUsersUseCase = createGetUsersUseCase(mockUserRepository);

      await expect(getUsersUseCase()).rejects.toThrow('データベース接続エラー');
      expect(mockUserRepository.findAll).toHaveBeenCalledWith();
    });

    test('リポジトリがnullを返した場合、エラーが発生する', async () => {
      mockUserRepository.findAll.mockResolvedValue(null as any);

      const getUsersUseCase = createGetUsersUseCase(mockUserRepository);

      await expect(getUsersUseCase()).rejects.toThrow();
      expect(mockUserRepository.findAll).toHaveBeenCalledWith();
    });
  });
});