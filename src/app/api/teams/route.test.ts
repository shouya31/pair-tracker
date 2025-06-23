import { NextRequest } from 'next/server';
import { POST } from './route';
import { createTeamUseCase } from '@/server/usecases';
import { DuplicateTeamNameError, UserNotFoundError } from '@/application/team/errors/TeamErrors';
import { TeamNameLengthError } from '@/domain/team/errors/TeamValidationError';

jest.mock('@/server/usecases', () => ({
  createTeamUseCase: {
    execute: jest.fn(),
  },
}));

describe('POST /api/teams', () => {
  const mockExecute = createTeamUseCase.execute as jest.Mock;

  beforeEach(() => {
    mockExecute.mockClear();
  });

  it('正常系：チームが作成できる', async () => {
    const requestBody = {
      name: 'A1',
      memberIds: ['user1', 'user2', 'user3'],
    };

    mockExecute.mockResolvedValueOnce(undefined);

    const request = new NextRequest('http://localhost:3000/api/teams', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(201);
    expect(responseBody).toEqual({ message: 'チームを作成しました' });
    expect(mockExecute).toHaveBeenCalledWith(requestBody);
  });

  it('バリデーションエラー：必須フィールドが欠けている', async () => {
    const requestBody = {
      name: '',
      memberIds: [],
    };

    const request = new NextRequest('http://localhost:3000/api/teams', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.message).toBe('バリデーションエラー');
    expect(responseBody.errors).toBeDefined();
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('エラー：チーム名が重複している', async () => {
    const requestBody = {
      name: 'A1',
      memberIds: ['user1', 'user2', 'user3'],
    };

    mockExecute.mockRejectedValueOnce(new DuplicateTeamNameError('A1'));

    const request = new NextRequest('http://localhost:3000/api/teams', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(409);
    expect(responseBody.message).toBe('チーム名「A1」は既に使用されています。');
  });

  it('エラー：チーム名が3文字を超える', async () => {
    const requestBody = {
      name: 'ABCD',
      memberIds: ['user1', 'user2', 'user3'],
    };

    mockExecute.mockRejectedValueOnce(new TeamNameLengthError('ABCD'));

    const request = new NextRequest('http://localhost:3000/api/teams', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.message).toBe('チーム名の検証に失敗しました: 3文字以下で入力してください（現在: 4文字）');
  });

  it('エラー：メンバー数が3名未満', async () => {
    const requestBody = {
      name: 'A1',
      memberIds: ['user1', 'user2'],
    };

    const request = new NextRequest('http://localhost:3000/api/teams', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.message).toBe('バリデーションエラー');
    expect(responseBody.errors).toBeDefined();
  });

  it('エラー：存在しないメンバーが指定された', async () => {
    const requestBody = {
      name: 'A1',
      memberIds: ['user1', 'user2', 'non-existent-user'],
    };

    mockExecute.mockRejectedValueOnce(new UserNotFoundError('non-existent-user'));

    const request = new NextRequest('http://localhost:3000/api/teams', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(404);
    expect(responseBody.message).toBe('ユーザーが見つかりません。ユーザーID: non-existent-user');
  });

  it('エラー：予期せぬエラーが発生', async () => {
    const requestBody = {
      name: 'A1',
      memberIds: ['user1', 'user2', 'user3'],
    };

    mockExecute.mockRejectedValueOnce(new Error('予期せぬエラー'));

    const request = new NextRequest('http://localhost:3000/api/teams', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.message).toBe('予期せぬエラーが発生しました');
  });
});