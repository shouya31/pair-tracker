import { NextResponse } from 'next/server';
import { RegisterUserUseCase } from '@/application/user/usecases/RegisterUserUseCase';
import { UserRepositoryPrisma } from '@/infrastructure/repositories/UserRepositoryPrisma';
import { PrismaClient } from '@prisma/client';
import { UserNameRequiredError, EmailFormatError, UserAlreadyExistsError } from '@/domain/user/errors/UserValidationError';
import { ValidationError } from '@/domain/shared/errors/ValidationError';
import { DomainError } from '@/domain/shared/DomainError';
import { UnexpectedError } from '@/domain/shared/errors/SystemError';

export async function POST(request: Request) {
  const prisma = new PrismaClient();
  const userRepository = new UserRepositoryPrisma(prisma);
  const registerUserUseCase = new RegisterUserUseCase(userRepository);

  try {
    const body = await request.json();
    const { name, email } = body;

    if (!name) {
      throw new UserNameRequiredError();
    }

    if (!email) {
      throw new EmailFormatError('');
    }

    const result = await registerUserUseCase.execute(name, email);

    return NextResponse.json(
      { message: result.message },
      { status: 201 }
    );

  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          error: error.message,
          propertyName: error.propertyName,
          actualValue: error.actualValue
        },
        { status: 400 }
      );
    }

    if (error instanceof UserAlreadyExistsError) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    if (error instanceof DomainError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    const unexpectedError = new UnexpectedError(error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: unexpectedError.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}