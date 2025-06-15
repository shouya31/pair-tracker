import { NextResponse } from 'next/server';
import { RegisterUserCommand } from '../../../application/user/commands/RegisterUserCommand';
import { ChangeStatusCommand } from '../../../application/user/commands/ChangeStatusCommand';
import { RegisterUserUseCase } from '../../../application/user/usecases/RegisterUserUseCase';
import { ChangeStatusUseCase } from '../../../application/user/usecases/ChangeStatusUseCase';
import { UserRepositoryPrisma } from '../../../infrastructure/repositories/UserRepositoryPrisma';
import { UserStatus } from '../../../domain/user/enums/UserStatus';

const userRepository = new UserRepositoryPrisma();
const registerUserUseCase = new RegisterUserUseCase(userRepository);
const changeStatusUseCase = new ChangeStatusUseCase(userRepository);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const command = new RegisterUserCommand(body.email);
    const result = await registerUserUseCase.execute(command);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const command = new ChangeStatusCommand(
      body.userId,
      body.status as UserStatus,
    );
    const result = await changeStatusUseCase.execute(command);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
} 