import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../../domain/user/IUserRepository';
import { User } from '../../domain/user/User';
import { Email } from '../../domain/shared/Email';

export class UserRepositoryPrisma implements IUserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findByEmail(email: Email): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email.getValue(),
      },
    });

    if (!user) {
      return null;
    }

    return User.create(user.name, user.email);
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        email: user.getEmail(),
        name: user.getName(),
        updatedAt: new Date(),
      },
    });
  }
} 