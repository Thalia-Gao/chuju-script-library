'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const linkStyles = (path: string) => {
    const isActive = pathname === path;
    return `px-4 py-2 rounded-lg font-medium transition-colors ${
      isActive
        ? 'bg-red-600 text-white'
        : 'text-gray-700 hover:text-red-600'
    }`;
  };

  const adminLinkStyles = (path: string) => {
    const isActive = pathname.startsWith(path);
    return `px-4 py-2 rounded-lg font-medium transition-colors ${
      isActive
        ? 'bg-red-600 text-white'
        : 'text-gray-700 hover:text-red-600'
    }`;
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold gradient-text">楚剧荟・剧本数字典藏馆</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/" className={linkStyles('/')}>
              首页
            </Link>
            <Link href="/login" className={linkStyles('/login')}>
              登录/注册
            </Link>
            <Link href="/admin" className={adminLinkStyles('/admin')}>
              管理后台
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
