import { NextResponse } from 'next/server';
import { CreateTeamCommand } from '../../../application/team/commands/CreateTeamCommand';
import { CreateTeamUseCase } from '../../../application/team/usecases/CreateTeamUseCase';
import { TeamRepositoryPrisma } from '../../../infrastructure/repositories/TeamRepositoryPrisma';
import { UserRepositoryPrisma } from '../../../infrastructure/repositories/UserRepositoryPrisma';

const teamRepository = new TeamRepositoryPrisma();
const userRepository = new UserRepositoryPrisma();
const createTeamUseCase = new CreateTeamUseCase(teamRepository, userRepository);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const command = new CreateTeamCommand(
      body.name,
      body.initialMemberIds,
    );
    const result = await createTeamUseCase.execute(command);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
} 