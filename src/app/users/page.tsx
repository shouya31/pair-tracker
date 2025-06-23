import { headers } from 'next/headers';

interface User {
  id: string;
  name: string;
  email: string;
  status: string;
}

async function getUsers() {
  // サーバーサイドとクライアントサイドで異なるURLを使用
  const API_URL = typeof window === 'undefined'
    ? 'http://app:3000/api/users'  // サーバーサイド（Docker環境内）
    : '/api/users';                 // クライアントサイド（ブラウザ）

  try {
    const res = await fetch(API_URL, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'ユーザーの取得に失敗しました' }));
      throw new Error(errorData.message || 'ユーザーの取得に失敗しました');
    }

    const users = await res.json();
    return users;
  } catch (error) {
    throw error;
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'Enrolled':
      return '在籍中';
    case 'Suspended':
      return '休会中';
    case 'Withdrawn':
      return '退会済み';
    default:
      return status;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'Enrolled':
      return 'bg-green-100 text-green-800';
    case 'Suspended':
      return 'bg-yellow-100 text-yellow-800';
    case 'Withdrawn':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default async function UsersPage() {
  let users: User[] = [];
  let error: string | null = null;

  try {
    const data = await getUsers();
    users = data.users;
  } catch (e) {
    error = e instanceof Error ? e.message : 'ユーザーの取得に失敗しました';
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">ユーザー一覧</h1>
      </div>

      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">エラー: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          ユーザーが登録されていません
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-4">{user.name}</h2>
              <p className="text-gray-600 mb-2">{user.email}</p>
              <p className="text-sm text-gray-500">ステータス: {user.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 