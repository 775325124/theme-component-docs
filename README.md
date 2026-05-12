# 主题组件在线手册（handbook）

运营向说明站点，技术栈：[VitePress](https://vitepress.dev/) + Markdown。

## 常用命令

```bash
cd handbook
npm install
npm run dev      # 本地预览，改即热更新
npm run build    # 输出静态站到 .vitepress/dist
npm run preview  # 本地预览构建结果
```

## 目录说明

| 路径 | 作用 |
|------|------|
| `index.md` | 首页 |
| `guide/common.md` | 通用：如何添加分区 |
| `guide/deploy-update.md` | 如何构建、部署、加新页 |
| `components/*.md` | 各组件说明（可继续增加） |
| `.vitepress/config.mts` | 站点标题、侧栏、搜索 |

发布与 CI 说明见 [部署文档](./guide/deploy-update.md)。**单独推 GitHub、给客户公网链接：** 见 [PUBLISH_TO_GITHUB.md](./PUBLISH_TO_GITHUB.md) 与 [全流程 workflow.md](./workflow.md)。
# theme-component-docs
