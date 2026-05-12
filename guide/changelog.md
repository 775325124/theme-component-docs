# 更新日志

记录手册（**不是主题代码**）的内容变更。新加 / 改 / 删一篇组件文档、一段片段、改版结构都登记在这里。

::: tip 自动化
绝大多数变更由 Cursor Agent Skill 自动生成草稿；如果你的改动是手写的，**请回来这里追加一条**。
:::

## 2026-05

<div class="changelog-item">
<time>2026-05-12</time>

**重大改版**：

- 全站按 **Slate 2.x / 3.x** 双轨分组（侧边栏、组件总览表）
- 新增 [自定义代码片段库](/snippets/)（技术向，按场景组织）
- 新增 [版本差异说明](/guide/version-difference)
- 每页底部加「反馈这一页」按钮，一键到 GitHub Issue
- 首页改为「角色入口」卡片：运营 / 技术 / 客户 三条路径
- 加品牌色（蓝紫渐变）+ logo + 中文优先字体（PingFang / Noto Sans SC）
- 中文搜索改为 bi-gram 分词（搜「红人」也能命中「红人模块」）
- 加 sitemap.xml + robots.txt + OG / Twitter Card meta
- 加 Markdown lint（pre-commit）+ PR CI（lint + build）
- 加 Dependabot（每周自动升 VitePress 等依赖）

新增 / 改写的组件文档：

- [产品排行榜](/components/product-ranking) — Tab 切换 + 排名徽章 + 滚动置顶（kenpogen 新增）
- [Tab 切换图文](/components/tab-switcher) — 顶部 Tab + 大图 + 3 商品卡（kenpogen 补文档）
- [图片轮播 Plus](/components/image-swiper-more) — 自定义每屏数量、支持小数（kenpogen 补文档）
- [人气视频](/components/kol-recommend) / [红人模块（图文）](/components/text-columns-renman) / [红人模块（视频轮播）](/components/text-columns-renman2) — 加版本徽章 + 维护者参考块

</div>

<div class="changelog-item">
<time>2026-05-12（早前）</time>

- 首次将 handbook 从 daramiyo 主题里抽离出来，独立成 GitHub 仓库 `theme-component-docs`
- 上线 GitHub Pages 公开访问链接
- 配齐 Actions 自动部署（push main → 1-2 分钟后更新）
- 收录最早 3 个组件：人气视频、红人模块（图文）、红人模块（视频轮播）

</div>

---

## 怎么读这个页

- **2026-05-12 < 早前**：是历史时间线倒序
- 链接全部用站内绝对路径，方便链接打到聊天工具时仍然能打开
- 每条只列**对运营有影响的改动**；如果只是改了 CSS 颜色这种没改语义的，可不登记

## 想看主题代码改动？

那不在本手册范围。各主题仓库（[kenpogen](https://github.com/...) 等）有自己的 git history。
