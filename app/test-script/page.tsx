import { getCoverUrlById } from "@/lib/script-covers-mapping";
import ScriptCoverImage from "@/components/ScriptCoverImage";

export default function TestScriptPage() {
  const scriptId = "C2358DCA375474D1CBE8D5019F9DBC46";
  const coverUrl = getCoverUrlById(scriptId);
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">测试剧本详情页面</h1>
        
        <div className="bg-white shadow-xl rounded-lg overflow-hidden p-8">
          <h2 className="text-2xl font-bold mb-4">逼休自缢</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">剧本ID</span>
                  <p className="text-lg">{scriptId}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">封面URL</span>
                  <p className="text-lg">{coverUrl || "无封面"}</p>
                </div>
              </div>
            </div>

            {/* 只显示一张剧照 */}
            <div className="lg:col-span-1">
              {coverUrl && (
                <div className="bg-gray-100 rounded-lg overflow-hidden">
                  <ScriptCoverImage
                    src={coverUrl}
                    alt="《逼休自缢》剧照"
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
