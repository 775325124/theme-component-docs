---
layout: home
feedback: false

hero:
  name: 主题组件配置中心
  text: 统筹所有主题的自定义组件
  tagline: 运营 / 技术 / 客户三类人，一个站点。推送即更新。
  image:
    src: /hero.svg
    alt: 主题组件配置中心
  actions:
    - theme: brand
      text: 组件总览
      link: /components/
    - theme: alt
      text: 自定义代码片段
      link: /snippets/

features:
  - icon: 🎯
    title: 跨主题、跨客户
    details: 同一组件若在多个主题上线，在总览里标注适用对象；文档只维护一份。
  - icon: 📖
    title: 运营友好
    details: 后台点哪里、每项填什么；不写代码路径，客户打开链接就能看。
  - icon: 🚀
    title: Git 推送后自动发站
    details: 配合 GitHub Pages + Actions，push 后约 1～2 分钟网站更新。
---

## 我是…

<div class="role-cards">
  <a class="role-card" href="/theme-component-docs/components/">
    <span class="role-icon">🛍️</span>
    <h3>运营 / 客服 / 店主</h3>
    <p>看后台每个分区怎么填、每个字段什么效果。无需 GitHub 账号。</p>
  </a>
  <a class="role-card" href="/theme-component-docs/guide/version-difference">
    <span class="role-icon">🛠️</span>
    <h3>技术维护者</h3>
    <p>主题代码结构、Shopline 3.x（Sline）/ Shopify（Liquid）/ Shopline 2.x（Handlebars）差异、自定义代码片段库。</p>
  </a>
  <a class="role-card" href="/theme-component-docs/components/">
    <span class="role-icon">🔗</span>
    <h3>客户 / 合作方</h3>
    <p>把任意页面链接发给客户即可。本站公开访问。</p>
  </a>
  <a class="role-card" href="/theme-component-docs/guide/changelog">
    <span class="role-icon">📰</span>
    <h3>最近更新</h3>
    <p>查看最近一次新增 / 改动的组件与片段。</p>
  </a>
</div>

## 站内结构

- **[组件总览](/components/)** — 所有运营向自定义组件，按平台 / 模板语言分组
- **[Shopline 应用插件](/apps/)** — 应用脚本配置（元字段 + Shopline 后台），如多件购买选择器
- **[代码片段库](/snippets/)** — 技术向：常用 CSS/JS 注入片段，按场景检索
- **[主题版本与模板语言差异](/guide/version-difference)** — Shopline 3.x（Sline） / Shopify（Liquid） / Shopline 2.x（Handlebars）实现差异
- **[FAQ](/components/troubleshooting)** — 三类用户常见问题
- **[维护与发布](/guide/deploy-update)** — 改完手册怎么上线

## 和主题代码的关系

- **主题仓库**（如 daramiyo、kenpogen）：只放主题代码与资源。
- **本手册仓库**：只放组件说明与 VitePress 站点；**登记你所有主题里新增的自定义组件**。

具体新组件登记流程见 **[如何在手册里登记新组件](/guide/registry)**；第一次从主题里迁出独立成仓的全流程见 **[独立仓库全流程](/workflow)**。
