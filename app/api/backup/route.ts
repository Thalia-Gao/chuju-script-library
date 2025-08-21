/**
 * Jscbc: 备份 API，导出 data 与 content
 */
import { NextResponse } from "next/server";
import path from "path";
import archiver from "archiver";
import fs from "fs";

export async function GET() {
  const tmp = path.join(process.cwd(), "data", `backup-${Date.now()}.zip`);
  await new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(tmp);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", () => resolve());
    archive.on("error", (err: any) => reject(err));
    archive.pipe(output);
    archive.directory(path.join(process.cwd(), "data"), "data");
    archive.directory(path.join(process.cwd(), "content"), "content");
    archive.finalize();
  });
  const buf = fs.readFileSync(tmp);
  try { fs.unlinkSync(tmp); } catch {}
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=chuju-backup.zip`
    }
  });
} 