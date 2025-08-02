import { PrismaClient } from '@prisma/client';
import { UserRepositoryPrisma } from './UserRepositoryPrisma';
import { UserStatus } from '../../domain/user/enums/UserStatus';
import { createUser, rebuildUser, getUserId, getUserNameVO, getUserEmail, getUserStatus } from '../../domain/user/User';
import { isOk } from '../../domain/shared/Result';
import { createEmail as createEmailVO } from '../../domain/shared/Email';

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
      const userResult = createUser('テストユーザー', 'test@example.com');
      expect(isOk(userResult)).toBe(true);
      
      if (isOk(userResult)) {
        const saveResult = await repository.save(userResult.value);
        expect(isOk(saveResult)).toBe(true);

        const savedUser = await prisma.user.findUnique({
          where: { id: getUserId(userResult.value) },
        });

        expect(savedUser).not.toBeNull();
        expect(savedUser?.name).toBe(getUserNameVO(userResult.value));
        expect(savedUser?.email).toBe(getUserEmail(userResult.value));
        expect(savedUser?.status).toBe(getUserStatus(userResult.value));
      }
    });

    test('既存ユーザーを更新できる', async () => {
      const userResult = createUser('テストユーザー', 'test@example.com');
      expect(isOk(userResult)).toBe(true);
      
      if (isOk(userResult)) {
        // 初回保存
        const saveResult = await repository.save(userResult.value);
        expect(isOk(saveResult)).toBe(true);

        // 更新用ユーザーを作成
        const updatedUserResult = rebuildUser(
          getUserId(userResult.value),
          '更新後ユーザー',
          'updated@example.com',
          UserStatus.Withdrawn
        );
        expect(isOk(updatedUserResult)).toBe(true);

        if (isOk(updatedUserResult)) {
          const updateResult = await repository.save(updatedUserResult.value);
          expect(isOk(updateResult)).toBe(true);

          const savedUser = await prisma.user.findUnique({
            where: { id: getUserId(userResult.value) },
          });

          expect(savedUser).not.toBeNull();
          expect(savedUser?.name).toBe('更新後ユーザー');
          expect(savedUser?.email).toBe('updated@example.com');
          expect(savedUser?.status).toBe(UserStatus.Withdrawn);

          const totalUsers = await prisma.user.count();
          expect(totalUsers).toBe(1);
        }
      }
    });
  });

  describe('findByEmail', () => {
    test('メールアドレスで既存のユーザーを検索できる', async () => {
      const userResult = createUser('テストユーザー', 'test@example.com');
      expect(isOk(userResult)).toBe(true);
      
      if (isOk(userResult)) {
        await repository.save(userResult.value);

        const emailResult = createEmailVO('test@example.com');
        expect(isOk(emailResult)).toBe(true);
        
        if (isOk(emailResult)) {
          const foundUser = await repository.findByEmail(emailResult.value);

          expect(foundUser).not.toBeNull();
          expect(getUserNameVO(foundUser!)).toBe('テストユーザー');
          expect(getUserEmail(foundUser!)).toBe('test@example.com');
          expect(getUserStatus(foundUser!)).toBe(UserStatus.Enrolled);
        }
      }
    });

    test('存在しないメールアドレスの場合はnullを返す', async () => {
      const emailResult = createEmailVO('nonexistent@example.com');
      expect(isOk(emailResult)).toBe(true);
      
      if (isOk(emailResult)) {
        const foundUser = await repository.findByEmail(emailResult.value);
        expect(foundUser).toBeNull();
      }
    });
  });

  describe('findById', () => {
    test('IDで既存のユーザーを検索できる', async () => {
      const userResult = createUser('テストユーザー', 'test@example.com');
      expect(isOk(userResult)).toBe(true);
      
      if (isOk(userResult)) {
        await repository.save(userResult.value);

        const foundUser = await repository.findById(getUserId(userResult.value));

        expect(foundUser).not.toBeNull();
        expect(getUserNameVO(foundUser!)).toBe('テストユーザー');
        expect(getUserEmail(foundUser!)).toBe('test@example.com');
        expect(getUserStatus(foundUser!)).toBe(UserStatus.Enrolled);
      }
    });

    test('存在しないIDの場合はnullを返す', async () => {
      const foundUser = await repository.findById('nonexistent-id');
      expect(foundUser).toBeNull();
    });
  });

  describe('findByIds', () => {
    test('複数のIDでユーザーを検索できる', async () => {
      const user1Result = createUser('テストユーザー1', 'test1@example.com');
      const user2Result = createUser('テストユーザー2', 'test2@example.com');
      expect(isOk(user1Result)).toBe(true);
      expect(isOk(user2Result)).toBe(true);
      
      if (isOk(user1Result) && isOk(user2Result)) {
        await repository.save(user1Result.value);
        await repository.save(user2Result.value);

        const foundUsers = await repository.findByIds([
          getUserId(user1Result.value),
          getUserId(user2Result.value)
        ]);

        expect(foundUsers).toHaveLength(2);
        expect(foundUsers.map(u => getUserNameVO(u))).toContain('テストユーザー1');
        expect(foundUsers.map(u => getUserNameVO(u))).toContain('テストユーザー2');
      }
    });

    test('存在しないIDが含まれている場合、存在するユーザーのみ返される', async () => {
      const userResult = createUser('テストユーザー', 'test@example.com');
      expect(isOk(userResult)).toBe(true);
      
      if (isOk(userResult)) {
        await repository.save(userResult.value);

        const foundUsers = await repository.findByIds([
          getUserId(userResult.value),
          'nonexistent-id'
        ]);

        expect(foundUsers).toHaveLength(1);
        expect(getUserNameVO(foundUsers[0])).toBe('テストユーザー');
      }
    });
  });

  describe('findAll', () => {
    test('全てのユーザーを取得できる', async () => {
      const user1Result = createUser('テストユーザー1', 'test1@example.com');
      const user2Result = createUser('テストユーザー2', 'test2@example.com');
      expect(isOk(user1Result)).toBe(true);
      expect(isOk(user2Result)).toBe(true);
      
      if (isOk(user1Result) && isOk(user2Result)) {
        await repository.save(user1Result.value);
        await repository.save(user2Result.value);

        const allUsers = await repository.findAll();

        expect(allUsers).toHaveLength(2);
        expect(allUsers.map(u => getUserNameVO(u))).toContain('テストユーザー1');
        expect(allUsers.map(u => getUserNameVO(u))).toContain('テストユーザー2');
      }
    });

    test('ユーザーが存在しない場合、空配列が返される', async () => {
      const allUsers = await repository.findAll();
      expect(allUsers).toHaveLength(0);
    });
  });
});