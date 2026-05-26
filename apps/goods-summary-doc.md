# 自定义摘要 · 富文本（goods-summary-doc）

::: info 适用范围
**Shopline 应用插件** · 应用块：`goods-summary-doc-block` · 仓库：shopline-blocks（app01）
:::

**适合做什么：** 在商品详情页插入一段**富文本摘要**，内容从商品元字段 `my_fields.summary_doc`（富文本类型）读取，支持换行段落和可选的文字横向滚动效果。

![自定义摘要前台效果](/screenshots/goods-summary-doc.png)

## 前台效果

- 商品详情页出现一段富文本区域（`<p>` 段落），内容由元字段驱动。
- 可选「文字滚动」：开启后文字横向 marquee 循环滚动，鼠标悬停暂停。
- 样式可配：字体、字号（12–30px）、颜色、加粗。

## 元字段配置

<MetafieldInstallerButton id="goods-summary-doc" />

::: tip 一键安装
点击上方按钮，输入店铺 handle，自动把下表元字段定义写入该店铺。已存在的字段会自动跳过。
:::

在 **设置 → 元字段 → 商品** 中创建以下字段：

| 键名 | 后台字段名称 | 数据类型 | 必填 | 说明 |
|------|-------------|----------|------|------|
| `summary_doc` | 自定义摘要(富文本-可换行) | 富文本（`rich_text_field`） | 是 | 商品摘要内容；富文本格式，支持换行 |

### 填写方式

在商品编辑页 → 元字段 → `summary_doc` 里，用富文本编辑器输入内容。支持多行段落，前端会解析 `root > paragraph > text` 的富文本 JSON 结构并渲染为 `<p>` 标签。

::: details 元字段 JSON 结构参考

```json
{
  "type": "root",
  "children": [
    {
      "type": "paragraph",
      "children": [
        { "type": "text", "value": "第一行文字内容" }
      ]
    },
    {
      "type": "paragraph",
      "children": [
        { "type": "text", "value": "第二行文字内容" }
      ]
    }
  ]
}
```

:::

## 应用块设置项

在 Shopline 后台「在线商店 → 主题 → 自定义 → 商品详情模板」中添加本应用块后，可配置以下项：

| 设置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| 字体 | 字体选择 | 主题默认 | 自定义字体 |
| 字体加粗 | 开关 | 关 | 是否加粗 |
| 字体颜色 | 颜色 | `#000000` | 文字颜色 |
| 字体大小 | 滑块 | 12px | 范围 12–30px，步进 2px |
| 文字滚动 | 开关 | 关 | 开启后文字横向循环滚动 |
| 滚动速度 | 滑块 | 1 | 范围 1–5，步进 1 |

## 技术实现

| 项目 | 说明 |
|------|------|
| 源文件 | `shopline-blocks/app01/theme-app-extension/blocks/goods-summary-doc-block.html` |
| 样式 | `assets/goods-summary/block.css` |
| 脚本 | `assets/goods-summary/block.js`（滚动逻辑） |
| 模板引擎 | Handlebars |
| 挂载位置 | `products/detail` |
| 限制数量 | 每页最多 1 个 |

### 渲染逻辑

1. 模板判断 `product.metafields.my_fields.summary_doc` 是否存在。
2. 存在则将富文本 JSON 赋给 `summaryData`，递归遍历 `root > paragraph > text` 节点拼接 HTML。
3. 若开启「文字滚动」，`block.js` 为 `.marquee` 元素添加 `requestAnimationFrame` 驱动的横向滚动。

## 常见疑问

| 现象 | 原因 / 处理 |
|------|------------|
| 摘要区域不显示 | 商品未填写 `summary_doc` 元字段；模板 Handlebars `#if` 判断为空跳过渲染 |
| 内容显示但不换行 | 元字段类型选错了（应为**富文本** `rich_text_field`，不是单行文本） |
| 滚动不生效 | 确认「文字滚动」开关已开启；检查 `block.js` 是否正常加载 |
| 鼠标悬停不暂停 | 确认 `block.js` 已挂载；`mouseenter` 事件将 `step` 设为 0 |

## 相关文档

- [应用插件总览](/apps/)
- [自定义购买选择器](/apps/product-variant-picker2)
