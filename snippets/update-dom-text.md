# 修改 DOM 元素文字

::: info 元信息

- **场景**：把页面上某个选择器匹配到的元素文字改成指定内容（含「锁定」加强版，防止被其他脚本改回）
- **适用平台 / 语言**：Shopline 3.x · Sline / Shopline 2.x · Handlebars / Shopify · Liquid（纯前端 JS，三种平台通用）
- **首次记录**：2026-05-19 · 客户/主题：通用
- **依赖**：无（`MutationObserver`，现代浏览器均支持）
- **放置位置**：主题 layout / 对应页面 section 末尾的 `<script>`，或店铺后台「自定义代码 / 注入脚本」
:::

## 用途

主题或第三方脚本**晚于首屏**才把目标节点插入 DOM 时，直接 `querySelector` 可能拿不到元素。两段代码都会先尝试立即改字，找不到元素时再监听 `document.body` 等待出现（10 秒超时）。

| 版本 | 函数 | 何时用 |
|------|------|--------|
| 基础版 | `updateText` | 只改一次即可，不会被别的脚本覆盖 |
| **加强版** | `lockText` | 改完后仍可能被主题 / 其他脚本改回去，需要**持续锁定**文案 |

## 基础版：updateText

改字成功后即停止监听，资源占用小。

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

## 加强版：lockText

在 `updateText` 基础上，对目标元素再挂一个**守卫监听**：一旦发现 `textContent` 被改回，立即覆盖为指定文案。适合购物车角标、动态计价等会被其他脚本反复刷新的节点。

::: code-group

```javascript [JavaScript（全平台通用）]
function lockText(selector, newText) {
  function apply(el) {
    el.textContent = newText;

    // 锁定：监听该元素自身的变化，一旦被其他代码改回就立刻覆盖
    const guard = new MutationObserver(() => {
      if (el.textContent !== newText) {
        el.textContent = newText;
      }
    });

    guard.observe(el, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  // 先尝试直接获取
  const el = document.querySelector(selector);
  if (el) {
    apply(el);
    return;
  }

  // 元素还不存在，等它出现
  const finder = new MutationObserver((_, obs) => {
    const target = document.querySelector(selector);
    if (target) {
      obs.disconnect();
      apply(target);
    }
  });

  finder.observe(document.body, {
    childList: true,
    subtree: true,
  });

  setTimeout(() => finder.disconnect(), 10000);
}

// 使用示例
lockText('.your-selector', '新的文字内容');
```

:::

### 两版对比

| | updateText | lockText |
|---|------------|----------|
| 等待元素出现 | 有（10 秒） | 有（10 秒） |
| 改字后是否持续监听 | 否 | 是（元素级 guard） |
| 性能 | 更轻 | 目标元素存在期间常驻一个 observer |
| 典型场景 | 静态文案替换 | 与主题脚本「抢」同一段文字 |

## 注意事项

- 只处理**第一个**匹配到的元素；选择器请写具体。
- 使用 `textContent`，会清掉元素内原有 HTML，只适合纯文字。
- **基础版**不防回写；若改完又被覆盖，请换 **lockText**。
- **加强版**的 guard 会一直监听该元素，直到页面关闭；同一元素不要重复调用 `lockText`，否则会叠多个 guard。
- 等待元素阶段的 `finder` 仍会在 10 秒后断开；若 10 秒内元素未出现，加强版也不会生效。
- 若其他脚本**整段替换 DOM 节点**（不是改 textContent），旧节点被移除后 guard 随之失效，需在新节点上重新执行。

## 改动记录

- 2026-05-19：首次记录（`updateText`）
- 2026-05-19：新增强化版 `lockText`
