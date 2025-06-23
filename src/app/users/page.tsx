import { headers } from 'next/headers';

interface User {
  id: string;
  name: string;
  email: string;
  status: string;
}

async function getUsers() {
  const headersList = await headers();
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const host = headersList.get('host') || 'localhost:3000';

  try {
    const res = await fetch(`${protocol}://${host}/api/users`, {
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
    users = await getUsers();
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
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  名前
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  メールアドレス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}>
                      {getStatusText(user.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 