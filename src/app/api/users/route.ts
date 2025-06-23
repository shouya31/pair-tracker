import { NextResponse } from 'next/server';
import { getUsersUseCase } from '@/server/usecases';
import { UnexpectedError } from '@/domain/shared/errors/SystemError';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const users = await getUsersUseCase.execute();
    return NextResponse.json({ users });
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