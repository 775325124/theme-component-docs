# Shopline 应用插件

本板块记录 **Shopline 店铺应用 / 自定义脚本** 的配置方法，与「主题分区组件」分开维护。

| 区别 | 主题组件（components） | 应用插件（apps） |
|------|------------------------|------------------|
| 代码位置 | 主题仓库 `sections/` | [shopline-app-script](https://github.com/) 等脚本仓库，CDN 下发 |
| 后台入口 | 在线商店 → 主题 → 自定义分区 | Shopline 应用市场 / 已安装应用 + **商品元字段** |
| 典型配置 | 分区设置、块设置 | **Shopline 自动折扣** + **商品元字段（与折扣一致）** + 应用挂载 |

::: tip 和主题的关系
应用脚本挂在商品页或应用块容器里，**不替代**主题自带的规格选择器；常与「多件优惠 / 组合购买」类商品模板（如 `product.sku`）一起使用。
:::

::: warning product-variant-picker2 特别注意
须先在 Shopline **营销 → 折扣** 配好多件阶梯自动折扣，再在商品元字段里按**相同件数、相同减免**填写；详见 [自定义购买选择器](/apps/product-variant-picker2#必读须配合-shopline-折扣并与元字段一致)。
:::

## 插件索引

<div class="apps-plugin-index">

<article class="apps-plugin-card">
  <a class="apps-plugin-card__thumb" href="product-variant-picker2" aria-label="查看 product-variant-picker2 文档">
    ![product-variant-picker2 预览](/screenshots/product-variant-picker2.png)
  </a>
  <div class="apps-plugin-card__main">
    <header class="apps-plugin-card__header">
      <h3 class="apps-plugin-card__name">
        <a href="product-variant-picker2">product-variant-picker2</a>
      </h3>
      <p class="apps-plugin-card__tagline">弹层式多件规格选择 + 分层优惠，加购 / 结账</p>
    </header>
    <dl class="apps-plugin-card__meta">
      <div class="apps-plugin-card__meta-row">
        <dt>配置方式</dt>
        <dd>Shopline 多件折扣 + 元字段同步 + 应用挂载</dd>
      </div>
    </dl>
    <footer class="apps-plugin-card__actions">
      <a class="apps-plugin-card__link" href="product-variant-picker2">打开文档</a>
      <MetafieldInstallerButton id="product-variant-picker2" size="sm" label="⚡ 一键安装元字段" />
    </footer>
  </div>
</article>

</div>

## 怎么加新插件文档

1. 在 `apps/` 下新建 `<slug>.md`（与脚本目录名一致，kebab-case）
2. 在本页「插件索引」的 `.apps-plugin-index` 里复制一张 `.apps-plugin-card` 并改内容（链接用**相对路径**如 `your-plugin`，不要用 `/apps/...`，否则 GitHub Pages 会 404）
3. 在 `.vitepress/config.mts` 的「Shopline 应用插件」分组追加侧栏项
4. `npm run build` → `git push`

或在 Cursor 中说「新增了 Shopline 应用插件 xxx，更新手册」，由 agent 按上述步骤处理。

## 脚本仓库

| 项目 | 说明 |
|------|------|
| **shopline-app-script** | 脚本源码与构建产物；`product-variant-picker2` 对应 `dist/scripts/product-variant-picker2/` |
| **CDN** | 线上入口：`https://shopline-scripts-cdn.qgergdv.com/scripts/product-variant-picker2/main.js` |
