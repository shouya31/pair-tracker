import { UserRepositoryPrisma } from '../../../infrastructure/repositories/UserRepositoryPrisma';
import { User } from '../../../domain/user/User';
import { Email } from '../../../domain/shared/Email';
import { UserStatus } from '../../../domain/user/enums/UserStatus';
import prisma from '../../../infrastructure/prisma/client';

describe('UserRepositoryPrisma', () => {
  let repository: UserRepositoryPrisma;

  beforeEach(async () => {
    repository = new UserRepositoryPrisma();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const createUser = () => {
    return User.create(
      'test-id',
      Email.create('test@example.com'),
      UserStatus.Enrolled,
    );
  };

  describe('save', () => {
    it('should save a new user', async () => {
      const user = createUser();
      await repository.save(user);

      const found = await prisma.user.findUnique({
        where: { id: user.getId() },
      });

      expect(found).not.toBeNull();
      expect(found?.email).toBe('test@example.com');
      expect(found?.status).toBe('ENROLLED');
    });

    it('should update an existing user', async () => {
      const user = createUser();
      await repository.save(user);

      user.changeStatus(UserStatus.Suspended);
      await repository.save(user);

      const found = await prisma.user.findUnique({
        where: { id: user.getId() },
      });

      expect(found?.status).toBe('SUSPENDED');
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const user = createUser();
      await repository.save(user);

      const found = await repository.findById(user.getId());

      expect(found).not.toBeNull();
      expect(found?.getId()).toBe(user.getId());
      expect(found?.getEmail().getValue()).toBe('test@example.com');
      expect(found?.getStatus()).toBe(UserStatus.Enrolled);
    });

    it('should return null for non-existent id', async () => {
      const found = await repository.findById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const user = createUser();
      await repository.save(user);

      const found = await repository.findByEmail(Email.create('test@example.com'));

      expect(found).not.toBeNull();
      expect(found?.getId()).toBe(user.getId());
      expect(found?.getEmail().getValue()).toBe('test@example.com');
    });

    it('should return null for non-existent email', async () => {
      const found = await repository.findByEmail(Email.create('non-existent@example.com'));
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all users', async () => {
      const user1 = User.create('id-1', Email.create('user1@example.com'));
      const user2 = User.create('id-2', Email.create('user2@example.com'));
      await Promise.all([
        repository.save(user1),
        repository.save(user2),
      ]);

      const found = await repository.findAll();

      expect(found).toHaveLength(2);
      expect(found.map(u => u.getId())).toContain(user1.getId());
      expect(found.map(u => u.getId())).toContain(user2.getId());
    });

    it('should return empty array when no users exist', async () => {
      const found = await repository.findAll();
      expect(found).toHaveLength(0);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const user = createUser();
      await repository.save(user);

      await repository.delete(user.getId());

      const found = await prisma.user.findUnique({
        where: { id: user.getId() },
      });
      expect(found).toBeNull();
    });

    it('should not throw error when deleting non-existent user', async () => {
      await expect(repository.delete('non-existent-id'))
        .resolves
        .not.toThrow();
    });
  });
}); 