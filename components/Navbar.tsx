'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [initials, setInitials] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const json = await res.json();
        const username: string | undefined = json?.user?.username;
        const r: string | undefined = json?.user?.role;
        if (username) {
          const init = username.slice(0, 3).toUpperCase();
          setInitials(init);
          setRole(r || null);
        } else {
          setInitials(null);
          setRole(null);
        }
      } catch {}
    };
    load();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setInitials(null);
      setRole(null);
      router.push('/');
    } catch {}
  };

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
            {initials ? (
              <div className="flex items-center space-x-3">
                <div className="px-3 py-2 rounded-lg bg-gray-100 text-gray-800 font-semibold" title="已登录用户">
                  {initials}
                </div>
                <button onClick={handleLogout} className="text-gray-700 hover:text-red-600 font-medium">退出</button>
              </div>
            ) : (
              <Link href="/login" className={linkStyles('/login')}>
                登录/注册
              </Link>
            )}
            {role === 'admin' && (
              <Link href="/admin" className={adminLinkStyles('/admin')}>
                管理后台
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
