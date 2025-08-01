import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../../domain/user/IUserRepository';
import { User } from '../../domain/user/User';
import { Email } from '../../domain/shared/Email';
import { UserStatus } from '../../domain/user/enums/UserStatus';
import { rebuildUser, getUserId, getUserNameVO, getUserEmail, getUserStatus } from '../../domain/user/User';
import { Result, ok, err, isOk, isErr } from '../../domain/shared/Result';
import { DomainError, createDomainError } from '../../domain/shared/DomainError';

export class UserRepositoryPrisma implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: Email): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email.value,
      },
    });

    if (!user) {
      return null;
    }

    const rebuildResult = rebuildUser(
      user.id,
      user.name,
      user.email,
      user.status as UserStatus
    );

    if (isErr(rebuildResult)) {
      return null;
    }

    return rebuildResult.value;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    const rebuildResult = rebuildUser(
      user.id,
      user.name,
      user.email,
      user.status as UserStatus
    );

    if (isErr(rebuildResult)) {
      return null;
    }

    return rebuildResult.value;
  }

  async findByIds(ids: string[]): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
    });

    return users
      .map(user => rebuildUser(
        user.id,
        user.name,
        user.email,
        user.status as UserStatus
      ))
      .filter(isOk)
      .map(result => result.value);
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();

    return users
      .map(user => rebuildUser(
        user.id,
        user.name,
        user.email,
        user.status as UserStatus
      ))
      .filter(isOk)
      .map(result => result.value);
  }

  async save(user: User): Promise<Result<void, DomainError>> {
    try {
      await this.prisma.user.upsert({
        where: {
          id: getUserId(user),
        },
        create: {
          id: getUserId(user),
          email: getUserEmail(user),
          name: getUserNameVO(user),
          status: getUserStatus(user),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        update: {
          email: getUserEmail(user),
          name: getUserNameVO(user),
          status: getUserStatus(user),
          updatedAt: new Date(),
        },
      });
      return ok(undefined);
    } catch (error) {
      return err(createDomainError(`ユーザーの保存に失敗しました: ${error}`));
    }
  }
}