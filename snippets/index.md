# 自定义代码片段库

技术维护者用的代码片段库。**按场景组织**——同一个场景下，如果三种模板语言（Shopline 3.x Sline / Shopline 2.x Handlebars / Shopify Liquid）都需要写法，会在同一篇文章里用代码切换标签同时给出。

> 这里只是**文档记录**，不是自动注入。真要在某个店铺生效，仍然需要技术同事把对应代码手写到主题文件里（或者通过店铺后台的"自定义代码 / 注入脚本"功能粘进去，如果你的 Shopline / Shopify 套餐支持的话）。

## 片段索引

| 场景 | 一句话用途 | 平台 / 语言 | 首次客户/主题 | 详情 |
|------|-----------|-----------|-------------|------|
| **修改 DOM 文字** | 按选择器改元素文案，支持晚加载节点 | 全平台 JS | 通用 | [打开](/snippets/update-dom-text) |

## 怎么加新片段

1. 复制 [`template.md`](/snippets/template) 为 `<场景-slug>.md`（kebab-case 英文）
2. 填顶部「元信息」徽章 + 用途 + 代码（用 `::: code-group` 给出 Sline / Handlebars / Liquid 写法）
3. 回到本页表格末尾追加一行
4. 在 [`.vitepress/config.mts`](https://github.com/775325124/theme-component-docs/blob/main/.vitepress/config.mts) 的 sidebar「自定义代码片段」分组里追加一项
5. `npm run build` 验证 → `git push`

或者更省事：在 Cursor 里说**「我加了个自定义代码片段」**，agent 会按 [`handbook-component-sync`](https://github.com/775325124/theme-component-docs) skill 自动做完上述步骤。

## 片段写作守则

- **不要写客户敏感信息**：API key、店铺 ID、PII（电话 / 邮箱 / 真实姓名）都不要进库
- **代码尽量自包含**：注释里写依赖（jQuery？某 CDN？）、放置位置（header / 商品页 / 全站）、调过哪些坑
- **同一场景多语言** 就放一篇文章里，文章顶部徽章标"Sline / Handlebars / Liquid 都有"
- **过期片段**：如果某段代码后来主题原生支持了或者改方案了，**不要删**，加 ⚠️ 标记 + 改动记录，方便未来回查
