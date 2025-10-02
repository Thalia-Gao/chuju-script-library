# 剧本封面静态映射系统

## 概述

为了确保部署时剧本和剧照的正确匹配，项目采用了静态映射系统，将剧本ID与对应的剧照URL写死在代码中，避免依赖动态生成或数据库中的cover_url字段。

## 系统架构

### 1. 静态映射文件
- **文件位置**: `lib/script-covers-mapping.ts`
- **功能**: 包含所有剧本ID与剧照URL的静态映射关系
- **数据来源**: 从数据库自动导出生成

### 2. 生成脚本
- **文件位置**: `scripts/generate-static-mapping.js`
- **功能**: 从数据库导出映射数据并更新静态映射文件
- **使用方法**: `node scripts/generate-static-mapping.js`

### 3. API更新
以下API已更新为使用静态映射：
- `GET /api/scripts` - 剧本列表
- `GET /api/scripts/[id]` - 单个剧本详情
- `GET /api/scripts/special` - 特殊剧本查询
- `app/scripts/[id]/page.tsx` - 剧本详情页面

## 当前数据统计

根据最新生成的映射数据：
- **总计剧本**: 196个有封面的剧本
- **DMX剧照**: 118个
- **Qwen剧照**: 78个
- **SF剧照**: 0个

## 使用方法

### 获取封面URL
```typescript
import { getCoverUrlById, getCoverUrlByTitle } from '@/lib/script-covers-mapping';

// 根据剧本ID获取封面
const coverUrl = getCoverUrlById('script-id-here');

// 根据剧本标题获取封面
const coverUrl = getCoverUrlByTitle('剧本标题');
```

### 检查剧本是否有封面
```typescript
import { hasScriptCover } from '@/lib/script-covers-mapping';

const hasCover = hasScriptCover('script-id-here');
```

### 获取统计信息
```typescript
import { getMappingStats } from '@/lib/script-covers-mapping';

const stats = getMappingStats();
console.log(stats); // { total: 196, dmx: 118, qwen: 78, sf: 0 }
```

## 部署优势

1. **稳定性**: 不依赖动态生成，确保部署后剧照正确显示
2. **性能**: 避免数据库查询，直接从内存中获取映射关系
3. **可维护性**: 映射关系集中管理，便于维护和更新
4. **版本控制**: 映射关系纳入版本控制，变更可追踪

## 更新流程

当需要更新映射关系时：

1. 确保数据库中的cover_url字段已正确设置
2. 运行生成脚本：`node scripts/generate-static-mapping.js`
3. 检查生成的映射文件：`lib/script-covers-mapping.ts`
4. 提交代码变更

## 注意事项

1. **不再依赖数据库**: API不再读取数据库中的cover_url字段
2. **图片文件**: 确保public/stills-*目录下的图片文件在部署时一同上传
3. **路径一致性**: 映射中的URL路径必须与实际文件路径一致
4. **定期更新**: 当添加新剧照时，需要重新生成映射文件

## 相关文件

- `lib/script-covers-mapping.ts` - 静态映射配置
- `scripts/generate-static-mapping.js` - 映射生成脚本
- `scripts/check-dmx-matching.js` - DMX匹配检查脚本
- `scripts/list-dmx-matched.js` - DMX匹配列表脚本
- `scripts/update-covers-from-dmx.js` - DMX封面更新脚本（已废弃） 