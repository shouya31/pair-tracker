import { PrismaClient } from '@prisma/client';
import { RegisterUserUseCase } from '@/application/user/usecases/RegisterUserUseCase';
import { UserRepositoryPrisma } from '@/infrastructure/repositories/UserRepositoryPrisma';
import { CreateTeamUseCase } from '@/application/team/usecases/CreateTeamUseCase';
import { TeamRepositoryPrisma } from '@/infrastructure/repositories/TeamRepositoryPrisma';

const prisma = new PrismaClient();

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

function createRegisterUserUseCaseInstance(): RegisterUserUseCase {
  const userRepository = new UserRepositoryPrisma(prisma);
  return new RegisterUserUseCase(userRepository);
}

function createTeamUseCaseInstance(): CreateTeamUseCase {
  const teamRepository = new TeamRepositoryPrisma(prisma);
  const userRepository = new UserRepositoryPrisma(prisma);
  return new CreateTeamUseCase(teamRepository, userRepository);
}

// シングルトンインスタンスをエクスポート
export const registerUserUseCase = createRegisterUserUseCaseInstance();
export const createTeamUseCase = createTeamUseCaseInstance();