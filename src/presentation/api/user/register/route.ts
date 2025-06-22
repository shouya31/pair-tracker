import { NextResponse } from 'next/server';
import { UserAlreadyExistsError } from '@/domain/user/errors/UserValidationError';
import { DomainError } from '@/domain/shared/DomainError';
import { UnexpectedError } from '@/domain/shared/errors/SystemError';
import { ZodError } from 'zod';
import { registerUserSchema } from '@/lib/schemas/user-schema';
import { createRegisterUserUseCase } from '@/server/usecases';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = registerUserSchema.parse(body);

    const registerUserUseCase = createRegisterUserUseCase();
    const registeredUser = await registerUserUseCase.execute(validatedData.name, validatedData.email);

    return NextResponse.json(
      {
        message: 'ユーザーが正常に登録されました',
        user: registeredUser
      },
      { status: 201 }
    );

  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json(
        {
          error: firstError.message,
          field: firstError.path.join('.'),
          value: firstError.path[0].toString()
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
  }
}