import { CreateTeamUseCase } from '../CreateTeamUseCase';
import { ITeamRepository } from '../../../../domain/team/ITeamRepository';
import { IUserRepository } from '../../../../domain/user/IUserRepository';
import { Team } from '../../../../domain/team/Team';
import { TeamName } from '../../../../domain/team/vo/TeamName';
import { User } from '../../../../domain/user/User';
import { UserStatus } from '../../../../domain/user/enums/UserStatus';
import { DuplicateTeamNameError } from '../../../../domain/team/errors/DuplicateTeamNameError';

describe('CreateTeamUseCase', () => {
  let teamRepository: jest.Mocked<ITeamRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let useCase: CreateTeamUseCase;

  beforeEach(() => {
    // リポジトリのモックを作成
    teamRepository = {
      findByName: jest.fn(),
      save: jest.fn(),
    } as jest.Mocked<ITeamRepository>;

    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
    } as jest.Mocked<IUserRepository>;

    useCase = new CreateTeamUseCase(teamRepository, userRepository);
  });

  describe('execute', () => {
    const validInput = {
      name: 'ABC',
      memberIds: ['user1', 'user2', 'user3'],
    };

    const mockUsers = [
      User.rebuild('user1', 'User 1', 'user1@example.com', UserStatus.Enrolled),
      User.rebuild('user2', 'User 2', 'user2@example.com', UserStatus.Enrolled),
      User.rebuild('user3', 'User 3', 'user3@example.com', UserStatus.Enrolled),
    ];

    test('正常系: チームが正常に作成される', async () => {
      teamRepository.findByName.mockResolvedValue(null);
      mockUsers.forEach(user => {
        userRepository.findById.mockResolvedValueOnce(user);
      });
      teamRepository.save.mockResolvedValue();

      await useCase.execute(validInput);
      expect(teamRepository.findByName).toHaveBeenCalledWith(
        expect.any(TeamName)
      );
      expect(userRepository.findById).toHaveBeenCalledTimes(3);
      validInput.memberIds.forEach(id => {
        expect(userRepository.findById).toHaveBeenCalledWith(id);
      });
      expect(teamRepository.save).toHaveBeenCalledWith(
        expect.any(Team)
      );
    });

    test('異常系: チーム名が重複している場合はエラーをスローする', async () => {
      const existingTeam = Team.create(
        new TeamName(validInput.name),
        mockUsers
      );
      teamRepository.findByName.mockResolvedValue(existingTeam);

      await expect(useCase.execute(validInput))
        .rejects
        .toThrow(DuplicateTeamNameError);

      expect(userRepository.findById).not.toHaveBeenCalled();
      expect(teamRepository.save).not.toHaveBeenCalled();
    });

    test('異常系: 存在しないユーザーIDが含まれている場合はエラーをスローする', async () => {
      teamRepository.findByName.mockResolvedValue(null);
      userRepository.findById.mockResolvedValueOnce(mockUsers[0]);
      userRepository.findById.mockResolvedValueOnce(null); // 2番目のユーザーが存在しない

      await expect(useCase.execute(validInput))
        .rejects
        .toThrow('ユーザーID "user2" が見つかりません');

      expect(teamRepository.save).not.toHaveBeenCalled();
    });

    test('異常系: 無効なチーム名の場合はエラーをスローする', async () => {
      await expect(useCase.execute({
        ...validInput,
        name: 'ABCD', // 4文字のチーム名（無効）
      }))
        .rejects
        .toThrow('チーム名は3文字以下である必要があります');

      expect(teamRepository.findByName).not.toHaveBeenCalled();
      expect(userRepository.findById).not.toHaveBeenCalled();
      expect(teamRepository.save).not.toHaveBeenCalled();
    });
  });
});