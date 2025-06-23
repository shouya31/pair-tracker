import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            ペアプロ管理
          </Link>
          <div className="flex items-center space-x-6">
            {/* ユーザー関連 */}
            <div className="relative group">
              <span className="cursor-pointer">ユーザー</span>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                <Link
                  href="/users"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  ユーザー一覧
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  新規ユーザー登録
                </Link>
              </div>
            </div>

            {/* チーム関連 */}
            <div className="relative group">
              <span className="cursor-pointer">チーム</span>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                <Link
                  href="/teams"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  チーム一覧
                </Link>
                <Link
                  href="/teams/create"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  新規チーム作成
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 