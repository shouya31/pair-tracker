import { PrismaClient } from '@prisma/client';
import { RegisterUserUseCase } from '@/application/user/usecases/RegisterUserUseCase';
import { GetUsersUseCase } from '@/application/user/usecases/GetUsersUseCase';
import { UserRepositoryPrisma } from '@/infrastructure/repositories/UserRepositoryPrisma';
import { CreateTeamUseCase } from '@/application/team/usecases/CreateTeamUseCase';
import { TeamRepositoryPrisma } from '@/infrastructure/repositories/TeamRepositoryPrisma';
import { GetTeamsUseCase } from '@/application/team/usecases/GetTeamsUseCase';

const prisma = new PrismaClient();
const userRepository = new UserRepositoryPrisma(prisma);
const teamRepository = new TeamRepositoryPrisma(prisma);

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

function createRegisterUserUseCaseInstance() {
  return new RegisterUserUseCase(userRepository);
}

function createTeamUseCaseInstance() {
  return new CreateTeamUseCase(teamRepository, userRepository);
}

function createGetTeamsUseCaseInstance() {
  return new GetTeamsUseCase(teamRepository);
}

function createGetUsersUseCaseInstance() {
  return new GetUsersUseCase(userRepository);
}

// シングルトンインスタンスをエクスポート
export const registerUserUseCase = createRegisterUserUseCaseInstance();
export const createTeamUseCase = createTeamUseCaseInstance();
export const getTeamsUseCase = createGetTeamsUseCaseInstance();
export const getUsersUseCase = createGetUsersUseCaseInstance();