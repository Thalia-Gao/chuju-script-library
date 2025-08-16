/**
 * Jscbc: 首页页面
 */
import dynamic from "next/dynamic";

const HomeClient = dynamic(() => import("@/components/HomeClient"), { ssr: false });

export default function Page() {
  return <HomeClient />;
} 