import { NextResponse } from 'next/server';
import { RegisterUserUseCase } from '@/application/user/usecases/RegisterUserUseCase';
import { UserRepositoryPrisma } from '@/infrastructure/repositories/UserRepositoryPrisma';
import { PrismaClient } from '@prisma/client';
import { UserNameRequiredError, EmailFormatError, UserAlreadyExistsError } from '@/domain/user/errors/UserValidationError';
import { ValidationError } from '@/domain/shared/errors/ValidationError';
import { DomainError } from '@/domain/shared/DomainError';
import { UnexpectedError } from '@/domain/shared/errors/SystemError';
import { ValidationErrorResponseDTO, ConflictErrorResponseDTO, SystemErrorResponseDTO } from '@/application/shared/dto/ResponseDTO';

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
      { status: result.getStatusCode() }
    );

  } catch (error) {
    let responseDTO;

    if (error instanceof ValidationError) {
      responseDTO = new ValidationErrorResponseDTO(
        error.message,
        error.propertyName,
        error.actualValue
      );
    } else if (error instanceof UserAlreadyExistsError) {
      responseDTO = new ConflictErrorResponseDTO(error.message);
    } else if (error instanceof DomainError) {
      responseDTO = new ValidationErrorResponseDTO(error.message);
    } else {
      const unexpectedError = new UnexpectedError(error instanceof Error ? error : undefined);
      responseDTO = new SystemErrorResponseDTO(unexpectedError.message);
    }

    return NextResponse.json(
      {
        error: responseDTO.message,
        ...(responseDTO instanceof ValidationErrorResponseDTO && {
          propertyName: responseDTO.propertyName,
          actualValue: responseDTO.actualValue
        })
      },
      { status: responseDTO.getStatusCode() }
    );

  } finally {
    await prisma.$disconnect();
  }
}