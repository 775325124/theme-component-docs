# 修改 DOM 元素文字

::: info 元信息

- **场景**：把页面上某个选择器匹配到的元素文字改成指定内容
- **适用平台 / 语言**：Shopline 3.x · Sline / Shopline 2.x · Handlebars / Shopify · Liquid（纯前端 JS，三种平台通用）
- **首次记录**：2026-05-19 · 客户/主题：通用
- **依赖**：无（`MutationObserver`，现代浏览器均支持）
- **放置位置**：主题 layout / 对应页面 section 末尾的 `<script>`，或店铺后台「自定义代码 / 注入脚本」
:::

## 用途

主题或第三方脚本**晚于首屏**才把目标节点插入 DOM 时，直接 `querySelector` 可能拿不到元素。本段代码先尝试立即改字；若元素尚未出现，则用 `MutationObserver` 监听 `document.body` 子树变化，出现后再改并停止监听；10 秒后自动断开，避免长期占用。

## 代码

::: code-group

```javascript [JavaScript（全平台通用）]
function updateText(selector, newText) {
  // 先尝试直接获取
  const el = document.querySelector(selector);
  if (el) {
    el.textContent = newText;
    return;
  }

  // 元素还不存在，用 MutationObserver 监听动态加载
  const observer = new MutationObserver((mutations, obs) => {
    const target = document.querySelector(selector);
    if (target) {
      target.textContent = newText;
      obs.disconnect(); // 修改完成后停止监听
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // 超时兜底，避免永久监听
  setTimeout(() => observer.disconnect(), 10000);
}

// 使用示例：把选择器对应元素的文字改成新内容
updateText('.your-selector', '新的文字内容');
```

:::

### 参数说明

| 参数 | 说明 |
|------|------|
| `selector` | CSS 选择器，须能唯一定位到要改的元素（如 `.cart-count`、`#header-title`） |
| `newText` | 替换后的纯文本（会覆盖 `textContent`，不含 HTML） |

### 调用示例

```javascript
// 改页头某段文案
updateText('.header-promo', '限时包邮');

// 改按钮文字
updateText('button[name="add"]', '立即购买');
```

## 注意事项

- 只改**第一个**匹配到的元素；若页面上有多个同名选择器，请把选择器写得更具体。
- 使用 `textContent` 会清掉元素内原有 HTML 子节点，只适合纯文字节点。
- 若目标元素会**反复被脚本重绘**（改完后又被主题改回去），本段只保证「第一次出现」时改写，需要持续监听时要另做方案。
- `MutationObserver` 监听整页子树，10 秒内未找到元素会自动停止；可酌情调大超时时间。
- 同一页面多次调用 `updateText` 且都走监听分支时，会注册多个 observer，建议合并为一次或封装去重。

## 改动记录

- 2026-05-19：首次记录
