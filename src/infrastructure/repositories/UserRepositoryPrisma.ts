import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../../domain/user/IUserRepository';
import { User } from '../../domain/user/User';
import { Email } from '../../domain/shared/Email';
import { UserStatus } from '../../domain/user/enums/UserStatus';

export class UserRepositoryPrisma implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: Email): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email.getValue(),
      },
    });

    if (!user) {
      return null;
    }

    return User.rebuild(
      user.id,
      user.name,
      user.email,
      user.status as UserStatus
    );
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      return null;
    }

    return User.rebuild(
      user.id,
      user.name,
      user.email,
      user.status as UserStatus
    );
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: {
        id: user.getUserId(),
      },
      create: {
        id: user.getUserId(),
        email: user.getEmail(),
        name: user.getName(),
        status: user.getStatus(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        email: user.getEmail(),
        name: user.getName(),
        status: user.getStatus(),
        updatedAt: new Date(),
      },
    });
  }

  async findByIds(ids: string[]): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    return users.map(user => User.rebuild(
      user.id,
      user.name,
      user.email,
      user.status as UserStatus
    ));
  }
}