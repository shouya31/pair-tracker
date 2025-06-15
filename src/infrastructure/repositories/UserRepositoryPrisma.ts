import { PrismaClient } from '@prisma/client';
import { User } from '../../domain/user/User';
import { IUserRepository } from '../../domain/user/IUserRepository';
import { Email } from '../../domain/shared/Email';
import { UserStatus } from '../../domain/user/UserStatus';

const prisma = new PrismaClient();

export class UserRepositoryPrisma implements IUserRepository {
  async save(user: User): Promise<void> {
    await prisma.user.upsert({
      where: { id: user.getId() },
      update: {
        email: user.getEmail().getValue(),
        status: user.getStatus(),
      },
      create: {
        id: user.getId(),
        email: user.getEmail().getValue(),
        status: user.getStatus(),
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return User.reconstruct(
      user.id,
      Email.create(user.email),
      user.status as UserStatus,
    );
  }

  async findByEmail(email: Email): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.getValue() },
    });

    if (!user) {
      return null;
    }

    return User.reconstruct(
      user.id,
      Email.create(user.email),
      user.status as UserStatus,
    );
  }

  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany();

    return users.map(user =>
      User.create(
        user.id,
        Email.create(user.email),
        user.status as UserStatus,
      )
    );
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.user.delete({
        where: { id },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        return;
      }
      throw error;
    }
  }
} 