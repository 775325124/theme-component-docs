# 如何更新在线手册（给技术 / 站长）

手册源文件在仓库 **`handbook/`** 目录，是 Markdown + [VitePress](https://vitepress.dev/) 生成的**静态网站**，没有单独数据库。所谓「实时更新」= **改完文档 → 重新构建 → 把构建结果发布到网页服务器**。

**想放到 GitHub、推代码后自动出网站、把链接发给其他用户？** 请看专门说明：[《把在线手册放到 GitHub》](/PUBLISH_TO_GITHUB) 与 **[独立仓库全流程](/workflow)**。

## 1. 本地改文档、预览

```bash
cd handbook
npm install
npm run dev
```

浏览器打开终端里提示的地址（一般是 `http://localhost:5173`），边改 `.md` 边刷新即可。

## 2. 生成可上传的静态文件

```bash
cd handbook
npm run build
```

生成结果在 **`handbook/.vitepress/dist`**。把该目录里的全部文件上传到你的静态空间即可访问。

## 3. 常见发布方式（任选一种）

| 方式 | 说明 |
|------|------|
| **公司 OSS / CDN / 静态主机** | 把 `dist` 整包上传，绑定域名（如 `docs.xxx.com`）。每次更新后覆盖上传。 |
| **Netlify / Vercel** | 连接 Git 仓库，构建命令填 `cd handbook && npm install && npm run build`，发布目录填 `handbook/.vitepress/dist`。推送代码即自动构建发布。 |
| **GitHub Pages** | 可用 GitHub Actions 在 push 时执行上述 build，把 `dist` 推到 `gh-pages` 分支或 Pages 工件。若仓库不在根目录，需在 VitePress 的 `base` 配置子路径（见下）。 |

### 若手册部署在子路径（例如 `https://site.com/handbook/`）

编辑 `handbook/.vitepress/config.mts`，增加：

```ts
export default defineConfig({
  base: '/handbook/',
  // ...其余不变
})
```

再重新 `npm run build` 并上传。

## 4. 以后加新组件文档怎么做

1. 在 `handbook/components/` 新建一篇 `xxx.md`（可复制现有组件页改内容）。
2. 打开 `handbook/components/index.md`，在总览表格里加一行。
3. 打开 `handbook/.vitepress/config.mts`，在 `sidebar` →「组件说明」里加一条链接。
4. 本地 `npm run dev` 检查无误后 `npm run build` 并发布。

运营同事只需看线上地址；**不需要**安装 Node，除非要在本机预览。
