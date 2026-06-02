# 组件总览

下表统筹**所有主题/店铺**里已提供说明的自定义组件。新增组件时：**加一行 + 新建一篇详细页**，见 [登记规范](/guide/registry)。

::: tip 关于「适用平台 / 模板语言」
我们目前在用三类主题：

- **Shopline 3.x · Sline**（daramiyo / kenpogen / pettena-kr / sosove-jp）— 主力
- **Shopify · Liquid**（Giipet / pettena-jp）
- **Shopline 2.x · Handlebars**（暂未使用）

后台运营层面操作几乎一致；技术细节详见 [主题版本与模板语言差异](/guide/version-difference)。
:::

| 缩略 | 后台里大概叫什么 | 一句话用途 | 平台 / 语言 | 适用主题 | 详细 |
|------|------|------|------|------|------|
| ![kol](/screenshots/kol-recommend.png) | **人气视频** | 达人视频墙：封面、短视频、KOL、进商品 | Shopline 3.x · Sline | daramiyo、kenpogen | [打开](/components/kol-recommend) |
| ![tcr](/screenshots/text-columns-renman.png) | **红人模块** | 多列图文卡片 | Shopline 3.x · Sline | 同上 | [打开](/components/text-columns-renman) |
| ![tcr2](/screenshots/text-columns-renman2.png) | **红人模块(视频)** | 横滑轮播 + 图/视频 | Shopline 3.x · Sline | 同上 | [打开](/components/text-columns-renman2) |
| ![pr](/screenshots/product-ranking.png) | **产品排行榜** | 顶部 Tab + 各类合集商品 + 排名徽章；支持滚动置顶 Tab | Shopline 3.x · Sline | kenpogen、sosove-jp | [打开](/components/product-ranking) |
| ![ht](/screenshots/hot-tags.png) | **Hot tags** | 热门标签按钮组，可配标题与悬停色 | Shopline 3.x · Sline | kenpogen | [打开](/components/hot-tags) |
| ![nt](/screenshots/notice.png) | **通知消息** | 公告列表：绑定自定义页面 + 发布日期 | Shopline 3.x · Sline | kenpogen | [打开](/components/notice) |
| ![bs](/screenshots/best-sellers.png) | **热销商品** | Tab + 横滑商品卡，支持合集或手动选品，营销角标 | Shopline 3.x · Sline | kenpogen | [打开](/components/best-sellers) |
| ![ts](/screenshots/tab-switcher.png) | **Tab Switcher** | 顶部 Tab + 大图 + 3 商品卡（或纯图）轮播 | Shopline 3.x · Sline | kenpogen | [打开](/components/tab-switcher) |
| ![isM](/screenshots/image-swiper-more.png) | **轮播(自定义数量)** | 横滑图片墙，每屏数量可填小数（如 2.5） | Shopline 3.x · Sline | kenpogen | [打开](/components/image-swiper-more) |
| ![ita](/screenshots/image-text-anchor.png) | **图文锚点** | 带标题的图片入口，点击自动滚动到指定区域 | Shopline 3.x · Sline | kenpogen | [打开](/components/image-text-anchor) |
| ![pdec](/screenshots/product-dec.png) | **产品描述** | 展示商品后台「描述」正文，可配合详情 Tab 导航 | Shopline 3.x · Sline | kenpogen | [打开](/components/product-dec) |
| ![pdet](/screenshots/product-detail.png) | **产品详情** | 图片 / 参数 / 尺码表 / 富文本组合，多块读元字段 | Shopline 3.x · Sline | kenpogen | [打开](/components/product-detail) |
| ![pdn](/screenshots/product-detail-nav.png) | **产品详情导航** | 商品页 Tab 切换导航，移动端可吸顶 | Shopline 3.x · Sline | kenpogen | [打开](/components/product-detail-nav) |
| ![pnav](/screenshots/product-navigation.png) | **产品导航** | 页内锚点按钮，顶部或底部固定 | Shopline 3.x · Sline | kenpogen | [打开](/components/product-navigation) |
| ![psub](/screenshots/product-subtitle.png) | **产品摘要** | 商品元字段短摘要，支持换行 | Shopline 3.x · Sline | kenpogen | [打开](/components/product-subtitle) |
| ![sp](/screenshots/sticky-purchase.png) | **移动端悬浮购买条** | 商品详情页底部固定加购 / 结账（手机端） | Shopline 3.x · Sline | kenpogen | [打开](/components/sticky-purchase) |
| ![ssc](/screenshots/staff-style-coordination.png) | **人员穿搭展示** | 员工/KOL 穿搭卡片，支持网格和轮播两种布局 | Shopline 3.x · Sline | sosove-jp | [打开](/components/staff-style-coordination) |
| ![sct](/screenshots/stroller-compare-table.png) | **婴儿车对比表** | 多款婴儿车参数横向对比，数据来自元对象 | Shopify · Liquid | pettena-jp | [打开](/components/stroller-compare-table) |

> **Shopline 2.x（Handlebars）主题** 目前没有专属自定义组件登记。如需把 Sline / Liquid 组件移植过去，请参考 [主题版本与模板语言差异 → 跨语言迁移注意事项](/guide/version-difference#跨语言迁移注意事项)。

---

[常见问题](/components/troubleshooting) · [自定义代码片段库](/snippets/)
