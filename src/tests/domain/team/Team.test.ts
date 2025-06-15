import { Team } from '../../../domain/team/Team';
import { TeamName } from '../../../domain/team/vo/TeamName';
import { User } from '../../../domain/user/User';
import { Email } from '../../../domain/shared/Email';
import { UserStatus } from '../../../domain/user/UserStatus';
import { Pair } from '../../../domain/team/Pair';
import { PairLabel } from '../../../domain/team/vo/PairLabel';

describe('Team', () => {
  const validName = TeamName.create('T1');

  const createUser = (id: string, email: string, status: UserStatus = UserStatus.ENROLLED): User => {
    return User.reconstruct(id, Email.create(email), status);
  };

  const createInitialMembers = () => {
    return [
      createUser('user-1', 'user1@example.com'),
      createUser('user-2', 'user2@example.com'),
      createUser('user-3', 'user3@example.com'),
    ];
  };

  describe('create', () => {
    it('should create a team with valid parameters', () => {
      const team = Team.create(validName, createInitialMembers());
      expect(team.getName().getValue()).toBe('T1');
      expect(team.getMembers()).toHaveLength(3);
      expect(team.getPairs()).toHaveLength(0);
    });

    it('should not create a team with less than 3 members', () => {
      const members = [
        createUser('user-1', 'user1@example.com'),
        createUser('user-2', 'user2@example.com'),
      ];
      expect(() => Team.create(validName, members))
        .toThrow('Team must have at least 3 members');
    });
  });

  describe('addMember', () => {
    let team: Team;

    beforeEach(() => {
      team = Team.create(validName, createInitialMembers());
    });

    it('should add an enrolled member', () => {
      const user = createUser('user-4', 'user4@example.com');
      team.addMember(user);
      expect(team.getMembers()).toHaveLength(4);
    });

    it('should not add a non-enrolled member', () => {
      const user = createUser('user-4', 'user4@example.com', UserStatus.SUSPENDED);
      expect(() => team.addMember(user))
        .toThrow('Only enrolled users can be added to a team');
    });

    it('should not add the same member twice', () => {
      const user = createUser('user-1', 'user1@example.com');
      expect(() => team.addMember(user))
        .toThrow('User is already a member of this team');
    });
  });

  describe('removeMember', () => {
    let team: Team;

    beforeEach(() => {
      team = Team.create(validName, createInitialMembers());
    });

    it('should remove a member not in any pair', () => {
      const user = team.getMembers()[0];
      team.removeMember(user);
      expect(team.getMembers()).toHaveLength(2);
    });

    it('should not remove a member in a pair', () => {
      const user = team.getMembers()[0];
      const pair = Pair.create(PairLabel.create('A'), [user, team.getMembers()[1]]);
      team.addPair(pair);
      expect(() => team.removeMember(user))
        .toThrow('Cannot remove user who belongs to a pair');
    });
  });

  describe('addPair', () => {
    let team: Team;

    beforeEach(() => {
      team = Team.create(validName, createInitialMembers());
    });

    it('should add a pair with valid parameters', () => {
      const pair = Pair.create(PairLabel.create('A'), [team.getMembers()[0], team.getMembers()[1]]);
      team.addPair(pair);
      expect(team.getPairs()).toHaveLength(1);
    });

    it('should not add a pair with duplicate label', () => {
      const pair1 = Pair.create(PairLabel.create('A'), [team.getMembers()[0], team.getMembers()[1]]);
      const pair2 = Pair.create(PairLabel.create('A'), [team.getMembers()[1], team.getMembers()[2]]);
      team.addPair(pair1);
      expect(() => team.addPair(pair2))
        .toThrow('Pair with this label already exists in the team');
    });
  });

  describe('removePair', () => {
    let team: Team;
    let pair: Pair;

    beforeEach(() => {
      team = Team.create(validName, createInitialMembers());
      pair = Pair.create(PairLabel.create('A'), [team.getMembers()[0], team.getMembers()[1]]);
      team.addPair(pair);
    });

    it('should remove an existing pair', () => {
      team.removePair(pair);
      expect(team.getPairs()).toHaveLength(0);
    });

    it('should throw error when removing non-existent pair', () => {
      const nonExistentPair = Pair.create(PairLabel.create('B'), [team.getMembers()[1], team.getMembers()[2]]);
      expect(() => team.removePair(nonExistentPair))
        .toThrow('Pair is not in this team');
    });
  });
}); 