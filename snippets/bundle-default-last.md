# 多件捆绑默认选最后一项

::: info 元信息

- **场景**：详情页批量加购促销（多件捆绑折扣）组件加载后，默认选中**最后一档**（通常优惠力度最大那档）
- **适用平台 / 语言**：Shopline 3.x · Sline
- **首次记录**：2026-06-12 · 客户/主题：通用（3.0 主题详情页 · 批量加购促销）
- **依赖**：无；依赖批量加购组件 DOM（`.discount-style_app_block`）
- **放置位置**：店铺后台「自定义代码」详情页 `<script>`，或主题详情页 section 末尾
:::

## 用途

详情页的多件捆绑折扣组件（批量加购促销）默认选中第 1 档。这段代码在组件渲染完成后，自动点击**最后一档**，引导用户直接选到优惠最大的捆绑方案。

代码用轮询等待组件与内部选项出现（组件是异步挂载的），找到后点击最后一项内的目标 `div`。

## 代码

::: code-group

```html [Shopline 3.x · Sline（详情页注入）]
<script>
  (function () {
    const checkElementLoaded = (selector, callable, maxTries = 50) => {
      let tries = 0;
      const intervalId = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
          clearInterval(intervalId);
          callable(element);
        } else {
          tries++;
          if (tries >= maxTries) clearInterval(intervalId);
        }
      }, 300);
    };

    document.addEventListener("DOMContentLoaded", function () {
      checkElementLoaded(".discount-style_app_block", function (element) {
        // 等待内部档位元素出现
        const waitForItems = setInterval(() => {
          const items = element.querySelectorAll("span>div");
          if (items.length > 0) {
            clearInterval(waitForItems);

            const lastItem = items[items.length - 1];
            const targetDiv = lastItem.querySelector('div');

            if (targetDiv) {
              targetDiv.click();
              console.log('clicked successfully');
            }
          }
        }, 200);

        // 5 秒后停止尝试
        setTimeout(() => clearInterval(waitForItems), 5000);
      });
    });
  })();
</script>
```

:::

## 注意事项

- 两层轮询都带上限：外层 `checkElementLoaded` 最多 50 次（≈15 秒）等组件出现；内层 5 秒内等档位渲染，超时自动停止，避免空转。
- 选择器 `.discount-style_app_block` 与内部 `span>div` 强依赖批量加购组件的 DOM 结构，**组件升级后务必复核**。
- 「最后一档」按 `items[items.length - 1]` 取；若档位顺序或层级变化，需调整取项与 `.querySelector('div')` 的目标层级。
- 模拟点击会触发组件自身的选中逻辑（价格 / 数量随之更新），与手动点击效果一致。
- 上线前删掉 `console.log`，或保留用于排查。

## 改动记录

- 2026-06-12：首次记录，from 3.0 详情页批量加购促销默认选最后一档

## 相关组件

配合 Shopline 平台「多件阶梯折扣」与 [自定义购买选择器](/apps/product-variant-picker2) 使用。
