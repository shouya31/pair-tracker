import { NextRequest } from 'next/server';
import { POST } from './route';
import { RegisterUserUseCase } from '@/application/user/usecases/RegisterUserUseCase';
import { UserDTO } from '@/application/user/dto/UserDTO';
import { UserAlreadyExistsError } from '@/domain/user/errors/UserValidationError';

jest.mock('@/application/user/usecases/RegisterUserUseCase');

describe('ユーザー登録API', () => {
  const mockUser = new UserDTO('テストユーザー', 'test@example.com');
  const mockExecute = jest.fn().mockResolvedValue(mockUser);

  beforeEach(() => {
    jest.clearAllMocks();

    (RegisterUserUseCase as jest.MockedClass<typeof RegisterUserUseCase>).mockImplementation(() => ({
      execute: mockExecute
    } as unknown as RegisterUserUseCase));
  });

  describe('正常系', () => {
    test('有効な入力でユーザーが正常に登録される', async () => {
      const requestBody = {
        name: 'テストユーザー',
        email: 'test@example.com'
      };

      const request = new NextRequest('http://localhost:3000/api/user/register', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        message: 'ユーザーが正常に登録されました',
        user: mockUser
      });

      expect(mockExecute).toHaveBeenCalledWith(
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

    test('メールアドレスが既に存在する場合、409エラーが返される', async () => {
      const requestBody = {
        name: 'テストユーザー',
        email: 'existing@example.com'
      };

      mockExecute.mockRejectedValueOnce(new UserAlreadyExistsError(requestBody.email));

      const request = new NextRequest('http://localhost:3000/api/user/register', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      expect(response.status).toBe(409);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        error: 'このメールアドレスは既に登録されています: existing@example.com'
      });
    });

    test('予期せぬエラーが発生した場合、500エラーが返される', async () => {
      const requestBody = {
        name: 'テストユーザー',
        email: 'test@example.com'
      };

      mockExecute.mockRejectedValueOnce(new Error('データベース接続エラー'));

      const request = new NextRequest('http://localhost:3000/api/user/register', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      expect(response.status).toBe(500);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        error: 'システムエラーが発生しました: 予期せぬエラーが発生しました'
      });
    });
  });
}); 