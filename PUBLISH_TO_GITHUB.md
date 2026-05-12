# 把在线手册放到 GitHub（给同事 / 客户一个链接就能看）

**结论先说：**

| 做法 | 能不能「推送就看到」 | 谁能看 |
|------|----------------------|--------|
| 只把项目推到 GitHub，**不开**网页托管 | 不能。GitHub 上只是源码，普通人不会用。 | 只有有仓库权限的人 |
| 推到 GitHub + **打开 GitHub Pages**（下面按步骤做） | 可以。每次推 `main` 大约 1～2 分钟后网站自动更新。 | **公开仓库**：任何知道链接的人；**私有仓库**：需 GitHub 付费或换 Netlify 等 |

所以：**单独建一个 GitHub 仓库 + 用本目录作为仓库根目录 + 开启 Pages**，就能实现你说的「上传（推送）后更新」，并把链接发给其他用户。

---

## 推荐结构：手册单独一个仓库（和主题分开）

主题仓库（`daramiyo`）经常改代码；手册给运营看，**单独仓库**更清晰，权限也好分开。

### 做法 A：从本主题里拷出去（第一次）

1. 在本机复制整个 **`handbook`** 文件夹到一个新位置，例如 `~/shop-theme-handbook`（名字自定）。
2. 在新文件夹里删掉旧的 git 记录（如果复制时带上了父仓库的 `.git` 不要删错——应只保留手册自己的）：
   ```bash
   cd ~/shop-theme-handbook
   rm -rf .git    # 若该文件夹里没有 .git 可忽略
   git init
   git add .
   git commit -m "init: theme component handbook"
   ```
3. 在 GitHub 网页上 **New repository**，建一个空仓库（不要勾选 README），例如 `shop-theme-handbook`。
4. 按 GitHub 提示绑定远程并推送：
   ```bash
   git remote add origin https://github.com/你的用户名/shop-theme-handbook.git
   git branch -M main
   git push -u origin main
   ```

### 做法 B：以后改主题里的手册怎么同步

你在某个主题仓库里若还留着 `handbook` 副本，改完后应**以独立手册仓为准**：把变更合并或复制到**组件手册独立仓库**再 `git push`，避免两处长期分叉。长期推荐只在独立仓库里编辑手册。

---

## 开启 GitHub Pages（必须做，别人才能浏览器访问）

1. 打开该仓库 GitHub 页面 → **Settings** → 左侧 **Pages**。
2. **Build and deployment** → Source 选 **GitHub Actions**（不要选 Deploy from a branch 的旧方式，否则和本仓库自带的工作流冲突）。
3. 第一次 push 带 `.github/workflows/deploy-github-pages.yml` 的 `main` 后，到 **Actions** 里应出现绿色成功的 **Deploy handbook to GitHub Pages**。
4. 再回到 **Settings → Pages**，上面会显示站点地址，一般是：
   - `https://<你的用户名>.github.io/<仓库名>/`

### 若打开是空白或样式乱

说明站点在**子路径**下，需要改一处配置：

1. 编辑本仓库里的 `/.vitepress/config.mts`。
2. 把 `base` 改成你的**仓库名**（注意前后斜杠），例如仓库叫 `shop-theme-handbook`：

   ```ts
   export default defineConfig({
     base: '/shop-theme-handbook/',
     // ...
   })
   ```

3. 提交推送，等 Actions 跑完再刷新页面。

若你绑定的是**独立域名**且网站在根路径，则保持 `base: '/'` 即可。

---

## 「实时」到底是怎样

- **不是**像在线文档那样你打字别人秒开同步；而是：**你 `git push` → GitHub 自动构建 → 1～2 分钟后网页变成新版本**。
- 其他用户：**不需要** GitHub 账号，只要有最终 **https 链接** 就能在浏览器里看（公开仓库 + Pages 时）。

---

## 私有仓库能不能给客户看

- GitHub 私有仓库的 **免费** Pages 一般只对仓库成员开放，**不适合**「随便给客户一个公网链接」。
- 若必须私有又给客户看：可用 **Netlify / Vercel** 连接私有 Git 并设密码 / IP 限制，或公司自己的静态服务器上传 `npm run build` 生成的 `.vitepress/dist`。

---

## 本仓库已包含

- `package.json`、`package-lock.json`：本地执行 `npm install` / `npm run dev` / `npm run build`。
- `.github/workflows/deploy-github-pages.yml`：**推 main 自动部署 Pages**。

把本文件夹作为 **Git 仓库根目录** 推到 GitHub 后即可使用。
