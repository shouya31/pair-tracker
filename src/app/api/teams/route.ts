import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createTeamUseCase } from '@/server/usecases';
import { DuplicateTeamNameError, UserNotFoundError } from '@/application/team/errors/TeamErrors';
import { TeamNameLengthError } from '@/domain/team/errors/TeamValidationError';
import { TeamDomainError } from '@/domain/team/errors/TeamDomainError';

const createTeamSchema = z.object({
  name: z.string().min(1, 'チーム名は必須です').max(3, 'チーム名は3文字以下で入力してください'),
  memberIds: z.array(z.string()).min(3, 'チームには最低3名のメンバーが必要です'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = createTeamSchema.parse(body);

    await createTeamUseCase.execute({
      name: validatedData.name,
      memberIds: validatedData.memberIds,
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