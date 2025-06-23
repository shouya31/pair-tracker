import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import { createTeamUseCase, getTeamsUseCase } from '@/server/usecases';
import { TeamDomainError } from '@/domain/team/errors/TeamDomainError';
import { TeamValidationError } from '@/domain/team/errors/TeamValidationError';

jest.mock('@/server/usecases', () => ({
  getTeamsUseCase: {
    execute: jest.fn()
  },
  createTeamUseCase: {
    execute: jest.fn()
  }
}));

describe('GET /api/teams', () => {
  const mockExecute = getTeamsUseCase.execute as jest.Mock;

  beforeEach(() => {
    mockExecute.mockClear();
  });

  it('チーム一覧を取得できる', async () => {
    const mockTeams = [{ id: '1', name: 'A1' }];
    mockExecute.mockResolvedValueOnce(mockTeams);

    const response = await GET();
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody.teams).toEqual(mockTeams);
    expect(mockExecute).toHaveBeenCalled();
  });
});

describe('POST /api/teams', () => {
  const mockExecute = createTeamUseCase.execute as jest.Mock;

  beforeEach(() => {
    mockExecute.mockReset();
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockExecute.mockReset();
    jest.clearAllMocks();
  });

  it('チームを作成できる', async () => {
    const requestBody = {
      name: 'A1',
      memberIds: ['1', '2', '3']
    };
    const request = new NextRequest('http://localhost:3000/api/teams', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    mockExecute.mockResolvedValueOnce(undefined);

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(201);
    expect(responseBody.message).toBe('チームを作成しました');
    expect(mockExecute).toHaveBeenCalledWith(requestBody);
  });

  it('バリデーションエラー：必須フィールドが欠けている', async () => {
    const request = new NextRequest('http://localhost:3000/api/teams', {
      method: 'POST',
      body: JSON.stringify({})
    });

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.error).toBeDefined();
    expect(responseBody.field).toBeDefined();
    expect(responseBody.value).toBeDefined();
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('エラー：チーム名が重複している', async () => {
    const requestBody = {
      name: 'A1',
      memberIds: ['1', '2', '3']
    };
    const request = new NextRequest('http://localhost:3000/api/teams', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    mockExecute.mockRejectedValueOnce(TeamDomainError.duplicateTeamNameError('A1'));

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(409);
    expect(responseBody.error).toBe('このチーム名は既に使用されています: A1');
  });

  it('エラー：チーム名が3文字を超える', async () => {
    const requestBody = {
      name: 'A123',
      memberIds: ['1', '2', '3']
    };
    const request = new NextRequest('http://localhost:3000/api/teams', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    mockExecute.mockRejectedValueOnce(
      new TeamValidationError('チーム名は3文字以下で入力してください', 'TEAM_NAME_TOO_LONG')
    );

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.error).toBe('チーム名は3文字以下で入力してください');
  });

  it('エラー：メンバー数が3名未満', async () => {
    const requestBody = {
      name: 'A1',
      memberIds: ['1', '2']
    };
    const request = new NextRequest('http://localhost:3000/api/teams', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.error).toBeDefined();
    expect(responseBody.field).toBeDefined();
    expect(responseBody.value).toBeDefined();
  });

  it('エラー：存在しないメンバーが指定された', async () => {
    const requestBody = {
      name: 'A1',
      memberIds: ['1', '2', 'non-existent-user']
    };
    const request = new NextRequest('http://localhost:3000/api/teams', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    const error = TeamDomainError.nonTeamMemberError(['non-existent-user']);
    mockExecute.mockRejectedValueOnce(error);

    const response = await POST(request);
    await expect(response.status).toBe(404);
    const responseBody = await response.json();
    await expect(responseBody.error).toBe('以下のメンバーはチームに所属していません: non-existent-user');
  });

  it('エラー：予期せぬエラーが発生', async () => {
    const requestBody = {
      name: 'A1',
      memberIds: ['1', '2', '3']
    };
    const request = new NextRequest('http://localhost:3000/api/teams', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    const error = new Error('予期せぬエラーが発生しました');
    mockExecute.mockRejectedValueOnce(error);

    const response = await POST(request);
    await expect(response.status).toBe(500);
    const responseBody = await response.json();
    await expect(responseBody.error).toBe('予期せぬエラーが発生しました');
  });
});