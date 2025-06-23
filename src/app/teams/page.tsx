import { headers } from 'next/headers';

interface Team {
  id: string;
  name: string;
  members: {
    id: string;
    name: string;
  }[];
}

async function getTeams() {
  // サーバーサイドとクライアントサイドで異なるURLを使用
  const API_URL = typeof window === 'undefined'
    ? 'http://app:3000/api/teams'  // サーバーサイド（Docker環境内）
    : '/api/teams';                 // クライアントサイド（ブラウザ）

  try {
    const res = await fetch(API_URL, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'チームの取得に失敗しました' }));
      throw new Error(errorData.message || 'チームの取得に失敗しました');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export default async function TeamsPage() {
  let teams: Team[] = [];
  let error: string | null = null;

  try {
    const data = await getTeams();
    teams = data.teams;
  } catch (e) {
    error = e instanceof Error ? e.message : 'チームの取得に失敗しました';
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">チーム一覧</h1>
      </div>

      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">エラー: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          チームが登録されていません
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-4">チーム名: {team.name}</h2>
              <div className="mt-4">
                <h3 className="font-medium text-gray-700 mb-2">メンバー:</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {team.members.map(member => (
                    <li key={member.id} className="mb-1">
                      {member.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}