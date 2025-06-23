'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MemberSelect } from '@/components/MemberSelect';

export default function CreateTeamPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (memberIds.length < 3) {
      setError('チームには3名以上のメンバーが必要です');
      return;
    }
    if (!name) {
      setError('チーム名を入力してください');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, memberIds }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'チームの作成に失敗しました');
      }

      router.push('/teams');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">チーム作成</h1>
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
            <p>{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
              チーム名
            </label>
            <input
              type="text"
              id="teamName"
              name="teamName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="3文字以下で入力してください"
              maxLength={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メンバー選択（3名以上）
            </label>
            <MemberSelect
              selectedIds={memberIds}
              onChange={setMemberIds}
            />
            {memberIds.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                選択中: {memberIds.length}名
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading || memberIds.length < 3 || !name}
              className={`inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                (isLoading || memberIds.length < 3 || !name) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? '作成中...' : 'チームを作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 