# 截图上传规范

每个组件文档顶部、组件总览缩略图列、片段示例都会用到这个目录里的图。**统一规范**才能让线上视觉一致。

## 命名

| 用途 | 文件名 |
|------|------|
| 组件后台截图 | `<slug>.png`（与 `components/<slug>.md` 同名）<br/>例：`product-ranking.png` |
| 组件前端效果 | `<slug>-frontend.png`（可选） |
| 片段示意 | `snippet-<slug>.png` |

**slug 用 kebab-case 英文小写**，不要中文 / 空格 / 大写。

## 规格

| 项 | 推荐 | 说明 |
|------|------|------|
| 宽度 | **1200~1600 px** | 太宽浪费带宽；太窄看不清字段名 |
| 高度 | 不限 | 但建议单图 < 2000 px，长图拆成多张 |
| 格式 | **PNG** 优先 | 后台 UI 有大面积纯色，PNG 更清晰；运行 `npm run optimize:screenshots` 会自动生成对应 WebP |
| 体积 | **单图 < 200 KB（压缩后）** | 太大影响 GitHub Pages 加载 |

## 压缩流程

提交前**必须**跑：

```bash
npm run optimize:screenshots
```

这会：

1. 把目录里 > 4 KB 的 PNG 都**等比缩到最大 1600 px 宽**
2. **重编码压缩** PNG（quality 82，压缩等级 9）
3. **额外生成同名 .webp**（更小，可选用）

跑完会有控制台日志告诉你每张图原大小→新大小。

## 打码 / 脱敏

**截图里不能出现**：

- 真实客户名 / 店铺 ID / 订单号
- 真实价格（如果是合作客户的实际报价）
- 后台账号邮箱 / 手机
- 库存 / 销售数据
- API key / Token

打码工具推荐：

- macOS 内置截图标记（Cmd+Shift+5 截完直接在弹层里画方块）
- 一般 Mac 图片编辑器（Preview、Adobe Photoshop、Sketch、Figma 等均可）

打码要**纯色矩形遮**，不要只虚化（虚化能还原）。

## 怎么用截图

在 markdown 里：

```markdown
![后台截图](/screenshots/your-slug.png)
```

或者用 `<img>` 标签（避开 VitePress 把路径当 build-time import）：

```html
<img src="/theme-component-docs/screenshots/your-slug.png" alt="...">
```

## 当前占位说明

刚上线时所有组件的截图都是 **1x1 透明 PNG 占位**（70 字节），用来让 build 通过。看到自己组件的文档顶部图框是空的 = 没传真图，**有空时补一下**。

补图：

1. 命名好的 PNG 丢进本目录
2. `npm run optimize:screenshots`
3. `git add public/screenshots/<slug>.png public/screenshots/<slug>.webp && git commit -m "docs(screenshots): 补 XX 组件截图" && git push`
4. 1~2 分钟后线上自动更新
