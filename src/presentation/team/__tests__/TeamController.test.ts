import { TeamController } from '../TeamController';
import { CreateTeamUseCase } from '../../../application/team/CreateTeamUseCase';
import { CreatePairUseCase } from '../../../application/team/CreatePairUseCase';
import { Team } from '../../../domain/team/Team';
import { TeamName } from '../../../domain/team/TeamName';
import { Pair } from '../../../domain/team/Pair';
import { PairLabel } from '../../../domain/team/PairLabel';
import { User } from '../../../domain/user/User';
import { Email } from '../../../domain/shared/Email';

describe('TeamController', () => {
  let createTeamUseCase: CreateTeamUseCase;
  let createPairUseCase: CreatePairUseCase;
  let controller: TeamController;
  let member1: User;
  let member2: User;
  let member3: User;
  let team: Team;

  beforeEach(() => {
    member1 = new User(new Email('member1@example.com'));
    member2 = new User(new Email('member2@example.com'));
    member3 = new User(new Email('member3@example.com'));
    team = new Team(new TeamName('ABC'), [member1, member2, member3]);

    createTeamUseCase = {
      execute: jest.fn()
    } as unknown as CreateTeamUseCase;

    createPairUseCase = {
      execute: jest.fn()
    } as unknown as CreatePairUseCase;

    controller = new TeamController(createTeamUseCase, createPairUseCase);
  });

  describe('createTeam', () => {
    it('チームを作成できる', async () => {
      (createTeamUseCase.execute as jest.Mock).mockResolvedValue(team);

      const response = await controller.createTeam({
        name: 'ABC',
        memberIds: [member1.userId, member2.userId, member3.userId]
      });

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({
        name: 'ABC',
        members: [member1.userId, member2.userId, member3.userId]
      });
    });

    it('バリデーションエラーの場合400を返す', async () => {
      (createTeamUseCase.execute as jest.Mock).mockRejectedValue(new Error('Invalid team name'));

      const response = await controller.createTeam({
        name: '',
        memberIds: [member1.userId]
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid team name'
      });
    });
  });

  describe('createPair', () => {
    it('ペアを作成できる', async () => {
      const pair = new Pair(new PairLabel('A'), [member1, member2]);
      (createPairUseCase.execute as jest.Mock).mockResolvedValue(pair);

      const response = await controller.createPair({
        teamId: team.teamId,
        label: 'A',
        memberIds: [member1.userId, member2.userId]
      });

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({
        label: 'A',
        members: [member1.userId, member2.userId]
      });
    });

    it('バリデーションエラーの場合400を返す', async () => {
      (createPairUseCase.execute as jest.Mock).mockRejectedValue(new Error('Invalid pair label'));

      const response = await controller.createPair({
        teamId: 'non-existent-team',
        label: 'A',
        memberIds: [member1.userId]
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid pair label'
      });
    });
  });
}); 