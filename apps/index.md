# Shopline 应用插件

本板块记录 **Shopline 店铺应用 / 自定义脚本** 的配置方法，与「主题分区组件」分开维护。

| 区别 | 主题组件（components） | 应用插件（apps） |
|------|------------------------|------------------|
| 代码位置 | 主题仓库 `sections/` | Shopline 应用脚本仓库，CDN 下发 |
| 后台入口 | 在线商店 → 主题 → 自定义分区 | Shopline 应用市场 / 已安装应用 + **商品元字段** |
| 典型配置 | 分区设置、块设置 | **Shopline 自动折扣** + **商品元字段（与折扣一致）** + 应用挂载 |

::: tip 和主题的关系
应用脚本挂在商品页或应用块容器里，**不替代**主题自带的规格选择器；常与「多件优惠 / 组合购买」类商品模板一起使用。
:::

::: warning product-variant-picker2 特别注意
须先在 Shopline **营销 → 折扣** 配好多件阶梯自动折扣，再在商品元字段里按**相同件数、相同减免**填写；详见 [自定义购买选择器](/apps/product-variant-picker2#必读须配合-shopline-折扣并与元字段一致)。
:::

## 插件索引

| 插件 | 介绍 | 使用 |
|------|------|------|
| **product-variant-picker2** | 商品详情自定义购买选择器：多件规格 + 阶梯优惠，加购 / 结账 | [打开文档](/apps/product-variant-picker2) |
| **goods-summary-doc** | 商品详情页富文本摘要，支持换行 + 可选文字滚动 | [打开文档](/apps/goods-summary-doc) |

## 怎么加新插件文档

1. 在 `apps/` 下新建 `<slug>.md`（与脚本目录名一致，kebab-case）
2. 在本页「插件索引」表格加一行（组件名 / 介绍 / 文档链接）
3. 在 `.vitepress/config.mts` 的「Shopline 应用插件」分组追加侧栏项
4. `npm run build` → `git push`

或在 Cursor 中说「新增了 Shopline 应用插件 xxx，更新手册」，由 agent 按上述步骤处理。
