---
layout: home

hero:
  name: 主题组件配置中心
  text: 统筹所有主题的自定义组件
  tagline: 运营向说明 · 与具体主题仓库分离 · 推送即更新在线站点
  actions:
    - theme: brand
      text: 组件总览
      link: /components/
    - theme: alt
      text: 独立仓库操作流程
      link: /workflow

features:
  - title: 跨主题、跨客户
    details: 同一组件若在多个主题上线，在总览里标注适用对象；文档只维护一份。
  - title: 只给运营看的内容
    details: 后台点哪里、每项填什么；不写代码路径，客户打开链接就能看。
  - title: Git 推送后自动发站
    details: 配合 GitHub Pages + Actions，push 后约 1～2 分钟网站更新。
---

### 谁适合看？

店主、运营、客服、合作方——**不需要** GitHub 账号（公开站点时），有链接即可。

### 和主题代码的关系

- **主题仓库**（如 daramiyo、kenpogen）：只放主题代码与资源。  
- **本手册仓库**：只放组件说明与 VitePress 站点；**登记你所有主题里新增的自定义组件**。

### 第一次部署 / 从别处迁入本仓库

请按 **[独立仓库全流程](/workflow)** 操作（复制本仓库到独立 Git、开 Pages、设 `base` 等）。

### 日常登记新组件

见 **[如何在手册里登记新组件](/guide/registry)**。
