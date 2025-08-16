/**
 * Jscbc: 应用根布局，复用站点导航与品牌风格
 */
import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <title>楚剧荟・剧本数字典藏馆</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-50 min-h-screen flex flex-col">
        <nav className="bg-white shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold gradient-text">楚剧荟・剧本数字典藏馆</span>
              </Link>
              <div className="flex items-center space-x-6">
                <Link href="/" className={`text-gray-700 hover:text-red-600 font-medium`}>首页</Link>
                <Link href="/login" className={`text-gray-700 hover:text-red-600 font-medium`}>登录</Link>
                <Link href="/register" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">注册</Link>
                <Link href="/admin" className={`bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900`}>管理后台</Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1 min-h-[60vh]">{children}</main>
        {/* Jscbc: 页脚 */}
        <footer className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600 text-sm">
            <div>© {new Date().getFullYear()} 楚剧荟・剧本数字典藏馆，版权所有。</div>
            <div className="mt-2 text-gray-500">一个致力于保护、传承和发扬楚地戏曲文化的公益项目。</div>
          </div>
        </footer>
      </body>
    </html>
  );
} 