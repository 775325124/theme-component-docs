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

::: warning 脚本放在 `<head>` 或 body 尚未生成时
不要在 `document.body` 还不存在时直接 `observe(document.body)`，否则会报错。下面两段代码都通过 **`whenBodyReady`** 等到 `body` 出现后再执行。
:::

## 公共辅助：whenBodyReady

```javascript
function whenBodyReady(cb) {
  if (document.body) return cb();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cb, { once: true });
  } else {
    // readyState 已是 interactive/complete 但 body 仍可能短暂为空，下一帧再试
    requestAnimationFrame(function tick() {
      if (document.body) cb();
      else requestAnimationFrame(tick);
    });
  }
}
```

## 基础版：updateText

改字成功后即停止监听，资源占用小。

::: code-group

```javascript [JavaScript（全平台通用）]
function updateText(selector, newText) {
  function apply(el) {
    if (!(el instanceof Node)) return;
    if (el.textContent !== newText) el.textContent = newText;
  }

  function start() {
    const el = document.querySelector(selector);
    if (el) {
      apply(el);
      return;
    }

    const root = document.body;
    if (!(root instanceof Node)) return;

    const observer = new MutationObserver(function (_, obs) {
      const target = document.querySelector(selector);
      if (target) {
        apply(target);
        obs.disconnect();
      }
    });

    observer.observe(root, { childList: true, subtree: true });
    setTimeout(function () { observer.disconnect(); }, 10000);
  }

  whenBodyReady(start);
}

// 使用示例
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
updateText('.header-promo', '限时包邮');
updateText('button[name="add"]', '立即购买');
```

## 加强版：lockText

在 `updateText` 基础上，对目标元素再挂一个**守卫监听**：一旦发现 `textContent` 被改回，立即覆盖为指定文案。适合结账页支付区块等会被其他脚本反复刷新的节点。

::: code-group

```javascript [JavaScript（全平台通用）]
function lockText(selector, newText) {
  function apply(el) {
    if (!(el instanceof Node)) return;
    if (el.textContent !== newText) el.textContent = newText;

    const guard = new MutationObserver(function () {
      if (el.textContent !== newText) el.textContent = newText;
    });
    guard.observe(el, { childList: true, characterData: true, subtree: true });
  }

  function start() {
    const el = document.querySelector(selector);
    if (el) {
      apply(el);
      return;
    }

    const root = document.body;
    if (!(root instanceof Node)) return;

    const finder = new MutationObserver(function (_, obs) {
      const target = document.querySelector(selector);
      if (target) {
        obs.disconnect();
        apply(target);
      }
    });
    finder.observe(root, { childList: true, subtree: true });
    setTimeout(function () { finder.disconnect(); }, 10000);
  }

  whenBodyReady(start);
}
```

```javascript [完整粘贴示例（结账支付文案）]
<script>
(function () {
  function whenBodyReady(cb) {
    if (document.body) return cb();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cb, { once: true });
    } else {
      requestAnimationFrame(function tick() {
        if (document.body) cb();
        else requestAnimationFrame(tick);
      });
    }
  }

  function lockText(selector, newText) {
    function apply(el) {
      if (!(el instanceof Node)) return;
      if (el.textContent !== newText) el.textContent = newText;

      const guard = new MutationObserver(function () {
        if (el.textContent !== newText) el.textContent = newText;
      });
      guard.observe(el, { childList: true, characterData: true, subtree: true });
    }

    function start() {
      const el = document.querySelector(selector);
      if (el) {
        apply(el);
        return;
      }
      const root = document.body;
      if (!(root instanceof Node)) return;

      const finder = new MutationObserver(function (_, obs) {
        const target = document.querySelector(selector);
        if (target) {
          obs.disconnect();
          apply(target);
        }
      });
      finder.observe(root, { childList: true, subtree: true });
      setTimeout(function () { finder.disconnect(); }, 10000);
    }

    whenBodyReady(start);
  }

  lockText('#payment-block .modules-header', 'お支払い');
  lockText('#payment-block .block-select-subtitle', 'すべての取引は安全で、暗号化されています。');
  lockText(
    '#pci-container .pci-footer-tips span',
    '当サイトでは、個人情報やクレジットカード番号等の機密性の高い情報は「SSL（Secure Socket Layer）」という暗号化通信技術を使用しております。ご入力いただいたクレジットカード情報は、すべて暗号化されて決済システム会社へ直接送信され、当社のサーバーには一切保存されません。'
  );
})();
</script>
```

:::

### 两版对比

| | updateText | lockText |
|---|------------|----------|
| 等待 body / 元素出现 | 有（`whenBodyReady` + 10 秒 finder） | 有（同上） |
| 改字后是否持续监听 | 否 | 是（元素级 guard） |
| 性能 | 更轻 | 目标元素存在期间常驻一个 observer |
| 典型场景 | 静态文案替换 | 与主题脚本「抢」同一段文字 |

## 注意事项

- 只处理**第一个**匹配到的元素；选择器请写具体。
- 使用 `textContent`，会清掉元素内原有 HTML，只适合纯文字。
- **基础版**不防回写；若改完又被覆盖，请换 **lockText**。
- **加强版**的 guard 会一直监听该元素，直到页面关闭；同一元素不要重复调用 `lockText`，否则会叠多个 guard。
- 等待元素阶段的 `finder` 仍会在 10 秒后断开；若 10 秒内元素未出现，则不会生效。
- 若其他脚本**整段替换 DOM 节点**（不是改 textContent），旧节点被移除后 guard 随之失效，需在新节点上重新执行。
- 仅在文案与目标不一致时才写入 `textContent`，可减少与 guard 的互相触发。

## 常见疑问

| 现象 | 原因 / 处理 |
|------|------------|
| 报错 `Cannot read properties of null (reading 'observe')` | 脚本执行时 `document.body` 还不存在；使用本文的 `whenBodyReady` 包装后再 `observe` |
| lockText 没生效 | 选择器写错，或 10 秒内目标节点未出现；用开发者工具确认 DOM 结构 |
| 改字后闪一下又变回去 | 用 **lockText** 而不是 updateText |

## 改动记录

- 2026-05-19：首次记录（`updateText`）
- 2026-05-19：新增强化版 `lockText`
- 2026-06-04：`whenBodyReady` 修复 body 未就绪报错；`updateText` / `lockText` 同步优化；补充结账支付文案完整示例
