# 产品详情

::: info 适用范围
**Shopline 3.x（Sline）** · 主题：kenpogen
:::

**适合做什么：** 在商品详情页组合展示**图片、参数列表、尺码表、富文本**等内容；其中多块数据来自商品元字段，适合「一商品一配置」的详情页。

> 配合用法：与「产品详情导航」联用时，整段填写「导航类名」如 `index-2`；块类型在后台自由增删排序。

![后台截图占位](/screenshots/product-detail.png)

## 整段（分区）设置

| 名称 | 怎么填 |
|------|--------|
| 导航类名 | 与详情导航联动，例如 `index-2` |
| 标题 | 本段顶部可选标题（可不填） |

## 可添加的内容块

在分区里按需添加以下块（可多个、可排序）：

### 图片

| 名称 | 怎么填 |
|------|--------|
| 桌面端图片 | 上传 PC 展示图 |
| 移动端图片 | 上传手机图；不填则用手机端复用桌面图 |

**显示优先级：** 若商品已配置元字段 `my_fields.custom_page_image`，则**优先用元字段图**，后台上传的图片作为备选。

### 自定义图片

无后台表单项，数据全部来自元字段 `my_fields.details_custom_image`（多张图片 URL 列表）。

### 产品详情（参数列表）

无后台表单项，数据来自元字段 `my_fields.product_details` 里的 **product_details** 数组：每行「参数名 + 参数值」。

### 尺码表

无后台表单项，数据来自同一元字段 `my_fields.product_details` 里的 **product_size** 数组：多列表格，每列有表头和多行单元格。

### 自定义富文本

| 名称 | 怎么填 |
|------|--------|
| 正文 | 富文本编辑器，支持粗体、链接、列表等 |

## 元字段配置

### 摘要类（产品摘要分区用）

| 命名空间 · 键名 | 类型 | 说明 |
|-----------------|------|------|
| `my_fields.summary` | 多行文本 | 短摘要文案 |

### 详情类（本分区常用）

| 命名空间 · 键名 | 类型 | 说明 |
|-----------------|------|------|
| `my_fields.custom_page_image` | 文件 / URL | 单张主图，供「图片」块优先展示 |
| `my_fields.details_custom_image` | JSON 列表 | 多张图片 URL，供「自定义图片」块 |
| `my_fields.product_details` | JSON | 内含 `product_details` 与 `product_size`，见下方结构 |

::: details 元字段 JSON 测试用例（product_details）

```json
{
  "product_details": [
    { "key": "材质", "value": "棉 100%" },
    { "key": "产地", "value": "日本" },
    { "key": "洗涤", "value": "可机洗" }
  ],
  "product_size": [
    {
      "table_head": "尺码",
      "data": [
        { "value": "S" },
        { "value": "M" },
        { "value": "L" }
      ]
    },
    {
      "table_head": "胸围",
      "data": [
        { "value": "88cm" },
        { "value": "92cm" },
        { "value": "96cm" }
      ]
    },
    {
      "table_head": "衣长",
      "data": [
        { "value": "62cm" },
        { "value": "64cm" },
        { "value": "66cm" }
      ]
    }
  ]
}
```

:::

::: details 元字段 JSON 测试用例（details_custom_image）

```json
[
  "https://cdn.example.com/detail-1.jpg",
  "https://cdn.example.com/detail-2.jpg"
]
```

:::

::: details 元字段示例（custom_page_image）

单张图片 URL 字符串，例如：

```text
https://cdn.example.com/product-hero.jpg
```

:::

## 推荐组合（商品详情页）

1. **产品详情导航** — Tab 标签  
2. **产品摘要**（`index-1`）+ **产品描述**（`index-2`）+ **产品详情**（`index-3`）— 各 Tab 内容  
3. 可选：**产品导航** — 页内锚点快速跳转  

## 常见疑问

| 现象 | 原因 / 处理 |
|------|------------|
| 参数列表 / 尺码表空白 | 商品未配置 `my_fields.product_details`，或 JSON 结构不符合上方示例 |
| 图片块不显示元字段图 | 检查 `custom_page_image` 是否有值；有值时会覆盖后台上传图 |
| 尺码表列对不齐 | `product_size` 里每一列的 `data` 行数建议一致 |
| 自定义图片块无内容 | `details_custom_image` 需为 URL 数组，不能是单个字符串 |
