import { defineConfig } from 'vitepress'

const SITE_URL = 'https://775325124.github.io/theme-component-docs/'

export default defineConfig({
  // GitHub Pages 项目站点路径：https://775325124.github.io/theme-component-docs/
  // 若以后绑定独立域名（站点在根路径），把下面改回 '/'
  base: '/theme-component-docs/',
  title: '主题组件配置中心',
  description: '统筹所有主题的自定义组件 · 运营向说明',
  lang: 'zh-CN',
  lastUpdated: true,
  cleanUrls: false,
  srcExclude: ['**/node_modules/**', '**/public/**'],
  sitemap: {
    hostname: SITE_URL,
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/theme-component-docs/logo.svg' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: '主题组件配置中心' }],
    ['meta', { property: 'og:image', content: SITE_URL + 'og-cover.png' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: SITE_URL + 'og-cover.png' }],
  ],
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: '主题组件配置中心',
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档',
          },
          modal: {
            displayDetails: '显示详情',
            resetButtonTitle: '清空',
            backButtonTitle: '返回',
            noResultsText: '没有匹配结果',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭',
            },
          },
        },
        miniSearch: {
          // F4 中文 bi-gram 分词：把连续 2 个汉字作为一个 token
          // 既支持「红人模块」精确命中也允许「红人」「人模」局部命中
          options: {
            tokenize: (text: string) => {
              const tokens: string[] = []
              const cn = /[\u4e00-\u9fff]/
              let i = 0
              while (i < text.length) {
                const ch = text[i]
                if (cn.test(ch)) {
                  tokens.push(ch)
                  if (i + 1 < text.length && cn.test(text[i + 1])) {
                    tokens.push(ch + text[i + 1])
                  }
                  i++
                } else {
                  let j = i
                  while (j < text.length && !cn.test(text[j]) && !/\s/.test(text[j])) j++
                  if (j > i) tokens.push(text.slice(i, j).toLowerCase())
                  while (j < text.length && /\s/.test(text[j])) j++
                  i = j
                }
              }
              return tokens
            },
            processTerm: (term: string) => term.toLowerCase(),
          },
        },
      },
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
    notFound: {
      title: '页面不见了',
      quote: '可能链接搬家了，或者你输错了路径。',
      linkLabel: '回到首页',
      linkText: '回到首页',
      code: '404',
    },
    lastUpdated: {
      text: '上次更新于',
      formatOptions: { dateStyle: 'short', timeStyle: 'short', hour12: false },
    },
    nav: [
      { text: '首页', link: '/' },
      { text: '组件总览', link: '/components/' },
      { text: '代码片段', link: '/snippets/' },
      { text: '应用插件', link: '/apps/' },
      { text: '版本差异', link: '/guide/version-difference' },
      { text: '更新与发布', link: '/guide/deploy-update' },
    ],
    sidebar: [
      {
        text: '开始',
        items: [
          { text: '首页', link: '/' },
          { text: '独立仓库全流程', link: '/workflow' },
          { text: '如何把模块加到页面', link: '/guide/common' },
          { text: '主题版本与模板语言差异', link: '/guide/version-difference' },
        ],
      },
      {
        text: '组件说明（运营向）',
        items: [
          { text: '组件总览', link: '/components/' },
          { text: '常见问题', link: '/components/troubleshooting' },
        ],
      },
      {
        text: 'Shopline 3.x · Sline 主题',
        collapsed: false,
        items: [
          { text: '人气视频', link: '/components/kol-recommend' },
          { text: '红人模块（图文）', link: '/components/text-columns-renman' },
          { text: '红人模块（视频轮播）', link: '/components/text-columns-renman2' },
          { text: '产品排行榜', link: '/components/product-ranking' },
          { text: '热门标签', link: '/components/hot-tags' },
          { text: '通知消息', link: '/components/notice' },
          { text: '热销商品', link: '/components/best-sellers' },
          { text: 'Tab 切换图文', link: '/components/tab-switcher' },
          { text: '图片轮播 Plus', link: '/components/image-swiper-more' },
          { text: '图文锚点', link: '/components/image-text-anchor' },
          { text: '产品描述', link: '/components/product-dec' },
          { text: '产品详情', link: '/components/product-detail' },
          { text: '产品详情导航', link: '/components/product-detail-nav' },
          { text: '产品导航', link: '/components/product-navigation' },
          { text: '产品摘要', link: '/components/product-subtitle' },
          { text: '移动端悬浮购买条', link: '/components/sticky-purchase' },
          { text: '人员穿搭展示', link: '/components/staff-style-coordination' },
        ],
      },
      {
        text: 'Shopify · Liquid 主题（Giipet / pettena-jp）',
        collapsed: false,
        items: [
          { text: '婴儿车对比表', link: '/components/stroller-compare-table' },
          { text: '客户评价', link: '/components/customer-reviews' },
        ],
      },
      {
        text: 'Shopline 2.x · Handlebars 主题',
        collapsed: true,
        items: [
          { text: '（预留分组）', link: '/guide/version-difference' },
        ],
      },
      {
        text: 'Shopline 应用插件',
        collapsed: false,
        items: [
          { text: '插件总览', link: '/apps/' },
          { text: '自定义购买选择器', link: '/apps/product-variant-picker2' },
          { text: '自定义摘要(富文本)', link: '/apps/goods-summary-doc' },
        ],
      },
      {
        text: '自定义代码片段（技术向）',
        collapsed: false,
        items: [
          { text: '片段总览', link: '/snippets/' },
          { text: '修改 DOM 文字', link: '/snippets/update-dom-text' },
          { text: '详情页视频自动播放', link: '/snippets/video-autoplay' },
          { text: '结账页加购埋点', link: '/snippets/checkout-addtocart-tracking' },
          { text: '选中规格外框高亮', link: '/snippets/selected-variant-border' },
          { text: '轮播默认显示第 N 张', link: '/snippets/carousel-default-slide' },
          { text: '多件捆绑默认选最后一项', link: '/snippets/bundle-default-last' },
          { text: '新片段模板', link: '/snippets/template' },
        ],
      },
      {
        text: '维护与发布',
        items: [
          { text: '更新日志', link: '/guide/changelog' },
          { text: '登记新组件（跨主题）', link: '/guide/registry' },
          { text: '如何更新在线手册', link: '/guide/deploy-update' },
          { text: 'GitHub Pages 补充说明', link: '/PUBLISH_TO_GITHUB' },
        ],
      },
    ],
    socialLinks: [],
  },
})
