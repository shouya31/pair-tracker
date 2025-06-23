import { NextResponse } from 'next/server';
import { getUsersUseCase } from '@/server/usecases';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await getUsersUseCase.execute();
    return NextResponse.json(users);
  } catch (error) {
    console.error('GET /api/users: Error:', error);
    return NextResponse.json(
      { 
        message: 'ユーザーの取得に失敗しました',
        details: error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
} 