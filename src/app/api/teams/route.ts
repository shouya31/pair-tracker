import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createTeamSchema } from '@/lib/schemas/team-schema';
import { createTeamUseCase, getTeamsUseCase } from '@/server/usecases';
import { DuplicateTeamNameError, UserNotFoundError } from '@/application/team/errors/TeamErrors';
import { TeamNameLengthError } from '@/domain/team/errors/TeamValidationError';
import { TeamDomainError } from '@/domain/team/errors/TeamDomainError';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('GET /api/teams: Starting...');
    const teams = await getTeamsUseCase.execute();
    console.log('GET /api/teams: Success', teams);
    return NextResponse.json({ teams });
  } catch (error) {
    console.error('GET /api/teams: Error:', error);
    return NextResponse.json(
      {
        message: 'チームの取得に失敗しました',
        details: error instanceof Error ? error.message : undefined
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

    return NextResponse.json({ message: 'チームを作成しました' }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'バリデーションエラー', errors: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof DuplicateTeamNameError) {
      return NextResponse.json(
        { message: error.message },
        { status: 409 }
      );
    }

    if (error instanceof TeamNameLengthError) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    if (error instanceof TeamDomainError) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    if (error instanceof UserNotFoundError) {
      return NextResponse.json(
        { message: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: '予期せぬエラーが発生しました' },
      { status: 500 }
    );
  }
}