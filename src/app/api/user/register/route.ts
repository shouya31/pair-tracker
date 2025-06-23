import { NextResponse } from 'next/server';
import { UserDomainError } from '@/domain/user/errors/UserDomainError';
import { UserValidationError } from '@/domain/user/errors/UserValidationError';
import { UnexpectedError } from '@/domain/shared/errors/SystemError';
import { ZodError } from 'zod';
import { registerUserSchema } from '@/lib/schemas/user-schema';
import { registerUserUseCase } from '@/server/usecases';
import type { UserResponse } from '@/presentation/types/responses/UserResponse';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received registration request:', body);

    const validatedData = registerUserSchema.parse(body);
    console.log('Validated data:', validatedData);

    const registeredUser = await registerUserUseCase.execute(validatedData.name, validatedData.email);
    console.log('User registered successfully:', registeredUser);

    const userResponse: UserResponse = {
      name: registeredUser.name,
      email: registeredUser.email
    };

    return NextResponse.json(
      {
        message: 'ユーザーが正常に登録されました',
        user: userResponse
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error in user registration:', error);

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

    if (error instanceof UserValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error instanceof UserDomainError) {
      switch (error.type) {
        case 'ALREADY_EXISTS':
          return NextResponse.json(
            { error: error.message },
            { status: 409 }
          );
        case 'NOT_FOUND':
          return NextResponse.json(
            { error: error.message },
            { status: 404 }
          );
      }
    }

    const unexpectedError = new UnexpectedError(error instanceof Error ? error : undefined);
    console.error('Unexpected error details:', error);
    return NextResponse.json(
      { error: unexpectedError.message },
      { status: 500 }
    );
  }
}