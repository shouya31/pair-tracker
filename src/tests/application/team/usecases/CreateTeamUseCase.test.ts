import { CreateTeamUseCase } from '../../../../application/team/usecases/CreateTeamUseCase';
import { CreateTeamCommand } from '../../../../application/team/commands/CreateTeamCommand';
import { MockTeamRepository } from '../../../mocks/MockTeamRepository';
import { MockUserRepository } from '../../../mocks/MockUserRepository';
import { User } from '../../../../domain/user/User';
import { Email } from '../../../../domain/shared/Email';
import { TeamName } from '../../../../domain/team/vo/TeamName';
import { UserStatus } from '../../../../domain/user/enums/UserStatus';

describe('CreateTeamUseCase', () => {
  let teamRepository: MockTeamRepository;
  let userRepository: MockUserRepository;
  let useCase: CreateTeamUseCase;

  beforeEach(() => {
    teamRepository = new MockTeamRepository();
    userRepository = new MockUserRepository();
    useCase = new CreateTeamUseCase(teamRepository, userRepository);
  });

  const setupUsers = async () => {
    const users = [
      User.create('user-1', Email.create('user1@example.com')),
      User.create('user-2', Email.create('user2@example.com')),
      User.create('user-3', Email.create('user3@example.com')),
    ];
    await Promise.all(users.map(user => userRepository.save(user)));
    return users.map(user => user.getId());
  };

  it('should create a team with valid members', async () => {
    const memberIds = await setupUsers();
    const command = new CreateTeamCommand('T1', memberIds);
    const result = await useCase.execute(command);

    expect(result.name).toBe('T1');
    expect(result.members).toHaveLength(3);

    const savedTeam = await teamRepository.findByName(TeamName.create('T1'));
    expect(savedTeam).not.toBeNull();
    expect(savedTeam?.getMembers()).toHaveLength(3);
  });

  it('should not create a team with duplicate name', async () => {
    const memberIds = await setupUsers();
    const command = new CreateTeamCommand('T1', memberIds);
    await useCase.execute(command);

    await expect(useCase.execute(command))
      .rejects
      .toThrow('Team with this name already exists');
  });

  it('should not create a team with less than 3 members', async () => {
    const memberIds = (await setupUsers()).slice(0, 2);
    const command = new CreateTeamCommand('T1', memberIds);

    await expect(useCase.execute(command))
      .rejects
      .toThrow('Team must have at least 3 members');
  });

  it('should not create a team with non-existent members', async () => {
    const command = new CreateTeamCommand('T1', ['non-existent-id']);

    await expect(useCase.execute(command))
      .rejects
      .toThrow('User not found: non-existent-id');
  });

  it('should not create a team with non-enrolled members', async () => {
    const user = User.create('user-1', Email.create('user1@example.com'), UserStatus.Suspended);
    await userRepository.save(user);

    const command = new CreateTeamCommand('T1', [user.getId()]);

    await expect(useCase.execute(command))
      .rejects
      .toThrow('User user-1 is not enrolled');
  });
}); 