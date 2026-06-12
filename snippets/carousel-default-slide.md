# 轮播默认显示第 N 张

::: info 元信息

- **场景**：商品详情页主图轮播加载后，默认切换到第 N 张缩略图（该张是视频也生效）
- **适用平台 / 语言**：Shopline 3.x · Sline
- **首次记录**：2026-06-12 · 客户/主题：通用（3.0 主题详情页）
- **依赖**：无；依赖主题轮播 DOM（`theme-carousel .media-gallery__thumbnail`）
- **放置位置**：店铺后台「自定义代码」详情页 `<script>`，或主题详情页 section 末尾
:::

## 用途

详情页轮播默认停在第 1 张图，有时希望进页面就展示**指定的第 N 张**（例如把某张主推图或视频放在首位展示）。这段代码在页面加载后延迟点击对应的缩略图，触发轮播切换；若第 N 张是视频也同样生效。

::: tip 第几张怎么数
`querySelectorAll(...)` 返回的是从 0 开始的数组。下例 `[1]` 表示**第 2 张**缩略图。要展示第 N 张就填 `N - 1`。
:::

## 代码

::: code-group

```html [Shopline 3.x · Sline（详情页注入）]
<script>
  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
      // [1] = 第 2 张缩略图；要第 N 张就填 N-1
      document.querySelectorAll('theme-carousel .media-gallery__thumbnail')[1].click();
    }, 1000);
  });
</script>
```

:::

## 注意事项

- `setTimeout` 给主题轮播留出渲染时间（默认 1000ms）；轮播渲染慢可调大，过小会取不到缩略图。
- 直接用下标 `[1]`，若缩略图数量不足会因 `undefined.click()` 报错；商品图少时建议加判空：

```javascript
var thumbs = document.querySelectorAll('theme-carousel .media-gallery__thumbnail');
if (thumbs[1]) thumbs[1].click();
```

- 选择器 `theme-carousel .media-gallery__thumbnail` 依赖主题结构，主题升级后需复核。
- 是通过**模拟点击缩略图**实现切换，因此第 N 张是视频也能正常切过去。

## 改动记录

- 2026-06-12：首次记录，from 3.0 主题详情页默认展示第 N 张
