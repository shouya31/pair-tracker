import { GET } from './route';
import { getUsersUseCase } from '@/server/usecases';
import { UserGetDTO } from '@/application/user/dto/UserDTO';

jest.mock('@/server/usecases', () => ({
  getUsersUseCase: jest.fn()
}));

describe('ユーザー一覧取得API', () => {
  const mockGetUsersUseCase = getUsersUseCase as jest.MockedFunction<typeof getUsersUseCase>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('正常系', () => {
    test('ユーザー一覧が正常に取得される', async () => {
      const mockUsers: UserGetDTO[] = [
        {
          id: 'user-1',
          name: 'テストユーザー1',
          email: 'test1@example.com',
          status: 'Enrolled'
        },
        {
          id: 'user-2',
          name: 'テストユーザー2',
          email: 'test2@example.com',
          status: 'Enrolled'
        }
      ];

      mockGetUsersUseCase.mockResolvedValue(mockUsers);

      const response = await GET();

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        users: mockUsers
      });

      expect(mockGetUsersUseCase).toHaveBeenCalledWith();
    });

    test('ユーザーが存在しない場合、空配列が返される', async () => {
      mockGetUsersUseCase.mockResolvedValue([]);

      const response = await GET();

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        users: []
      });

      expect(mockGetUsersUseCase).toHaveBeenCalledWith();
    });
  });

  describe('異常系', () => {
    test('データベースエラーが発生した場合、500エラーが返される', async () => {
      mockGetUsersUseCase.mockRejectedValue(new Error('データベース接続エラー'));

      const response = await GET();

      expect(response.status).toBe(500);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        error: 'ユーザー一覧取得中にエラーが発生しました: Error: データベース接続エラー'
      });
    });

    test('予期せぬエラーが発生した場合、500エラーが返される', async () => {
      mockGetUsersUseCase.mockRejectedValue(new Error('予期せぬエラー'));

      const response = await GET();

      expect(response.status).toBe(500);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        error: 'ユーザー一覧取得中にエラーが発生しました: Error: 予期せぬエラー'
      });
    });
  });
});