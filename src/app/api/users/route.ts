import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { UserStatus } from '@/domain/user/enums/UserStatus';

export async function GET() {
  try {
    console.log('Fetching enrolled users...');
    const users = await prisma.user.findMany({
      where: {
        status: UserStatus.Enrolled
      },
      select: {
        id: true,
        name: true
      }
    });
    console.log('Found users:', users);

    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { message: 'ユーザー情報の取得に失敗しました' },
      { status: 500 }
    );
  }
} 