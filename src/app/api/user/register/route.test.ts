import { NextRequest } from 'next/server';
import { POST } from './route';
import { registerUserUseCase } from '@/server/usecases';
import { userAlreadyExists } from '@/domain/user/errors/UserDomainError';
import { Result, ok, err } from '@/domain/shared/Result';
import { User } from '@/domain/user/User';
import { DomainError } from '@/domain/shared/DomainError';
import { createUser, getUserNameVO, getUserEmail } from '@/domain/user/User';

jest.mock('@/server/usecases', () => ({
  registerUserUseCase: jest.fn()
}));

describe('ユーザー登録API', () => {
  const mockRegisterUserUseCase = registerUserUseCase as jest.MockedFunction<typeof registerUserUseCase>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('正常系', () => {
    test('有効な入力でユーザーが正常に登録される', async () => {
      const requestBody = {
        name: 'テストユーザー',
        email: 'test@example.com'
      };

      // 成功時のユーザーを作成
      const userResult = createUser(requestBody.name, requestBody.email);
      if (userResult._tag === 'Ok') {
        mockRegisterUserUseCase.mockResolvedValue(ok(userResult.value));
      }

      const request = new NextRequest('http://localhost:3000/api/user/register', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        message: 'ユーザーが正常に登録されました',
        user: {
          name: requestBody.name,
          email: requestBody.email
        }
      });

      expect(mockRegisterUserUseCase).toHaveBeenCalledWith(
        requestBody.name,
        requestBody.email
      );
    });
  });

  describe('異常系', () => {
    test('名前が空の場合、400エラーが返される', async () => {
      const requestBody = {
        name: '',
        email: 'test@example.com'
      };

      const request = new NextRequest('http://localhost:3000/api/user/register', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        error: '名前は必須です',
        field: 'name',
        value: 'name'
      });
    });

    test('メールアドレスが空の場合、400エラーが返される', async () => {
      const requestBody = {
        name: 'テストユーザー',
        email: ''
      };

      const request = new NextRequest('http://localhost:3000/api/user/register', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        error: 'メールアドレスは必須です',
        field: 'email',
        value: 'email'
      });
    });

    test('メールアドレスの形式が無効な場合、400エラーが返される', async () => {
      const requestBody = {
        name: 'テストユーザー',
        email: 'invalid-email'
      };

      const request = new NextRequest('http://localhost:3000/api/user/register', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        error: 'メールアドレスの形式が正しくありません',
        field: 'email',
        value: 'email'
      });
    });

    test('メールアドレスが既に存在する場合、409エラーが返される', async () => {
      const requestBody = {
        name: 'テストユーザー',
        email: 'existing@example.com'
      };

      mockRegisterUserUseCase.mockResolvedValue(err(userAlreadyExists(requestBody.email)));

      const request = new NextRequest('http://localhost:3000/api/user/register', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      expect(response.status).toBe(409);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        error: 'このメールアドレスは既に使用されています: existing@example.com'
      });
    });

    test('ユーザー名が空の場合、400エラーが返される', async () => {
      const requestBody = {
        name: 'テストユーザー',
        email: 'test@example.com'
      };

      const validationError: DomainError = {
        message: 'ユーザー名の入力が必須です',
        code: 'VALIDATION_ERROR'
      };
      mockRegisterUserUseCase.mockResolvedValue(err(validationError));

      const request = new NextRequest('http://localhost:3000/api/user/register', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        error: 'ユーザー名の入力が必須です'
      });
    });

    test('システムエラーの場合、500エラーが返される', async () => {
      const requestBody = {
        name: 'テストユーザー',
        email: 'test@example.com'
      };

      const systemError: DomainError = {
        message: 'データベースエラー',
        code: 'SYSTEM_ERROR'
      };
      mockRegisterUserUseCase.mockResolvedValue(err(systemError));

      const request = new NextRequest('http://localhost:3000/api/user/register', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      expect(response.status).toBe(500);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        error: 'データベースエラー'
      });
    });

    test('予期せぬエラーが発生した場合、500エラーが返される', async () => {
      const requestBody = {
        name: 'テストユーザー',
        email: 'test@example.com'
      };

      mockRegisterUserUseCase.mockRejectedValue(new Error('データベース接続エラー'));

      const request = new NextRequest('http://localhost:3000/api/user/register', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      expect(response.status).toBe(500);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        error: 'ユーザー登録中にエラーが発生しました: Error: データベース接続エラー'
      });
    });
  });
});