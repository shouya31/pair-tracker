import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createTeamSchema } from '@/lib/schemas/team-schema';
import { createTeamUseCase, getTeamsUseCase } from '@/server/usecases';
import { TeamValidationError } from '@/domain/team/errors/TeamValidationError';
import { TeamDomainError } from '@/domain/team/errors/TeamDomainError';
import { UnexpectedError } from '@/domain/shared/errors/SystemError';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const teams = await getTeamsUseCase.execute();
    return NextResponse.json({ teams });
  } catch (error) {
    const unexpectedError = new UnexpectedError(error instanceof Error ? error : undefined);
    return NextResponse.json(
      {
        error: unexpectedError.message
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createTeamSchema.parse(body);

    await createTeamUseCase.execute({
      name: validatedData.name,
      memberIds: validatedData.memberIds
    });

    return NextResponse.json(
      { message: 'チームを作成しました' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
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

    if (error instanceof TeamValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error instanceof TeamDomainError) {
      switch (error.type) {
        case 'DUPLICATE_TEAM_NAME':
          return NextResponse.json(
            { error: error.message },
            { status: 409 }
          );
        case 'NON_TEAM_MEMBER':
          return NextResponse.json(
            { error: error.message },
            { status: 404 }
          );
        default:
          return NextResponse.json(
            { error: error.message },
            { status: 400 }
          );
      }
    }

    const unexpectedError = new UnexpectedError(error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: unexpectedError.message },
      { status: 500 }
    );
  }
}