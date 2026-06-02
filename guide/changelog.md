# 更新日志

记录手册（**不是主题代码**）的内容变更。新加 / 改 / 删一篇组件文档、一段片段、改版结构都登记在这里。

::: tip 自动化
绝大多数变更由 Cursor Agent Skill 自动生成草稿；如果你的改动是手写的，**请回来这里追加一条**。
:::

## 2026-05

<div class="changelog-item">
<time>2026-05-29</time>

**应用插件**：[自定义购买选择器](/apps/product-variant-picker2) 补充 Shopline 平台配置钉钉文档链接；统一称为「应用组件」，不再使用「弹层」表述。

</div>

<div class="changelog-item">
<time>2026-05-29</time>

**组件移植**：产品排行榜 section 同步至 **sosove-jp** 主题；[文档适用范围](/components/product-ranking) 已更新。

</div>

<div class="changelog-item">
<time>2026-05-19</time>

**应用插件**：[自定义购买选择器](/apps/product-variant-picker2) 补充「须配合 Shopline 自动折扣、元字段与后台折扣逐档对齐」说明及对照表。

</div>

<div class="changelog-item">
<time>2026-05-19</time>

**组件文档同步（kenpogen schema 更新）**：[产品排行榜](/components/product-ranking)、[红人模块（图文）](/components/text-columns-renman)、[红人模块（视频）](/components/text-columns-renman2) — 标题/副标题字号改为主题 typography 下拉选项说明；新增 [热门标签](/components/hot-tags)、[通知消息](/components/notice) 文档。

</div>

<div class="changelog-item">
<time>2026-05-19</time>

**kenpogen 组件更新**：[热销商品](/components/best-sellers) 新文档 + 前台截图；[移动端悬浮购买条](/components/sticky-purchase) 商品详情 block 说明。

</div>

<div class="changelog-item">
<time>2026-05-19</time>

**新增板块**： [Shopline 应用插件](/apps/)，与主题组件分开；首篇 [自定义购买选择器 product-variant-picker2](/apps/product-variant-picker2)（商品元字段 + Shopline 应用配置）。

</div>

<div class="changelog-item">
<time>2026-05-13</time>

**重要事实修正**：之前把 Shopline 主题统一称为 "Slate 2.x / 3.x"（错——Slate 是 Shopify 工具链术语），且把模板语言归属写反了。本次按 [Shopline 官方文档](https://developer.shopline.com/zh-hans-cn/docs/online-store-3-0-themes/bottle) 全部修正：

- 「Slate 3.x」→ **Shopline 3.x · Sline**（daramiyo / kenpogen / pettena-kr / sosove-jp 用的是 Sline，不是"Handlebars-like"）
- 「Slate 2.x（Liquid）」→ 这个其实是 **Shopify Liquid**（Giipet），跟 Shopline 不是一回事
- 新增 **Shopline 2.x · Handlebars** 分组占位（目前未使用）
- 重写 [主题版本与模板语言差异](/guide/version-difference)：现在三栏并排（Sline / Handlebars / Liquid），含官方文档链接和跨语言迁移对照表
- 侧边栏分组按平台/语言重命名
- 6 篇组件文档顶部徽章 + 维护者参考块同步更新
- snippets/template 由"两版"扩展为"三种平台/语言"

</div>

<div class="changelog-item">
<time>2026-05-12</time>

**重大改版**：

- 全站按主题版本分组（侧边栏、组件总览表）
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
