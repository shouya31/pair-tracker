import { PrismaClient } from '@prisma/client';
import { UserRepositoryPrisma } from './UserRepositoryPrisma';
import { User } from '../../domain/user/User';
import { createEmail, Email } from '../../domain/shared/Email';
import { UserStatus } from '../../domain/user/enums/UserStatus';
import { createUser, rebuildUser, getUserId, getUserName, getUserEmail } from '../../domain/user/User';

describe('UserRepositoryPrisma', () => {
  let prisma: PrismaClient;
  let repository: UserRepositoryPrisma;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    repository = new UserRepositoryPrisma(prisma);
    await prisma.teamUser.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('save', () => {
    test('新規ユーザーを保存できる', async () => {
      const user = createUser('テストユーザー', 'test@example.com');
      await repository.save(user);

      const savedUser = await prisma.user.findUnique({
        where: { id: getUserId(user) },
      });

      expect(savedUser).not.toBeNull();
      expect(savedUser?.name).toBe(getUserName(user));
      expect(savedUser?.email).toBe(getUserEmail(user));
    });

    test('既存ユーザーを更新できる', async () => {
      const user = createUser('テストユーザー', 'test@example.com');
      await repository.save(user);

      const updatedUser = rebuildUser(
        getUserId(user),
        '更新後ユーザー',
        'updated@example.com',
        UserStatus.Enrolled
      );
      await repository.save(updatedUser);

      const savedUser = await prisma.user.findUnique({
        where: { id: getUserId(user) },
      });

      expect(savedUser).not.toBeNull();
      expect(savedUser?.name).toBe('更新後ユーザー');
      expect(savedUser?.email).toBe('updated@example.com');

      const totalUsers = await prisma.user.count();
      expect(totalUsers).toBe(1);
    });
  });

  describe('findByEmail', () => {
    test('メールアドレスで既存のユーザーを検索できる', async () => {
      const user = createUser('テストユーザー', 'test@example.com');
      await repository.save(user);

      const foundUser = await repository.findByEmail(createEmail('test@example.com'));

      expect(foundUser).not.toBeNull();
      expect(getUserName(foundUser!)).toBe('テストユーザー');
      expect(getUserEmail(foundUser!)).toBe('test@example.com');
    });

    test('存在しないメールアドレスの場合はnullを返す', async () => {
      const foundUser = await repository.findByEmail(createEmail('nonexistent@example.com'));

      expect(foundUser).toBeNull();
    });
  });
});