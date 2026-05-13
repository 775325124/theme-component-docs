# 常见问题 FAQ

按你的角色找问题。

[[toc]]

## 🛍️ 运营 / 客服 / 店主

### 后台找不到某个分区 / 模块

主题没装上对应模块。请联系**技术 / 建站同事**确认这个主题（kenpogen / daramiyo / Giipet 等）是否带了对应 section。

### 某张卡片 / 某条数据不显示

90% 的情况是「**块**」没加，或「**Main Image / Link**」之类必填项漏填。

进对应分区 → 看每一个**块**是否都填了图、商品、链接 → 再保存预览。

### 红人模块 / 轮播类不动、空白

1. 先**完全刷新**页面（`Cmd+Shift+R`），有时是缓存
2. 检查这个分区里是不是只加了 1 个块——很多轮播需要 ≥ 2 个块才有"轮播效果"
3. 仍不行联系技术，让 ta 看是否主题缺配套 JS / CSS

### 视频不自动播

**正常现象**，绝大多数手机浏览器要求"静音"才能自动播放。给视频块勾上「自动播放」+ 浏览器默认会静音；想让用户听声音，需要 ta 主动点击播放图标。

### 改完保存了，网站看不到变化

- 这个分区是不是被「**隐藏**」了？（编辑器里左侧每个分区有一个眼睛图标）
- 改的是不是另一个**模板**（首页 vs 商品详情页 vs 列表页）？
- 浏览器缓存：换个**无痕窗口**确认
- 缓存仍在的话联系技术清 CDN

### 想把某店铺的配置复制到另一店铺

后台没有现成的复制功能。需要技术：把对应主题的 `templates/*.json` 复制过去 + 调整商品/合集 ID。

### 客户问：为什么我看到的链接不能用

- 链接末尾**加斜杠** `/`（很多 GitHub Pages 项目站点 URL 没斜杠会出问题）
- 公开站点：任何人都能看；私有仓库的 Pages 客户看不到，要换 Netlify 等

---

## 🛠️ 技术维护

<div v-pre>

### 主题里加了新 section，handbook 怎么补文档

最省事：在 Cursor 里说一句「**我在 kenpogen 加了 XX 组件，补 handbook**」，agent 会按 [`handbook-component-sync`](https://github.com/775325124/theme-component-docs) skill 全自动写 + 提交 + 推送。

手动流程：复制 [产品排行榜文档](/components/product-ranking) 作模板，改完按 [更新流程](/guide/deploy-update) 走。

### 改了 schema 字段，文档没自动同步

handbook 没监听主题仓库 commit。**改完 schema 后请回 handbook 把表格里的标签 / 默认值改一遍**（每篇组件文档底部有「维护者参考」节，标了对应代码位置）。

### 三种模板语言怎么区分（Shopline Sline / Handlebars / Shopify Liquid）

见 [主题版本与模板语言差异](/guide/version-difference)。30 秒判断法：

- 看到 `sections/<name>.liquid` 扁平 + `{% if %}` `{% schema %}` → **Shopify Liquid**（Giipet）
- 看到 `sections/<name>/<name>.html` 文件夹 + `{{#if}}` `{{#schema}}` `| asset_url()` → **Shopline 3.x · Sline**（daramiyo / kenpogen / pettena-kr / sosove-jp）
- 看到 `sections/<name>.html` 扁平 + `{{#if}}` + helper → **Shopline 2.x · Handlebars**（目前未使用）

### `git commit -m` 报 `unknown option 'trailer'`

系统 git 太旧（< 2.32），Cursor 会注入 `--trailer`。修法：

```bash
brew install git
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
```

或者退一步用底层命令：

```bash
TREE=$(git write-tree)
COMMIT=$(echo "your message" | git commit-tree $TREE -p HEAD)
git update-ref HEAD $COMMIT
```

### VitePress build 失败：`unknown option 'trailer'` 类的语法错误

多半是 Markdown 里有 `{{...}}` 被 Vue 当成模板。两种解法：

1. 把整段用 `<div v-pre>...</div>` 包起来
2. 不要在 inline code 里写 `{{#xxx}}`，改成 fenced code block 或纯文字描述

### 添加新代码片段

在 Cursor 里说「**我加了个自定义代码片段**」即可。手动：复制 [片段模板](/snippets/template) 改写，回 [片段总览](/snippets/) 表格加一行。

</div>

---

## 🔗 客户 / 合作方

### 我没有 GitHub 账号，能看吗

可以。本站是公开 GitHub Pages，**有链接就能看**。把链接发邮件 / 微信 / 飞书 都行。

### 能下载 / 离线看吗

**目前不支持**。本站全程线上。如果需要离线手册，请联系对接的运营 / 技术同事，他们可以打印 PDF 或导出。

### 我想自己尝试改文档

公开仓库，欢迎用 GitHub 账号在每页底部点「**在 GitHub 上编辑此页**」提 Pull Request。

---

## 反馈这页

::: tip
没找到你的问题？或者答案过期了？  
直接到本页底部点「**报告问题 / 提建议**」给我们提一条，我们会更新。
:::
