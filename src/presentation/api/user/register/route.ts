import { NextResponse } from 'next/server';
import { RegisterUserUseCase } from '@/application/user/usecases/RegisterUserUseCase';
import { UserRepositoryPrisma } from '@/infrastructure/repositories/UserRepositoryPrisma';
import { PrismaClient } from '@prisma/client';
import { UserAlreadyExistsError } from '@/domain/user/errors/UserValidationError';
import { DomainError } from '@/domain/shared/DomainError';
import { UnexpectedError } from '@/domain/shared/errors/SystemError';
import { ValidationErrorResponseDTO, ConflictErrorResponseDTO, SystemErrorResponseDTO } from '@/application/shared/dto/ResponseDTO';
import { ZodError } from 'zod';
import { registerUserSchema } from '@/lib/schemas/user-schema';

export async function POST(request: Request) {
  const prisma = new PrismaClient();
  const userRepository = new UserRepositoryPrisma(prisma);
  const registerUserUseCase = new RegisterUserUseCase(userRepository);

  try {
    const body = await request.json();
    const validatedData = registerUserSchema.parse(body);

    const result = await registerUserUseCase.execute(validatedData.name, validatedData.email);

    return NextResponse.json(
      { message: result.message },
      { status: result.getStatusCode() }
    );

  } catch (error) {
    let responseDTO;

    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      responseDTO = new ValidationErrorResponseDTO(
        firstError.message,
        firstError.path.join('.'),
        firstError.path[0].toString()
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