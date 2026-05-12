# 组件配置手册 · 独立仓库全流程（统筹所有主题）

本文说明：**如何把「组件手册」从某个主题里挪出去**，变成**单独一个 Git 仓库**，用来**登记、编写、发布**你名下所有主题/店铺里新增的自定义组件说明；以及你**已有 Git 托管**时，从建仓库到日常更新的推荐步骤。

> 手册的定位：**不是**某个主题的子文件夹，而是**跨项目、跨客户**的「组件说明与配置中心」。主题仓库只放代码；手册仓库只放运营向文档与站点构建配置。

---

## 一、你要准备什么

| 项目 | 说明 |
|------|------|
| Git 账号 | 例如 GitHub（你已具备） |
| 本机 Node.js | 建议 18+，用于本地 `npm run dev` 预览 |
| 命名建议 | 仓库名例如 `theme-component-docs` / `shopline-handbook`，避免和具体主题同名 |

---

## 二、第一次：从当前主题「挪出」手册（独立成仓）

### 步骤 1：在本机新建目录（不要放在主题 `.git` 里面当子目录长期维护）

1. 复制 **`handbook` 整个文件夹**到本机任意位置，例如：  
   `~/项目/theme-component-docs`
2. **不要**复制父级主题里的 `.git`。若误拷了父仓库的 `.git`，删掉，在手册目录里重新初始化：

   ```bash
   cd ~/项目/theme-component-docs
   rm -rf .git    # 仅当存在且是父仓库时不要误删——确认当前目录是手册根目录再执行
   git init
   ```

### 步骤 2：确认手册根目录包含这些关键内容

- `package.json`、`package-lock.json`
- `.vitepress/`（站点配置）
- `index.md`、`guide/`、`components/`
- `.github/workflows/deploy-github-pages.yml`（自动发布用）

### 步骤 3：在你现有的 Git 平台新建「空仓库」

- GitHub：**New repository**，不要勾选 README / .gitignore（保持空）。
- 记下仓库地址，例如：  
  `https://github.com/你的组织/theme-component-docs.git`

### 步骤 4：绑定远程并推送

```bash
cd ~/项目/theme-component-docs
git add .
git commit -m "chore: init component handbook (standalone)"
git branch -M main
git remote add origin https://github.com/你的组织/theme-component-docs.git
git push -u origin main
```

### 步骤 5：开启「网站」托管（GitHub Pages + Actions）

1. 打开该仓库 → **Settings** → **Pages**。
2. **Build and deployment** → Source 选择 **GitHub Actions**。
3. 打开 **Actions** 页签，确认 **Deploy handbook to GitHub Pages** 已成功跑完（绿色）。
4. 回到 **Settings → Pages**，复制显示的站点地址（一般为 `https://<用户或组织>.github.io/<仓库名>/`）。

### 步骤 6：若页面样式错乱或空白

站点在子路径时，必须配置 `base`：

1. 编辑 `.vitepress/config.mts`，设置：  
   `base: '/你的仓库名/'`（前后都要有 `/`，仓库名与 GitHub 上完全一致）。
2. `git commit` → `git push`，等 Actions 再次成功后再访问。

### 步骤 7：把链接发给「其他用户」

- **公开仓库**：任何拿到 **HTTPS 链接**的人即可阅读，无需 GitHub 账号。
- **私有仓库**：免费 Pages 通常不适合对外公开，需改用 Netlify/Vercel 或企业静态站，此处不展开。

---

## 三、日常：每在一个主题里「新增组件」时，手册仓库要做什么

**原则：** 代码在哪个主题仓库改，**说明以手册仓库为唯一对外出口**（避免每个主题各写一份、互相不一致）。

### 每次新增一个组件，建议按顺序做

1. **登记**  
   打开手册仓库里的 `components/index.md`（组件总览表），**加一行**：  
   - 后台显示名称  
   - 一句话用途  
   - **适用哪些主题/客户**（例如：daramiyo、kenpogen、sosove-jp）  
   - 链接到该组件的详细页（下一步新建的文件）

2. **写详细页**  
   在 `components/` 下新建一篇 Markdown（可复制现有组件页改标题与表格），只写：运营在后台要点哪里、每项填什么、常见问题。

3. **侧栏**（可选）  
   若希望左侧导航也出现新条目，编辑 `.vitepress/config.mts` 里 `sidebar` 对应分组，增加一条 `link`。

4. **本地预览（推荐）**  

   ```bash
   npm install   # 第一次或依赖变更时
   npm run dev
   ```

   浏览器检查排版与链接。

5. **发布**  

   ```bash
   git add .
   git commit -m "docs: add xxx component for kenpogen"
   git push
   ```

   等待 GitHub Actions 完成（约 1～2 分钟），刷新线上手册。

6. **主题仓库侧（可选）**  
   在具体主题里只留**一行**指向手册网址（README 或内部 wiki），不必再维护长篇 Markdown。

---

## 四、与多个主题仓库的协作方式（选一种长期执行）

| 方式 | 适合 | 做法要点 |
|------|------|----------|
| **手册仓单独维护**（推荐） | 组件多、人多 | 所有说明只在手册仓改；主题仓不拷手册全文。 |
| **双仓手动同步** | 偶尔从主题里改了一版 | 改完复制到手册仓再 push，易忘，不推荐长期用。 |
| **Submodule** | 强绑定版本 | 主题仓挂 `handbook` 子模块，上手成本高。 |

对你当前目标，**推荐：手册一个独立仓库 + 所有主题只链到该站点**。

---

## 五、检查清单（发布前扫一眼）

- [ ] `npm run build` 本地能成功（与线上 Actions 一致）。
- [ ] 新组件已在 `components/index.md` 总览表中登记「适用主题」。
- [ ] GitHub Pages 的 `base` 与仓库名一致（子路径站点时）。
- [ ] 对外发出的 URL 已用**无痕窗口**测过，非登录态可打开（公开站）。

---

## 六、相关文件（在本手册项目内）

- [把在线手册放到 GitHub](/PUBLISH_TO_GITHUB) — Pages、子路径 `base` 的补充说明。
- [如何更新在线手册](./guide/deploy-update.md) — 构建命令、其他托管方式。
- [如何在手册里登记新组件](./guide/registry) — 新增组件时的编辑位置说明。

---

*若不用 `main` 分支，需同步修改 `.github/workflows/deploy-github-pages.yml` 里的分支名。*
