import { defineConfig } from 'vitepress'

export default defineConfig({
  // GitHub Pages 项目站点路径：https://775325124.github.io/theme-component-docs/
  // 若以后绑定独立域名（站点在根路径），把下面改回 '/'
  base: '/theme-component-docs/',
  title: '主题组件配置中心',
  description: '统筹所有主题的自定义组件 · 运营向说明',
  lang: 'zh-CN',
  lastUpdated: true,
  themeConfig: {
    search: {
      provider: 'local',
    },
    outline: {
      level: [2, 3],
      label: '本页目录',
    },
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '深色模式',
    lightModeSwitchTitle: '切换到浅色',
    darkModeSwitchTitle: '切换到深色',
    nav: [
      { text: '首页', link: '/' },
      { text: '组件总览', link: '/components/' },
      { text: '全流程', link: '/workflow' },
      { text: '更新与发布', link: '/guide/deploy-update' },
    ],
    sidebar: [
      {
        text: '开始',
        items: [
          { text: '首页', link: '/' },
          { text: '独立仓库全流程', link: '/workflow' },
          { text: '如何把模块加到页面', link: '/guide/common' },
        ],
      },
      {
        text: '组件说明',
        items: [
          { text: '组件总览', link: '/components/' },
          { text: '人气视频', link: '/components/kol-recommend' },
          { text: '红人模块（图文）', link: '/components/text-columns-renman' },
          { text: '红人模块（视频轮播）', link: '/components/text-columns-renman2' },
          { text: '常见问题', link: '/components/troubleshooting' },
        ],
      },
      {
        text: '维护与发布',
        items: [
          { text: '登记新组件（跨主题）', link: '/guide/registry' },
          { text: '如何更新在线手册', link: '/guide/deploy-update' },
          { text: 'GitHub Pages 补充说明', link: '/PUBLISH_TO_GITHUB' },
        ],
      },
    ],
    socialLinks: [],
  },
})
