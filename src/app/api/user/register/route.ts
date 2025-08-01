import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { registerUserSchema } from '@/lib/schemas/user-schema';
import type { UserResponse } from '@/presentation/types/responses/UserResponse';
import { registerUserUseCase } from '@/server/usecases';
import { isOk, isErr } from '@/domain/shared/Result';
import { getUserNameVO, getUserEmail } from '@/domain/user/User';
import { ERROR_CODES } from '@/domain/shared/DomainError';

function getHttpStatusFromErrorCode(code: string): number {
  switch (code) {
    case ERROR_CODES.ALREADY_EXISTS:
      return 409;
    case ERROR_CODES.NOT_FOUND:
      return 404;
    case ERROR_CODES.VALIDATION_ERROR:
      return 400;
    case ERROR_CODES.SYSTEM_ERROR:
    default:
      return 500;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = registerUserSchema.parse(body);
    const registeredUserResult = await registerUserUseCase(validatedData.name, validatedData.email);

    if (isErr(registeredUserResult)) {
      const status = getHttpStatusFromErrorCode(registeredUserResult.error.code);
      return NextResponse.json(
        { error: registeredUserResult.error.message },
        { status }
      );
    }

    const userResponse: UserResponse = {
      name: getUserNameVO(registeredUserResult.value),
      email: getUserEmail(registeredUserResult.value)
    };

    return NextResponse.json(
      {
        message: 'ユーザーが正常に登録されました',
        user: userResponse
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

    return NextResponse.json(
      { error: 'ユーザー登録中にエラーが発生しました' },
      { status: 500 }
    );
  }
}