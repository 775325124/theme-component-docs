# 选中规格外框高亮

::: info 元信息

- **场景**：商品详情页规格（SKU）选择器，选中项外框改为红色 + 加粗 3px，hover 也高亮
- **适用平台 / 语言**：Shopline 3.x · Sline（纯 CSS）
- **首次记录**：2026-06-12 · 客户/主题：通用（3.0 模板）
- **依赖**：无（纯 CSS）；依赖 3.0 主题规格选择器 DOM 结构与 CSS 变量
- **放置位置**：店铺后台「自定义代码」全站 / 详情页 `<style>`，或主题 CSS
:::

## 用途

3.0 主题默认选中规格的边框不够明显。这段 CSS 把**选中态**的 SKU 外框换成红色并加粗到 3px，同时给 hover 态加一圈红色阴影，让当前选择更直观。

## 代码

::: code-group

```css [Shopline 3.x · Sline]
:root {
  --border-color-checked-sku: #ff3333;
}

/* 选中状态 - 红色边框（匹配 input 后的任意直接兄弟元素） */
.product-detail__variant-picker .variant-picker__options input[type="radio"]:checked + * {
  --border-color: var(--border-color-checked-sku) !important;
  --border-thickness: 3px;
}

/* hover 状态 - 红色边框 */
.product-detail__variant-picker .variant-picker__button:hover::after {
  box-shadow: 0 0 0 3px var(--border-color-checked-sku);
}
```

:::

## 注意事项

- 颜色统一抽到 `--border-color-checked-sku`，改色只动这一处。
- 依赖主题自身的 `--border-color` / `--border-thickness` CSS 变量；若主题升级改了变量名或 DOM 结构（`.variant-picker__options` / `.variant-picker__button`），需同步调整选择器。
- `input:checked + *` 匹配的是 radio 紧邻的下一个兄弟元素，主题若把 radio 与可视块拆开层级会失效。
- 仅样式层面，不影响选择逻辑与加购。

## 改动记录

- 2026-06-12：首次记录，from 3.0 模板选中规格高亮需求

## 相关组件

配合详情页规格选择使用，亦可参考应用插件 [自定义购买选择器](/apps/product-variant-picker2)。
