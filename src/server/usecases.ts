import { PrismaClient } from '@prisma/client';
import { RegisterUserUseCase } from '@/application/user/usecases/RegisterUserUseCase';
import { UserRepositoryPrisma } from '@/infrastructure/repositories/UserRepositoryPrisma';

const prisma = new PrismaClient();

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export function createRegisterUserUseCase(): RegisterUserUseCase {
  const userRepository = new UserRepositoryPrisma(prisma);
  return new RegisterUserUseCase(userRepository);
}