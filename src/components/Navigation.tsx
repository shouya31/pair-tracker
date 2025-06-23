'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (menu: string) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  // クリック以外の場所をクリックした時にドロップダウンを閉じる
  const handleClickOutside = () => {
    setActiveDropdown(null);
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Pair Tracker
          </Link>
          <div className="flex items-center space-x-6">
            {/* ユーザー関連 */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDropdown('users');
                }}
                className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <span>ユーザー</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeDropdown === 'users' ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {activeDropdown === 'users' && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={handleClickOutside}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 transform opacity-100 scale-100 transition-all duration-200 origin-top-right">
                    <Link
                      href="/users"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      onClick={() => setActiveDropdown(null)}
                    >
                      ユーザー一覧
                    </Link>
                    <Link
                      href="/register"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      onClick={() => setActiveDropdown(null)}
                    >
                      ユーザー登録
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* チーム関連 */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDropdown('teams');
                }}
                className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <span>チーム</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeDropdown === 'teams' ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {activeDropdown === 'teams' && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={handleClickOutside}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 transform opacity-100 scale-100 transition-all duration-200 origin-top-right">
                    <Link
                      href="/teams"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      onClick={() => setActiveDropdown(null)}
                    >
                      チーム一覧
                    </Link>
                    <Link
                      href="/teams/create"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      onClick={() => setActiveDropdown(null)}
                    >
                      チーム作成
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 