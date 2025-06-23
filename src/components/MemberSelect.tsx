'use client';

import { useEffect, useState } from 'react';

type User = {
  id: string;
  name: string;
};

type Props = {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export function MemberSelect({ selectedIds, onChange }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('ユーザー情報の取得に失敗しました');
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleCheckboxChange = (userId: string) => {
    const newSelectedIds = selectedIds.includes(userId)
      ? selectedIds.filter(id => id !== userId)
      : [...selectedIds, userId];
    onChange(newSelectedIds);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="border border-gray-300 rounded-md p-4">
        <div className="text-center">
          <p className="text-gray-700 mb-4">在籍中のユーザーが見つかりません</p>
          <a
            href="/register"
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
          >
            ユーザーを登録する →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-md divide-y divide-gray-200">
      {users.map(user => (
        <label
          key={user.id}
          className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(user.id)}
            onChange={() => handleCheckboxChange(user.id)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <span className="ml-3 text-sm text-gray-700">{user.name}</span>
        </label>
      ))}
    </div>
  );
} 