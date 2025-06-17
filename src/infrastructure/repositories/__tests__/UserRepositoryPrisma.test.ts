import { PrismaClient } from '@prisma/client';
import { UserRepositoryPrisma } from '../UserRepositoryPrisma';
import { User } from '../../../domain/user/User';
import { Email } from '../../../domain/shared/Email';
import { UserStatus } from '../../../domain/user/enums/UserStatus';

describe('UserRepositoryPrisma', () => {
  let prisma: PrismaClient;
  let repository: UserRepositoryPrisma;

  beforeEach(async () => {
    prisma = new PrismaClient();
    repository = new UserRepositoryPrisma(prisma);

    await prisma.user.deleteMany();
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  describe('save', () => {
    test('新規ユーザーを保存できる', async () => {
      const user = User.create('テストユーザー', 'test@example.com');
      await repository.save(user);

      const savedUser = await prisma.user.findUnique({
        where: { id: user.getUserId() },
      });

      expect(savedUser).not.toBeNull();
      expect(savedUser?.name).toBe('テストユーザー');
      expect(savedUser?.email).toBe('test@example.com');
    });

    test('既存ユーザーを更新できる', async () => {
      const user = User.create('テストユーザー', 'test@example.com');
      await repository.save(user);

      const updatedUser = User.rebuild(
        user.getUserId(),
        '更新後ユーザー',
        'updated@example.com',
        UserStatus.Enrolled
      );
      await repository.save(updatedUser);

      const savedUser = await prisma.user.findUnique({
        where: { id: user.getUserId() },
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
      const user = User.create('テストユーザー', 'test@example.com');
      await repository.save(user);

      const foundUser = await repository.findByEmail(Email.create('test@example.com'));

      expect(foundUser).not.toBeNull();
      expect(foundUser?.getName()).toBe('テストユーザー');
      expect(foundUser?.getEmail()).toBe('test@example.com');
    });

    test('存在しないメールアドレスの場合はnullを返す', async () => {
      const foundUser = await repository.findByEmail(Email.create('nonexistent@example.com'));

      expect(foundUser).toBeNull();
    });
  });
});