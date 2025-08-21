/**
 * Jscbc: 应用根布局，复用站点导航与品牌风格
 */
/**
 * Jscbc: 应用根布局，复用站点导航与品牌风格
 */
import "./globals.css";
import Navbar from "../components/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <title>楚剧荟・剧本数字典藏馆</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-50 min-h-screen flex flex-col">
        <Navbar />
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