import { NextResponse } from 'next/server';
import { getUsersUseCase } from '@/server/usecases';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const users = await getUsersUseCase();
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { error: `ユーザー一覧取得中にエラーが発生しました: ${error}` },
      { status: 500 }
    );
  }
}